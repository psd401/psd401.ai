/**
 * Send an issue of the newsletter.
 *
 *   npm run field-notes:send -- --issue path/to/issue.md --preview out.html
 *       Render one copy to a file and open it in a browser. No AWS.
 *
 *   npm run field-notes:send -- --issue path/to/issue.md --dry-run
 *       Count who would receive it. Sends nothing, records nothing.
 *
 *   npm run field-notes:send -- --issue path/to/issue.md --test you@psd401.net
 *       Send one copy, subject prefixed [TEST], to one address. Records nothing.
 *
 *   npm run field-notes:send -- --issue path/to/issue.md
 *       Send to every confirmed subscriber who has not had this issue. Shows
 *       what it is about to do and waits for you to type the recipient count.
 *
 * Needs, except for --preview: FIELD_NOTES_TABLE, FIELD_NOTES_FROM, and AWS
 * credentials for an identity with the sender policy from
 * infra/field-notes.yaml. Optional: FIELD_NOTES_REGION (us-west-2),
 * FIELD_NOTES_SITE_URL (https://psd401.ai), FIELD_NOTES_POSTAL_ADDRESS.
 *
 * Safe to re-run: recipients are recorded against the issue id as each send
 * succeeds, and skipped next time.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import { loadIssue } from '../src/lib/field-notes/issue';
import { buildMessage, sendIssue } from '../src/lib/field-notes/send';
import { DynamoStore, SesMailer } from '../src/lib/field-notes/aws';
import { NEWSLETTER } from '../src/lib/newsletter';

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}
const flag = (name: string) => process.argv.includes(`--${name}`);

function fail(message: string): never {
  console.error(`\n${message}\n`);
  process.exit(1);
}

function env(name: string): string {
  const v = process.env[name];
  if (!v) fail(`${name} is not set. See docs/field-notes.md.`);
  return v;
}

async function main() {
  const issuePath = arg('issue');
  if (!issuePath) fail('Missing --issue <file.md>. See the header of scripts/field-notes-send.ts.');

  const issue = await loadIssue(await fs.readFile(issuePath, 'utf8'), path.basename(issuePath));
  const siteUrl = (process.env.FIELD_NOTES_SITE_URL ?? 'https://psd401.ai').replace(/\/$/, '');
  const postalAddress = process.env.FIELD_NOTES_POSTAL_ADDRESS;

  console.log(`\n${NEWSLETTER.name} — issue "${issue.id}"`);
  console.log(`  subject: ${issue.subject}`);

  // ---- preview: no AWS at all
  const previewPath = arg('preview');
  if (previewPath) {
    const sample = buildMessage(
      issue,
      // Deliberately not token-shaped, so the unsubscribe page reports the
      // link as invalid rather than pretending to unsubscribe someone.
      { sid: 'preview-not-real', unsubKey: 'preview-not-real' },
      siteUrl,
      postalAddress
    );
    await fs.writeFile(previewPath, sample.html, 'utf8');
    console.log(`  preview written to ${previewPath}`);
    console.log(`  headers: ${sample.headers.map(h => h.Name).join(', ')}`);
    if (!postalAddress)
      console.log('  note: FIELD_NOTES_POSTAL_ADDRESS is not set; the footer uses the town only.');
    return;
  }

  const table = env('FIELD_NOTES_TABLE');
  const from = env('FIELD_NOTES_FROM');
  const region = process.env.FIELD_NOTES_REGION ?? 'us-west-2';
  const store = new DynamoStore(table, region);
  const mailer = new SesMailer(from, region);

  console.log(`  from:    ${from}`);
  console.log(`  table:   ${table} (${region})`);

  // ---- one test copy
  const testTo = arg('test');
  if (testTo) {
    const message = buildMessage(
      issue,
      { sid: 'test-not-real', unsubKey: 'test-not-real' },
      siteUrl,
      postalAddress
    );
    await mailer.sendIssue(testTo, {
      ...message,
      subject: `[TEST] ${message.subject}`,
      headers: [], // no working unsubscribe target for a test copy
    });
    console.log(`\n  sent one test copy to ${testTo}. Nothing was recorded.\n`);
    return;
  }

  // ---- count
  const count = await sendIssue({ store, mailer, issue, siteUrl, postalAddress, dryRun: true });
  console.log(`\n  confirmed subscribers who have not had this issue: ${count.eligible}`);
  if (count.alreadySent)
    console.log(`  already sent this issue (will be skipped): ${count.alreadySent}`);
  if (flag('dry-run')) {
    console.log('\n  --dry-run: nothing sent, nothing recorded.\n');
    return;
  }
  if (count.eligible === 0) {
    console.log('\n  Nobody to send to.\n');
    return;
  }

  // ---- confirm. Sending email to the public cannot be undone.
  if (!process.stdin.isTTY)
    fail('A real send asks for confirmation and needs an interactive terminal.');
  if (!postalAddress)
    console.log('  note: FIELD_NOTES_POSTAL_ADDRESS is not set; the footer uses the town only.');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(
    `\n  This sends "${issue.subject}" to ${count.eligible} people.\n  Type ${count.eligible} to send, anything else to stop: `
  );
  rl.close();
  if (answer.trim() !== String(count.eligible)) {
    console.log('\n  Stopped. Nothing sent.\n');
    return;
  }

  const rate = await mailer.maxSendRate();
  const minIntervalMs = Math.ceil(1000 / Math.max(rate, 1));
  console.log(`\n  sending at up to ${rate}/s (SES account limit)…`);

  const report = await sendIssue({
    store,
    mailer,
    issue,
    siteUrl,
    postalAddress,
    minIntervalMs,
    onProgress: done => {
      if (done % 25 === 0) console.log(`  ${done}/${count.eligible}`);
    },
  });

  console.log(`\n  sent: ${report.sent}`);
  if (report.unsubscribedDuringRun)
    console.log(`  unsubscribed while sending (not re-added): ${report.unsubscribedDuringRun}`);
  if (report.failed.length) {
    console.log(`  failed: ${report.failed.length} — run the same command again to retry them`);
    for (const f of report.failed) console.log(`    ${f.email}  ${f.error}`);
    process.exitCode = 1;
  }
  console.log('');
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
