/**
 * Field Notes self-test — proves the consent flow without an AWS account.
 *
 *   npm run field-notes:selftest
 *
 * Part 1 drives src/lib/field-notes/core.ts with an in-memory store, a clock
 * we control, and a mailer we can make fail.
 *
 * Part 2 calls the real Next.js route handlers with FIELD_NOTES_DRIVER=memory,
 * covering what the core cannot: request validation, the honeypot, the time
 * trap, and RFC 8058 one-click unsubscribe parsing.
 *
 * Part 3 covers sending an issue: confirmed-only, per-recipient unsubscribe
 * links and headers, safe re-runs, failures, and an unsubscribe that arrives
 * mid-send — ending with an issue's own List-Unsubscribe header being posted
 * to the real route.
 *
 * Exits non-zero on the first failed assertion.
 */
import assert from 'node:assert/strict';
import {
  CONFIRM_WINDOW_DAYS,
  RESEND_THROTTLE_MINUTES,
  confirm,
  subscribe,
  unsubscribe,
  type ConfirmationMailer,
  type Deps,
} from '../src/lib/field-notes/core';
import { MemoryStore } from '../src/lib/field-notes/memory';
import { loadIssue } from '../src/lib/field-notes/issue';
import { sendIssue, type IssueMailer, type OutgoingMessage } from '../src/lib/field-notes/send';

let passed = 0;
async function test(name: string, fn: () => Promise<void>) {
  await fn();
  passed++;
  console.log(`  ok  ${name}`);
}

class CapturingMailer implements ConfirmationMailer {
  sent: Array<{ to: string; url: string }> = [];
  failNext = false;
  async sendConfirmation(to: string, url: string) {
    if (this.failNext) {
      this.failNext = false;
      throw new Error('SES down');
    }
    this.sent.push({ to, url });
  }
  last() {
    const m = this.sent.at(-1)!;
    const params = new URLSearchParams(new URL(m.url).hash.slice(1));
    return { ...m, id: params.get('id')!, token: params.get('t')! };
  }
}

function harness() {
  let t = new Date('2026-09-25T17:00:00Z').getTime();
  const store = new MemoryStore();
  const mailer = new CapturingMailer();
  const deps: Deps = { store, mailer, siteUrl: 'https://psd401.ai', now: () => new Date(t) };
  const advance = (ms: number) => (t += ms);
  return { store, mailer, deps, advance };
}

const MIN = 60_000;
const DAY = 86_400_000;

