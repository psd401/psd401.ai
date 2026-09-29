/**
 * Assert that every URL the site had BEFORE the redesign still resolves.
 *
 *   npm run build && npm start        # in one terminal
 *   npm run links:audit               # in another
 *   npm run links:audit -- --base http://localhost:3001
 *
 * The redesign renumbered the information architecture. Old URLs live in
 * slide decks, QR codes, press articles and other districts' documentation,
 * none of which we can update. This script is the guarantee that none of them
 * broke: it reads the pre-redesign content tree straight out of git, rebuilds
 * the URL every file used to have, and fetches it.
 *
 * A 200 passes. A 3xx passes only if it lands on a 200. Anything else fails.
 */
import { execFileSync } from 'node:child_process';
import matter from 'gray-matter';

const BASE = (() => {
  const i = process.argv.indexOf('--base');
  return i !== -1 ? process.argv[i + 1] : 'http://localhost:3000';
})().replace(/\/$/, '');

/**
 * The commit to treat as "before the redesign".
 *
 * Pinned, NOT HEAD. The redesign renamed src/content/blog -> writing and
 * policies -> guidance, so once it landed, reading the old tree from HEAD
 * returns nothing and 45 URLs drop out of the audit silently — it would
 * report a clean pass while checking a fraction of what it claims to.
 * assertBaseline() below turns that failure mode into a loud one.
 */
const BASELINE = 'e776864';

const REF = (() => {
  const i = process.argv.indexOf('--ref');
  return i !== -1 ? process.argv[i + 1] : BASELINE;
})();

/** Directories that MUST exist at REF. Their absence means silent under-coverage. */
const REQUIRED_AT_REF = [
  'src/content/blog',
  'src/content/policies',
  'src/content/presentations',
  'src/content/tools',
  'src/content/articles',
  'src/content/use-cases',
];

type Check = { url: string; why: string };

function git(args: string[]): string {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
}

/**
 * Files under a directory at REF.
 *
 * Reserved OKF filenames are excluded: index.md and log.md describe the
 * bundle and were never pages, so including them invents URLs like
 * /articles/index that have never existed and can only ever 404.
 */
function listAt(dir: string): string[] {
  try {
    return git(['ls-tree', '--name-only', `${REF}:${dir}`])
      .split('\n')
      .filter(f => f.endsWith('.md'))
      .filter(f => f !== 'index.md' && f !== 'log.md');
  } catch {
    return [];
  }
}

/**
 * Refuse to run against a ref that does not hold the pre-redesign tree.
 * An audit that quietly checks less than it says it does is worse than none.
 */
function assertBaseline(): void {
  const missing = REQUIRED_AT_REF.filter(d => {
    try {
      git(['ls-tree', '--name-only', `${REF}:${d}`]);
      return false;
    } catch {
      return true;
    }
  });

  if (missing.length) {
    console.error(
      `\nThe ref "${REF}" does not contain the pre-redesign content tree.\n` +
        `Missing: ${missing.join(', ')}\n\n` +
        `This audit reconstructs old URLs from that tree. Without it, it would\n` +
        `silently check only a fraction of the URLs it claims to.\n\n` +
        `Pass a ref from before the redesign:  npm run links:audit -- --ref <sha>\n`
    );
    process.exit(1);
  }
}

function readAt(path: string): string | null {
  try {
    return git(['show', `${REF}:${path}`]);
  } catch {
    return null;
  }
}

function buildChecks(): Check[] {
  const checks: Check[] = [];
  const add = (url: string, why: string) => checks.push({ url, why });

  // ---- pre-redesign static routes
  for (const p of [
    '/',
    '/blog',
    '/articles',
    '/presentations',
    '/use-cases',
    '/policies',
    '/tools',
    '/aistudio',
    '/openadaptivedistrict',
    '/search',
  ]) {
    add(p, 'pre-redesign static route');
  }

  // ---- pre-redesign machine surfaces
  for (const p of ['/sitemap.xml', '/robots.txt', '/llms.txt', '/feed.xml']) {
    add(p, 'pre-redesign machine surface');
  }

  // ---- pre-redesign content, one URL per markdown file
  const simple: Array<[dir: string, prefix: string]> = [
    ['src/content/blog', '/blog'],
    ['src/content/policies', '/policies'],
    ['src/content/presentations', '/presentations'],
    ['src/content/tools', '/tools'],
    ['src/content/articles', '/articles'],
  ];

  for (const [dir, prefix] of simple) {
    for (const file of listAt(dir)) {
      add(`${prefix}/${file.replace(/\.md$/, '')}`, `pre-redesign ${prefix} page`);
    }
  }

  // Use cases carried the category in the path, URL-encoded.
  for (const file of listAt('src/content/use-cases')) {
    const raw = readAt(`src/content/use-cases/${file}`);
    if (!raw) continue;
    const { data } = matter(raw);
    const category = String(data.category ?? '');
    if (!category) continue;
    add(
      `/use-cases/${encodeURIComponent(category)}/${file.replace(/\.md$/, '')}`,
      'pre-redesign use-case page'
    );
  }

  // The Open Adaptive District artefacts are hand-authored static HTML and
  // must keep resolving at their original paths.
  for (const f of [
    '01-Start-Here.html',
    '02-The-Playbook.html',
    '03-What-Were-Learning.html',
    '04-The-Deep-Dive.html',
    '05-Get-Started-Flyer.html',
  ]) {
    add(`/openadaptivedistrict/${f}`, 'OAD artefact — must NOT be swallowed by a redirect');
  }

  // ---- surfaces introduced by the redesign
  for (const p of [
    '/writing',
    '/software',
    '/guidance',
    '/open-adaptive-district',
    '/practice',
    '/okf',
    '/okf/index.md',
    '/llms-full.txt',
    '/api/content.json',
    '/writing/build-products-our-agents-can-use.md',
  ]) {
    add(p, 'new in the redesign');
  }

  return checks;
}

async function main() {
  assertBaseline();
  const checks = buildChecks();
  console.log(`Auditing ${checks.length} URLs against ${BASE} (baseline ${REF})\n`);

  const failures: Array<{ url: string; why: string; detail: string }> = [];
  let redirected = 0;
  let ok = 0;

  // Modest concurrency — this is a local dev server, not a load test.
  const queue = [...checks];
  const workers = Array.from({ length: 8 }, async () => {
    for (;;) {
      const check = queue.shift();
      if (!check) return;

      const target = `${BASE}${check.url}`;
      try {
        const res = await fetch(target, { redirect: 'follow' });
        if (!res.ok) {
          failures.push({
            ...check,
            detail: `${res.status} ${res.statusText}`,
          });
          continue;
        }
        // res.redirected means we followed at least one hop and landed on 200.
        if (res.redirected) redirected++;
        else ok++;
      } catch (e) {
        failures.push({ ...check, detail: (e as Error).message });
      }
    }
  });

  await Promise.all(workers);

  console.log(`  ${ok} resolved directly`);
  console.log(`  ${redirected} redirected to a 200`);
  console.log(`  ${failures.length} failed\n`);

  if (failures.length) {
    for (const f of failures.sort((a, b) => a.url.localeCompare(b.url))) {
      console.error(`FAIL  ${f.url}\n      ${f.detail} — ${f.why}`);
    }
    console.error(
      `\n${failures.length} URLs did not resolve. These are live links that would break.`
    );
    process.exit(1);
  }

  console.log('Every pre-redesign URL still resolves.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
