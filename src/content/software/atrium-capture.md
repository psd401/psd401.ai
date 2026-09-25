---
type: software
title: Atrium Capture
description: Record a workflow in Chrome or on a Mac and turn it into an editable step-by-step guide, saved to Atrium as a private draft — without ever capturing a password.
resource: /software/atrium-capture
date: '2026-09-25'
tags:
  - Staff
  - Publishing
  - Privacy
maturity: Production
stack: Chrome extension · macOS
repo: https://github.com/psd401/atrium-capture
license: MIT
contact: hagelk@psd401.net
image: /images/software/atrium-capture-review.png
imageAlt: The Atrium Capture panel listing eight recorded steps awaiting review, beside the line "Record the workflow, not the secrets"
spec:
  - k: Platforms
    v: Chrome extension, and a companion app for macOS
  - k: Output
    v: A private Atrium draft, reviewed before anything is published
  - k: Passwords
    v: Never captured. Other typed values are left out by default
  - k: Redaction
    v: Permanent — flattened into new pixels before upload
  - k: Recordings
    v: Stay on the device until the author submits a reviewed draft
  - k: Telemetry
    v: Off
  - k: Sign-in
    v: The staff member's AI Studio account
  - k: Licence
    v: MIT
status: stable
generated:
  by: claude-code/opus-5-5
  at: '2026-09-25'
---

Atrium Capture records a workflow — clicking through a system, filling in a form — and turns each meaningful action into a step in an editable visual guide. The author reviews the steps, redacts what should not be seen, and saves the result to [Atrium](/software/atrium) as a private draft. It is available to all staff.

It runs as a Chrome extension, and as a Mac app for workflows outside the browser.

## Built around what it will not do

Guides are made of screenshots, and screenshots leak. So the rules came first:

- **Passwords are never captured.** Other typed values are left out by default.
- **Nothing leaves the device until the author says so.** Recordings stay local until a reviewed draft is submitted.
- **Redaction is permanent.** Only flattened screenshots are uploaded — never the unredacted original with a box drawn on top.
- **Private by default.** Every guide lands in Atrium as a private draft, and publishing is a separate, deliberate step.
- **No telemetry.**

Staff sign in with the same AI Studio account they already use.
