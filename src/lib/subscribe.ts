/**
 * Field Notes subscriptions — configuration and wiring. Server only.
 *
 * Import this only from server code (route handlers, server components): the
 * configuration it reads must never reach the browser bundle.
 *
 * Drivers, chosen by FIELD_NOTES_DRIVER:
 *
 *   aws     (default) DynamoDB + SES. Needs FIELD_NOTES_TABLE and
 *           FIELD_NOTES_FROM. FIELD_NOTES_REGION defaults to us-west-2.
 *           Amplify reserves the AWS_ prefix for its own variables, hence the
 *           FIELD_NOTES_ names.
 *   memory  In-process list, confirmation links printed to the server log.
 *           For `npm run dev` only — refused in a production build.
 *
 * With neither configured, the form renders disabled with an email fallback
 * and the routes answer 503. The flow itself is src/lib/field-notes/core.ts.
 */
import { SITE_URL } from './site';
import {
  confirm,
  subscribe,
  unsubscribe,
  type ConfirmOutcome,
  type Deps,
  type UnsubscribeOutcome,
} from './field-notes/core';
import { LogMailer, MemoryStore } from './field-notes/memory';
import { DynamoStore, SesMailer } from './field-notes/aws';

type Driver = 'aws' | 'memory';

function driver(): Driver | null {
  const chosen = (process.env.FIELD_NOTES_DRIVER ?? 'aws').toLowerCase();

  if (chosen === 'memory') {
    if (process.env.NODE_ENV === 'production') {
      console.error('[field-notes] FIELD_NOTES_DRIVER=memory is ignored in production.');
      return null;
    }
    return 'memory';
  }

  if (chosen === 'aws') {
    return process.env.FIELD_NOTES_TABLE && process.env.FIELD_NOTES_FROM ? 'aws' : null;
  }

  console.error(`[field-notes] Unknown FIELD_NOTES_DRIVER "${chosen}".`);
  return null;
}

/** True when sign-up is connected and the form should accept addresses. */
export function isSubscribeConfigured(): boolean {
  return driver() !== null;
}

// The memory store must survive Next.js dev reloads, or a confirmation link
// printed before an edit would point at a store that no longer exists.
const globalForFieldNotes = globalThis as unknown as { __fieldNotesMemory?: MemoryStore };

function deps(): Deps {
  const d = driver();
  if (d === 'memory') {
    globalForFieldNotes.__fieldNotesMemory ??= new MemoryStore();
    return {
      store: globalForFieldNotes.__fieldNotesMemory,
      mailer: new LogMailer(),
      siteUrl: process.env.FIELD_NOTES_SITE_URL ?? 'http://localhost:3000',
    };
  }
  if (d === 'aws') {
    const region = process.env.FIELD_NOTES_REGION ?? 'us-west-2';
    return {
      store: new DynamoStore(process.env.FIELD_NOTES_TABLE!, region),
      mailer: new SesMailer(process.env.FIELD_NOTES_FROM!, region),
      siteUrl: process.env.FIELD_NOTES_SITE_URL ?? SITE_URL,
    };
  }
  throw new Error('Newsletter sign-up is not configured.');
}

export type SubscribeResult = { ok: true } | { ok: false; reason: 'provider_error' };

/**
 * Start a subscription. Whether the address was new, already confirmed, or
 * recently emailed, the caller sees the same success — so the form cannot be
 * used to find out who is on the list.
 */
export async function addSubscriber(email: string): Promise<SubscribeResult> {
  try {
    await subscribe(deps(), email);
    return { ok: true };
  } catch (error) {
    console.error('[field-notes] subscribe failed:', error instanceof Error ? error.name : error);
    return { ok: false, reason: 'provider_error' };
  }
}

export async function confirmSubscription(sid: string, token: string): Promise<ConfirmOutcome> {
  return confirm(deps(), sid, token);
}

export async function removeSubscription(sid: string, key: string): Promise<UnsubscribeOutcome> {
  return unsubscribe(deps(), sid, key);
}
