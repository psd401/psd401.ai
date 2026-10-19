import {
  homeMarkdown,
  markdownResponse,
  notFoundMarkdown,
  trustPageMarkdown,
} from '@/lib/agent-markdown';
import { TRUST_PAGES, isTrustPageKey } from '@/lib/trust-pages';

export const dynamic = 'force-static';
export const revalidate = 3600;

/**
 * Markdown representations of the pages that are not OKF concepts.
 *
 * Agents do not call this directly. next.config.js rewrites requests that
 * carry `Accept: text/markdown` here: `/` to `home`, the trust pages to their
 * own key, and any URL that matched nothing to `not-found`, which answers
 * with status 404. See src/lib/agent-markdown.ts.
 */
export function generateStaticParams() {
  return ['home', 'not-found', ...Object.keys(TRUST_PAGES)].map(page => ({ page }));
}

export async function GET(_request: Request, ctx: { params: Promise<{ page: string }> }) {
  const { page } = await ctx.params;

  if (page === 'home') return markdownResponse(await homeMarkdown());
  if (isTrustPageKey(page)) return markdownResponse(trustPageMarkdown(page));
  return markdownResponse(notFoundMarkdown(), { status: 404 });
}
