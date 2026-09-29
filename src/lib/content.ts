/**
 * The shared content loader.
 *
 * Before the OKF migration, each of the six content libraries carried its own
 * copy of the same `fs.readdir` + `gray-matter` + map block. They now all sit
 * on this, which means one place enforces the rules that are easy to get
 * wrong:
 *
 *   · Reserved OKF filenames (index.md, log.md) are never content. Miss this
 *     and every index, sitemap, feed and search result gains two ghost
 *     entries.
 *   · Frontmatter is validated against src/lib/schemas.ts.
 *   · Validation is LENIENT at runtime and STRICT in CI. A malformed file
 *     should fail the build via `npm run content:validate`, not take the
 *     live site down mid-render.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { cache } from 'react';
import { z } from 'zod';
import { isReservedFilename } from './okf';
import { SCHEMAS, DIR_TO_TYPE, type ContentDir } from './schemas';

const CONTENT_ROOT = path.join(process.cwd(), 'src/content');

/** A loaded concept: its validated frontmatter, plus slug and raw body. */
export type Concept<T> = T & {
  slug: string;
  /** Raw markdown body, frontmatter stripped. */
  content: string;
};

function dirPath(dir: ContentDir): string {
  return path.join(CONTENT_ROOT, dir);
}

/**
 * Parse and validate one file. Returns null when the file cannot be used, and
 * logs why — a bad file drops out of the index rather than throwing.
 */
function parseConcept<D extends ContentDir>(
  dir: D,
  fileName: string,
  raw: string
): Concept<z.infer<(typeof SCHEMAS)[(typeof DIR_TO_TYPE)[D]]>> | null {
  const slug = fileName.replace(/\.md$/, '');
  const schema = SCHEMAS[DIR_TO_TYPE[dir]];

  let data: Record<string, unknown>;
  let content: string;
  try {
    const parsed = matter(raw);
    data = parsed.data;
    content = parsed.content;
  } catch (error) {
    console.error(`[content] ${dir}/${fileName}: unparseable frontmatter`, error);
    return null;
  }

  const result = schema.safeParse(data);
  if (!result.success) {
    // Surface the field path, not a wall of Zod internals.
    const issues = result.error.issues
      .map(i => `${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('; ');
    console.error(`[content] ${dir}/${fileName}: invalid frontmatter — ${issues}`);
    return null;
  }

  return {
    ...(result.data as z.infer<(typeof SCHEMAS)[(typeof DIR_TO_TYPE)[D]]>),
    slug,
    content,
  };
}

/**
 * Every concept in a content directory.
 *
 * `react/cache` dedupes this per request, so a page that reads posts and a
 * layout that counts them hit the filesystem once.
 */
export const getConcepts = cache(
  async <D extends ContentDir>(
    dir: D
  ): Promise<Array<Concept<z.infer<(typeof SCHEMAS)[(typeof DIR_TO_TYPE)[D]]>>>> => {
    let fileNames: string[];
    try {
      fileNames = await fs.readdir(dirPath(dir));
    } catch (error) {
      console.error(`[content] cannot read ${dir}/`, error);
      return [];
    }

    const loaded = await Promise.all(
      fileNames
        .filter(f => f.endsWith('.md'))
        // OKF reserves these. They describe the bundle; they are not concepts.
        .filter(f => !isReservedFilename(f))
        .map(async f => {
          const raw = await fs.readFile(path.join(dirPath(dir), f), 'utf8');
          return parseConcept(dir, f, raw);
        })
    );

    return loaded.filter((c): c is NonNullable<typeof c> => c !== null);
  }
);

/** One concept by slug, or null. */
export const getConcept = cache(
  async <D extends ContentDir>(
    dir: D,
    slug: string
  ): Promise<Concept<z.infer<(typeof SCHEMAS)[(typeof DIR_TO_TYPE)[D]]>> | null> => {
    // Never let a slug escape the content directory.
    if (slug.includes('/') || slug.includes('\\') || slug.includes('..')) return null;
    try {
      const raw = await fs.readFile(path.join(dirPath(dir), `${slug}.md`), 'utf8');
      return parseConcept(dir, `${slug}.md`, raw);
    } catch {
      return null;
    }
  }
);

/** Newest first, by `date`. */
export function byDateDesc<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));
}

/** Distinct tags across a set of concepts, sorted. */
export function collectTags(items: Array<{ tags?: string[] }>): string[] {
  const tags = new Set<string>();
  for (const item of items) for (const t of item.tags ?? []) tags.add(t);
  return [...tags].sort((a, b) => a.localeCompare(b));
}

/**
 * Real counts, computed from the bundle.
 *
 * The design system's rule is "numbers are real or absent" — never round up
 * to look better, never invent a statistic to fill a stat row. Every count
 * shown on the site comes from here.
 */
export const getCounts = cache(async () => {
  const [posts, software, policies, presentations, useCases, tools, research, protocol] =
    await Promise.all([
      getConcepts('writing'),
      getConcepts('software'),
      getConcepts('guidance'),
      getConcepts('presentations'),
      getConcepts('use-cases'),
      getConcepts('tools'),
      getConcepts('articles'),
      getConcepts('open-adaptive-district'),
    ]);

  return {
    posts: posts.length,
    software: software.length,
    /** Products actually in production — not counting pilots and betas. */
    softwareInProduction: software.filter(s => s.maturity === 'Production').length,
    policies: policies.length,
    presentations: presentations.length,
    useCases: useCases.length,
    tools: tools.length,
    research: research.length,
    /** Open Adaptive District documents, the action plan included. */
    protocol: protocol.length,
    /** Everything published on the site. */
    total:
      posts.length +
      software.length +
      policies.length +
      presentations.length +
      useCases.length +
      tools.length +
      research.length +
      protocol.length,
  };
});
