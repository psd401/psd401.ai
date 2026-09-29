import { z } from 'zod';
import { confirmSubscription, isSubscribeConfigured } from '@/lib/subscribe';

export const dynamic = 'force-dynamic';

/**
 * POST /api/field-notes/confirm — { id, token } from the confirmation link.
 *
 * Confirmation is a POST from a button on /field-notes/confirm, never a GET on
 * the emailed link itself: mail security scanners (Microsoft Safe Links and
 * others) fetch every link in an email, and a GET that confirmed would
 * subscribe people who never clicked.
 */
const Body = z.object({ id: z.string().max(64), token: z.string().max(64) });

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export async function POST(request: Request) {
  if (!isSubscribeConfigured()) return json(503, { ok: false, error: 'not_configured' });

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json(400, { ok: false, error: 'invalid_json' });
  }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) return json(400, { ok: false, error: 'invalid_request' });

  try {
    const outcome = await confirmSubscription(parsed.data.id, parsed.data.token);
    return json(200, { ok: outcome === 'confirmed', outcome });
  } catch (error) {
    console.error('[field-notes] confirm failed:', error instanceof Error ? error.name : error);
    return json(500, { ok: false, error: 'server_error' });
  }
}
