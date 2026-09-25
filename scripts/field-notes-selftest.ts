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
  } finally {
    console.log = log;
  }
}

async function main() {
  await core();
  await routes();
  console.log(`\n${passed} passed.`);
}

main().catch(err => {
  console.error('\nFAILED:', err instanceof Error ? err.message : err);
  process.exit(1);
});
