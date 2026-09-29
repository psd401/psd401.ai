---
type: software
title: PSD AI Agents
description: A personal AI agent for district staff, with its own district Google account, that works on its owner's behalf in Google Chat — the way an assistant would.
resource: /software/psd-ai-agents
date: '2026-09-25'
tags:
  - Agents
  - Staff
  - Operations
maturity: Production
stack: OpenClaw · AWS · Google Workspace
repo: https://github.com/psd401/aistudio
license: MIT
contact: hagelk@psd401.net
image: /images/software/pd-psd-ai-agents.jpg
imageAlt: A staff member working at a two-monitor desk in a district office
spec:
  - k: Where staff use it
    v: Google Chat
  - k: Identity
    v: Its own Google Workspace account, agnt_<name>@psd401.net
  - k: Acting as its owner
    v: Only with the owner's explicit consent, per account
  - k: Credentials
    v: Minted outside the model runtime; the model never holds a reusable token
  - k: Memory
    v: Plain markdown files — no hidden state
  - k: Skills
    v: 40 as of September 2026
  - k: Source
    v: Part of the AI Studio repository
  - k: Licence
    v: MIT
status: stable
generated:
  by: claude-code/opus-5-5
  at: '2026-09-25'
---

Each staff member can have a personal AI agent. It has its own district Google Workspace account — `agnt_<name>@psd401.net` — and works through Google Chat. Staff delegate to it the way they would delegate to an assistant: share a calendar, a folder or a thread with it, and it works on that.

The agent acts as itself by default. It can act on its owner's own account too, but only after the owner grants that consent explicitly, and the two are kept separate.

## What it does

The agent ships with 40 skills as of September 2026. Among them:

- **Email triage and a morning brief** across its owner's inbox and calendar
- **District lookups** — the staff directory, Freshservice tickets, district data
- **Deep research** with sources
- **Writing and publishing** — drafts, standard operating procedures, pages published to [Atrium](/software/atrium)
- **Transcription and summaries** of meetings and recordings
- **District workflows** through our internal agent gateway

## How it stays safe

The model never holds a reusable Google credential. When the agent needs to act in Workspace, a separate, isolated service mints a short-lived token and hands it only to the command that needs it. A compromise of the web application can reach agent accounts, not staff mailboxes.

Its memory is plain markdown files. There is no hidden state: if a fact is not written down, the agent does not remember it. And it runs under a short set of rules it re-reads every turn — never invent a link, an ID or an outcome, and never promise something it has not done.
