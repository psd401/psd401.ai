/**
 * Scaffold a new concept with correct frontmatter.
 *
 *   npm run content:new -- --type post --title "What we learned about IEP drafts"
 *   npm run content:new -- --type use-case --title "..." --category "Enhancing Teaching & Learning"
 *   npm run content:new -- --type software --title "LessonLens" --maturity Pilot
 *
 * Guessing the frontmatter shape is the single most common way an agent
 * produces a file that does not render. This removes the guess: it emits
 * every required field filled in, every optional field commented, and a
 * `resource` that already matches where the file will live.
 *
 * The output is validated before it is written, so this can never produce a
 * file that `npm run content:validate` would reject.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { dump } from 'js-yaml';
import { SCHEMAS, DIR_TO_TYPE, DIR_TO_URL, type ContentDir } from '../src/lib/schemas';
import { OKF_TYPES, type OkfType } from '../src/lib/okf';

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, 'src/content');

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

const MAX_SLUG = 72;

function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (slug.length <= MAX_SLUG) return slug;
  // Cut at the last whole word that fits. A plain slice could end mid-word
  // or on a hyphen, and the slug is the page's permanent URL.
  const end = slug.slice(0, MAX_SLUG + 1).lastIndexOf('-');
  return end > 0 ? slug.slice(0, end) : slug.slice(0, MAX_SLUG);
}

function today(): string {
  // Passed in by the caller when reproducibility matters (tests, fixtures).
  return arg('date') ?? new Date().toISOString().slice(0, 10);
}

const DIR_FOR_TYPE = Object.fromEntries(
  Object.entries(DIR_TO_TYPE).map(([dir, type]) => [type, dir])
) as Record<OkfType, ContentDir>;

function usage(message?: string): never {
  if (message) console.error(`\n${message}\n`);
  console.error(`Usage:
  npm run content:new -- --type <type> --title "<title>" [options]

Types:
${OKF_TYPES.map(t => `  ${t.padEnd(14)}→ src/content/${DIR_FOR_TYPE[t]}/`).join('\n')}

Common options:
  --title      required
  --slug       defaults to a slugified title
  --author     post, use-case, research
  --category   REQUIRED for use-case; optional for policy, tool
  --maturity   REQUIRED for software (Production | Pilot | Beta | Retired)
  --date       defaults to today
  --tags       comma-separated
  --force      overwrite an existing file

Example:
  npm run content:new -- --type post \\
    --title "IEP drafts: stopped after two weeks" \\
    --author "Kris Hagel" --tags "What flopped,Special Services"
`);
  process.exit(1);
}

async function main() {
  const type = arg('type') as OkfType | undefined;
  const title = arg('title');

  if (!type) usage('Missing --type.');
  if (!OKF_TYPES.includes(type)) usage(`Unknown type "${type}".`);
  if (!title) usage('Missing --title.');

  const dir = DIR_FOR_TYPE[type];
  const slug = arg('slug') ?? slugify(title);
  const date = today();
  const tags = (arg('tags') ?? '')
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  const category = arg('category');
  const maturity = arg('maturity');

  if (type === 'use-case' && !category) {
    usage('--category is required for a use-case; it forms part of the URL.');
  }
  if (type === 'software' && !maturity) {
    usage('--maturity is required for software (Production | Pilot | Beta | Retired).');
  }

  const resource =
    type === 'use-case'
      ? `${DIR_TO_URL[dir]}/${encodeURIComponent(category!)}/${slug}`
      : `${DIR_TO_URL[dir]}/${slug}`;

  const description = arg('description') ?? `TODO: one sentence describing ${title}.`;

  const frontmatter: Record<string, unknown> = {
    type,
    title,
    description,
    resource,
    date,
    tags,
    // New content is unreviewed by definition. Clearing this is the act of
    // publishing: draft concepts are excluded from the sitemap, llms.txt and
    // the RSS feed, and carry noindex.
    status: 'draft',
  };

  switch (type) {
    case 'post':
      frontmatter.author = arg('author') ?? 'TODO';
      break;
    case 'software':
      frontmatter.maturity = maturity;
      frontmatter.stack = arg('stack') ?? 'TODO';
      break;
    case 'policy':
      frontmatter.category = category ?? 'Guidance';
      break;
    case 'presentation':
      frontmatter.presenters = (arg('presenters') ?? '')
        .split(',')
        .map(p => p.trim())
        .filter(Boolean);
      frontmatter.audience = arg('audience') ?? 'TODO';
      frontmatter.format = arg('format') ?? 'PD Session';
      break;
    case 'use-case':
      frontmatter.category = category;
      frontmatter.tools_used = (arg('tools') ?? '')
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
      frontmatter.author = arg('author') ?? 'TODO';
      break;
    case 'tool':
      frontmatter.provider = arg('provider') ?? 'TODO';
      frontmatter.maturity = maturity ?? 'Experimentation';
      break;
    case 'research':
      frontmatter.author = arg('author') ?? 'TODO';
      frontmatter.source = arg('source') ?? 'TODO';
      frontmatter.format = arg('format') ?? 'Research';
      break;
  }

  // Validate before writing. This script must never emit a file that
  // content:validate would reject.
  const result = SCHEMAS[type].safeParse(frontmatter);
  if (!result.success) {
    console.error('Generated frontmatter failed its own schema — this is a bug in content-new.ts:');
    for (const i of result.error.issues) {
      console.error(`  ${i.path.join('.') || '(root)'}: ${i.message}`);
    }
    process.exit(1);
  }

  // Serialise with js-yaml rather than string concatenation. Hand-rolled YAML
  // breaks the moment a value contains ': ', a '#', or a leading '-' — and a
  // placeholder like "TODO: one sentence describing X" contains exactly that.
  const yaml = dump(frontmatter, {
    lineWidth: -1,
    noRefs: true,
    quotingType: "'",
    sortKeys: false,
  });

  const body = `---
${yaml}---

TODO: write the piece.

Before publishing:

1. Replace \`description\` with one real sentence — it becomes the page's meta
   description, its search result, and its entry in llms.txt.
2. Fill in every TODO above.
3. Remove \`status: draft\` so the page is indexed and appears in the feed.
4. Run \`npm run okf:build\` to refresh the bundle indexes.
5. Run \`npm run content:validate\`.

House style is in AGENTS.md. The short version: first person plural, past
tense, specific. Sentence case headings. No emoji. Real numbers or none.
Publish the failures.
`;

  const target = path.join(CONTENT, dir, `${slug}.md`);

  try {
    await fs.access(target);
    if (!process.argv.includes('--force')) {
      console.error(`\nsrc/content/${dir}/${slug}.md already exists. Pass --force to overwrite.\n`);
      process.exit(1);
    }
  } catch {
    /* does not exist — good */
  }

  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, body, 'utf8');

  console.log(`\nCreated src/content/${dir}/${slug}.md`);
  console.log(`  type      ${type}`);
  console.log(`  url       ${resource}`);
  console.log(`  status    draft (not indexed until you clear this)`);
  console.log(`\nNext: write it, then \`npm run okf:build && npm run content:validate\`.\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
