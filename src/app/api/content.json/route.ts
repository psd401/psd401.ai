import { getAllConcepts } from '@/lib/all-content';
import { SITE_URL } from '@/lib/site';
import { OKF_VERSION, OKF_TYPES } from '@/lib/okf';

export const dynamic = 'force-static';
export const revalidate = 3600;

/**
 * The whole bundle as a structured index.
 *
 * Body text is deliberately NOT included — this is the manifest an agent
 * reads to decide what to fetch, and each entry carries `markdown` pointing
 * at its source. Fetching the index should not cost the same as fetching
 * everything.
 *
 * CORS is open because the point is for other people's tools to read it.
 */
export async function GET() {
  const concepts = await getAllConcepts();

  const payload = {
    site: {
      name: 'Peninsula AI',
      organization: 'Peninsula School District',
      url: SITE_URL,
      description:
        'A public school district in Gig Harbor, Washington, doing its AI work in the open.',
      license: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
      contact: 'hagelk@psd401.net',
      source: 'https://github.com/psd401/psd401.ai',
    },
    format: {
      spec: 'Open Knowledge Format',
      version: OKF_VERSION,
      specUrl: 'https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf',
      types: OKF_TYPES,
      bundle: `${SITE_URL}/okf`,
      fullText: `${SITE_URL}/llms-full.txt`,
      index: `${SITE_URL}/llms.txt`,
    },
    generatedAt: new Date().toISOString(),
    count: concepts.length,
    concepts: concepts.map(c => ({
      type: c.type,
      title: c.title,
      description: c.description,
      url: `${SITE_URL}${c.url}`,
      markdown: `${SITE_URL}/okf${c.bundlePath}`,
      date: c.date,
      tags: c.tags,
      status: c.status,
      section: c.section,
    })),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
