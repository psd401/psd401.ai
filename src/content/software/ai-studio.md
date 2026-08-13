---
type: software
title: AI Studio
description: Frontier AI models for every teacher and student in the district, behind your own authentication, at about a tenth of per-seat cost.
resource: /software/ai-studio
date: '2025-09-27'
tags:
  - Open Source
  - Platform
  - Staff
  - Students
maturity: Production
stack: Next.js · AWS
repo: https://github.com/psd401/aistudio
demoUrl: https://github.com/psd401/aistudio
license: MIT
contact: aistudio@psd401.net
image: /images/aistudio-1.png
spec:
  - k: Front end
    v: Next.js, App Router, TypeScript strict
  - k: Hosting
    v: Any container host. We run AWS ECS behind CloudFront.
  - k: Authentication
    v: SAML 2.0 or OIDC against your existing directory
  - k: Student data
    v: Never sent for training. Retention configurable per group.
  - k: Accessibility
    v: WCAG 2.2 AA. Keyboard-complete, screen-reader tested.
  - k: Licence
    v: MIT — fork it, no attribution required
status: stable
verified:
  - by: human:hagelk
    at: '2025-09-27'
---

AI Studio gives staff and students access to frontier models — GPT-5, Claude Opus, Google Gemini — through the district's own sign-in, instead of buying per-seat licences for each one. Staff build and share their own assistants inside it.

We built it because the per-seat maths did not work. Licensing a commercial assistant for every teacher and student in a 9,100-student district costs more than the district spends on most curriculum. Running the same models through their APIs behind our own authentication costs roughly a tenth of that, and we keep control of where the data goes.

## What it does

- Access to frontier models from several vendors, in one interface, under district sign-in.
- Staff-built assistants: a teacher can package a prompt, a set of documents and a role into something a colleague can use without knowing anything about prompting.
- Per-group controls over which models are reachable and how long conversations are retained.
- No student or staff data is sent to model providers for training.

## Running it in your district

Clone it and self-host, or email us and we will help you stand it up. We are not selling anything — we would rather more districts had this.
