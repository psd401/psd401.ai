# AGENTS.md

Instructions for AI agents working on psd401.ai — the public site where
Peninsula School District publishes its AI work. Read this before writing
content or code. It is the contract.

## The two rules that matter most

**1. One section colour per page.** Set `data-section` once on the page
wrapper. Never mix two section colours in a single view. The homepage is the
only exception, because it is the index of all five sections.

**2. Never invent a number, and never hide a failure.** Every count on this
site is computed from `src/content/` at build time — see `getCounts()` in
[src/lib/content.ts](src/lib/content.ts). If you cannot compute a number,
leave it out. "What flopped" is a first-class content category, not something
to bury.

## Publishing content

### The loop

```bash
bun run content:new -- --type post --title "..."   # scaffold, never hand-write frontmatter
# write the piece
bun run okf:build                                   # refresh the bundle indexes
bun run content:validate                            # must pass; CI runs it too
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
`type`. The type → directory → URL table is in
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md); full field tables are in
[docs/CONTENT.md](docs/CONTENT.md).

`index.md` and `log.md` are **reserved** by OKF. They describe the bundle and
are never concepts. Do not create them by hand — `bun run okf:build` writes
them.

### URLs never change

Every URL that existed before the 2026 redesign still resolves. Redirects live
in [next.config.js](next.config.js) and `bun run links:audit` proves it against
a running server. Two things this constrains:

- **Do not rename a slug.** A file's name is its permanent public URL.
- **Do not "tidy" use-case category URLs.** They contain spaces and
  ampersands, URL-encoded (`/use-cases/Data%20Analysis%20%26%20Insights.../slug`).
  Ugly, and load-bearing.

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

## Code

Stack, library layout, the section/colour table and type families:
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

### Design system

Components in [src/components/ds/](src/components/ds/), styling in
[src/styles/ds.css](src/styles/ds.css), tokens in [src/styles/tokens/](src/styles/tokens/).

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

HeroUI was removed because it forced every index page to be a client
component. Add `'use client'` only for real interaction: today `Masthead`,
`ThemeToggle`, `SubscribeForm`, `ContentIndex`, `MarkdownContent`.

### Reading content

Always go through [src/lib/content.ts](src/lib/content.ts). It excludes the
reserved OKF filenames and validates against
[src/lib/schemas.ts](src/lib/schemas.ts). Reading `src/content/` with `fs`
directly will pull `index.md` and `log.md` in as ghost entries.

### Before you finish

```bash
bun run content:validate && bun run type-check && bun run lint && bun run build
```

If you touched routes or redirects, also run `bun run start` in one terminal
and `bun run links:audit` (every pre-redesign URL still resolves) and
`bun run agent:audit` (markdown negotiation, 404s, metadata, trust pages) in
another. Both run in CI; `agent:audit -- --base https://psd401.ai` checks
production.

Other commands: `bun run dev` (http://localhost:3000), `bun run lint:fix`,
`bun run format` / `format:check`, `bun run validate` (lint + format + content
validation), `bun run field-notes:selftest` (newsletter consent flow and
sender on the in-memory driver; no AWS; runs in CI).
`bun run field-notes:send -- --issue <file.md> --preview out.html` renders an
issue locally; `--dry-run`, `--test <addr>` and a real send need AWS (see
[docs/field-notes.md](docs/field-notes.md)). Never run a real send unprompted.

### Accessibility

WCAG 2.2 AA. One `<h1>` per page — markdown bodies are heading-shifted at
render time so they start at `h2`, since many carry their own `# Title`.
Focus-visible styling is global in `globals.css` and uses the active section
colour. Decorative SVGs get `aria-hidden`, toggle chips get `aria-pressed`,
breadcrumbs get `aria-label="Breadcrumb"` and `aria-current="page"`.

Commits: never attribute a commit to an AI agent; write detailed messages.

## Machine-readable surfaces and the Open Adaptive District documents

Keep these working; they are the point of the site. Full table and rendering
model: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

- `/llms.txt` must stay an INDEX — do not inline bodies.
- The sitemap is generated from content. Never hand-add a route; anything
  added to `STATIC_ROUTES` in [src/lib/all-content.ts](src/lib/all-content.ts)
  must be a real page (`links:audit` fetches every one).
- Never rename an Open Adaptive District `printable` value: `links:audit`
  checks those five URLs.
- The action plan's body is **one HTML block with no blank lines**. A blank
  line ends the block, and the rest is parsed as markdown.
- `public/openadaptivedistrict/oad.css` and the `.oad-doc` / `.oad-plan`
  blocks in [src/styles/ds.css](src/styles/ds.css) **must change together**.
- Do not restyle `public/openadaptivedistrict/first-draft/`; its old style is
  what marks it as archived.

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
