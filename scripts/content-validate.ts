/**
 * Validate src/content/ — the gate that makes this bundle safe for agents to
 * write to.
 *
 *   npm run content:validate
 *
 * Exits non-zero on any ERROR. Runs in CI on every push and pull request.
 *
 * Errors (build-breaking):
 *   · OKF conformance — unparseable frontmatter, or a missing/empty `type`.
 *     These are the spec's own conformance criteria.
 *   · Schema violation against src/lib/schemas.ts.
 *   · A link to a site path that does not resolve to a real concept.
 *   · An image path that does not exist in public/.
 *   · A stale directory index (run `npm run okf:build`).
 *   · Duplicate slugs within a directory.
 *
 * Warnings (reported, not fatal):
 *   · status: draft — fine in development, worth seeing before a release.
 *   · A concept past its stale_after date.
 *   · A description long enough that search engines will truncate it.
 *
 * Design note: OKF says consumers MUST NOT reject a bundle for unknown extra
 * keys or broken cross-links. That applies to CONSUMERS reading someone
 * else's bundle. This is the producer's own gate on its own content, so it is
 * stricter on purpose — a broken link here is our bug, not a peer's.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { SCHEMAS, DIR_TO_TYPE, DIR_TO_URL, type ContentDir } from '../src/lib/schemas';
import { isReservedFilename, isStale, OKF_TYPES } from '../src/lib/okf';

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, 'src/content');
const PUBLIC = path.join(ROOT, 'public');

type Issue = { level: 'error' | 'warn'; file: string; message: string };
const issues: Issue[] = [];

const error = (file: string, message: string) => issues.push({ level: 'error', file, message });
const warn = (file: string, message: string) => issues.push({ level: 'warn', file, message });

/** Every valid public path a link may point at, built as we go. */
const knownPaths = new Set<string>();

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const dirs = Object.keys(DIR_TO_TYPE) as ContentDir[];

  type Loaded = {
    dir: ContentDir;
    file: string;
    rel: string;
    data: Record<string, unknown>;
    body: string;
  };
  const loaded: Loaded[] = [];

  /* ---------------------------------------------- pass 1: parse + conform */

  for (const dir of dirs) {
    const abs = path.join(CONTENT, dir);
    let files: string[];
    try {
      files = await fs.readdir(abs);
    } catch {
      error(`src/content/${dir}`, 'content directory is missing');
      continue;
    }

    const slugs = new Set<string>();

    for (const file of files.sort()) {
      if (!file.endsWith('.md')) continue;
      const rel = `src/content/${dir}/${file}`;

      if (isReservedFilename(file)) continue;

      const slug = file.replace(/\.md$/, '');
      if (slugs.has(slug)) error(rel, `duplicate slug "${slug}" in ${dir}/`);
      slugs.add(slug);

      const raw = await fs.readFile(path.join(abs, file), 'utf8');

      // OKF conformance rule 1: parseable YAML frontmatter.
      if (!/^---\r?\n/.test(raw)) {
        error(rel, 'OKF: no frontmatter block — every concept must start with ---');
        continue;
      }

      let data: Record<string, unknown>;
      let body: string;
      try {
        const parsed = matter(raw);
        data = parsed.data;
        body = parsed.content;
      } catch (e) {
        error(rel, `OKF: unparseable YAML frontmatter — ${(e as Error).message}`);
        continue;
      }

      // OKF conformance rule 2: non-empty `type`.
      const type = data.type;
      if (typeof type !== 'string' || type.trim() === '') {
        error(rel, 'OKF: frontmatter must contain a non-empty `type` field');
        continue;
      }
      if (!(OKF_TYPES as readonly string[]).includes(type)) {
        error(rel, `unknown type "${type}" — expected one of: ${OKF_TYPES.join(', ')}`);
        continue;
      }
      if (type !== DIR_TO_TYPE[dir]) {
        error(
          rel,
          `type "${type}" does not match directory ${dir}/ (expected "${DIR_TO_TYPE[dir]}")`
        );
        continue;
      }

      loaded.push({ dir, file, rel, data, body });

      // Register the canonical path so cross-links can be checked in pass 2.
      const resource = data.resource;
      if (typeof resource === 'string') knownPaths.add(decodeURIComponent(resource));
      knownPaths.add(`${DIR_TO_URL[dir]}/${slug}`);
    }
  }

  // Section landing pages and standalone routes are valid link targets too.
  for (const p of [
    '/',
    '/writing',
    '/software',
    '/guidance',
    '/presentations',
    '/open-adaptive-district',
    '/practice',
    '/use-cases',
    '/tools',
    '/articles',
    '/search',
  ]) {
    knownPaths.add(p);
  }

  /* ------------------------------------- pass 2: schema, links, images */

  for (const { dir, rel, data, body } of loaded) {
    const schema = SCHEMAS[DIR_TO_TYPE[dir]];
    const result = schema.safeParse(data);

    if (!result.success) {
      for (const i of result.error.issues) {
        error(rel, `${i.path.join('.') || '(root)'}: ${i.message}`);
      }
      continue;
    }

    const concept = result.data;

    // ---- lifecycle warnings
    if (concept.status === 'draft') warn(rel, 'status: draft — not reviewed for publication');
    if (isStale(concept.stale_after)) {
      warn(rel, `past stale_after (${concept.stale_after}) — needs review`);
    }
    if (concept.description.length > 300) {
      warn(
        rel,
        `description is ${concept.description.length} chars; search engines truncate near 160`
      );
    }

    // ---- images referenced in frontmatter
    for (const field of ['image', 'thumbnail'] as const) {
      const value = (concept as Record<string, unknown>)[field];
      if (typeof value !== 'string' || !value.startsWith('/')) continue;
      if (!(await exists(path.join(PUBLIC, value)))) {
        error(rel, `${field} points at ${value}, which does not exist in public/`);
      }
    }

    // ---- links in the body
    const linkRe = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
    for (const m of body.matchAll(linkRe)) {
      const href = m[1];
      if (/^(https?:|mailto:|tel:|#)/.test(href)) continue;

      // Bundle-absolute concept link, e.g. /writing/my-post.md
      if (href.endsWith('.md')) {
        const target = path.join(CONTENT, href.replace(/^\//, ''));
        if (!(await exists(target))) {
          error(rel, `bundle link ${href} does not resolve to a file`);
        }
        continue;
      }

      // Site-relative image
      if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(href)) {
        if (href.startsWith('/') && !(await exists(path.join(PUBLIC, href)))) {
          error(rel, `image ${href} does not exist in public/`);
        }
        continue;
      }

      // Site-relative page link
      if (href.startsWith('/')) {
        const clean =
          decodeURIComponent(href.split('#')[0].split('?')[0].replace(/\/$/, '')) || '/';
        // A file under public/ is a valid target too, e.g. the archived
        // first-draft pages the action plan links to.
        if (!knownPaths.has(clean) && !(await exists(path.join(PUBLIC, clean)))) {
          error(rel, `link ${href} does not resolve to a page on this site`);
        }
      }
    }
  }

  /* ------------------------------------------- pass 3: index freshness */

  for (const dir of dirs) {
    const indexPath = path.join(CONTENT, dir, 'index.md');
    if (!(await exists(indexPath))) {
      error(`src/content/${dir}/index.md`, 'missing — run `npm run okf:build`');
      continue;
    }
    const index = await fs.readFile(indexPath, 'utf8');
    const listed = new Set([...index.matchAll(/\]\(\/[^)]*?\/([^/)]+)\.md\)/g)].map(m => m[1]));
    const actual = loaded.filter(l => l.dir === dir).map(l => l.file.replace(/\.md$/, ''));

    const missing = actual.filter(s => !listed.has(s));
    const extra = [...listed].filter(s => !actual.includes(s));
    if (missing.length || extra.length) {
      error(
        `src/content/${dir}/index.md`,
        `stale index — run \`npm run okf:build\`${missing.length ? ` (missing: ${missing.slice(0, 3).join(', ')}${missing.length > 3 ? '…' : ''})` : ''}${extra.length ? ` (removed: ${extra.slice(0, 3).join(', ')})` : ''}`
      );
    }
  }

  if (!(await exists(path.join(CONTENT, 'index.md')))) {
    error('src/content/index.md', 'bundle root index missing — run `npm run okf:build`');
  }

  // OKF conformance rule 1 applies to the WHOLE bundle, not just the content
  // directories: any non-reserved .md anywhere under the root must be a
  // conformant concept. Documentation belongs in docs/, not in here.
  for (const entry of await fs.readdir(CONTENT, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    if (isReservedFilename(entry.name)) continue;
    error(
      `src/content/${entry.name}`,
      'OKF: a non-reserved .md at the bundle root makes the bundle non-conformant — move it to docs/'
    );
  }

  /* --------------------------------------------------------- reporting */

  const errors = issues.filter(i => i.level === 'error');
  const warnings = issues.filter(i => i.level === 'warn');

  for (const i of errors) console.error(`ERROR  ${i.file}\n       ${i.message}`);
  if (errors.length && warnings.length) console.log('');
  for (const i of warnings) console.warn(`warn   ${i.file}\n       ${i.message}`);

  console.log(
    `\n${loaded.length} concepts checked · ${errors.length} error${errors.length === 1 ? '' : 's'} · ${warnings.length} warning${warnings.length === 1 ? '' : 's'}`
  );

  if (errors.length) {
    console.error('\nContent validation failed. Fix the errors above before committing.');
    process.exit(1);
  }
  console.log('OKF v0.2 conformant.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
