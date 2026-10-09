---
name: psd401-publish
description: Publish content to psd401.ai — blog posts, software pages, policy guidance, presentations, use cases, tools, and research summaries. Handles the whole loop: pick the type, scaffold correct OKF frontmatter, write in house voice, validate, open a PR, wait for CI, merge and confirm the page is live. Has step-by-step playbooks for turning a Google Slides link into a presentation page and an author's text and images into a blog post. Use whenever adding or editing content on this site. Triggers on: write a post, add a blog post, add a use case, publish, new blog, add a tool, add a presentation, Google Slides link, document a product, add research.
user-invocable: true
---

# Publishing to psd401.ai

`src/content/` is an Open Knowledge Format v0.2 bundle _and_ the site's
source. Every markdown file is one "concept" that renders as a page and is
served to agents as raw markdown. Getting the frontmatter right is not
bookkeeping — it is what makes the page exist.

Read [AGENTS.md](../../../AGENTS.md) for the full contract and
[docs/CONTENT.md](../../../docs/CONTENT.md) for exact field tables.

## Playbooks

The two most common requests have their own step-by-step playbooks. Follow
them start to finish; they cover everything below for their type.

| You were given                            | Playbook                           |
| ----------------------------------------- | ---------------------------------- |
| A Google Slides link                      | [presentation.md](presentation.md) |
| A post's text (Doc, paste, file) + images | [post.md](post.md)                 |

Both end with [ship.md](ship.md): branch, checks, PR, wait for CI, merge,
confirm the page is live. Use it for any other type too.

## The loop

```bash
# 1. Scaffold. Never hand-write frontmatter.
npm run content:new -- --type post --title "IEP drafts: stopped after two weeks"

# 2. Write the piece. Fill every TODO.

# 3. Refresh the bundle indexes.
npm run okf:build

# 4. Validate. Must pass.
npm run content:validate
```

`content:new` prints the file path and the URL it will live at. It creates
everything with `status: draft`.

**Removing `status: draft` is the act of publishing.** Draft concepts are
excluded from the sitemap, `llms.txt` and the RSS feed, and carry `noindex`.
Leave it in place until the piece is genuinely ready.

## Step 1 — pick the type

| Ask                                           | Type           | Lands at                         |
| --------------------------------------------- | -------------- | -------------------------------- |
| Someone at PSD writing about work they did    | `post`         | `/writing/<slug>`                |
| A product PSD builds and runs                 | `software`     | `/software/<slug>`               |
| A policy or guidance document staff work from | `policy`       | `/guidance/<slug>`               |
| A talk that was given                         | `presentation` | `/presentations/<slug>`          |
| A staff member's practical example            | `use-case`     | `/use-cases/<category>/<slug>`   |
| A third-party tool we assessed                | `tool`         | `/tools/<slug>`                  |
| Someone else's paper, summarised              | `research`     | `/articles/<slug>`               |
| A document of the Open Adaptive District      | `protocol`     | `/open-adaptive-district/<slug>` |

If it does not fit one of these, it probably does not belong on the site yet.
Ask rather than inventing a type — the vocabulary is closed and lives in
`src/lib/okf.ts`.

## Step 2 — write it

House voice, in short:

- First person plural, past tense, specific. "We shipped AI Studio to eleven
  hundred staff and then watched our own agents fail to use it."
- "We" is the district. "You" is another district reading this. Never "users".
- Sentence case headings. No emoji, anywhere.
- **Real numbers or none.** Never round up, never invent a statistic to fill a
  row. If a figure is illustrative, say so.
- **Publish the failures.** "What flopped" is a first-class tag, not an
  embarrassment. The failure posts are the ones other districts email about.
- Avoid: empower, unlock, leverage, journey, revolutionise, game-changing,
  seamless, robust, cutting-edge, insights, solutions.

The `description` field is not a formality. It becomes the page's meta
description, its search result, its RSS entry and its line in `llms.txt`. One
real sentence.

### Cross-link

Link to related concepts with bundle-absolute markdown paths:

```markdown
This follows the rules in our [data security guidance](/guidance/data-security-ai-guidance.md).
```

Validation fails on a link that does not resolve, so these stay honest. The
site also computes related content automatically, but an explicit link from
the body is a stronger signal and reads better.

### Provenance and trust

If the content was drafted by an agent, say so:

```yaml
generated:
  by: claude-code/opus-5
  at: '2026-08-12'
verified:
  - by: human:hagelk
    at: '2026-08-13'
```

`human:` is what marks a concept as human-reviewed. Do not add a `verified`
entry for a person who has not actually read it.

## Step 3 — images

Images referenced in frontmatter must exist in `public/`, or validation fails.

Art direction bans: robots, glowing brains, circuit boards, blue particle
networks, humanoid AI figures, rendered text in images.

**Do not generate** photorealistic images of identifiable children, or a
portrait for a named byline. Those slots need real photography — see
`docs/image-shoot-list.md`.

A post with no image is fine. The layout falls back to a holding frame.

## Step 4 — ship

```bash
npm run content:validate && npm run type-check && npm run lint && npm run build
```

Then follow [ship.md](ship.md): commit on a branch, open a PR, wait for CI,
merge, and confirm the page is live. Never commit directly to `main`.

Commit messages on this repo are detailed — say what changed and why, not just
"add post".

## Editing existing content

**Do not rewrite the body of an existing file** unless explicitly asked. Much
of it is bylined by named staff or summarises someone else's research. Fixing a
typo is fine; restyling someone's prose to the voice guide is not.

**Never rename a slug.** A file's name is its permanent public URL, and those
URLs are in slide decks and other districts' documentation. If something must
move, add a redirect in `next.config.js` and re-run `npm run links:audit`.

## When validation fails

The error names the file and the field. Common ones:

| Message                                          | Fix                                                 |
| ------------------------------------------------ | --------------------------------------------------- |
| `OKF: frontmatter must contain a non-empty type` | You hand-wrote the file. Scaffold it instead.       |
| `date: must be YYYY-MM-DD`                       | Quote it: `date: '2026-08-12'`.                     |
| `description: drives the page meta description`  | Write one real sentence.                            |
| `stale index — run npm run okf:build`            | You added or removed a file.                        |
| `image points at ... which does not exist`       | Add the file to `public/` or drop the field.        |
| `link ... does not resolve to a page`            | Check the path; use the concept's `resource` value. |
