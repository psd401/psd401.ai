/**
 * Assert the site answers agents the way it claims to.
 *
 *   bun run build && bun run start        # in one terminal
 *   bun run agent:audit               # in another
 *   bun run agent:audit -- --base https://psd401.ai
 *
 * Covers, over real HTTP so the next.config.js rewrites and headers are part
 * of what is tested:
 *
 *   · Markdown content negotiation (acceptmarkdown.com): `Accept: text/markdown`
 *     gets markdown with `Vary: Accept`; a browser's Accept still gets HTML.
 *   · Agent-readable 404s: a missing URL is a 404 with a markdown body that
 *     links to llms.txt and the sitemap.
 *   · Homepage metadata: canonical, lang, og:image, og:type.
 *   · Organization JSON-LD with contactPoint and a PostalAddress.
 *   · The trust pages (/about, /contact, /privacy) exist, carry real content
 *     in both shapes, and are in the sitemap.
 *
 * Exits non-zero if any check fails, after running all of them.
 */
import assert from 'node:assert/strict';

const BASE = (() => {
  const i = process.argv.indexOf('--base');
  return i !== -1 ? process.argv[i + 1] : 'http://localhost:3000';
})().replace(/\/$/, '');

const MD = 'text/markdown';
const HTML = 'text/html';
/** What Chrome sends for a navigation. */
const BROWSER = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,*/*;q=0.8';
const PROBE = `/__agent-audit-404-${Date.now().toString(36)}`;

let passed = 0;
const failures: string[] = [];

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    passed++;
    console.log(`  ok    ${name}`);
  } catch (err) {
    failures.push(name);
    console.log(
      `  FAIL  ${name}\n        ${(err as Error).message.split('\n').join('\n        ')}`
    );
  }
}

async function get(path: string, accept?: string) {
  const res = await fetch(BASE + path, {
    headers: accept ? { Accept: accept } : {},
    redirect: 'follow',
  });
  const body = await res.text();
  return {
    status: res.status,
    type: res.headers.get('content-type') ?? '',
    vary: (res.headers.get('vary') ?? '').toLowerCase(),
    body,
  };
}

function varies(vary: string) {
  return vary.split(',').some(v => v.trim() === 'accept');
}

function isMarkdown(r: Awaited<ReturnType<typeof get>>, status = 200) {
  assert.equal(r.status, status, `status ${r.status}, expected ${status}`);
  assert.ok(r.type.startsWith(MD), `content-type "${r.type}"`);
  assert.ok(varies(r.vary), `Vary "${r.vary}" does not include Accept`);
  assert.ok(!/<html|<!doctype/i.test(r.body), 'body is HTML');
}

function isHtml(r: Awaited<ReturnType<typeof get>>, status = 200) {
  assert.equal(r.status, status, `status ${r.status}, expected ${status}`);
  assert.ok(r.type.startsWith(HTML), `content-type "${r.type}"`);
}

/**
 * Prose text of an HTML page's <main>: the contents of its paragraphs and
 * list items. Only measured, never rendered. Reading <p> and <li> rather than
 * stripping <script> keeps JSON-LD out of the count without regex HTML
 * filtering, and tags are split out rather than replaced.
 */
