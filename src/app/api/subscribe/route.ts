import { z } from 'zod';
import { addSubscriber, isSubscribeConfigured } from '@/lib/subscribe';

export const dynamic = 'force-dynamic';

/**
 * POST /api/subscribe — Field Notes sign-up.
 *
 * Bot protection is deliberately simple, because the provider's double opt-in
 * is the real control: nobody is subscribed until they click a link sent to
 * that address, so a bot can at worst cause one confirmation email.
 *
 *   honeypot  a field real people never see. Filled means a bot.
 *   time trap the form reports how long it was open. Under 1.5s means a bot.
 *
 * Both fail silently with a normal-looking success, so a bot learns nothing.
 * The address is never echoed back or logged.
 */
const Body = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  /** Honeypot. Must be empty. */
  company: z.string().max(200).optional().default(''),
  /** Milliseconds between the form rendering and being submitted. */
  elapsed: z.number().int().nonnegative().optional().default(0),
});

const MIN_HUMAN_MS = 1500;

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export async function POST(request: Request) {
  if (!isSubscribeConfigured()) {
    return json(503, { ok: false, error: 'not_configured' });
  }

  if (!request.headers.get('content-type')?.includes('application/json')) {
    return json(415, { ok: false, error: 'unsupported_media_type' });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json(400, { ok: false, error: 'invalid_json' });
  }

  const parsed = Body.safeParse(raw);
  if (!parsed.success) {
    return json(400, { ok: false, error: 'invalid_email' });
  }

  const { email, company, elapsed } = parsed.data;

  // Bot signals: accept quietly and do nothing.
  if (company !== '' || elapsed < MIN_HUMAN_MS) {
    return json(200, { ok: true });
  }

  const result = await addSubscriber(email);
  if (!result.ok) {
    return json(502, { ok: false, error: 'provider_error' });
  }
  return json(200, { ok: true });
}
