---
type: Architecture
title: Site UI, design system, search and related content
description: The psd401.ai design system rules (square corners, one ink, section colours), component layout, JSON-LD helpers, and the content-discovery libraries for search and cross-type related links.
tags: [design-system, components, search, related, json-ld, tailwind]
openwiki:
  roles: [architecture, domain]
  change_kinds: [ui, styling, search, seo]
  source_paths: [src/components/ds, src/styles/ds.css, src/styles/tokens, src/components/JsonLd.tsx, src/components/MarkdownContent.tsx, src/lib/search.ts, src/lib/related.ts, src/components/Related.tsx, src/components/ContentIndex.tsx]
  symbols: [searchContent, getSearchIndex, getRelated, JsonLd, SectionKey, Masthead, ContentIndex]
  invariants:
    - border-radius is 0 everywhere except the three browser-chrome dots.
    - Section colour is never hard-coded; read var(--sec) resolved by data-section.
    - No icon library, no emoji; arrows are the literal characters.
    - Search and related URLs come from each concept's resource field.
  validation_commands: ['bun run type-check', 'bun run lint']
---

# Site UI, design system, search and related content

## Design system

Components in `src/components/ds/` are ported from the Claude Design project; the barrel `ds/index.ts` is the import path (`@/components/ds`). Modules: `core` (Button, Chip, SectionRule, StatCell, ImageFrame, CodeBlock, PullQuote; all server components), `navigation` (UtilityBar, Breadcrumb, SideNav, OnThisPage), `content` (SectionHeader, PostCard, DocCard, SpecTable, StepRow, ProductCard), `forms` (TextInput, SubscribeForm; client), `Masthead` and `ThemeToggle` (client). Styling lives in `src/styles/ds.css` under `.ds-*` classes with tokens in `src/styles/tokens/` (`colors`, `fonts`, `motion`, `responsive`, `spacing`, `typography`). Tailwind v4 is loaded through PostCSS.

Rules from [AGENTS.md](../../AGENTS.md) that code review enforces:

- **One section colour per page**: set `data-section` once on the wrapper (`writing`, `software`, `guidance`, `presentations`, `oad`, `practice`; type `SectionKey`). Only the homepage mixes. Never hard-code colours; use `var(--sec)`.
- `border-radius: 0` everywhere, **one ink** (`--ink`; emphasis is opacity), minimal motion (hover = tint fill, 120–180ms, honouring `prefers-reduced-motion`), no icon library.
- Server components by default; the client set is listed in the [overview](overview.md#rendering-rules).
- Fonts (Gabarito, Public Sans, IBM Plex Mono, Newsreader) are self-hosted via `next/font` in `src/app/layout.tsx`; `fonts.css` maps them to role names. Theme switching uses `next-themes` in `src/app/providers.tsx`.
- The `peninsula-ai-design` skill in `.claude/skills/` carries the fuller brand spec.

Other shared components: `SiteChrome` (utility bar, masthead, footer), `MarkdownContent` (react-markdown + `remark-gfm` + `rehype-raw`, with a copy button), `ContentIndex` (client filter UI for section index pages), `TrustPage`, `OadCycle`, `FieldNotesAction` (see [Field Notes](../integrations/field-notes-newsletter.md)), `OadCopyButtons` (see [OAD](open-adaptive-district.md)).

## Structured data

`src/components/JsonLd.tsx` exports `JsonLd` plus `create*Schema` factories (Organization, WebSite, BlogPosting, Article, Software, Tool, Presentation, HowTo, Research, Breadcrumb, Collection, WebPage, FAQ). Detail pages inject the one matching their concept type plus breadcrumbs. `scripts/agent-audit.ts` asserts Organization has a `contactPoint` and `PostalAddress`.

## Search

`src/lib/search.ts`: `getSearchIndex` (cached per request) lowercases title, description, tags and body of every concept across all eight directories; `searchContent(query, {types, tag})` does substring matching with first-match ranking title → description → tag → body, then newest first. Result URLs are the concept's `resource` (an earlier version hand-built use-case URLs and 404ed all 50). `/search` is `Disallow`ed in robots.

## Related content

`getRelated(url, limit)` in `src/lib/related.ts` scores every other concept: +3 per shared tag, +4 if either body names the other's title (titles longer than 8 chars), +2 for crossing a type boundary (only when already scoring), +1–2 for shared distinctive title words (stop-words removed). Threshold is 3; results sort by score then title, with at most two per type. `Related` renders nothing when nothing qualifies. Both libraries read the same `DIRS` list as `all-content.ts` ([machine surfaces](machine-readable-surfaces.md)); a new content directory must be added to each ([recipe](content-bundle.md#change-recipes)).

## Change navigation

- UI tweak: find the `.ds-*` class in `src/styles/ds.css` before adding Tailwind utilities; check the AGENTS.md rules above.
- New ds component: add to the right module and re-export in `ds/index.ts` (consumers import from `@/components/ds`).
- Validate: `bun run type-check && bun run lint`; `bun run build` only for route-level or metadata changes. There are no component unit tests in the repo.
