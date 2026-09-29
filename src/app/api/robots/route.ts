import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

/**
 * robots.txt, served at /robots.txt via a rewrite in next.config.js.
 *
 * The district's whole position is that this work should be reusable, so the
 * AI crawlers are allowed explicitly rather than left to the wildcard — an
 * explicit allow also survives a future tightening of the default.
 *
 * The pointers at the bottom are non-standard but widely read: they are how
 * an agent that lands on robots.txt finds the machine-readable surfaces
 * without crawling the HTML.
 */
/**
 * A crawler follows only the most specific group that names it, so each
 * named group repeats the wildcard's Disallow: /search. Without it these bots
 * would ignore that line and crawl every search-results URL.
 */
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
];

export async function GET() {
  const body = `# https://www.robotstxt.org/robotstxt.html
# Peninsula School District publishes this work to be reused.
# Everything here is CC BY-NC-SA 4.0.

User-agent: *
Allow: /
Disallow: /search

# Answer engines and model crawlers, allowed explicitly.
${AI_CRAWLERS.map(ua => `User-agent: ${ua}\nAllow: /\nDisallow: /search\n`).join('\n')}
Sitemap: ${SITE_URL}/sitemap.xml

# Machine-readable surfaces
# llms.txt      ${SITE_URL}/llms.txt        index of everything, with links
# llms-full.txt ${SITE_URL}/llms-full.txt   full text of every document
# OKF bundle    ${SITE_URL}/okf             Open Knowledge Format v0.2
# Content API   ${SITE_URL}/api/content.json
# Any content page  append .md to its URL for the markdown source
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
