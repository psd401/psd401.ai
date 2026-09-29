/**
 * Field Notes subscriptions — the consent flow.
 *
 * Pure logic: no AWS, no Next.js. Storage and email are injected, which is
 * what lets scripts/field-notes-selftest.ts prove the flow without an AWS
 * account, and lets local development run on an in-memory driver.
 *
 * The lifecycle:
 *
 *   subscribe   record the address as `pending`, email a confirmation link.
 *               Nothing else is ever sent to a pending address.
 *   confirm     the link's token is checked against a stored hash; the record
 *               becomes `confirmed`.
 *   unsubscribe the record is deleted outright. We keep no suppression list of
 *               former subscribers.
 *
 * Unconfirmed records carry `expiresAt`, which DynamoDB TTL uses to delete
 * them after CONFIRM_WINDOW_DAYS. Confirming removes it.
 *
 * Links identify a subscriber by `sid`, a random id — never by email address —
 * and carry their tokens in the URL fragment, so an address never lands in a
 * server log, a Referer header or analytics.
 */
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export const CONFIRM_WINDOW_DAYS = 7;
/** A second sign-up for the same pending address inside this window sends nothing. */
export const RESEND_THROTTLE_MINUTES = 10;

export type Subscriber = {
  /** Partition key. Lowercased and trimmed. */
  email: string;
  /** Random id used in links. Indexed (GSI `bySid`). */
  sid: string;
  status: 'pending' | 'confirmed';
  /** SHA-256 of the confirmation token. The token itself is never stored. */
  confirmHash?: string;
  /** Checked on unsubscribe. Stays with the subscriber for life. */
  unsubKey: string;
  createdAt: string;
  confirmedAt?: string;
  lastSentAt?: string;
  /** Epoch seconds. DynamoDB TTL attribute; present only while pending. */
  expiresAt?: number;
  /** Ids of issues already sent to this subscriber. Makes re-running a send safe. */
  issuesSent?: Set<string>;
  lastIssueAt?: string;
};

export interface SubscriberStore {
  getByEmail(email: string): Promise<Subscriber | null>;
  getBySid(sid: string): Promise<Subscriber | null>;
  put(subscriber: Subscriber): Promise<void>;
  /** Set confirmed, only if currently pending. False if the condition failed. */
  markConfirmed(email: string, confirmedAt: string): Promise<boolean>;
  remove(email: string): Promise<void>;
}

export interface ConfirmationMailer {
  sendConfirmation(to: string, confirmUrl: string): Promise<void>;
}

export type Deps = {
  store: SubscriberStore;
  mailer: ConfirmationMailer;
  /** Absolute site origin, no trailing slash — used to build links. */
  siteUrl: string;
  now?: () => Date;
  token?: () => string;
};

/** 32 random bytes, base64url: 43 characters. */
export function newToken(): string {
  return randomBytes(32).toString('base64url');
}

/** What a token or sid looks like. Anything else is rejected before a lookup. */
export const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function confirmUrl(siteUrl: string, sid: string, token: string): string {
  return `${siteUrl}/field-notes/confirm#id=${sid}&t=${token}`;
}

export function unsubscribeUrl(siteUrl: string, sid: string, key: string): string {
  return `${siteUrl}/field-notes/unsubscribe#id=${sid}&k=${key}`;
}

/* ------------------------------------------------------------ subscribe */

export type SubscribeOutcome =
  /** A confirmation email was sent. */
  | 'sent'
  /** Already confirmed. Nothing sent — and the caller must not reveal this. */
  | 'already_confirmed'
  /** Pending and emailed recently. Nothing sent. */
  | 'throttled';

export async function subscribe(deps: Deps, rawEmail: string): Promise<SubscribeOutcome> {
  const now = (deps.now ?? (() => new Date()))();
  const token = deps.token ?? newToken;
  const email = rawEmail.trim().toLowerCase();

  const existing = await deps.store.getByEmail(email);

  if (existing?.status === 'confirmed') return 'already_confirmed';

  if (existing?.lastSentAt) {
    const since = now.getTime() - new Date(existing.lastSentAt).getTime();
    if (since < RESEND_THROTTLE_MINUTES * 60_000) return 'throttled';
  }

  const confirmToken = token();
  const pending: Subscriber = {
    email,
    sid: existing?.sid ?? token(),
    status: 'pending',
    confirmHash: hashToken(confirmToken),
    unsubKey: existing?.unsubKey ?? token(),
    createdAt: existing?.createdAt ?? now.toISOString(),
    lastSentAt: now.toISOString(),
    expiresAt: Math.floor(now.getTime() / 1000) + CONFIRM_WINDOW_DAYS * 86_400,
  };

  await deps.store.put(pending);

  try {
    await deps.mailer.sendConfirmation(email, confirmUrl(deps.siteUrl, pending.sid, confirmToken));
  } catch (error) {
    // Roll back, or the resend throttle would lock the person out of a retry
    // for an email that never went.
    if (existing) await deps.store.put(existing);
    else await deps.store.remove(email);
    throw error;
  }

  return 'sent';
}

/* -------------------------------------------------------------- confirm */

export type ConfirmOutcome = 'confirmed' | 'expired' | 'invalid';

export async function confirm(deps: Deps, sid: string, token: string): Promise<ConfirmOutcome> {
  if (!TOKEN_PATTERN.test(sid) || !TOKEN_PATTERN.test(token)) return 'invalid';
  const now = (deps.now ?? (() => new Date()))();

  const subscriber = await deps.store.getBySid(sid);
  if (!subscriber) return 'invalid';
  if (subscriber.status === 'confirmed') return 'confirmed'; // idempotent

  if (subscriber.expiresAt !== undefined && subscriber.expiresAt * 1000 <= now.getTime()) {
    return 'expired';
  }
  if (!subscriber.confirmHash || !safeEqual(hashToken(token), subscriber.confirmHash)) {
    return 'invalid';
  }

  const updated = await deps.store.markConfirmed(subscriber.email, now.toISOString());
  if (!updated) {
    // Lost a race with another confirmation of the same link.
    const again = await deps.store.getByEmail(subscriber.email);
    return again?.status === 'confirmed' ? 'confirmed' : 'invalid';
  }
  return 'confirmed';
}

/* ---------------------------------------------------------- unsubscribe */

export type UnsubscribeOutcome = 'removed' | 'invalid';

export async function unsubscribe(
  deps: Pick<Deps, 'store'>,
  sid: string,
  key: string
): Promise<UnsubscribeOutcome> {
  if (!TOKEN_PATTERN.test(sid) || !TOKEN_PATTERN.test(key)) return 'invalid';

  const subscriber = await deps.store.getBySid(sid);
  // Already gone: report success, so a second click does not look like an error.
  if (!subscriber) return 'removed';
  if (!safeEqual(key, subscriber.unsubKey)) return 'invalid';

  await deps.store.remove(subscriber.email);
  return 'removed';
}
