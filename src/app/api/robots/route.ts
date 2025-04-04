export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://psd401.ai';

  const robotsTxt = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