async function core() {
  console.log('\nPart 1 — consent flow (core)');

  await test('a new address is stored pending and sent one confirmation', async () => {
    const { store, mailer, deps } = harness();
    assert.equal(await subscribe(deps, 'teacher@example.org'), 'sent');
    assert.equal(mailer.sent.length, 1);
    const s = await store.getByEmail('teacher@example.org');
    assert.equal(s?.status, 'pending');
    assert.ok(s?.expiresAt, 'pending records carry a TTL');
    assert.notEqual(s?.confirmHash, mailer.last().token, 'the token itself is never stored');
  });

  await test('addresses are normalised', async () => {
    const { store, deps } = harness();
    await subscribe(deps, '  Teacher@Example.ORG ');
    assert.ok(await store.getByEmail('teacher@example.org'));
  });

  await test('the confirmation link carries no email address, only a fragment', async () => {
    const { mailer, deps } = harness();
    await subscribe(deps, 'teacher@example.org');
    const url = new URL(mailer.last().url);
    assert.equal(url.pathname, '/field-notes/confirm');
    assert.equal(url.search, '', 'nothing in the query string');
    assert.ok(!mailer.last().url.includes('teacher'), 'no address in the link');
  });

  await test(`a repeat sign-up within ${RESEND_THROTTLE_MINUTES} minutes sends nothing`, async () => {
    const { mailer, deps, advance } = harness();
    await subscribe(deps, 'teacher@example.org');
    advance(5 * MIN);
    assert.equal(await subscribe(deps, 'teacher@example.org'), 'throttled');
    assert.equal(mailer.sent.length, 1);
  });

  await test('a later repeat sends a new link and retires the old one', async () => {
    const { mailer, deps, advance, store } = harness();
    await subscribe(deps, 'teacher@example.org');
    const first = mailer.last();
    const before = await store.getByEmail('teacher@example.org');
    advance(RESEND_THROTTLE_MINUTES * MIN + 1);
    assert.equal(await subscribe(deps, 'teacher@example.org'), 'sent');
    const second = mailer.last();
    const after = await store.getByEmail('teacher@example.org');
    assert.equal(after?.sid, before?.sid, 'same subscriber id');
    assert.equal(after?.unsubKey, before?.unsubKey, 'same unsubscribe key');
    assert.equal(await confirm(deps, first.id, first.token), 'invalid', 'old token rejected');
    assert.equal(await confirm(deps, second.id, second.token), 'confirmed');
  });

  await test('confirming with the right token confirms, and is idempotent', async () => {
    const { mailer, deps, store } = harness();
    await subscribe(deps, 'teacher@example.org');
    const { id, token } = mailer.last();
    assert.equal(await confirm(deps, id, token), 'confirmed');
    const s = await store.getByEmail('teacher@example.org');
    assert.equal(s?.status, 'confirmed');
    assert.equal(s?.expiresAt, undefined, 'TTL removed — confirmed records do not expire');
    assert.equal(s?.confirmHash, undefined);
    assert.equal(await confirm(deps, id, token), 'confirmed');
  });

  await test('wrong, malformed and unknown tokens are rejected', async () => {
    const { mailer, deps } = harness();
    await subscribe(deps, 'teacher@example.org');
    const { id, token } = mailer.last();
    const wrong = token.slice(0, -1) + (token.endsWith('A') ? 'B' : 'A');
    assert.equal(await confirm(deps, id, wrong), 'invalid');
    assert.equal(await confirm(deps, id, 'short'), 'invalid');
    assert.equal(await confirm(deps, 'x'.repeat(43), token), 'invalid');
  });

  await test(`links expire after ${CONFIRM_WINDOW_DAYS} days`, async () => {
    const { mailer, deps, advance } = harness();
    await subscribe(deps, 'teacher@example.org');
    advance(CONFIRM_WINDOW_DAYS * DAY);
    const { id, token } = mailer.last();
    assert.equal(await confirm(deps, id, token), 'expired');
  });

  await test('a confirmed address signing up again is sent nothing', async () => {
    const { mailer, deps } = harness();
    await subscribe(deps, 'teacher@example.org');
    await confirm(deps, mailer.last().id, mailer.last().token);
    assert.equal(await subscribe(deps, 'teacher@example.org'), 'already_confirmed');
    assert.equal(mailer.sent.length, 1);
  });

  await test('if the email fails, a new record is rolled back', async () => {
    const { mailer, deps, store } = harness();
    mailer.failNext = true;
    await assert.rejects(subscribe(deps, 'teacher@example.org'));
    assert.equal(store.size(), 0);
  });

  await test('if the email fails on a resend, the previous record is restored', async () => {
    const { mailer, deps, store, advance } = harness();
    await subscribe(deps, 'teacher@example.org');
    const before = await store.getByEmail('teacher@example.org');
    advance(RESEND_THROTTLE_MINUTES * MIN + 1);
    mailer.failNext = true;
    await assert.rejects(subscribe(deps, 'teacher@example.org'));
    assert.deepEqual(await store.getByEmail('teacher@example.org'), before);
    // Not locked out: the throttle is measured from the last email that went.
    assert.equal(await subscribe(deps, 'teacher@example.org'), 'sent');
  });

  await test('unsubscribe needs the right key, deletes the record, and repeats safely', async () => {
    const { mailer, deps, store } = harness();
    await subscribe(deps, 'teacher@example.org');
    await confirm(deps, mailer.last().id, mailer.last().token);
    const s = (await store.getByEmail('teacher@example.org'))!;
    assert.equal(await unsubscribe(deps, s.sid, 'y'.repeat(43)), 'invalid');
    assert.ok(await store.getByEmail('teacher@example.org'), 'still subscribed');
    assert.equal(await unsubscribe(deps, s.sid, s.unsubKey), 'removed');
    assert.equal(await store.getByEmail('teacher@example.org'), null, 'record deleted');
    assert.equal(await unsubscribe(deps, s.sid, s.unsubKey), 'removed', 'second click is fine');
  });
}

