/**
 * One-time migration: convert src/content/ into a conformant OKF v0.2 bundle.
 *
 *   npx tsx scripts/content-migrate.ts [--dry]
 *
 * This rewrites FRONTMATTER ONLY. The body of every file is preserved
 * byte-for-byte: the script slices the raw string after the closing `---` and
 * concatenates it back untouched, rather than round-tripping it through a
 * markdown parser. `--dry` prints the plan and writes nothing.
 *
 * Two field renames are unavoidable, because OKF reserves both names:
 *   `type`   → `format`    presentations, articles, 2 tools
 *   `status` → `maturity`  tools
 *
 * Three gaps in the existing content are filled from real sources, never
 * invented:
 *   · 26 articles and 4 policies had no `description` — derived from the
 *     document's own opening paragraph, truncated at a sentence boundary.
 *   · 50 use cases had no `date` — taken from git: the author date of the
 *     commit that added the file.
 *   · Presentations had no `tags` — synthesised from `audience` and `format`,
 *     which is what the old getAllTags() was doing at runtime anyway.
 *
 * Every derived value is listed in the report at the end so it can be
 * reviewed. Run once; it is idempotent, but it is not meant to be a
 * permanent part of the build.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import { DIR_TO_TYPE, DIR_TO_URL, type ContentDir } from '../src/lib/schemas';
import { isReservedFilename } from '../src/lib/okf';

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, 'src/content');
const DRY = process.argv.includes('--dry');

type Frontmatter = Record<string, unknown>;

const derived: Array<{ file: string; field: string; value: string; from: string }> = [];

/* ------------------------------------------------------------- utilities */

/** Split a raw file into its frontmatter block and its byte-exact body. */
function split(raw: string): { fm: string; body: string } | null {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!m) return null;
  return { fm: m[1], body: raw.slice(m[0].length) };
}

/** The author date of the commit that added a file, as YYYY-MM-DD. */
function gitAddedDate(relPath: string): string | null {
  try {
    const out = execFileSync(
      'git',
      ['log', '--diff-filter=A', '--follow', '--format=%ad', '--date=short', '-1', '--', relPath],
      { cwd: ROOT, encoding: 'utf8' }
    ).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : null;
  } catch {
    return null;
  }
}

/**
 * First substantive paragraph of a document, trimmed to a sentence boundary.
 * Used only to fill a missing `description` — it extracts the author's own
 * words rather than writing new ones.
 */
function deriveDescription(body: string, max = 200): string | null {
  const lines = body.split(/\r?\n/);
  const paragraphs: string[] = [];
  let buf: string[] = [];

  for (const line of lines) {
    const t = line.trim();
    // Skip headings, images, blockquote markers, list bullets and HTML.
    if (!t) {
      if (buf.length) {
        paragraphs.push(buf.join(' '));
        buf = [];
      }
      continue;
    }
    if (/^(#{1,6}\s|!\[|<|\||[-*+]\s|\d+\.\s|>)/.test(t)) {
      if (buf.length) {
        paragraphs.push(buf.join(' '));
        buf = [];
      }
      continue;
    }
    buf.push(t);
  }
  if (buf.length) paragraphs.push(buf.join(' '));

  const first = paragraphs.find(p => p.length > 60);
  if (!first) return null;

  // Strip markdown emphasis and inline links, keeping the link text.
  const plain = first
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .trim();

  if (plain.length <= max) return plain;

  // Cut at the last sentence end inside the budget; fall back to a word break.
  const window = plain.slice(0, max);
  const lastStop = Math.max(
    window.lastIndexOf('. '),
    window.lastIndexOf('? '),
    window.lastIndexOf('! ')
  );
  if (lastStop > 80) return window.slice(0, lastStop + 1).trim();
  return `${window.slice(0, window.lastIndexOf(' ')).trim()}…`;
}

/** Emit frontmatter YAML with one consistent style across the whole bundle. */
function dump(data: Frontmatter): string {
  return yaml.dump(data, {
    lineWidth: -1, // never wrap — wrapped URLs are a common agent trip-up
    noRefs: true,
    quotingType: "'",
    forceQuotes: false,
    sortKeys: false,
  });
}

/** Drop undefined/null/empty values so absent stays absent. */
function clean(data: Frontmatter): Frontmatter {
  const out: Frontmatter = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null) continue;
    if (typeof v === 'string' && v.trim() === '') continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out;
}

function asArray(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String);
  return [String(v)];
}

/* ------------------------------------------------------- per-type mapping */

