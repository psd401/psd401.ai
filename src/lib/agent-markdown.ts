/**
 * Markdown responses for agents that ask for them.
 *
 * A request carrying `Accept: text/markdown` (and not text/html) is rewritten
 * by next.config.js to a markdown representation of the same URL:
 *
 *   /                          → homeMarkdown()
 *   /about, /contact, /privacy → the trust page's own markdown body
 *   /<section>/<slug>          → the concept's source, via /okf
 *   anything that would 404    → notFoundMarkdown(), with status 404
 *
 * Every response carries `Vary: Accept`, because the same URL now returns
 * two different bodies depending on that header. Browsers are unaffected:
 * they send text/html, and the rewrites never match.
 */
import { byDateDesc, getConcepts } from './content';
import {
  PRACTICE_HUB,
  PRACTICE_SECTIONS,
  SECTIONS,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from './site';
import { TRUST_PAGES } from './trust-pages';

export function markdownResponse(body: string, init: { status?: number } = {}): Response {
  return new Response(body, {
    status: init.status ?? 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      Vary: 'Accept',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

/** The body for any URL that does not exist. */
export function notFoundMarkdown(): string {
  return `# Page not found

There is no page at this address on ${SITE_NAME} (${SITE_URL}). The site was reorganized in 2026 and most old links redirect automatically; this one did not.

## Where to look instead

- Index of every document, for language models: ${SITE_URL}/llms.txt
- Sitemap: ${SITE_URL}/sitemap.xml
- Search: ${SITE_URL}/search?q={query}
- Homepage: ${SITE_URL}/
`;
}

export function trustPageMarkdown(key: keyof typeof TRUST_PAGES): string {
  const page = TRUST_PAGES[key];
  return `# ${page.title}\n\n${page.body}`;
}

/** The homepage as markdown: what the site is, its sections, and the latest writing. */
export async function homeMarkdown(): Promise<string> {
  const posts = await getConcepts('writing');
  const latest = byDateDesc(posts.filter(p => p.status !== 'draft')).slice(0, 5);

  const sections = SECTIONS.map(
    s => `- [${s.n} ${s.name}](${SITE_URL}${s.href}): ${s.description}`
  ).join('\n');

  const library = PRACTICE_SECTIONS.map(
    s => `- [${s.name}](${SITE_URL}${s.href}): ${s.description}`
  ).join('\n');

  const writing = latest
    .map(p => `- [${p.title}](${SITE_URL}${p.resource}) (${p.date}): ${p.description}`)
    .join('\n');

  return `# ${SITE_NAME}

> ${SITE_TAGLINE}

${SITE_DESCRIPTION}

Peninsula School District, in Gig Harbor, Washington, uses AI in teaching, operations, policy and professional learning. We publish what we build, what we decide and what we learn, including what didn't work.

## Sections

${sections}

## Reference library

Staff-submitted use cases, reviewed tools and summarized research: ${SITE_URL}${PRACTICE_HUB.href}

${library}

## Latest writing

${writing}

## For machines

- Index of every document: ${SITE_URL}/llms.txt
- Full text of every document: ${SITE_URL}/llms-full.txt
- Open Knowledge Format bundle: ${SITE_URL}/okf
- Structured index as JSON: ${SITE_URL}/api/content.json
- Any page's markdown: request it with \`Accept: text/markdown\`, or append \`.md\` to a content URL
- Sitemap: ${SITE_URL}/sitemap.xml

## About this site

- [About](${SITE_URL}/about) · [Contact](${SITE_URL}/contact) · [Privacy](${SITE_URL}/privacy)
- Source: https://github.com/psd401/psd401.ai
- License: CC BY-NC-SA 4.0
`;
}
