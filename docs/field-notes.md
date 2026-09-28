# Field Notes — the subscriber list

Field Notes is the sign-up on the Writing page. Subscribers are stored in
DynamoDB and confirmation emails go out through SES, in the district's own AWS
account. No mailing-list vendor is involved.

## How it works

1. **Sign-up.** The form posts to `/api/subscribe`. The address is stored as
   `pending` and one confirmation email is sent. Nothing else is ever sent to a
   pending address.
2. **Confirmation.** The emailed link opens `/field-notes/confirm`, and the
   person presses a button. Opening the link alone does nothing — mail
   security scanners fetch every link in an email, and a link that confirmed on
   open would subscribe people who never clicked.
3. **Unsubscribe.** `/field-notes/unsubscribe` deletes the record outright.
   `/api/field-notes/unsubscribe` also accepts RFC 8058 one-click requests, which
   Gmail and Yahoo require from bulk senders.

Privacy properties, all covered by `npm run field-notes:selftest`:

- Links identify a subscriber by a random id and carry their token in the URL
  fragment. **An email address never appears in a URL**, so none reaches server
  logs, Referer headers or Google Analytics.
- Confirmation tokens are stored only as SHA-256 hashes.
- The response to a sign-up is identical whether the address is new, pending or
  already confirmed, so the form cannot be used to find out who is on the list.
- Unconfirmed sign-ups are deleted after 7 days (DynamoDB TTL). Unsubscribing
  deletes the record. We keep no list of former subscribers.
- Bots: a hidden honeypot field and a minimum time-on-form. Both fail silently.

What is stored per subscriber: the address, a random id, `pending` or
`confirmed`, a token hash while pending, an unsubscribe key, and timestamps.

Code: `src/lib/field-notes/core.ts` is the flow, with no AWS imports.
`src/lib/field-notes/aws.ts` is the DynamoDB and SES driver.
`src/lib/subscribe.ts` chooses the driver from the environment.

## Running it locally

No AWS account needed. Put this in `.env.development.local` (git-ignored):

```bash
FIELD_NOTES_DRIVER=memory
```

Restart `npm run dev`. The form is live; subscribers are kept in memory, and
each confirmation link is printed to the dev server's log instead of emailed.
Open the printed link to finish the flow. The memory driver is refused in a
production build.

## Setting it up in AWS

One time, in the same region for every step (the code defaults to `us-west-2`).

### 1. Sending identity in SES

Verify the domain the email comes from — `psd401.ai`, or a single address —
in SES, and publish the DKIM records it gives you. Then check the account is
out of the SES sandbox, or confirmations will only reach verified addresses:

```bash
aws sesv2 get-account --query ProductionAccessEnabled
```

### 2. The table and the policies

```bash
aws cloudformation deploy \
  --template-file infra/field-notes.yaml \
  --stack-name psd401-ai-field-notes \
  --parameter-overrides SenderIdentity=psd401.ai \
  --capabilities CAPABILITY_IAM
```

This creates the `psd401-ai-field-notes` table (retained if the stack is ever
deleted) and two managed policies:

- **Site policy** (`SitePolicyArn`) — exactly `GetItem`, `PutItem`,
  `UpdateItem`, `DeleteItem` and `Query` on the table, and `ses:SendEmail` on
  the sending identity. For the website.
- **Sender policy** (`SenderPolicyArn`) — `Scan` and `UpdateItem` on the table,
  `ses:SendEmail` on the sending identity, and `ses:GetAccount`. For whoever
  sends issues; see [Sending an issue](#sending-an-issue).

The stack outputs give the table name and both ARNs.

### 3. Give the site the policy

In the Amplify console: **App settings → IAM roles → Compute role**. Attach the
site policy (`SitePolicyArn`) to that role (create one if the app has none). Do
not attach the sender policy — the site never lists subscribers. The site gets
credentials from the role at runtime; no access keys are stored anywhere.

### 4. Environment variables

In **App settings → Environment variables**:

| Variable             | Value                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------- |
| `FIELD_NOTES_TABLE`  | `psd401-ai-field-notes`                                                                     |
| `FIELD_NOTES_FROM`   | `Display Name <address>` — an address the district has created, on a domain verified in SES |
| `FIELD_NOTES_REGION` | Only if not `us-west-2`                                                                     |

Amplify reserves the `AWS_` prefix, which is why these are named
`FIELD_NOTES_`.

### 5. Make them visible at runtime

Amplify exposes console variables to the build, but **not** to server code at
runtime. The API routes run at runtime, so add this line to the build spec
(**App settings → Build settings**), in `build.commands` before `npm run build`:

```yaml
- env | grep -e '^FIELD_NOTES_' >> .env.production
```

Without it the Writing page's form will render as connected (it is decided at
build time) while the API routes answer 503.

### 6. Check it

Sign up with a real address on `/writing`, confirm from the email, and look for
the item in the table with `status = confirmed`. Then unsubscribe and confirm
the item is gone.

## Sending an issue

### Write it

An issue is a markdown file. Keep them anywhere; the sender takes a path.

```markdown
---
subject: What we learned from six weeks of AI-drafted IEPs
id: 2026-10-06
---

The body, in markdown. Use absolute URLs for links and images — a relative
path means nothing inside an email.
```

`id` is optional and defaults to the file name. It is how the sender knows who
already has this issue, so do not change it between runs of the same issue.

### Send it

Four steps, in order. Only the last one emails subscribers.

```bash
# 1. Look at it. Writes one copy to a file; touches no AWS.
npm run field-notes:send -- --issue issue.md --preview preview.html

# 2. See who would get it. Sends nothing, records nothing.
npm run field-notes:send -- --issue issue.md --dry-run

# 3. Send one copy to yourself, subject prefixed [TEST].
npm run field-notes:send -- --issue issue.md --test you@psd401.net

# 4. Send it. Shows the subject and recipient count, then waits for you to
#    type that count before anything goes out.
npm run field-notes:send -- --issue issue.md
```

Steps 2–4 need `FIELD_NOTES_TABLE`, `FIELD_NOTES_FROM` and AWS credentials for
an identity with the **sender policy** (`SenderPolicyArn` from the stack).
Optional: `FIELD_NOTES_POSTAL_ADDRESS` for the footer (without it the footer
names the town only), `FIELD_NOTES_REGION`, `FIELD_NOTES_SITE_URL`.

What the sender guarantees, all covered by `npm run field-notes:selftest`:

- **Confirmed subscribers only.** The store lists confirmed records and the
  send loop checks each one again.
- **Each copy carries its recipient's own unsubscribe link**, plus the
  `List-Unsubscribe` and `List-Unsubscribe-Post` headers Gmail and Yahoo
  require. Mail clients show their own "Unsubscribe" button from these.
- **Re-running is safe.** Each recipient is recorded against the issue id as
  their copy goes out and skipped next time. If a run dies half way, run the
  same command again.
- **A failed send does not stop the run.** Failures are listed at the end,
  left unrecorded, and retried by the next run.
- **Someone who unsubscribes mid-send stays unsubscribed.** Recording a send
  is conditional on the record still existing.
- **Paced to the account's SES send rate**, with backoff if SES throttles.

### Bounces and complaints

Handled by SES rather than by this code. Make sure the account-level
suppression list covers both, so SES stops sending to an address that
bounced or marked a message as spam:

```bash
aws sesv2 put-account-suppression-attributes --suppressed-reasons BOUNCE COMPLAINT
```

Suppressed addresses stay in the table but SES will not deliver to them.
