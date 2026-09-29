# Content field reference

Exact frontmatter for every concept type. Enforced by
[src/lib/schemas.ts](../src/lib/schemas.ts) and checked by `npm run content:validate`.

Do not hand-write frontmatter — run `npm run content:new -- --type <type> --title "..."`
and edit the result. See [AGENTS.md](../AGENTS.md) for house style and the
publishing loop.

> This file is documentation, not a concept. It has no `.md` frontmatter and
> is skipped by the loader, which only reads files with a valid `type`.

---

## Fields every type carries

From the [OKF v0.2](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)
base. `type` is the only field OKF itself requires; the next four are OKF
"SHOULD" fields that this bundle enforces because they drive page metadata.

| Field         | Required | Notes                                                                                            |
| ------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `type`        | yes      | The concept kind. Must match the directory.                                                      |
| `title`       | yes      | Sentence case.                                                                                   |
| `description` | yes      | One sentence. Becomes the meta description, the search result, and the `llms.txt` entry.         |
| `resource`    | yes      | Canonical site path, e.g. `/writing/my-post`. The single source of truth for this concept's URL. |
| `date`        | yes      | `YYYY-MM-DD`, quoted. Publication or last revision.                                              |
| `tags`        | no       | List of strings. Drives the on-page filters.                                                     |
| `status`      | no       | `draft` \| `stable` \| `deprecated`. Defaults to `stable`. **`draft` means not indexed.**        |
| `stale_after` | no       | `YYYY-MM-DD`. Validation warns once today is past it.                                            |
| `sources`     | no       | Provenance. See below.                                                                           |
| `generated`   | no       | `{ by, at }` — who wrote it.                                                                     |
| `verified`    | no       | `[{ by, at }]` — who checked it.                                                                 |

### Actors

`generated.by` and `verified.by` follow the OKF actor convention. Consumers
derive trust from the `human:` prefix, so the shape matters:

```yaml
generated:
  by: claude-code/opus-5 # <producer>/<version>
  at: '2026-08-12'
verified:
  - by: human:hagelk # human:<id> — this is what makes it human-reviewed
    at: '2026-08-12'
```

A third form, `process:<id>`, is for automated jobs.

### Sources

Provenance. External research and presentations get these automatically from
their `externalUrl` / `slides`.

```yaml
sources:
  - resource: https://example.org/paper.pdf # required within an entry
    id: original # referenced by markdown footnotes
    title: The paper's title
    author: A. Researcher
    last_modified: '2024-03-19'
```

### Cross-links

Link concepts to each other with **bundle-absolute** markdown paths — a
leading slash, relative to `src/content/`. They survive a file moving:

```markdown
See our [data security guidance](/guidance/data-security-ai-guidance.md).
```

Site-relative page links (`/guidance/data-security-ai-guidance`) also work and
are validated. Both forms fail the build if the target does not exist.

---

## `post` — `writing/` → `/writing/<slug>`

| Field    | Required | Notes                                 |
| -------- | -------- | ------------------------------------- |
| `author` | yes      | Person's name, as they want it shown. |
| `image`  | no       | Path under `public/`. Must exist.     |

## `software` — `software/` → `/software/<slug>`

| Field      | Required | Notes                                                                          |
| ---------- | -------- | ------------------------------------------------------------------------------ |
| `maturity` | yes      | `Production` \| `Pilot` \| `Beta` \| `Retired`. Where the product actually is. |
| `stack`    | no       | Short line, e.g. `Next.js · AWS`.                                              |
| `repo`     | no       | Full URL. Renders the "Get the code" button.                                   |
| `demoUrl`  | no       | Full URL.                                                                      |
| `license`  | no       | e.g. `MIT`.                                                                    |
| `contact`  | no       | Email. Renders the "Ask us to host it" button.                                 |
| `image`    | no       | Product screenshot. Rendered inside browser chrome.                            |
| `spec`     | no       | List of `{ k, v }` rows for the technical specification table.                 |

`maturity` and `status` are different fields on purpose: a product can be in
`Production` while its page copy is still `draft`.

## `policy` — `guidance/` → `/guidance/<slug>`

| Field      | Required | Notes                                     |
| ---------- | -------- | ----------------------------------------- |
| `category` | no       | e.g. `Guidance`. Shown as the card label. |

## `presentation` — `presentations/` → `/presentations/<slug>`

