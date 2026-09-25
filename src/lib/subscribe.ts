/**
 * Field Notes subscriptions — server only.
 *
 * The form posts to /api/subscribe, never directly to a mailing provider, so
 * the provider's credentials stay on the server. Everything provider-specific
 * lives behind `addSubscriber` below; the route, validation and bot checks do
 * not change when the provider does.
 *
 * Until a provider is configured, `isSubscribeConfigured()` is false: the form
 * renders disabled with an email fallback, and the route answers 503.
 *
 * Import this only from server code (route handlers, server components): the
 * provider credentials it reads must never reach the browser bundle.
 */

export type SubscribeResult = { ok: true } | { ok: false; reason: 'provider_error' };

/** True when a provider is configured and the form should accept sign-ups. */
export function isSubscribeConfigured(): boolean {
  // Filled in once the provider is chosen: check its credentials here.
  return false;
}

/**
 * Hand one address to the mailing provider. The provider is responsible for
 * double opt-in (a confirmation email) and for unsubscribe handling — both
 * are legal requirements for a mailing list, not features.
 */
export async function addSubscriber(email: string): Promise<SubscribeResult> {
  void email;
  return { ok: false, reason: 'provider_error' };
}
