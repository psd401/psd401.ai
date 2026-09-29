import { getAllConcepts, indexable } from '@/lib/all-content';
import { getCounts } from '@/lib/content';
import { SITE_URL } from '@/lib/site';
import type { ContentDir } from '@/lib/schemas';

export const dynamic = 'force-static';
export const revalidate = 3600;

/**
 * llms.txt — an INDEX, per llmstxt.org.
 *
 * The previous implementation inlined the full body of all ~200 documents
 * into a single response: several megabytes, and a model reading it burned
 * its context on content it had not asked for. That defeats the purpose of
 * the file, which is to be the cheap thing you read FIRST.
 *
 * This is now links plus one-line descriptions. Full text moved to
 * /llms-full.txt, and any individual page's markdown is at <url>.md.
 */
const ORDER: Array<{ dir: ContentDir; heading: string; note: string }> = [
  {
    dir: 'writing',
    heading: 'Writing',
    note: 'Notes from the people doing the work: what we built, decided and learned.',
  },
  {
    dir: 'software',
    heading: 'Software',
    note: 'Products the district builds and runs. Open source, forkable.',
  },
  {
    dir: 'guidance',
    heading: 'Guidance',
    note: 'The guidance district staff work from.',
  },
  {
    dir: 'presentations',
    heading: 'Presentations',
    note: 'Talks and workshops, published as given.',
  },
  {
    dir: 'open-adaptive-district',
    heading: 'Open Adaptive District',
    note: 'Our protocol for AI work: six-week cycles any district can adopt, and the fellowship action plan behind it.',
  },
  {
    dir: 'use-cases',
    heading: 'Use cases',
    note: 'Staff-submitted examples: the task, the tool, the outcome.',
  },
  { dir: 'tools', heading: 'Tools', note: 'AI tools reviewed for district use.' },
  {
    dir: 'articles',
    heading: 'Research',
    note: 'External research summarized, each linking to the original.',
  },
];

export async function GET() {
  const [concepts, counts] = await Promise.all([getAllConcepts(), getCounts()]);
  const published = indexable(concepts);

  const sections = ORDER.map(({ dir, heading, note }) => {
    const items = published.filter(c => c.dir === dir);
    if (items.length === 0) return null;
    return [
      `## ${heading}`,
      '',
      `${note} (${items.length})`,
      '',
      ...items.map(c => `- [${c.title}](${SITE_URL}${c.url}): ${c.description}`),
      '',
    ].join('\n');
  }).filter(Boolean);

  const body = `# Peninsula School District — AI

> A public school district in Gig Harbor, Washington, doing its AI work in the open.
> Peninsula School District publishes the software it builds, the guidance it writes,
> the talks it gives, and what it learns along the way. ${counts.total} documents, all
> licensed CC BY-NC-SA 4.0 and intended to be adapted by other districts.

This file is an index. Append \`.md\` to any content URL below for its markdown source.

- Full text of every document: ${SITE_URL}/llms-full.txt
- Open Knowledge Format v0.2 bundle: ${SITE_URL}/okf
- Structured index as JSON: ${SITE_URL}/api/content.json
- Search: ${SITE_URL}/search?q={query}

${sections.join('\n')}
## About this site

- Organization: Peninsula School District, Gig Harbor, Washington
- Contact: hagelk@psd401.net
- Source: https://github.com/psd401/psd401.ai
- License: CC BY-NC-SA 4.0
- Counts are computed from the content, not hand-maintained.
- \`status: draft\` documents are excluded from this index.
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
