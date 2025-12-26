import { getAllPosts } from '@/lib/blog';
import { getAllArticles } from '@/lib/articles';
import { getAllPresentations } from '@/lib/presentations';
import { getAllUseCases } from '@/lib/use-cases';
import { getAllPolicies } from '@/lib/policies';
import { getAllTools } from '@/lib/tools';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://psd401.ai';

  // Static routes that should always be included
  const staticRoutes = [
    '',
    '/blog',
    '/articles',
    '/presentations',
    '/use-cases',
    '/policies',
    '/tools',
    '/about',
    '/contact',
  ];

  // Get all dynamic content
  const [posts, articles, presentations, useCases, policies, tools] = await Promise.all([
    getAllPosts(),
    getAllArticles(),
    getAllPresentations(),
    getAllUseCases(),
    getAllPolicies(),
    getAllTools(),
  ]);

  // Helper function to safely format date
  const formatDate = (dateStr: string | undefined): string | null => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      // Check if date is valid
      if (isNaN(date.getTime())) return null;
      return date.toISOString();
    } catch {
      return null;
    }
  };

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticRoutes
    .map(
      route => `
  <url>
    <loc>${baseUrl}${route}</loc>
    <changefreq>daily</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`
    )
    .join('')}
  ${posts
    .map(post => {
      const lastmod = formatDate(post.date);
      return `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    })
    .join('')}
  ${articles
    .map(article => {
      const lastmod = formatDate(article.date);
      return `
  <url>
    <loc>${baseUrl}/articles/${article.slug}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    })
    .join('')}
  ${presentations
    .map(presentation => {
      const lastmod = formatDate(presentation.date);
      return `
  <url>
    <loc>${baseUrl}/presentations/${presentation.slug}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    })
    .join('')}
  ${useCases
    .map(useCase => {
      const lastmod = useCase.date
        ? formatDate(useCase.date)
        : formatDate(new Date().toISOString());
      return `
  <url>
    <loc>${baseUrl}/use-cases/${useCase.category}/${useCase.slug}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    })
    .join('')}
  ${policies
    .map(policy => {
      const lastmod = formatDate(policy.date);
      return `
  <url>
    <loc>${baseUrl}/policies/${policy.slug}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    })
    .join('')}
  ${tools
    .map(tool => {
      const lastmod = formatDate(tool.date);
      return `
  <url>
    <loc>${baseUrl}/tools/${tool.slug}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    })
    .join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
