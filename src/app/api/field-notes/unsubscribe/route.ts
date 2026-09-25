import { z } from 'zod';
import { isSubscribeConfigured, removeSubscription } from '@/lib/subscribe';

export const dynamic = 'force-dynamic';

/**
 * POST /api/field-notes/unsubscribe
 *
 * Two callers:
 *
 *   the unsubscribe page   JSON body { id, key }
 *   a mail client          RFC 8058 one-click: ?id=&k= in the URL, form body
 *                          "List-Unsubscribe=One-Click". Gmail and Yahoo
 *                          require this for bulk senders, so the endpoint
 *                          exists before the first issue does.
 *
 * Unsubscribing deletes the record. A second click reports success.
 */
const Pair = z.object({ id: z.string().max(64), key: z.string().max(64) });

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export async function POST(request: Request) {
  if (!isSubscribeConfigured()) return json(503, { ok: false, error: 'not_configured' });

  const url = new URL(request.url);
  const contentType = request.headers.get('content-type') ?? '';

  let candidate: unknown;
  if (contentType.includes('application/json')) {
    try {
      candidate = await request.json();
    } catch {
      return json(400, { ok: false, error: 'invalid_json' });
    }
  } else {
    // One-click: the pair rides in the query string. The body is fixed by the RFC.
    const body = await request.text();
    if (!body.includes('List-Unsubscribe=One-Click')) {
      return json(400, { ok: false, error: 'invalid_request' });
    }
    candidate = { id: url.searchParams.get('id'), key: url.searchParams.get('k') };
  }

  const parsed = Pair.safeParse(candidate);
  if (!parsed.success) return json(400, { ok: false, error: 'invalid_request' });

  try {
    const outcome = await removeSubscription(parsed.data.id, parsed.data.key);
    return json(200, { ok: outcome === 'removed', outcome });
  } catch (error) {
    console.error('[field-notes] unsubscribe failed:', error instanceof Error ? error.name : error);
    return json(500, { ok: false, error: 'server_error' });
  }
}
