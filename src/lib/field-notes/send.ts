/**
 * Sending an issue — the loop, with no AWS imports.
 *
 * Rules it enforces, all covered by scripts/field-notes-selftest.ts:
 *
 *   - Confirmed subscribers only. The store is asked for confirmed records and
 *     each is checked again before sending.
 *   - Every copy carries that recipient's own unsubscribe link, plus RFC 8058
 *     List-Unsubscribe and List-Unsubscribe-Post headers, which Gmail and Yahoo
 *     require from bulk senders.
 *   - Re-running is safe. Each recipient is marked with the issue id after a
 *     successful send and skipped next time — so a run that dies half way can
 *     simply be run again.
 *   - One failure does not stop the run. Failures are reported and left
 *     unmarked, so the next run retries them.
 *   - Marking is conditional on the record still existing: someone who
 *     unsubscribes mid-run is not re-created by the bookkeeping.
 */
import type { Subscriber } from './core';
import { unsubscribeUrl } from './core';
import { renderIssueEmail, type Issue } from './issue';

export type Header = { Name: string; Value: string };

export type OutgoingMessage = {
  subject: string;
  text: string;
  html: string;
  headers: Header[];
};

export interface IssueStore {
  listConfirmed(): AsyncIterable<Subscriber>;
  /** Record the issue against the subscriber. False if they no longer exist. */
  markIssueSent(email: string, issueId: string, at: string): Promise<boolean>;
}

export interface IssueMailer {
  sendIssue(to: string, message: OutgoingMessage): Promise<void>;
}

export type SendReport = {
  /** Confirmed subscribers who had not yet been sent this issue. */
  eligible: number;
  sent: number;
  alreadySent: number;
  failed: Array<{ email: string; error: string }>;
  /** Sent, but gone from the list by the time we recorded it. */
  unsubscribedDuringRun: number;
};

export type SendOptions = {
  store: IssueStore;
  mailer: IssueMailer;
  issue: Issue;
  siteUrl: string;
  postalAddress?: string;
  /** Minimum gap between sends, from the SES account's MaxSendRate. */
  minIntervalMs?: number;
  /** Count eligible recipients; send nothing, mark nothing. */
  dryRun?: boolean;
  now?: () => Date;
  sleep?: (ms: number) => Promise<void>;
  onProgress?: (done: number) => void;
};

/** The two addresses a recipient can unsubscribe through. */
export function unsubscribeTargets(siteUrl: string, s: Pick<Subscriber, 'sid' | 'unsubKey'>) {
  return {
    page: unsubscribeUrl(siteUrl, s.sid, s.unsubKey),
    oneClick: `${siteUrl}/api/field-notes/unsubscribe?id=${encodeURIComponent(s.sid)}&k=${encodeURIComponent(s.unsubKey)}`,
  };
}

export function buildMessage(
  issue: Issue,
  subscriber: Pick<Subscriber, 'sid' | 'unsubKey'>,
  siteUrl: string,
  postalAddress?: string
): OutgoingMessage {
  const targets = unsubscribeTargets(siteUrl, subscriber);
  const { subject, text, html } = renderIssueEmail(issue, {
    unsubscribePageUrl: targets.page,
    postalAddress,
  });
  return {
    subject,
    text,
    html,
    headers: [
      { Name: 'List-Unsubscribe', Value: `<${targets.oneClick}>` },
      { Name: 'List-Unsubscribe-Post', Value: 'List-Unsubscribe=One-Click' },
    ],
  };
}

const defaultSleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

export async function sendIssue(opts: SendOptions): Promise<SendReport> {
  const now = opts.now ?? (() => new Date());
  const sleep = opts.sleep ?? defaultSleep;
  const report: SendReport = {
    eligible: 0,
    sent: 0,
    alreadySent: 0,
    failed: [],
    unsubscribedDuringRun: 0,
  };

  let first = true;
  for await (const subscriber of opts.store.listConfirmed()) {
    if (subscriber.status !== 'confirmed') continue; // belt and braces
    if (subscriber.issuesSent?.has(opts.issue.id)) {
      report.alreadySent++;
      continue;
    }
    report.eligible++;
    if (opts.dryRun) continue;

    if (!first && opts.minIntervalMs) await sleep(opts.minIntervalMs);
    first = false;

    const message = buildMessage(opts.issue, subscriber, opts.siteUrl, opts.postalAddress);
    try {
      await opts.mailer.sendIssue(subscriber.email, message);
    } catch (error) {
      report.failed.push({
        email: subscriber.email,
        error: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
      });
      continue;
    }

    report.sent++;
    const recorded = await opts.store.markIssueSent(
      subscriber.email,
      opts.issue.id,
      now().toISOString()
    );
    if (!recorded) report.unsubscribedDuringRun++;
    opts.onProgress?.(report.sent + report.failed.length);
  }

  return report;
}
