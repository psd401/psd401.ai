/**
 * In-memory driver for local development and the self-test.
 *
 * FIELD_NOTES_DRIVER=memory makes the whole Field Notes flow clickable in
 * `npm run dev` with no AWS account: subscribers live in process memory, and
 * the confirmation link is printed to the server log instead of emailed.
 *
 * src/lib/subscribe.ts refuses this driver in a production build.
 */
import type { ConfirmationMailer, Subscriber, SubscriberStore } from './core';
import type { IssueStore } from './send';

export class MemoryStore implements SubscriberStore, IssueStore {
  private byEmail = new Map<string, Subscriber>();

  async getByEmail(email: string) {
    return structuredClone(this.byEmail.get(email) ?? null);
  }

  async getBySid(sid: string) {
    for (const s of this.byEmail.values()) if (s.sid === sid) return structuredClone(s);
    return null;
  }

  async put(subscriber: Subscriber) {
    this.byEmail.set(subscriber.email, structuredClone(subscriber));
  }

  async markConfirmed(email: string, confirmedAt: string) {
    const s = this.byEmail.get(email);
    if (!s || s.status !== 'pending') return false;
    s.status = 'confirmed';
    s.confirmedAt = confirmedAt;
    delete s.confirmHash;
    delete s.expiresAt;
    delete s.lastSentAt;
    return true;
  }

  async remove(email: string) {
    this.byEmail.delete(email);
  }

  async *listConfirmed() {
    for (const s of [...this.byEmail.values()]) {
      if (s.status === 'confirmed') yield structuredClone(s);
    }
  }

  async markIssueSent(email: string, issueId: string, at: string) {
    const s = this.byEmail.get(email);
    if (!s || s.status !== 'confirmed') return false;
    s.issuesSent = new Set([...(s.issuesSent ?? []), issueId]);
    s.lastIssueAt = at;
    return true;
  }

  /** Test helper. */
  size() {
    return this.byEmail.size;
  }
}

/** Prints the confirmation link to the server log. */
export class LogMailer implements ConfirmationMailer {
  async sendConfirmation(to: string, url: string) {
    console.log(`[field-notes] confirmation for ${to}\n  ${url}`);
  }
}