function mainText(html: string): string {
  const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html;
  return [...main.matchAll(/<(p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi)]
    .map(m => m[2].split(/<[^>]*>/).join(' '))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  console.log(`\nAgent audit against ${BASE}\n`);

  // One real concept per type, from the site's own index.
  const index = JSON.parse((await get('/api/content.json')).body) as {
    concepts: Array<{ type: string; url: string }>;
  };
  const samples = [...new Map(index.concepts.map(c => [c.type, c])).values()].map(
    c => new URL(c.url).pathname
  );
  assert.ok(samples.length >= 8, `expected a concept of every type, got ${samples.length}`);

  console.log('Markdown negotiation');

  await test('/ with Accept: text/markdown is markdown, Vary: Accept', async () => {
    const r = await get('/', MD);
    isMarkdown(r);
    assert.match(r.body, /^# /, 'body does not start with a heading');
    assert.ok(r.body.includes('/llms.txt'), 'body does not link llms.txt');
  });

  // Vary: Accept is asserted on the markdown responses only. Next overwrites
  // Vary on prerendered HTML (a next.config.js headers() entry is dropped),
  // and the CDN in front of the site already keys its cache on Accept.
  await test('/ with Accept: text/html is HTML', async () => {
    isHtml(await get('/', HTML));
  });

  await test('/ with a browser Accept header is HTML', async () => {
    isHtml(await get('/', BROWSER));
  });

  await test('/ with Accept: */* is HTML', async () => {
    isHtml(await get('/', '*/*'));
  });

  await test('/ with both markdown and HTML acceptable is HTML', async () => {
    isHtml(await get('/', 'text/markdown, text/html'));
  });

  for (const path of samples) {
    await test(`${decodeURI(path)} negotiates to its .md source`, async () => {
      const r = await get(path, MD);
      isMarkdown(r);
      const source = await get(`${path}.md`);
      assert.equal(source.status, 200, `${path}.md is ${source.status}`);
      assert.equal(r.body, source.body, 'negotiated body differs from the .md source');
      isHtml(await get(path, BROWSER));
    });
  }

  await test('a redirected old URL negotiates after the redirect', async () => {
    const post = samples.find(p => p.startsWith('/writing/'));
    assert.ok(post, 'no writing sample');
    isMarkdown(await get(post.replace('/writing/', '/blog/'), MD));
  });

  console.log('\nAgent-readable 404s');

  for (const path of [PROBE, `/writing${PROBE}`, `/a/b${PROBE}`]) {
    await test(`${path} is a 404 with a markdown body`, async () => {
      const r = await get(path, MD);
      isMarkdown(r, 404);
      assert.ok(r.body.trim().length >= 20, 'body under 20 characters');
      assert.ok(r.body.includes('/llms.txt'), 'body does not link llms.txt');
      assert.ok(r.body.includes('/sitemap.xml'), 'body does not link the sitemap');
    });
  }

  await test(`${PROBE} is still an HTML 404 for a browser`, async () => {
    isHtml(await get(PROBE, BROWSER), 404);
  });

  console.log('\nHomepage metadata and JSON-LD');

  const home = (await get('/', BROWSER)).body;

  await test('canonical, lang, og:image and og:type', async () => {
    assert.match(home, /<link rel="canonical" href="[^"]+"/, 'no canonical');
    assert.match(home, /<html[^>]* lang="[a-z]{2}/, 'no html lang');
    assert.match(home, /<meta property="og:image" content="[^"]+"/, 'no og:image');
    assert.match(home, /<meta property="og:type" content="website"/, 'no og:type');
  });

  await test('Organization has contactPoint and a PostalAddress', async () => {
    const blocks = [...home.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    const nodes = blocks.flatMap(b => {
      const data = JSON.parse(b[1]);
      return data['@graph'] ?? [data];
    });
    const org = nodes.find(n => [n['@type']].flat().includes('Organization'));
    assert.ok(org, 'no Organization node');
    assert.equal(org.contactPoint?.['@type'], 'ContactPoint', 'no ContactPoint');
    assert.ok(org.contactPoint.contactType, 'contactPoint has no contactType');
    assert.ok(org.contactPoint.email || org.contactPoint.telephone, 'no email or telephone');
    assert.equal(org.address?.['@type'], 'PostalAddress', 'no PostalAddress');
  });

  console.log('\nTrust pages');

  const sitemap = (await get('/sitemap.xml')).body;

  for (const page of ['/about', '/contact', '/privacy']) {
    await test(`${page}: HTML and markdown, 500+ characters, in the sitemap`, async () => {
      const html = await get(page, BROWSER);
      isHtml(html);
      assert.ok(mainText(html.body).length >= 500, 'HTML main text under 500 characters');
      const md = await get(page, MD);
      isMarkdown(md);
      assert.ok(md.body.length >= 500, 'markdown under 500 characters');
      assert.ok(sitemap.includes(`${page}</loc>`), 'not in sitemap.xml');
    });
  }

  console.log('\nExisting machine surfaces');

  for (const [path, type] of [
    ['/llms.txt', MD],
    ['/llms-full.txt', MD],
    ['/sitemap.xml', 'application/xml'],
    ['/feed.xml', 'application/rss+xml'],
    ['/robots.txt', 'text/plain'],
    ['/api/content.json', 'application/json'],
    ['/okf/index.md', MD],
  ] as const) {
    await test(`${path} is 200${type ? ` ${type}` : ''}`, async () => {
      const r = await get(path);
      assert.equal(r.status, 200, `status ${r.status}`);
      if (type) assert.ok(r.type.startsWith(type), `content-type "${r.type}"`);
    });
  }

  console.log(`\n${passed} passed, ${failures.length} failed`);
  if (failures.length) process.exit(1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
