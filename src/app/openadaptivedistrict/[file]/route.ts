import { escapeHtml, getOadDocs, getOadPrintable, getOadSeries } from '@/lib/oad';
import { SITE_URL } from '@/lib/site';

/**
 * The printable copies of the Open Adaptive District documents, at their
 * original URLs: /openadaptivedistrict/01-Start-Here.html and so on.
 *
 * These used to be hand-written static files in public/. They are now built
 * from the same markdown and the same HTML as the in-site pages, so the two
 * can never disagree. The page is self-contained: its own small header and
 * nav, styled by public/openadaptivedistrict/oad.css (which has print rules),
 * and a canonical pointing at the in-site page so search engines see one copy.
 *
 * `npm run links:audit` checks all five URLs still answer 200.
 */
export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  const docs = await getOadDocs();
  return docs.filter(d => d.printable).map(d => ({ file: d.printable! }));
}

export async function GET(_request: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;
  const doc = await getOadPrintable(file);
  if (!doc) return new Response('Not found', { status: 404 });

  const series = await getOadSeries();
  const nav = series
    .map(d =>
      d.slug === doc.slug
        ? `<span>${escapeHtml(d.label)}</span>`
        : `<a href="/openadaptivedistrict/${d.printable}">${escapeHtml(d.label)}</a>`
    )
    .join('');

  const page = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(doc.title)}</title>
    <link rel="stylesheet" href="/openadaptivedistrict/oad.css" />
    <link rel="canonical" href="${SITE_URL}${doc.resource}" />
  </head>
  <body>
    <div class="wrap">
      <header>
        <img alt="Peninsula School District" src="/images/psd-logo-ink.png" />
        <div class="site">The Open Adaptive District &bull; psd401.ai</div>
      </header>
      <nav class="oadnav"><a href="/open-adaptive-district">Home</a>${nav}</nav>
${doc.html}
    </div>
  </body>
</html>
`;

  return new Response(page, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
