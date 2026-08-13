import { getAllConcepts, indexable } from '@/lib/all-content';
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from '@/lib/site';

export const dynamic = 'force-static';
export const revalidate = 3600;

/**
 * RSS 2.0 across every content type, not just the blog.
 *
 * Someone subscribing to a district's AI work wants the new policy and the
 * new product as much as the new post, so the feed carries all of them and
 * labels each with its section in the category field.
 */
function escape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function rfc822(date: string): string {
  const d = new Date(`${date.slice(0, 10)}T12:00:00Z`);
  return Number.isNaN(d.getTime()) ? new Date().toUTCString() : d.toUTCString();
}

export async function GET() {
  const concepts = indexable(await getAllConcepts()).slice(0, 50);

  const items = concepts
    .map(c =>
      [
        '    <item>',
        `      <title>${escape(c.title)}</title>`,
        `      <link>${SITE_URL}${escape(c.url)}</link>`,
        `      <guid isPermaLink="true">${SITE_URL}${escape(c.url)}</guid>`,
        `      <description>${escape(c.description)}</description>`,
        `      <pubDate>${rfc822(c.date)}</pubDate>`,
        `      <category>${escape(c.section)}</category>`,
        ...c.tags.map(t => `      <category>${escape(t)}</category>`),
        '    </item>',
      ].join('\n')
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escape(SITE_DESCRIPTION)}</description>
    <language>en-US</language>
    <copyright>CC BY-NC-SA 4.0, Peninsula School District</copyright>
    <lastBuildDate>${concepts[0] ? rfc822(concepts[0].date) : new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
