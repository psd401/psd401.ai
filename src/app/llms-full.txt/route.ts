import { getAllConcepts, indexable } from '@/lib/all-content';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';
export const revalidate = 3600;

/**
 * llms-full.txt — every document, in full.
 *
 * This is the heavy one and it is opt-in on purpose: /llms.txt is the index a
 * model should read first, and this is here for when something genuinely
 * wants the whole corpus in a single fetch (an eval harness, a local index,
 * a district cloning the content).
 */
export async function GET() {
  const concepts = indexable(await getAllConcepts());

  const documents = concepts.map(c =>
    [
      '---',
      `title: ${c.title}`,
      `type: ${c.type}`,
      `url: ${SITE_URL}${c.url}`,
      `date: ${c.date}`,
      c.tags.length ? `tags: ${c.tags.join(', ')}` : null,
      '---',
      '',
      c.content.trim(),
      '',
    ]
      .filter(l => l !== null)
      .join('\n')
  );

  const body = `# Peninsula School District — AI · full corpus

> Every published document from ${SITE_URL}, in full, newest first.
> ${concepts.length} documents. Licensed CC BY-NC-SA 4.0.
> The index-only version is at ${SITE_URL}/llms.txt.

${documents.join('\n\n')}`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
