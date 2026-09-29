# CLAUDE.md

Guidance for Claude Code working in this repository.

**Read [AGENTS.md](AGENTS.md) first.** It is the working contract — content
rules, house style, the design system's hard constraints, and the checks that
must pass. This file covers commands and architecture.

## Development Commands

### Core

- `npm run dev` — development server at http://localhost:3000
- `npm run build` — production build
- `npm start` — serve the production build
- `npm run type-check` — TypeScript, no emit

### Content

- `npm run content:new -- --type <type> --title "..."` — scaffold a concept
  with valid frontmatter. Never hand-write frontmatter.
- `npm run okf:build` — regenerate the OKF bundle's `index.md` files and
  `log.md`. Run after adding or removing content.
- `npm run content:validate` — OKF conformance, schemas, links, images, index
  freshness. Runs in CI.

### Quality

- `npm run lint` / `npm run lint:fix`
- `npm run format` / `npm run format:check`
- `npm run validate` — lint + format + content validation
- `npm run links:audit` — asserts every pre-redesign URL still resolves.
  Needs a running server (`npm start` in another terminal). Runs in CI.

### Newsletter

- `npm run field-notes:selftest` — consent flow, route handlers and issue
  sender against the in-memory driver. No AWS. Runs in CI.
- `npm run field-notes:send -- --issue <file.md> --preview out.html` — render
  an issue locally. `--dry-run`, `--test <addr>` and a real send need AWS; see
  [docs/field-notes.md](docs/field-notes.md). Never run a real send unprompted.

## Architecture

### Stack

Next.js 16 App Router · React 19 · TypeScript strict · Tailwind v4 · Node
≥20.9. **No component library** — HeroUI was removed in the 2026 redesign
because it forced every index page to be a client component and fought the
design's square-cornered geometry.

### Content is an OKF bundle

`src/content/` is an [Open Knowledge Format](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf)
v0.2 bundle _and_ the site's source — not an export derived from it. Every
markdown file is one "concept" carrying a required `type`. Agents consume the
same files the site renders, from GitHub or over HTTP at `/okf`.

| `type`         | Directory                 | Route                            |
| -------------- | ------------------------- | -------------------------------- |
| `post`         | `writing/`                | `/writing/<slug>`                |
| `software`     | `software/`               | `/software/<slug>`               |
| `policy`       | `guidance/`               | `/guidance/<slug>`               |
| `presentation` | `presentations/`          | `/presentations/<slug>`          |
| `use-case`     | `use-cases/`              | `/use-cases/<category>/<slug>`   |
| `tool`         | `tools/`                  | `/tools/<slug>`                  |
| `research`     | `articles/`               | `/articles/<slug>`               |
| `protocol`     | `open-adaptive-district/` | `/open-adaptive-district/<slug>` |

`index.md` and `log.md` are reserved by OKF and are never concepts. Field
tables are in [docs/CONTENT.md](docs/CONTENT.md).

### Library layout

- **`src/lib/content.ts`** — the only way to read content. Excludes reserved
  filenames, validates against the schemas, caches per request. Reading
  `src/content/` with `fs` directly pulls in `index.md` as a ghost entry.
- **`src/lib/schemas.ts`** — Zod schema per type. Single source of truth for
  valid frontmatter.
- **`src/lib/okf.ts`** — the format's constants, types and conformance helpers.
- **`src/lib/site.ts`** — the five sections, the reference library, URL helpers.
  Adding a section here propagates to nav, sitemap, breadcrumbs and llms.txt.
- **`src/lib/all-content.ts`** — flat view for the machine-facing routes.
- **`src/lib/related.ts`** — cross-type relatedness scoring.
- **`src/lib/search.ts`** — server-side search across every type, including
  body text.
- **`src/lib/use-cases.ts`** — the one type needing domain helpers, because its
  route embeds a URL-encoded category.

### Information architecture

Five numbered standing sections, each owning a colour, plus a de-prioritised
reference library at `/practice` that is footer-linked rather than in the
masthead.

|     | Section                | Colour  | Route                     |
| --- | ---------------------- | ------- | ------------------------- |
| 01  | Writing                | cobalt  | `/writing`                |
| 02  | Software               | teal    | `/software`               |
| 03  | Guidance               | green   | `/guidance`               |
| 04  | Presentations          | magenta | `/presentations`          |
| 05  | Open Adaptive District | violet  | `/open-adaptive-district` |

**A page shows one section colour.** Set `data-section` once on the page
wrapper; every component beneath reads `--sec`. The homepage is the only
exception, because it is the index of all five.

### URLs are permanent

Every URL that existed before the redesign still resolves — redirects are in
[next.config.js](next.config.js), proven by `npm run links:audit`. Do not
rename a slug; a file's name is its permanent public URL. `/tools`,
`/articles` and `/use-cases` deliberately kept their original paths.

### Design system

`src/components/ds/` (components) and `src/styles/` (tokens + `ds.css`),
ported from the Claude Design project. `border-radius: 0` everywhere; one ink
with opacity for emphasis; hover is a ground fill or a fade, never a transform.
Four families: Gabarito (display), Public Sans (body), IBM Plex Mono (labels),
Newsreader italic (pull quotes only). The `/design` skill at
`.claude/skills/peninsula-ai-design/` carries the full spec.

### Machine-readable surfaces

`/llms.txt` (index) · `/llms-full.txt` (full corpus) · `/okf` (bundle,
browsable) · `/<section>/<slug>.md` (any page's source) · `/api/content.json`
· `/sitemap.xml` · `/feed.xml` · `/robots.txt`.

All are generated from content. Never hand-add a route to the sitemap.

## Accessibility

WCAG 2.2 AA. One `<h1>` per page — markdown bodies are heading-shifted at
render time so they start at `h2`, since many carry their own `# Title`.
Focus-visible styling is global in `globals.css` and uses the active section
colour. Decorative SVGs get `aria-hidden`, toggle chips get `aria-pressed`,
breadcrumbs get `aria-label="Breadcrumb"` and `aria-current="page"`.

## Commits

Never attribute commits to Claude. Write detailed messages documenting what
changed and why.