async function routes() {
  console.log('\nPart 2 — route handlers (FIELD_NOTES_DRIVER=memory)');
  process.env.FIELD_NOTES_DRIVER = 'memory';
  process.env.FIELD_NOTES_SITE_URL = 'http://localhost:3000';

  const { POST: subscribePost } = await import('../src/app/api/subscribe/route');
  const { POST: confirmPost } = await import('../src/app/api/field-notes/confirm/route');
  const { POST: unsubPost } = await import('../src/app/api/field-notes/unsubscribe/route');

  // Capture what the log mailer prints instead of letting it hit the console.
  const printed: string[] = [];
  const log = console.log;
  console.log = (...args: unknown[]) => {
    const line = args.join(' ');
    if (line.startsWith('[field-notes]')) printed.push(line);
    else log(...args);
  };

  const post = (fn: (r: Request) => Promise<Response>, body: unknown, path = '/x') =>
    fn(
      new Request(`http://localhost:3000${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    );

  const lastLink = () => {
    const url = printed.at(-1)!.split('\n').at(-1)!.trim();
    const p = new URLSearchParams(new URL(url).hash.slice(1));
    return { id: p.get('id')!, token: p.get('t')! };
  };

  try {
    await test('a real sign-up is accepted and produces a link', async () => {
      const res = await post(subscribePost, { email: 'route@example.org', elapsed: 4000 });
      assert.equal(res.status, 200);
      assert.equal(printed.length, 1);
    });

    await test('an invalid address is rejected with 400', async () => {
      const res = await post(subscribePost, { email: 'not-an-email', elapsed: 4000 });
      assert.equal(res.status, 400);
    });

    await test('non-JSON is rejected with 415', async () => {
      const res = await subscribePost(
        new Request('http://localhost:3000/api/subscribe', { method: 'POST', body: 'email=x' })
      );
      assert.equal(res.status, 415);
    });

    await test('the honeypot returns 200 and stores nothing', async () => {
      const before = printed.length;
      const res = await post(subscribePost, {
        email: 'bot1@example.org',
        company: 'Acme',
        elapsed: 4000,
      });
      assert.equal(res.status, 200);
      assert.equal(printed.length, before);
    });

    await test('the time trap returns 200 and stores nothing', async () => {
      const before = printed.length;
      const res = await post(subscribePost, { email: 'bot2@example.org', elapsed: 300 });
      assert.equal(res.status, 200);
      assert.equal(printed.length, before);
    });

    await test('the responses do not reveal who is already subscribed', async () => {
      const { id, token } = lastLink();
      assert.equal((await post(confirmPost, { id, token })).status, 200);
      const again = await post(subscribePost, { email: 'route@example.org', elapsed: 4000 });
      const fresh = await post(subscribePost, { email: 'new@example.org', elapsed: 4000 });
      assert.equal(again.status, fresh.status);
      assert.equal(await again.text(), await fresh.text());
    });

    await test('confirm route: bad token → invalid; missing fields → 400', async () => {
      const { id } = lastLink();
      const bad = await post(confirmPost, { id, token: 'z'.repeat(43) });
      assert.equal((await bad.json()).outcome, 'invalid');
      assert.equal((await post(confirmPost, { id })).status, 400);
    });

    await test('RFC 8058 one-click unsubscribe works, and rejects other bodies', async () => {
      const g = globalThis as unknown as { __fieldNotesMemory: MemoryStore };
      const s = (await g.__fieldNotesMemory.getByEmail('route@example.org'))!;
      const target = `http://localhost:3000/api/field-notes/unsubscribe?id=${s.sid}&k=${s.unsubKey}`;
      const wrongBody = await unsubPost(
        new Request(target, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'something=else',
        })
      );
      assert.equal(wrongBody.status, 400);
      const oneClick = await unsubPost(
        new Request(target, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'List-Unsubscribe=One-Click',
        })
      );
      assert.equal((await oneClick.json()).outcome, 'removed');
      assert.equal(await g.__fieldNotesMemory.getByEmail('route@example.org'), null);
    });
    await test('an issue’s own List-Unsubscribe header unsubscribes through the real route', async () => {
      const g = globalThis as unknown as { __fieldNotesMemory: MemoryStore };
      const res = await post(subscribePost, { email: 'reader@example.org', elapsed: 4000 });
      assert.equal(res.status, 200);
      const { id, token } = lastLink();
      assert.equal((await (await post(confirmPost, { id, token })).json()).outcome, 'confirmed');

      const mailer = new IssueCapture();
      const issue = await loadIssue(ISSUE_MD, '2026-10-06.md');
      await sendIssue({
        store: g.__fieldNotesMemory,
        mailer,
        issue,
        siteUrl: 'http://localhost:3000',
      });
      const copy = mailer.sent.find(s => s.to === 'reader@example.org')!;
      const target = copy.message.headers
        .find(h => h.Name === 'List-Unsubscribe')!
        .Value.slice(1, -1);

      const out = await unsubPost(
        new Request(target, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'List-Unsubscribe=One-Click',
        })
      );
      assert.equal((await out.json()).outcome, 'removed');
      assert.equal(await g.__fieldNotesMemory.getByEmail('reader@example.org'), null);
    });
  } finally {
    console.log = log;
  }
}

