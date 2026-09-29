# AGENTS.md

Instructions for AI agents working on psd401.ai — the public site where
Peninsula School District publishes its AI work.

Read this before writing content or code. It is the contract; everything else
in this file explains why the contract is what it is.

---

## The two rules that matter most

**1. One section colour per page.** Set `data-section` once on the page
wrapper. Never mix two section colours in a single view. The homepage is the
only exception, because it is the index of all five sections.

**2. Never invent a number, and never hide a failure.** Every count on this
site is computed from `src/content/` at build time — see `getCounts()` in
[src/lib/content.ts](src/lib/content.ts). If you cannot compute a number,
leave it out. "What flopped" is a first-class content category, not something
to bury.

---

## Publishing content

### The loop

```bash
npm run content:new -- --type post --title "..."   # scaffold, never hand-write frontmatter
# write the piece
npm run okf:build                                   # refresh the bundle indexes
npm run content:validate                            # must pass; CI runs it too
```

`content:new` emits every required field correctly quoted and a `resource`
that already matches where the file will live. Hand-writing frontmatter is the
most common way to produce a file that does not render.

New content is created with `status: draft`. Draft concepts are excluded from
the sitemap, `llms.txt` and the RSS feed, and carry `noindex`. **Removing
`status: draft` is the act of publishing.**

### Content types

`src/content/` is an [Open Knowledge Format](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf)
v0.2 bundle. Every markdown file is one "concept" and MUST carry a non-empty
`type`. Full field tables are in [docs/CONTENT.md](docs/CONTENT.md).

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

`index.md` and `log.md` are **reserved** by OKF. They describe the bundle and
are never concepts. Do not create them by hand — `npm run okf:build` writes
them.

### URLs never change

Every URL that existed before the 2026 redesign still resolves. Redirects live
in [next.config.js](next.config.js) and `npm run links:audit` proves it against
a running server.

Two things this constrains:

- **Do not rename a slug.** A file's name is its permanent public URL.
- **Do not "tidy" use-case category URLs.** They contain spaces and
  ampersands, URL-encoded (`/use-cases/Data%20Analysis%20%26%20Insights.../slug`).
  Ugly, and load-bearing.

---

## House style

The voice guide is not decoration; it is the reason the site reads as one
district rather than a CMS.

**Voice.** First person plural, past tense, specific. "We shipped AI Studio to
eleven hundred staff and then watched our own agents fail to use it." Not "PSD
is proud to announce".

**We / you.** "We" is the district, always. "You" is another district reading
this and deciding whether to try it. Never "users".

**Casing.** Sentence case for headings — "Software we build", not "Software We
Build". Mono labels are the only uppercase, always tracked out.

**No emoji.** Not in copy, not in headings, not as icons.

**Words to avoid:** empower, unlock, leverage, journey, revolutionise,
game-changing, seamless, robust, cutting-edge, insights, solutions, "in
today's rapidly evolving landscape". If a sentence would survive being pasted
onto any other district's website, it is not written yet.

**Calls to action name the thing.** "Get the code", "Download all as a pack",
"Read the playbook" — never "Learn more", never "Click here".

### Editing existing content

**Do not rewrite the body of an existing markdown file** unless you are asked
to. Much of it is bylined by named staff (Heather Whyte, Dave Stitt, Kayla
Frank, Krestin Bahr) or is a summary of someone else's research. The house
style applies to new writing and to site chrome, not retroactively to other
people's words.

---

## Code

### Stack

Next.js 16 App Router · React 19 · TypeScript strict · Tailwind v4 · no
component library.

### Design system

Components live in [src/components/ds/](src/components/ds/), ported from the
Claude Design project. Styling is in [src/styles/ds.css](src/styles/ds.css);
tokens in [src/styles/tokens/](src/styles/tokens/).

- **`border-radius: 0` everywhere.** There is no radius token because there is
  no radius. The only rounded shapes in the system are the three browser-chrome
  dots on a product screenshot (`.ds-browser__dot`).
- **One ink.** `--ink` does all text and all rules. Emphasis is opacity, never
  a second grey.
- **The system barely moves.** Hover is a ground fill to the 8% section tint,
  a fade to 82%, or the section colour. No transforms, no scale, no lift, no
  shadow. 120–180ms. Everything respects `prefers-reduced-motion`.
