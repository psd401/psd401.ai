---
type: software
title: AI Studio
description: Frontier AI models for every staff member and student in the district, behind district sign-in, at about a tenth of the cost of per-seat licences.
resource: /software/ai-studio
date: '2026-09-25'
tags:
  - Open Source
  - Platform
  - Staff
  - Students
maturity: Production
stack: Next.js 16 · AWS
repo: https://github.com/psd401/aistudio
license: MIT
contact: aistudio@psd401.net
image: /images/aistudio-1.png
imageAlt: The AI Studio home screen, with the district name above a short description of the platform
appUrl: aistudio.psd401.ai
spec:
  - k: Models
    v: GPT-5, Claude Opus and Google Gemini, switchable per conversation
  - k: Front end
    v: Next.js 16, TypeScript
  - k: Hosting
    v: AWS — ECS on Fargate, with RDS
  - k: Sign-in
    v: AWS Cognito with Google sign-in
  - k: Model data
    v: Covered by the model providers' zero-data-retention agreements
  - k: Content safety
    v: Amazon Bedrock Guardrails in detect-and-log mode
  - k: Licence
    v: MIT
status: stable
generated:
  by: claude-code/opus-5-5
  at: '2026-09-25'
---

AI Studio gives staff and students access to frontier models — GPT-5, Claude Opus, Google Gemini — through the district's own sign-in, instead of a separate per-seat licence for each one.

We built it because the per-seat maths did not work. Individual AI subscriptions run $20 to $200 a month per person. Calling the same models through their APIs, behind our own authentication, costs about a tenth of that, and we decide where the data goes.

## What it does

- **Chat with several models in one place.** Switch between GPT-5, Claude Opus and Gemini mid-conversation, or run the same prompt against two side by side and compare.
- **Build an assistant without code.** Assistant Architect lets a teacher chain prompts together, pass results from one step to the next, and attach a set of documents — then share the result with colleagues who never need to learn prompting.
- **Ground answers in your own documents.** Upload PDFs, Word files and text, OCR included, and assistants answer from them.
- **Keep control at the district level.** Role-based access, tool-level permissions and an audit log.

## What did not work

We started with Amazon Bedrock Guardrails set to block unsafe content. It kept flagging legitimate educational content. After repeated false positives, we switched it to detect-and-log: detections are recorded for review, and nothing is blocked. That trade-off is deliberate, and it is documented in the repository.

## Running it in your district

The code is MIT-licensed and deploys to your own AWS account; the deployment guide is in the repository. If you would rather talk it through first, email us.
