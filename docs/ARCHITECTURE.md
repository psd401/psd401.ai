# Architecture reference

Reference material moved out of the root `AGENTS.md` so that file stays under
200 lines. The rules agents must follow are in [AGENTS.md](../AGENTS.md); this
page holds the detail behind them.

## Stack

Next.js 16 App Router · React 19 · TypeScript strict · Tailwind v4 · Node 24.
**No component library** — HeroUI was removed in the 2026 redesign
because it forced every index page to be a client component and fought the
design's square-cornered geometry.

## Content is an OKF bundle

`src/content/` is an [Open Knowledge Format](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf)
v0.2 bundle _and_ the site's source — not an export derived from it. Every
markdown file is one "concept" carrying a required `type`. Agents consume the
same files the site renders, from GitHub or over HTTP at `/okf`. Field tables
are in [CONTENT.md](CONTENT.md).

| `type`         | Directory                 | URL                              | What it is                                                               |
| -------------- | ------------------------- | -------------------------------- | ------------------------------------------------------------------------ |
| `policy`       | `guidance/`               | `/guidance/<slug>`               | 01 Guidance — documents staff work from                                  |
| `post`         | `writing/`                | `/writing/<slug>`                | 02 Writing — notes from staff doing the work                             |
| `presentation` | `presentations/`          | `/presentations/<slug>`          | 03 Presentations — talks, as given                                       |
| `software`     | `software/`               | `/software/<slug>`               | 04 Software — products the district builds                               |
| `protocol`     | `open-adaptive-district/` | `/open-adaptive-district/<slug>` | 05 Open Adaptive District — the protocol's documents and the action plan |
| `use-case`     | `use-cases/`              | `/use-cases/<category>/<slug>`   | Staff-submitted examples                                                 |
| `tool`         | `tools/`                  | `/tools/<slug>`                  | Third-party tools reviewed                                               |
| `research`     | `articles/`               | `/articles/<slug>`               | External research, summarised                                            |

## Library layout

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

## Information architecture

Five numbered standing sections, each owning a colour, plus a de-prioritised
reference library at `/practice` that is footer-linked rather than in the
masthead.

|     | Section                | Colour  | Route                     |
| --- | ---------------------- | ------- | ------------------------- |
| 01  | Guidance               | green   | `/guidance`               |
| 02  | Writing                | cobalt  | `/writing`                |
| 03  | Presentations          | magenta | `/presentations`          |
| 04  | Software               | teal    | `/software`               |
| 05  | Open Adaptive District | violet  | `/open-adaptive-district` |

`/tools`, `/articles` and `/use-cases` deliberately kept their original paths.

## Design system

`src/components/ds/` (components) and `src/styles/` (tokens + `ds.css`),
ported from the Claude Design project. Four families: Gabarito (display),
Public Sans (body), IBM Plex Mono (labels), Newsreader italic (pull quotes
only). The `/design` skill at `.claude/skills/peninsula-ai-design/` carries
the full spec.

## Machine-readable surfaces

Keep these working; they are the point of the site, not an add-on.

| Surface                 | What it is                                                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `/llms.txt`             | Index of everything, with links. Must stay an INDEX — do not inline bodies.                                                      |
| `/llms-full.txt`        | Every document in full. The heavy one, opt-in.                                                                                   |
| `/okf`                  | The OKF bundle, browsable. `/okf/<dir>/<slug>.md` serves raw markdown.                                                           |
| `/<section>/<slug>.md`  | Any page's markdown source, via a rewrite.                                                                                       |
| `Accept: text/markdown` | `/`, the trust pages and every concept URL answer in markdown; unknown URLs get a markdown 404. `bun run agent:audit` proves it. |
| `/api/content.json`     | Typed index of every concept. CORS open.                                                                                         |
| `/sitemap.xml`          | Generated from content. Never hand-add a route.                                                                                  |
| `/feed.xml`             | RSS across all content types, not just posts.                                                                                    |

The sitemap used to hard-code `/about` and `/contact`, neither of which ever
existed, so Google was handed two 404s on every crawl. Anything added to
`STATIC_ROUTES` in [src/lib/all-content.ts](../src/lib/all-content.ts) must be a
real page — `links:audit` fetches every one.

---

## The Open Adaptive District documents

Section 05's documents are OKF concepts of type `protocol` in
`src/content/open-adaptive-district/`: the five documents of the protocol
(`n: '01'` to `'05'`, the reading order) and the fellowship action plan (no
`n`, `layout: plan`). Each renders **twice**, from the same HTML
([src/lib/oad.ts](../src/lib/oad.ts)), so the two cannot drift:

- `/open-adaptive-district/<slug>`: canonical, inside the site chrome
  (`src/app/open-adaptive-district/[slug]/page.tsx`).
- `/openadaptivedistrict/<printable>`: self-contained and formatted for
  printing, at the documents' original static URLs
  (`src/app/openadaptivedistrict/[file]/route.ts`). Never rename a
  `printable` value: `links:audit` checks those five URLs.

Bodies are markdown with a little raw HTML, rendered unsanitised because it is
ours:

- A copy button goes where a document has
  `<div class="oad-copy" data-copy-label="Copy the …"></div>` directly before
  a blockquote template (the Playbook has three).
- The action plan's body is its own designed markup, kept as **one HTML block
  with no blank lines**. A blank line ends the block, and the rest would be
  parsed as markdown (an indented line becomes a code block).

Two stylesheets cover the same classes and **must change together**:
`public/openadaptivedistrict/oad.css` for the printable copies, and the
`.oad-doc` / `.oad-plan` blocks in [src/styles/ds.css](../src/styles/ds.css) for the
in-site version.

`public/openadaptivedistrict/first-draft/` is an 18-file archive of the
superseded original, deliberately left in its own visual style. Do not restyle
it; the difference is what marks it as archived. It no longer holds a copy of
the action plan: that lives in `src/content/open-adaptive-district/action-plan.md`,
and the old archive URL redirects to `/open-adaptive-district/action-plan`
(../next.config.js).
