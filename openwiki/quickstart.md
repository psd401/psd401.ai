---
type: Guide
title: psd401.ai OpenWiki quickstart
description: Entry point to the psd401.ai knowledge base. Overview of the Peninsula School District AI site (Next.js 16, OKF content bundle, Field Notes newsletter), a task-routing table to source files, symbols, checks and validation commands, and links to every wiki page.
tags: [quickstart, navigation, psd401, nextjs, okf]
openwiki:
  roles: [repository]
  change_kinds: [navigation]
  source_paths: [README.md, AGENTS.md, package.json]
---

# psd401.ai wiki quickstart

psd401.ai is Peninsula School District's public record of its AI work: guidance, writing, presentations, software, the Open Adaptive District protocol, plus a reference library of use cases, reviewed tools and research. It is a **Next.js 16 App Router / React 19 / TypeScript strict / Tailwind v4** site with no component library, deployed on AWS Amplify. Its distinctive design choice is that `src/content/` is simultaneously the site's source and an [Open Knowledge Format](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf) v0.2 bundle, so human pages and machine surfaces (`llms.txt`, `/okf`, `Accept: text/markdown`, `/api/content.json`) come from the same files. Content is licensed CC BY-NC-SA 4.0.

There is no unit-test runner. The repo's tests are `bun run content:validate`, `bun run field-notes:selftest`, type-check/lint/build, and two HTTP audits (`links:audit`, `agent:audit`). The working contract for agents is [AGENTS.md](../AGENTS.md); `CLAUDE.md` adds the command list and architecture notes.

## Pages

| Section | Page | What it answers |
| --- | --- | --- |
| Architecture | [Overview](architecture/overview.md) | Route map, sections, rendering defaults, where each concern lives |
| Architecture | [Content bundle](architecture/content-bundle.md) | Schemas, loader, validation, adding a content type |
| Architecture | [Machine-readable surfaces](architecture/machine-readable-surfaces.md) | llms.txt, /okf, markdown negotiation, sitemap, redirects |
| Architecture | [Open Adaptive District](architecture/open-adaptive-district.md) | Dual rendering of protocol documents, two stylesheets |
| Architecture | [Site UI](architecture/site-ui.md) | Design system, section colours, JSON-LD, search, related content |
| Workflow | [Publishing content](workflows/publishing-content.md) | Scaffold, validate, publish, house style |
| Integration | [Field Notes newsletter](integrations/field-notes-newsletter.md) | Double opt-in on DynamoDB and SES, issue sending |
| Operations | [CI and deploy](operations/ci-and-deploy.md) | GitHub Actions, Amplify, bun, audits, automation |

## Task routing

Run commands from the repo root. "Fast" checks are the default; items marked conditional are slower and only needed for the stated reason.

