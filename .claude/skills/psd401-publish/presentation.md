# Playbook: a Google Slides link → a presentation page

Input: one or more Google Slides links. Output: a merged PR and a live page at
`/presentations/<slug>`, with the deck embedded, a thumbnail, and a written
summary in the same shape as the 43 presentations already on the site.

Work out everything you can from the deck. Ask only for what the deck does not
say, in one message, with numbered questions.

These commands use the `gws` Google Workspace CLI (`gws auth login -s slides,drive`
if it reports an auth error). Any tool that can read the Slides API and export
Drive files works the same way.

Work in a scratch directory for the deck files. They are not committed.

## 1. Get the presentation ID

| Link                                                       | ID                               |
| ---------------------------------------------------------- | -------------------------------- |
| `docs.google.com/presentation/d/<ID>/edit` (or `/view`)    | `<ID>`                           |
| `docs.google.com/presentation/d/e/2PACX-…/pub` or `/embed` | none: this is a "published" link |

A published `2PACX-…` link is fine for the embed, but the API cannot read it.
Ask for the deck's normal link as well.

## 2. Read the whole deck

```bash
gws slides presentations get --params '{"presentationId":"<ID>"}' > deck.json
```

A 403 or 404 means the account you run as cannot open the deck. Ask the person
to share it with that account (Viewer is enough).

Slide text and speaker notes, slide by slide:

```bash
jq -r '.slides | to_entries[] | "--- Slide \(.key+1)\n"
  + ([.value.pageElements[]? | .. | .textRun?.content? // empty] | join(""))
  + "Notes: "
  + ([.value.slideProperties.notesPage.pageElements[]? | .. | .textRun?.content? // empty] | join(""))' \
  deck.json > deck.txt
```

That misses anything inside a screenshot or image, which is often most of a
talk. Export the deck as a PDF and read it page by page (20 pages per read):

```bash
gws drive files export --params '{"fileId":"<ID>","mimeType":"application/pdf"}' --output deck.pdf
```

Drive refuses exports over 10 MB. If that happens, read `deck.txt` and fetch
thumbnails (step 4's command, any slide's `objectId`) for the slides whose text
is thin.

## 3. Work out the details

List the values already in use, and reuse one exactly when it fits. The site
filters and groups by these strings.

```bash
grep -h '^format:'   src/content/presentations/*.md | sort | uniq -c | sort -rn
grep -h '^audience:' src/content/presentations/*.md | sort | uniq -c | sort -rn
grep -h -A8 '^presenters:' src/content/presentations/*.md | grep '^  - ' | sort | uniq -c | sort -rn
```

| Field         | Where to find it                                                                                                                                                                     | If it is not there     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| `title`       | The title slide, as written. Fall back to the file's `title` in `deck.json`.                                                                                                         | Use the file title     |
| `date`        | The date the talk was given, usually on the title slide ("AASA NCE - February 13, 2026"). Never the file's created or modified date.                                                 | Ask                    |
| `presenters`  | Title slide, a "who we are" slide, or the notes. Full names, spelled as in the list above.                                                                                           | Ask                    |
| `audience`    | The event or group: "AASA NCE", "PSD Staff", "WERA Conference".                                                                                                                      | Ask                    |
| `format`      | Conference Session, PD Session, Public Workshop, Conference Workshop, Internal Workshop, …                                                                                           | Ask, offering the list |
| `tags`        | Always exactly `<format>,<audience>`. Every existing presentation does this.                                                                                                         | n/a                    |
| `slug`        | Short and permanent. The event and year for a conference talk (`aasa-nce-2026`), otherwise 3–6 whole words of the title. Check `src/content/presentations/<slug>.md` does not exist. | n/a                    |
| `description` | You write it: one sentence, at most 160 characters, on what the talk covered.                                                                                                        | n/a                    |

If the deck clearly says something, do not ask about it. If it is ambiguous,
ask. A wrong date or a misspelled presenter is worse than one question.

## 4. Thumbnail: the first slide

```bash
gws slides presentations pages getThumbnail \
  --params '{"presentationId":"<ID>","pageObjectId":"<slides[0].objectId>"}' | jq -r .contentUrl
curl -sL -o public/images/thumbnails/<slug>.png "<contentUrl>"
file public/images/thumbnails/<slug>.png    # expect: PNG image data, 1600 x 900
```

The `contentUrl` expires within minutes. Download it straight away.

## 5. Embed link and sharing

| Link you were given           | `slides` value                                           |
| ----------------------------- | -------------------------------------------------------- |
| `/presentation/d/<ID>/…`      | `https://docs.google.com/presentation/d/<ID>/embed`      |
| `/presentation/d/e/2PACX-…/…` | `https://docs.google.com/presentation/d/e/2PACX-…/embed` |

The embed shows only for a deck that anyone with the link can view, or one
published to the web. Check:

```bash
gws drive permissions list --params '{"fileId":"<ID>","supportsAllDrives":true,"fields":"permissions(type,role)"}'
```

You need an entry with `"type":"anyone"`, or a `2PACX-…` published link. If
there is neither, ask the person to set **Share → General access → Anyone with
the link → Viewer**. Never change a file's sharing yourself.

## 6. Scaffold

```bash
npm run content:new -- --type presentation --title "<title>" --slug <slug> \
  --date <YYYY-MM-DD> --presenters "<Name One>,<Name Two>" \
  --audience "<audience>" --format "<format>" --tags "<format>,<audience>" \
  --description "<one sentence>"
```

Then edit the frontmatter. Delete the `status: draft` line (that is the act of
publishing), and add these after `format:`:

```yaml
thumbnail: /images/thumbnails/<slug>.png
slides: <embed link>
sources:
  - resource: <embed link>
    id: slides
    title: Slide deck
```

## 7. Write the summary

Replace the scaffold's TODO body with this shape. Every existing presentation
uses it.

```markdown
**<Title>**

<One paragraph: who presented, their roles if the deck gives them, when, at
what event or to whom, and what the talk covered.>

**Key Takeaways:**

- **<Short header>:** <What the talk said, in a sentence or two.>
- … 4 to 7 of these, in the order the deck takes them.

**Actionable Insights:**

- **<Short header>:** <Something the audience could do, as the talk framed it.>
- … 3 to 5 of these.

**Looking Ahead:**

<One paragraph on where the talk said the work goes next.>
```

The shape is fixed. What goes in it is not up to you:

- **Only what the deck says.** Every claim must trace to a slide or a speaker
  note. If a section has nothing to draw on, make it shorter. Do not pad it.
- **No numbers the deck does not show.** No percentages, costs, counts or
  savings unless they are on a slide, and then exactly as given.
- **"Looking Ahead" is the talk's next steps,** from its closing slides or
  notes. If the deck has none, one or two sentences on what it asked the
  audience to try. Never invent a roadmap.
- **Name PSD's own things accurately.** If the talk shows AI Studio or another
  product on the site, link it with a bundle path such as
  `[AI Studio](/software/ai-studio.md)`. Validation checks that the link
  resolves.
- The house style in [AGENTS.md](../../../AGENTS.md) applies to your sentences:
  plain words, none of the banned list, no emoji. The deck's own title stays
  as written, even if it uses one of those words.

Re-read the summary against `deck.txt` and the PDF before moving on. Delete
any sentence you cannot point to a slide for.

## 8. Ship

Follow [ship.md](ship.md). The live URL is
`https://psd401.ai/presentations/<slug>`. In the report, say the summary is
yours and was written from the slides and notes.
