---
type: Integration
title: Field Notes newsletter (double opt-in on DynamoDB and SES)
description: How the Field Notes subscriber flow works (sign-up, confirm, unsubscribe, issue sending), its driver split between pure core logic and AWS or in-memory drivers, privacy properties, env vars, IAM and the self-test that proves it.
tags: [newsletter, aws, dynamodb, ses, privacy, double-opt-in]
openwiki:
  roles: [integration, domain]
  change_kinds: [consent-flow, aws, email, api]
  source_paths: [src/lib/field-notes/core.ts, src/lib/field-notes/aws.ts, src/lib/field-notes/memory.ts, src/lib/field-notes/send.ts, src/lib/field-notes/issue.ts, src/lib/field-notes/email.ts, src/lib/subscribe.ts, src/lib/newsletter.ts, src/app/api/subscribe/route.ts, src/app/api/field-notes/confirm/route.ts, src/app/api/field-notes/unsubscribe/route.ts, scripts/field-notes-send.ts, infra/field-notes.yaml, docs/field-notes.md]
  symbols: [subscribe, confirm, unsubscribe, sendIssue, buildMessage, SubscriberStore, ConfirmationMailer, IssueStore, IssueMailer, DynamoStore, SesMailer, MemoryStore, LogMailer, isSubscribeConfigured, loadIssue]
  test_paths: [scripts/field-notes-selftest.ts]
  invariants:
    - An email address never appears in a URL; links carry a random sid and tokens in the URL fragment.
    - Confirmation tokens are stored only as SHA-256 hashes.
    - Sign-up responses are identical for new, pending and confirmed addresses.
    - Confirmation requires a POST from a button, never a GET on the emailed link.
    - Unsubscribing deletes the record; no former-subscriber list is kept.
    - Re-running an issue send never double-sends; a failed send is retried on the next run.
  validation_commands: ['bun run field-notes:selftest']
---

# Field Notes newsletter

Field Notes is the sign-up form on `/writing`. Subscribers live in DynamoDB and mail goes through SES in the district's own AWS account; no mailing-list vendor is involved. The operator runbook (AWS setup, env vars, sending commands, SES suppression) is [docs/field-notes.md](../../docs/field-notes.md); this page explains the code and its invariants. The public name and tagline are in `src/lib/newsletter.ts` (the name is flagged there as unconfirmed; internal identifiers like `FIELD_NOTES_*` are separate).

## Layering

| Layer | File | Role |
| --- | --- | --- |
| Pure flow | `src/lib/field-notes/core.ts` | `subscribe`, `confirm`, `unsubscribe`; depends only on injected `SubscriberStore` and `ConfirmationMailer` (no AWS, no Next.js) |
| Wiring | `src/lib/subscribe.ts` | Server-only. Picks the driver from `FIELD_NOTES_DRIVER` and exposes `addSubscriber`, `confirmSubscription`, `removeSubscription`, `isSubscribeConfigured` |
| Drivers | `field-notes/aws.ts` (`DynamoStore` also implements `IssueStore`; `SesMailer`), `field-notes/memory.ts` (`MemoryStore`, `LogMailer`) | Production and local-dev implementations |
| Issue sending | `field-notes/send.ts`, `issue.ts`, `email.ts`, `scripts/field-notes-send.ts` | Render and send an issue to confirmed subscribers |
| HTTP | `src/app/api/subscribe`, `api/field-notes/confirm`, `api/field-notes/unsubscribe` | Validation (zod), bot checks, 503 when unconfigured |
| UI | `SubscribeForm` (`src/components/ds/forms.tsx`) rendered in `src/app/writing/page.tsx`; `FieldNotesAction` for `/field-notes/confirm` and `/unsubscribe` pages | |
| Infra | `infra/field-notes.yaml` | CloudFormation: table (retained on delete) with `bySid` GSI and TTL, plus site and sender managed policies |

Driver selection (`driver()` in `subscribe.ts`): `aws` (default) needs `FIELD_NOTES_TABLE` and `FIELD_NOTES_FROM` (region `FIELD_NOTES_REGION`, default `us-west-2`); `memory` is for `bun run dev` only and is refused when `NODE_ENV=production`. With neither configured the form is hidden on `/writing` (decided at build time) and the routes answer 503. On Amplify, the variables must be copied into `.env.production` at build time (see [CI and deploy](../operations/ci-and-deploy.md)); the `amplify.yml` currently in the repo does not contain that line, so check it against docs/field-notes.md step 5 if the routes answer 503 in production.

