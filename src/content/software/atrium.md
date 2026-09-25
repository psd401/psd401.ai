---
type: software
title: Atrium
description: A content workspace inside AI Studio where staff and their agents write documents and build interactive pages together, then publish them to the intranet, the public web, Schoology or Google.
resource: /software/atrium
date: '2026-09-25'
tags:
  - Agents
  - Staff
  - Publishing
maturity: Production
stack: Next.js · AWS
repo: https://github.com/psd401/aistudio
license: MIT
contact: hagelk@psd401.net
image: /images/software/pd-atrium.jpg
imageAlt: An empty classroom after hours with a laptop open on a side table
spec:
  - k: Content
    v: Documents in markdown, and interactive artifacts
  - k: Authorship
    v: Every version kept, with a record of which parts a person wrote and which an agent wrote
  - k: Visibility
    v: Private, group or public, set per item
  - k: Agent access
    v: The same API the editors use — over MCP, REST or skills
  - k: Publishes to
    v: Staff intranet, public web, Schoology and Google — and can unpublish from each
  - k: Exports
    v: Open Knowledge Format bundles, for one item or a whole collection
  - k: Source
    v: Part of the AI Studio repository
  - k: Licence
    v: MIT
status: stable
generated:
  by: claude-code/opus-5-5
  at: '2026-09-25'
---

Atrium is where staff and their [agents](/software/psd-ai-agents) make things together. It holds two kinds of content — documents, written in markdown, and interactive artifacts — versions them with visible authorship, and publishes them wherever they need to go: the staff intranet, the public web, Schoology or Google.

## Built for agents first

The rule we held to: anything a person can do in Atrium, an agent can do through the same tools. There is no path that only works through the user interface. The in-app editors, agents working over MCP, scripts calling the REST API and scheduled skills are all clients of one content API, and it is the source of truth for how content is created, versioned and published.

That is what lets an agent draft a procedure, a person edit it, and the page record who wrote which part.

## What it does

- **Documents and artifacts.** Documents are markdown that renders richly. Anything interactive is an artifact.
- **Versions with authorship.** Every version is kept, and you can see which changes came from a person and which from an agent.
- **Permission-aware.** Items are private, shared with a group, or public. Published content becomes grounding for AI Studio's assistants — scoped to who is allowed to see it.
- **Fed by [Atrium Capture](/software/atrium-capture).** Record a workflow in Chrome or on a Mac and it arrives in Atrium as a draft guide.
- **Publishes where people already are.** One document can go to the staff intranet, the public web, a Schoology course or Google, and can be taken down from any of them. Publishing to the public web takes a separate permission from publishing internally.
- **Exports as Open Knowledge Format.** A single item or a whole collection, in the same format this site is published in, so any agent can read it without a custom integration.
