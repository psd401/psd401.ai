import { getAllConcepts, indexable, STATIC_ROUTES } from '@/lib/all-content';
import { getCategories } from '@/lib/use-cases';
import { getOadArtifacts } from '@/lib/oad';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';
export const revalidate = 3600;

/**
 * The sitemap is generated from the same source as every page, so it cannot
 * list a URL that does not exist.
 *
 * The previous version hardcoded /about and /contact. Neither route has ever
 * existed on this site, so Google was being handed two 404s on every crawl.
 * Draft concepts are excluded — an unreviewed page should not be advertised.
 */
function escape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry({
  path,
  lastmod,
  changefreq,
  priority,
}: {
  path: string;
  lastmod?: string;
  changefreq: string;
  priority: string;
}): string {
  const loc = escape(`${SITE_URL}${path}`);
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

export async function GET() {
  const [concepts, categories, oad] = await Promise.all([
    getAllConcepts(),
    getCategories(),
    getOadArtifacts(),
  ]);
  const published = indexable(concepts);

  // The freshest concept date stands in for "when did this index last change".
  const newest = published[0]?.date;

  const entries = [
    ...STATIC_ROUTES.map(r =>
      urlEntry({ path: r.path, lastmod: newest, changefreq: r.changefreq, priority: r.priority })
    ),
    ...categories.map(c =>
      urlEntry({
        path: `/use-cases/${c.slug}`,
        changefreq: 'monthly',
        priority: '0.5',
      })
    ),
    // The five Open Adaptive District artefacts. Only the canonical app
    // routes are listed — the standalone .html copies point their canonical
    // here, so listing both would advertise duplicate content.
    ...oad.map(a =>
      urlEntry({
        path: `/open-adaptive-district/${a.slug}`,
        changefreq: 'monthly',
        priority: '0.7',
      })
    ),
    ...published.map(c =>
      urlEntry({
        path: c.url,
        lastmod: c.date,
        changefreq: c.dir === 'writing' ? 'monthly' : 'yearly',
        priority: c.dir === 'writing' || c.dir === 'software' ? '0.8' : '0.6',
      })
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