- **No icon library.** Structure is carried by rules, numerals and mono
  labels. Arrows are the literal characters → and ←.
- **Never hard-code a section colour.** Read `var(--sec)`; the page's
  `data-section` resolves it.

### Server components by default

HeroUI was removed in the redesign specifically because it forced every index
page to be a client component. Add `'use client'` only where there is real
interaction. Currently that is: `Masthead` (mobile disclosure), `ThemeToggle`,
`SubscribeForm`, `ContentIndex` (filters), `MarkdownContent` (copy button).

### Reading content

Always go through [src/lib/content.ts](src/lib/content.ts). It excludes the
reserved OKF filenames and validates against
[src/lib/schemas.ts](src/lib/schemas.ts). Reading `src/content/` with `fs`
directly will pull `index.md` and `log.md` in as ghost entries.

### Before you finish

```bash
npm run content:validate && npm run type-check && npm run lint && npm run build
```

If you touched routes or redirects, also:

```bash
npm start                     # one terminal
npm run links:audit           # another
```

---

## Machine-readable surfaces

Keep these working; they are the point of the site, not an add-on.

| Surface                | What it is                                                                  |
| ---------------------- | --------------------------------------------------------------------------- |
| `/llms.txt`            | Index of everything, with links. Must stay an INDEX — do not inline bodies. |
| `/llms-full.txt`       | Every document in full. The heavy one, opt-in.                              |
| `/okf`                 | The OKF bundle, browsable. `/okf/<dir>/<slug>.md` serves raw markdown.      |
| `/<section>/<slug>.md` | Any page's markdown source, via a rewrite.                                  |
| `/api/content.json`    | Typed index of every concept. CORS open.                                    |
| `/sitemap.xml`         | Generated from content. Never hand-add a route.                             |
| `/feed.xml`            | RSS across all content types, not just posts.                               |

The sitemap used to hard-code `/about` and `/contact`, neither of which ever
existed, so Google was handed two 404s on every crawl. Anything added to
`STATIC_ROUTES` in [src/lib/all-content.ts](src/lib/all-content.ts) must be a
real page — `links:audit` fetches every one.

---

## The Open Adaptive District documents

Section 05's documents are OKF concepts of type `protocol` in
`src/content/open-adaptive-district/`: the five documents of the protocol
(`n: '01'` to `'05'`, the reading order) and the fellowship action plan (no
`n`, `layout: plan`). Each renders **twice**, from the same HTML
([src/lib/oad.ts](src/lib/oad.ts)), so the two cannot drift:

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
`.oad-doc` / `.oad-plan` blocks in [src/styles/ds.css](src/styles/ds.css) for the
in-site version.

`public/openadaptivedistrict/first-draft/` is an 18-file archive of the
superseded original, deliberately left in its own visual style. Do not restyle
it; the difference is what marks it as archived. It no longer holds a copy of
the action plan: that lives in `src/content/open-adaptive-district/action-plan.md`,
and the old archive URL redirects to `/open-adaptive-district/action-plan`
(next.config.js).

## Things that will bite you

- **`type` and `status` are reserved by OKF.** Presentations, research and two
  tools previously used `type` for their genre; that field is now `format`.
  Tools used `status` for Production/Experimentation; that is now `maturity`.
- **Dates are calendar dates.** Parse them as UTC (`formatDate` in
  [src/lib/format.ts](src/lib/format.ts) does). Parsing `2026-05-26` in local
  time shifts it a day for everyone west of UTC, which is everyone here.
- **`resource` is the single source of truth for a concept's URL.** The
  sitemap, search, JSON-LD and related-content all read it. Search used to
  build use-case URLs itself and got them wrong, 404ing all 50.
- **Images must exist.** `content:validate` fails on a frontmatter `image` or
  `thumbnail` that is not in `public/`.
- **Art direction bans:** no robots, glowing brains, circuit boards, blue
  particle networks, humanoid AI figures, or rendered text in images.
- **All photography is generated placeholder work** awaiting real Peninsula
  photography. Generated classroom scenes with students are fine for that.
  The one thing not to do is attach a generated portrait to a real named
  byline. Classroom prompts need "candid and unposed, nobody looking at the
  camera, not a stock photo" or they come back as stock.
  See [docs/image-shoot-list.md](docs/image-shoot-list.md).
