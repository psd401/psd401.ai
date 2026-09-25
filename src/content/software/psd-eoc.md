---
type: software
title: PSD EOC
description: Emergency notification and operations for school districts — activate an incident or a drill, notify staff, work the event in a live timeline, and keep an append-only record.
resource: /software/psd-eoc
date: '2026-09-25'
tags:
  - Operations
  - Safety
maturity: Production
stack: Next.js · Expo · AWS
repo: https://github.com/psd401/psd-eoc
license: MIT
contact: hagelk@psd401.net
image: /images/software/pd-eoc.jpg
imageAlt: An operations room with handheld radios on chargers and a wall display showing a map
spec:
  - k: First
    v: Call 911. EOC notifies and documents; it does not contact emergency services
  - k: Modes
    v: Real incidents and drills
  - k: Clients
    v: Web, iOS and Android
  - k: Record
    v: An append-only event timeline
  - k: Hosting
    v: Your district's own AWS account and Google Workspace
  - k: Agent access
    v: An MCP adapter over the same capabilities as the app
  - k: Licence
    v: MIT
status: stable
generated:
  by: claude-code/opus-5-5
  at: '2026-09-25'
---

**Call 911 first.** PSD EOC notifies and documents. It does not contact emergency services.

Staff activate an incident or a drill, notify the people who need to know over the channels the district has configured, and work the event together in a live timeline. Everything that happens is kept as an append-only record.

## Built for any district

EOC runs on a district's own AWS account and Google Workspace. The repository includes a first-administrator guide, a first-run runbook, and a configuration index listing every value a district supplies: its identity, its facilities, its notification providers, and the identifiers for its own mobile app listings.

There is a web app, native apps for iOS and Android, and an MCP adapter so agents can use the same capabilities people do.

## The rule that matters most

Automation in this system never starts a real incident, sends a real notification, issues a real all-clear, or closes a real event. A person does those things. The repository's own development setup uses only synthetic identities and recipients that cannot be reached, so it is safe to run and test without touching a real district.