| Change area / intent | Wiki page | Entry points | Key symbols | Focused check | Minimal validation |
| --- | --- | --- | --- | --- | --- |
| Add or edit a post, policy, talk, tool, use case | [Publishing](workflows/publishing-content.md) | `scripts/content-new.ts`, `src/content/<dir>/` | `SCHEMAS`, `DIR_FOR_TYPE` | `scripts/content-validate.ts` | `bun run okf:build && bun run content:validate` |
| Add a frontmatter field or content type | [Content bundle](architecture/content-bundle.md) | `src/lib/schemas.ts`, `src/lib/okf.ts`, `src/lib/site.ts` | `okfBase`, `OKF_TYPES`, `DIR_TO_TYPE`, `DIR_TO_URL`, `SECTIONS` | `content:validate` | `bun run content:validate && bun run type-check` (conditional `bun run build` if routes added) |
| Change how pages read content, counts, search or related links | [Content bundle](architecture/content-bundle.md), [Site UI](architecture/site-ui.md) | `src/lib/content.ts`, `search.ts`, `related.ts`, `all-content.ts` | `getConcepts`, `getCounts`, `searchContent`, `getRelated`, `getAllConcepts` | `content:validate` (no unit tests) | `bun run type-check` |
| Change llms.txt, sitemap, feed, content.json, `.md` rewrites, Accept negotiation | [Machine surfaces](architecture/machine-readable-surfaces.md) | `next.config.js`, `src/lib/agent-markdown.ts`, `src/app/llms.txt/route.ts`, `src/app/okf/[...path]/route.ts` | `WANTS_MARKDOWN`, `markdownResponse`, `STATIC_ROUTES`, `indexable` | `scripts/agent-audit.ts` | `bun run type-check`; conditional `bun run build && bun run start` then `bun run agent:audit` |
| Add or move a public URL / redirect | [Machine surfaces](architecture/machine-readable-surfaces.md) | `next.config.js` `redirects`, `STATIC_ROUTES` | `redirects` | `scripts/links-audit.ts` | conditional: `bun run build && bun run start` then `bun run links:audit` |
| Edit an Open Adaptive District document or its rendering | [OAD](architecture/open-adaptive-district.md) | `src/lib/oad.ts`, `src/content/open-adaptive-district/`, `public/openadaptivedistrict/oad.css`, `src/styles/ds.css` | `getOadDocs`, `renderOadHtml`, `getOadPrintable`, `protocolSchema` | `content:validate`; `links:audit` for `printable` changes | `bun run content:validate` |
| UI component, styling, section colour, JSON-LD | [Site UI](architecture/site-ui.md) | `src/components/ds/`, `src/styles/ds.css`, `src/styles/tokens/`, `src/components/JsonLd.tsx` | `data-section`, `var(--sec)`, `createBlogPostingSchema` | none dedicated | `bun run type-check && bun run lint` |
| Newsletter sign-up, confirm, unsubscribe, sending | [Field Notes](integrations/field-notes-newsletter.md) | `src/lib/field-notes/core.ts`, `src/lib/subscribe.ts`, `src/app/api/subscribe/route.ts`, `scripts/field-notes-send.ts` | `subscribe`, `confirm`, `unsubscribe`, `sendIssue`, `DynamoStore` | `scripts/field-notes-selftest.ts` | `bun run field-notes:selftest` |
| AWS table, IAM policies, env vars for Field Notes | [Field Notes](integrations/field-notes-newsletter.md), [CI and deploy](operations/ci-and-deploy.md) | `infra/field-notes.yaml`, `docs/field-notes.md`, `amplify.yml` | `SID_INDEX`, `isSubscribeConfigured` | selftest does not cover AWS | manual check in AWS (docs/field-notes.md step 6) |
| CI, Bun version, hooks, Dependabot, deploy | [CI and deploy](operations/ci-and-deploy.md) | `.github/workflows/`, `amplify.yml`, `.husky/pre-commit` | n/a | n/a | review the workflow diff; PR CI is the real check |

## Rules every change should respect

- One `data-section` per page; never hard-code a section colour ([Site UI](architecture/site-ui.md)).
- Never invent a number: counts come from `getCounts()`; "what flopped" is first-class content.
- URLs never change: no slug renames, no tidying use-case category URLs, redirects for any moved page.
- Read content only through `src/lib/content.ts` (reserved `index.md`/`log.md` are not concepts).
- Do not rewrite existing bylined content bodies unless asked; house style applies to new writing and chrome.
- Treat `openwiki/` as generated; prefer fixing source and letting the workflow regenerate.

## Backlog

- `src/app/*/page.tsx` list and detail pages (per-type layouts, `ContentIndex` filters): only summarised in [Overview](architecture/overview.md) and [Site UI](architecture/site-ui.md); a per-route page-composition reference was not written.
- `docs/image-shoot-list.md` and `public/images/` (editorial photography plan): out of scope for engineering docs.
- `.claude/skills/peninsula-ai-design/SKILL.md` design brand detail: only referenced from [Site UI](architecture/site-ui.md), not summarised.