| Field        | Required | Notes                                                               |
| ------------ | -------- | ------------------------------------------------------------------- |
| `presenters` | no       | List of names.                                                      |
| `audience`   | no       | e.g. `AASA NCE`.                                                    |
| `format`     | no       | e.g. `Conference Session`. **Was `type` before the OKF migration.** |
| `thumbnail`  | no       | Path under `public/`. Must exist.                                   |
| `slides`     | no       | Embed URL. Rendered in a 16:9 frame and added to `sources`.         |

## `use-case` — `use-cases/` → `/use-cases/<category>/<slug>`

| Field         | Required | Notes                                                                    |
| ------------- | -------- | ------------------------------------------------------------------------ |
| `category`    | yes      | **Forms part of the URL, URL-encoded.** Reuse an existing value exactly. |
| `subject`     | no       | e.g. `Data Analysis`.                                                    |
| `grade_level` | no       | e.g. `Staff`, `9-12`.                                                    |
| `tools_used`  | no       | List. Also used as filter facets.                                        |
| `author`      | no       | Who did the work.                                                        |
| `school`      | no       | Site or department.                                                      |

Existing categories — reuse rather than inventing:

- Enhancing Teaching & Learning
- Streamlining Administrative Tasks & Operations
- Enhancing Staff Professional Growth
- Data Analysis & Insights for Decision Making
- Enhancing Student Support & Wellbeing
- Communication & Community Engagement
- IT & Technical Infrastructure Management

## `tool` — `tools/` → `/tools/<slug>`

| Field         | Required | Notes                                                |
| ------------- | -------- | ---------------------------------------------------- |
| `provider`    | no       | Vendor.                                              |
| `category`    | no       | e.g. `Education Tools`.                              |
| `format`      | no       | e.g. `Chat Environment`. **Was `type`.**             |
| `privacy`     | no       | e.g. `District Hosted`. Where the data goes.         |
| `access_type` | no       | e.g. `Multi-Purpose Tool`.                           |
| `maturity`    | no       | `Production` \| `Experimentation`. **Was `status`.** |
| `demoUrl`     | no       | Full URL.                                            |

## `research` — `articles/` → `/articles/<slug>`

| Field         | Required | Notes                                                   |
| ------------- | -------- | ------------------------------------------------------- |
| `author`      | no       | Paper's authors.                                        |
| `source`      | no       | Publisher or journal.                                   |
| `format`      | no       | e.g. `Research Paper`, `Opinion Piece`. **Was `type`.** |
| `externalUrl` | no       | The original. Also becomes `sources[0]`.                |
| `image`       | no       | Path under `public/`. Must exist.                       |

Bodies here are **our summary**, not the paper. The page says so explicitly
above the fold, and the JSON-LD marks the page as an Article we wrote, with
`isBasedOn` carrying the original's URL, author and publisher.

## `protocol` — `open-adaptive-district/` → `/open-adaptive-district/<slug>`

| Field       | Required | Notes                                                                     |
| ----------- | -------- | ------------------------------------------------------------------------- |
| `date`      | yes      | Last revised.                                                             |
| `label`     | yes      | Short name for nav and breadcrumbs, e.g. `Start Here`.                    |
| `n`         | no       | Reading order, `'01'`–`'05'`. Absent = not in the series (action plan).   |
| `printable` | no       | File name of the printable copy, e.g. `01-Start-Here.html`. Never rename. |
| `image`     | no       | Shown above the document in the site. Path under `public/`.               |
| `imageAlt`  | no       | Alt text for `image`.                                                     |
| `layout`    | no       | `document` (default) or `plan` for a body carrying its own markup and h1. |

The body starts at `##`; the title is the h1. See "The Open Adaptive District
documents" in AGENTS.md for the raw-HTML rules.

---

## Reserved files

`index.md` and `log.md` are reserved by OKF at any level. They describe the
bundle and are never concepts. `npm run okf:build` writes them; do not edit
them by hand — `content:validate` fails if they are stale.

## What validation checks

Errors (build-breaking):

- No parseable frontmatter, or a missing/empty `type` — OKF's own conformance criteria
- `type` not matching the directory
- Any schema violation
- Duplicate slugs in a directory
- A link to a site path or bundle file that does not resolve
- An `image` / `thumbnail` not present in `public/`
- A stale directory index

Warnings:

- `status: draft`
- Past `stale_after`
- A description long enough that search engines will truncate it