class IssueCapture implements IssueMailer {
  sent: Array<{ to: string; message: OutgoingMessage }> = [];
  failFor = new Set<string>();
  onSend?: (to: string) => Promise<void>;
  async sendIssue(to: string, message: OutgoingMessage) {
    if (this.failFor.has(to)) throw new Error('SES rejected');
    await this.onSend?.(to);
    this.sent.push({ to, message });
  }
}

const ISSUE_MD = `---
subject: What we learned this cycle
id: 2026-10-06
---
We tried **one** thing. <script>alert(1)</script>

- It worked, mostly.
`;

/** A store with confirmed subscribers a, b, c and a pending p. */
async function listHarness() {
  const store = new MemoryStore();
  const mailer = new CapturingMailer();
  const deps: Deps = { store, mailer, siteUrl: 'https://psd401.ai' };
  for (const who of ['a', 'b', 'c', 'p']) {
    await subscribe(deps, `${who}@example.org`);
    if (who !== 'p') await confirm(deps, mailer.last().id, mailer.last().token);
  }
  return store;
}

async function sending() {
  console.log('\nPart 3 — sending an issue');
  const issue = await loadIssue(ISSUE_MD, '2026-10-06.md');

  await test('issues: subject required, id from frontmatter or file name, HTML sanitised', async () => {
    await assert.rejects(loadIssue('---\nid: x\n---\nbody', 'x.md'), /subject/);
    assert.equal((await loadIssue('---\nsubject: S\n---\nbody', 'Oct-Issue.md')).id, 'oct-issue');
    await assert.rejects(loadIssue('---\nsubject: S\nid: Bad Id\n---\nbody', 'x.md'));
    assert.equal(issue.id, '2026-10-06');
    assert.ok(issue.html.includes('<strong>one</strong>'), 'markdown rendered');
    assert.ok(!issue.html.includes('<script'), 'script stripped');
  });

  await test('only confirmed subscribers are sent the issue', async () => {
    const store = await listHarness();
    const mailer = new IssueCapture();
    const r = await sendIssue({ store, mailer, issue, siteUrl: 'https://psd401.ai' });
    assert.equal(r.sent, 3);
    assert.deepEqual(mailer.sent.map(s => s.to).sort(), [
      'a@example.org',
      'b@example.org',
      'c@example.org',
    ]);
  });

  await test('the store lists confirmed subscribers only', async () => {
    const store = await listHarness();
    const listed: string[] = [];
    for await (const s of store.listConfirmed()) listed.push(s.email);
    assert.deepEqual(listed.sort(), ['a@example.org', 'b@example.org', 'c@example.org']);
  });

  await test('a pending record that reaches the send loop is still not sent', async () => {
    // Defence in depth: the loop re-checks status even if a store leaks one.
    const real = await listHarness();
    const leaky = {
      async *listConfirmed() {
        yield (await real.getByEmail('p@example.org'))!;
        yield (await real.getByEmail('a@example.org'))!;
      },
      markIssueSent: real.markIssueSent.bind(real),
    };
    const mailer = new IssueCapture();
    const r = await sendIssue({ store: leaky, mailer, issue, siteUrl: 'https://psd401.ai' });
    assert.deepEqual(
      mailer.sent.map(s => s.to),
      ['a@example.org']
    );
    assert.equal(r.sent, 1);
  });

  await test('every copy carries its recipient’s own unsubscribe link and one-click headers', async () => {
    const store = await listHarness();
    const mailer = new IssueCapture();
    await sendIssue({ store, mailer, issue, siteUrl: 'https://psd401.ai' });
    const seen = new Set<string>();
    for (const { to, message } of mailer.sent) {
      const s = (await store.getByEmail(to))!;
      const lu = message.headers.find(h => h.Name === 'List-Unsubscribe')!.Value;
      assert.ok(lu.includes(`id=${s.sid}`) && lu.includes(`k=${s.unsubKey}`), 'header is theirs');
      assert.equal(
        message.headers.find(h => h.Name === 'List-Unsubscribe-Post')?.Value,
        'List-Unsubscribe=One-Click'
      );
      assert.ok(message.html.includes(`#id=${s.sid}&amp;k=${s.unsubKey}`), 'footer link is theirs');
      assert.ok(message.text.includes(`#id=${s.sid}&k=${s.unsubKey}`), 'text part too');
      assert.ok(!lu.includes(to) && !message.html.includes(`id=${to}`), 'no address in links');
      seen.add(lu);
    }
    assert.equal(seen.size, 3, 'no two recipients share a link');
  });

  await test('re-running the same issue sends nothing to people who have it', async () => {
    const store = await listHarness();
    const mailer = new IssueCapture();
    await sendIssue({ store, mailer, issue, siteUrl: 'https://psd401.ai' });
    const second = await sendIssue({ store, mailer, issue, siteUrl: 'https://psd401.ai' });
    assert.equal(second.sent, 0);
    assert.equal(second.alreadySent, 3);
    assert.equal(mailer.sent.length, 3);
  });

  await test('a failed send is reported, not recorded, and retried by the next run', async () => {
    const store = await listHarness();
    const mailer = new IssueCapture();
    mailer.failFor.add('b@example.org');
    const first = await sendIssue({ store, mailer, issue, siteUrl: 'https://psd401.ai' });
    assert.equal(first.sent, 2);
    assert.deepEqual(
      first.failed.map(f => f.email),
      ['b@example.org']
    );
    mailer.failFor.clear();
    const retry = await sendIssue({ store, mailer, issue, siteUrl: 'https://psd401.ai' });
    assert.equal(retry.sent, 1);
    assert.equal(mailer.sent.at(-1)!.to, 'b@example.org');
  });

  await test('someone who unsubscribes mid-send is not re-created by the bookkeeping', async () => {
    const store = await listHarness();
    const mailer = new IssueCapture();
    mailer.onSend = async to => {
      if (to === 'a@example.org') await store.remove(to); // they click unsubscribe as it goes out
    };
    const r = await sendIssue({ store, mailer, issue, siteUrl: 'https://psd401.ai' });
    assert.equal(r.unsubscribedDuringRun, 1);
    assert.equal(await store.getByEmail('a@example.org'), null);
  });

  await test('a dry run sends nothing and records nothing', async () => {
    const store = await listHarness();
    const mailer = new IssueCapture();
    const dry = await sendIssue({
      store,
      mailer,
      issue,
      siteUrl: 'https://psd401.ai',
      dryRun: true,
    });
    assert.equal(dry.eligible, 3);
    assert.equal(mailer.sent.length, 0);
    const real = await sendIssue({ store, mailer, issue, siteUrl: 'https://psd401.ai' });
    assert.equal(real.sent, 3, 'dry run did not mark anyone as sent');
  });

  await test('sends are spaced to the SES rate', async () => {
    const store = await listHarness();
    const waits: number[] = [];
    await sendIssue({
      store,
      mailer: new IssueCapture(),
      issue,
      siteUrl: 'https://psd401.ai',
      minIntervalMs: 72,
      sleep: async ms => void waits.push(ms),
    });
    assert.deepEqual(waits, [72, 72], 'n-1 gaps between n sends');
  });
}

async function main() {
  await core();
  await routes();
  await sending();
  console.log(`\n${passed} passed.`);
}

main().catch(err => {
  console.error('\nFAILED:', err instanceof Error ? err.message : err);
  process.exit(1);
});
