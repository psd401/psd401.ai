/**
 * Generate the OKF bundle's reserved files.
 *
 *   npm run okf:build
 *
 * Writes, per the v0.2 spec's §8–§9:
 *   src/content/index.md          bundle root, carries okf_version
 *   src/content/<dir>/index.md    per-directory listing
 *   src/content/log.md            chronological history, newest first
 *
 * index.md files are OPTIONAL in OKF — a consumer must not reject a bundle
 * for their absence. They exist for progressive disclosure: an agent walking
 * the tree reads the index first and only opens the concepts it needs,
 * instead of loading 156 files to answer one question.
 *
 * Re-run this after adding or removing content. `npm run content:validate`
 * fails if the indexes are stale.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import matter from 'gray-matter';
import { OKF_VERSION, isReservedFilename } from '../src/lib/okf';
import { DIR_TO_TYPE, type ContentDir } from '../src/lib/schemas';

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, 'src/content');

const DIR_TITLES: Record<ContentDir, string> = {
  writing: '01 Writing',
  software: '02 Software',
  guidance: '03 Guidance',
  presentations: '04 Presentations',
  'use-cases': 'Use cases',
  tools: 'Tools',
  articles: 'Research',
};

const DIR_BLURBS: Record<ContentDir, string> = {
  writing: 'Notes from the people doing the work: what we built, decided and learned.',
  software: 'Products the district builds and runs, all open source.',
  guidance: 'The guidance our own staff work from.',
  presentations: 'Talks and slides, published as given.',
  'use-cases': 'Practical examples of AI in use across the district, submitted by staff.',
  tools: 'AI tools reviewed for district use.',
  articles: 'External research and articles on AI in education.',
};

type Entry = { slug: string; title: string; description: string; date?: string; status?: string };

async function readDir(dir: ContentDir): Promise<Entry[]> {
  const abs = path.join(CONTENT, dir);
  let files: string[];
  try {
    files = await fs.readdir(abs);
  } catch {
    return [];
  }

  const entries: Entry[] = [];
  for (const f of files.sort()) {
    if (!f.endsWith('.md') || isReservedFilename(f)) continue;
    const raw = await fs.readFile(path.join(abs, f), 'utf8');
    const { data } = matter(raw);
    entries.push({
      slug: f.replace(/\.md$/, ''),
      title: String(data.title ?? f),
      description: String(data.description ?? ''),
      date: data.date ? String(data.date) : undefined,
      status: data.status ? String(data.status) : undefined,
    });
  }
  return entries;
}

/** `* [Title](/dir/slug.md) - description` — the spec's entry shape. */
function line(dir: ContentDir, e: Entry): string {
  const draft = e.status === 'draft' ? ' *(draft)*' : '';
  const desc = e.description ? ` - ${e.description}` : '';
  return `* [${e.title}](/${dir}/${e.slug}.md)${draft}${desc}`;
}

async function writeDirIndex(dir: ContentDir, entries: Entry[]): Promise<void> {
  const body = [
    `# ${DIR_TITLES[dir]}`,
    '',
    DIR_BLURBS[dir],
    '',
    `Concept type: \`${DIR_TO_TYPE[dir]}\` · ${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`,
    '',
    '## Concepts',
    '',
    ...entries.map(e => line(dir, e)),
    '',
  ].join('\n');

  await fs.writeFile(path.join(CONTENT, dir, 'index.md'), body, 'utf8');
}

async function writeRootIndex(all: Array<{ dir: ContentDir; entries: Entry[] }>): Promise<void> {
  const total = all.reduce((n, g) => n + g.entries.length, 0);

  const body = [
    '---',
    `okf_version: '${OKF_VERSION}'`,
    '---',
    '',
    '# Peninsula School District — AI knowledge bundle',
    '',
    'Everything Peninsula School District (Gig Harbor, Washington) publishes about',
    'its AI work: the software it builds, the guidance it writes, the talks it',
    'gives, and what it learns along the way.',
    '',
    `This directory is an [Open Knowledge Format](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf) v${OKF_VERSION} bundle.`,
    'Every markdown file below the root is one concept, carrying a `type` and its',
    'own frontmatter. These are the same files the website renders, so what an',
    'agent reads and what a reader sees stay the same.',
    '',
    `${total} concepts across ${all.length} directories.`,
    '',
    "Licensed CC BY-NC-SA 4.0. Fork it and put your district's name on it.",
    '',
    '## Directories',
    '',
    ...all.map(
      g =>
        `* [${DIR_TITLES[g.dir]}](/${g.dir}/index.md) — \`${DIR_TO_TYPE[g.dir]}\`, ${g.entries.length} ${g.entries.length === 1 ? 'concept' : 'concepts'}. ${DIR_BLURBS[g.dir]}`
    ),
    '',
    '## Conventions',
    '',
    '* Cross-links between concepts are bundle-absolute (`/writing/my-post.md`),',
    '  so they survive a document moving.',
    '* `resource` on each concept is its canonical URL path on psd401.ai.',
    '* `status: draft` means the copy has not been reviewed. Treat it as a',
    '  placeholder, not a claim.',
    '* `generated.by` names the actor that wrote a concept; `verified.by` names',
    '  who checked it. An actor starting `human:` means a person reviewed it.',
    '* Counts in this bundle and on the website are computed from the files.',
    '  Nothing here is rounded up.',
    '',
  ].join('\n');

  await fs.writeFile(path.join(CONTENT, 'index.md'), body, 'utf8');
}

/**
 * log.md — date-grouped, newest first, from git history of src/content/.
 * Uses --follow-free plain log because the directory renames during the OKF
 * migration would otherwise duplicate entries under both paths.
 */
async function writeLog(): Promise<void> {
  let raw = '';
  try {
    raw = execFileSync('git', ['log', '--date=short', '--format=%ad%s', '--', 'src/content'], {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
    });
  } catch {
    // A shallow clone or a fresh repo has no history to summarise.
  }

  const byDate = new Map<string, string[]>();
  for (const l of raw.split('\n')) {
    if (!l.trim()) continue;
    const [date, subject] = l.split('');
    if (!date || !subject) continue;
    const list = byDate.get(date) ?? [];
    if (!list.includes(subject)) list.push(subject);
    byDate.set(date, list);
  }

  const dates = [...byDate.keys()].sort().reverse();

  const body = [
    '# Update history',
    '',
    'Changes to the concepts in this bundle, newest first, taken from the',
    'repository history. Generated by `npm run okf:build`.',
    '',
    ...dates.flatMap(d => [
      `## ${d}`,
      '',
      ...(byDate.get(d) ?? []).map(s => `**Update** — ${s}`),
      '',
    ]),
  ].join('\n');

  await fs.writeFile(path.join(CONTENT, 'log.md'), body, 'utf8');
}

async function main() {
  const dirs = Object.keys(DIR_TO_TYPE) as ContentDir[];
  const all: Array<{ dir: ContentDir; entries: Entry[] }> = [];

  for (const dir of dirs) {
    const entries = await readDir(dir);
    if (!entries.length) continue;
    await writeDirIndex(dir, entries);
    all.push({ dir, entries });
  }

  await writeRootIndex(all);
  await writeLog();

  const total = all.reduce((n, g) => n + g.entries.length, 0);
  console.log(
    `OKF v${OKF_VERSION} bundle: ${total} concepts, ${all.length} directory indexes, root index + log written.`
  );
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
