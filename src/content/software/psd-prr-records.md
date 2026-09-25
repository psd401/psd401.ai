---
type: software
title: PSD PRR Records
description: Our public records request system, built to replace NextRequest — Washington's deadlines, exemptions and audit trail enforced in code rather than by policy.
resource: /software/psd-prr-records
date: '2026-09-25'
tags:
  - Operations
  - Compliance
maturity: Production
stack: Django · React · Celery
contact: hagelk@psd401.net
image: /images/software/pd-prr-records.jpg
imageAlt: A records office with archive boxes on metal shelving and a scanner on a work table
spec:
  - k: Governing law
    v: RCW 42.56 (Washington Public Records Act) and FERPA
  - k: Replaces
    v: NextRequest
  - k: Response clock
    v: Five business days, computed with Washington holidays and district closures
  - k: Redactions
    v: Every one must cite an RCW 42.56 or FERPA exemption
  - k: Audit log
    v: Append-only — no update or delete path exists
  - k: Denials
    v: Never automated. A person drafts every one
  - k: Records source
    v: Google Workspace, through Vault
  - k: Source
    v: Private repository
status: draft
generated:
  by: claude-code/opus-5-5
  at: '2026-09-25'
---

The district's public records requests run through this system, and it is in use every day. We built it to replace NextRequest.

Under Washington's Public Records Act, the deadline arithmetic, the exemptions and the audit trail are not administrative details — they are the legal record. So in this system they are not settings an administrator can change or fields someone can skip. They are enforced by the database and proven by tests.

## Why we built it

Our 2026 build-or-buy analysis priced NextRequest at roughly $1,000 to $5,000 a month, with GovQA and FOIAXpress at enterprise pricing. The only credible open-source option was a heavyweight stack with no Google Vault integration — and the district's records live in Google Workspace. A purpose-built system won on all three counts, and the avoided licence cost paid for the build.

## What it guarantees

- **The five-day clock is computed, not estimated.** Washington holidays including Juneteenth, district closures, requests received after hours, and clarification pauses are all accounted for — and tested against real calendar dates.
- **Every redaction cites an exemption.** A redaction without an RCW 42.56 or FERPA citation cannot be saved.
- **The audit log cannot be edited.** There is no code path that updates or deletes it.
- **A person makes every statutory decision.** Denials are never automated. Requests for camera footage automatically place the footage on hold, and never automatically deny.
- **The request is never rewritten.** What the requester asked for is the legal record. Clarifications are added alongside it.
- **We ask requesters for as little as the law allows** — a name, a way to reach them, and what they are looking for.

The repository is private. If you are a district weighing the same decision, email us.