## Lifecycle

```mermaid
sequenceDiagram
  participant P as Person
  participant F as /api/subscribe
  participant C as core.subscribe
  participant S as Store (Dynamo or memory)
  participant M as Mailer (SES or log)
  P->>F: POST email, honeypot, elapsed
  F->>F: honeypot filled or under 1.5s: quiet 200, nothing stored
  F->>C: addSubscriber
  C->>S: put pending record with sha256 token hash and 7 day TTL
  C->>M: confirmation link with sid and token in URL fragment
  P->>P: opens link, FieldNotesAction reads fragment then strips it
  P->>F: presses button, POST /api/field-notes/confirm
  F->>S: getBySid, compare hash, conditional markConfirmed
  Note over P,S: unsubscribe deletes the record; one-click POST supported
```

*Confirm and unsubscribe are explicit POSTs; the emailed link alone changes nothing.*

Key behaviours in `core.ts`:

- `subscribe`: lowercases and trims; confirmed address returns `already_confirmed` without sending; a pending record emailed within `RESEND_THROTTLE_MINUTES` (10) returns `throttled`; otherwise a new token replaces the old one (retiring the old link) and `expiresAt` is set `CONFIRM_WINDOW_DAYS` (7) ahead. If the mailer throws, the previous state is restored (new record removed, or old record put back) so the throttle cannot lock someone out.
- `confirm`: `TOKEN_PATTERN` (43 base64url chars) check before any lookup; idempotent for already-confirmed; `expired`/`invalid` outcomes; constant-time compare; handles losing a race on conditional `markConfirmed`.
- `unsubscribe`: unknown sid reports `removed` (a second click is not an error); wrong key is `invalid`.
- `addSubscriber` returns the same `{ ok: true }` for every outcome, so the form cannot enumerate subscribers; only a provider failure surfaces (502).
- `DynamoStore`: `getByEmail` is a consistent read; `getBySid` uses GSI `bySid` (eventually consistent); `markConfirmed` is conditional on `status = pending`; `markIssueSent` is conditional on `attribute_exists(email) AND status = confirmed`; listing confirmed subscribers uses `Scan`, which only the sender policy grants (the site's policy deliberately does not).

## Sending an issue

`sendIssue` (`send.ts`) iterates `store.listConfirmed()`, skips anyone whose `issuesSent` already has the issue id, builds a per-recipient message (`buildMessage`: own unsubscribe link plus `List-Unsubscribe` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click` headers), sends, then records the id. Failures are collected and not recorded (retried next run); a recipient who unsubscribes mid-run is counted in `unsubscribedDuringRun` rather than recreated; `minIntervalMs` paces sends to the SES rate; `dryRun` counts only. `loadIssue` (`issue.ts`) requires a `subject`, derives `id` from frontmatter or file name (`^[a-z0-9][a-z0-9-]{0,63}$`), and keeps remark-html sanitising on. The CLI `scripts/field-notes-send.ts` offers `--preview`, `--dry-run`, `--test <address>` and a full send that makes the operator type the recipient count.

## Change navigation

- Flow or privacy change: edit `core.ts`; then update `field-notes-selftest.ts` (the CI test) and, if collected data changes, the privacy page text in `src/lib/trust-pages.ts` (see [machine surfaces](../architecture/machine-readable-surfaces.md#change-navigation)).
- New storage or mail provider: implement `SubscriberStore`/`ConfirmationMailer` (and `IssueStore`/`IssueMailer` for sending), then wire in `deps()` in `subscribe.ts`.
- Tests live in `scripts/field-notes-selftest.ts` in three parts: core flow (e.g. "a repeat sign-up within 10 minutes sends nothing", "if the email fails on a resend, the previous record is restored", "links expire after 7 days"); route handlers under the memory driver (honeypot, time trap, 415 on non-JSON, identical responses, RFC 8058 one-click); issue sending (e.g. "re-running the same issue sends nothing to people who have it", "someone who unsubscribes mid-send is not re-created by the bookkeeping", "sends are spaced to the SES rate").
- Validate: `bun run field-notes:selftest` (no AWS needed; this is what CI runs). Real AWS paths (`aws.ts`, `infra/field-notes.yaml`) are not covered by the self-test and need a manual check in a real account (docs/field-notes.md step 6).
- Entry in the site's data-collection story: [overview](../architecture/overview.md).