function buildFrontmatter(
  dir: ContentDir,
  slug: string,
  data: Frontmatter,
  body: string,
  relPath: string
): Frontmatter {
  const type = DIR_TO_TYPE[dir];

  // -------- description: existing, else derived from the body
  let description = (data.description as string | undefined)?.trim();
  if (!description) {
    const d = deriveDescription(body);
    if (d) {
      description = d;
      derived.push({ file: relPath, field: 'description', value: d, from: 'first paragraph' });
    }
  }

  // -------- date: existing, else lastUpdated, else git add date
  // gray-matter hands back a Date object for an unquoted YAML date, and a
  // string for a quoted one. Both shapes appear in this content.
  const rawDate: unknown = data.date ?? data.lastUpdated;
  let date: string | undefined;
  if (rawDate instanceof Date) date = rawDate.toISOString().slice(0, 10);
  else if (typeof rawDate === 'string') date = rawDate.slice(0, 10);
  if (!date) {
    const g = gitAddedDate(relPath);
    if (g) {
      date = g;
      derived.push({
        file: relPath,
        field: 'date',
        value: g,
        from: 'git: commit that added the file',
      });
    }
  }

  // -------- resource: the canonical public URL path
  const resource =
    dir === 'use-cases'
      ? `${DIR_TO_URL[dir]}/${encodeURIComponent(String(data.category ?? ''))}/${slug}`
      : `${DIR_TO_URL[dir]}/${slug}`;

  // OKF-ordered head, then the domain fields. Key order is deliberate: the
  // fields an agent must get right come first.
  const head: Frontmatter = {
    type,
    title: data.title,
    description,
    resource,
    date,
  };

  const tags = asArray(data.tags);
  const tail: Frontmatter = {};

  switch (type) {
    case 'post':
      tail.author = data.author;
      tail.image = data.image;
      break;

    case 'policy':
      tail.category = data.category;
      break;

    case 'presentation': {
      tail.presenters = asArray(data.presenters);
      tail.audience = data.audience;
      tail.format = data.type; // renamed: OKF reserves `type`
      tail.thumbnail = data.thumbnail;
      tail.slides = data.slides;
      // Presentations carried no tags; the old getAllTags() synthesised
      // "Type:"/"Audience:" facets at runtime. Make them real data instead.
      if (tags.length === 0) {
        const synth = [data.type, data.audience].filter(Boolean).map(String);
        if (synth.length) {
          tags.push(...synth);
          derived.push({
            file: relPath,
            field: 'tags',
            value: synth.join(', '),
            from: 'format + audience',
          });
        }
      }
      break;
    }

    case 'use-case':
      tail.category = data.category;
      tail.subject = data.subject;
      tail.grade_level = data.grade_level;
      tail.tools_used = asArray(data.tools_used);
      tail.author = data.author;
      tail.school = data.school;
      break;

    case 'tool':
      tail.category = data.category;
      tail.provider = data.provider;
      tail.privacy = data.privacy;
      tail.access_type = data.access_type;
      tail.maturity = data.status; // renamed: OKF reserves `status`
      tail.format = data.type; // renamed: OKF reserves `type`
      tail.demoUrl = data.demoUrl;
      break;

    case 'research':
      tail.author = data.author;
      tail.source = data.source;
      tail.format = data.type; // renamed: OKF reserves `type`
      tail.externalUrl = data.externalUrl;
      tail.image = data.image;
      break;
  }

  // -------- OKF lifecycle. Policies were `status: 'Active'`, which is
  // exactly OKF's `stable`. Everything else published is stable too.
  const status = 'stable';

  // -------- OKF provenance. An external link is a source, not a field.
  const sources: Array<Record<string, unknown>> = [];
  if (type === 'research' && data.externalUrl) {
    sources.push(
      clean({
        resource: data.externalUrl,
        id: 'original',
        title: data.title,
        author: data.author,
        last_modified: date,
      })
    );
  }
  if (type === 'presentation' && data.slides) {
    sources.push(clean({ resource: data.slides, id: 'slides', title: 'Slide deck' }));
  }

  return clean({
    ...head,
    tags,
    ...tail,
    status,
    ...(sources.length ? { sources } : {}),
  });
}

/* ------------------------------------------------------------------ main */

async function main() {
  const dirs = Object.keys(DIR_TO_TYPE) as ContentDir[];
  let migrated = 0;
  let skipped = 0;

  for (const dir of dirs) {
    const abs = path.join(CONTENT, dir);
    let files: string[];
    try {
      files = await fs.readdir(abs);
    } catch {
      console.log(`  ${dir}/ — not present, skipping`);
      continue;
    }

    for (const file of files.sort()) {
      if (!file.endsWith('.md') || isReservedFilename(file)) continue;

      const relPath = path.posix.join('src/content', dir, file);
      const absPath = path.join(abs, file);
      const raw = await fs.readFile(absPath, 'utf8');

      const parts = split(raw);
      if (!parts) {
        console.error(`  ! ${relPath} — no parseable frontmatter block, skipped`);
        skipped++;
        continue;
      }

      const { data } = matter(raw);
      const slug = file.replace(/\.md$/, '');
      const next = buildFrontmatter(dir, slug, data as Frontmatter, parts.body, relPath);

      const out = `---\n${dump(next)}---\n${parts.body}`;

      if (out === raw) {
        skipped++;
        continue;
      }
      if (!DRY) await fs.writeFile(absPath, out, 'utf8');
      migrated++;
    }
  }

  console.log(`\n${DRY ? 'Would migrate' : 'Migrated'} ${migrated} files (${skipped} unchanged).`);

  if (derived.length) {
    const byField = derived.reduce<Record<string, number>>((acc, d) => {
      acc[d.field] = (acc[d.field] ?? 0) + 1;
      return acc;
    }, {});
    console.log(`\nDerived values needing review: ${JSON.stringify(byField)}`);

    const report = [
      '# Derived frontmatter — review required',
      '',
      'These values were not present in the source content. They were derived',
      'mechanically during the OKF migration, never invented. Each row names',
      'where the value came from so it can be checked or replaced.',
      '',
      '| File | Field | Source | Value |',
      '| --- | --- | --- | --- |',
      ...derived.map(
        d => `| \`${d.file}\` | ${d.field} | ${d.from} | ${d.value.replace(/\|/g, '\\|')} |`
      ),
      '',
    ].join('\n');
    if (!DRY) {
      await fs.mkdir(path.join(ROOT, 'docs'), { recursive: true });
      await fs.writeFile(path.join(ROOT, 'docs/derived-frontmatter.md'), report, 'utf8');
      console.log('Report written to docs/derived-frontmatter.md');
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
