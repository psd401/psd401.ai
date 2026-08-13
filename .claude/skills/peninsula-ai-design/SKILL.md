---
name: peninsula-ai-design
description: Design in the Peninsula AI brand — the visual system behind psd401.ai. Use when building or changing any UI on this site, or when producing mocks, slides, or prototypes that should look like Peninsula School District's public AI work. Covers colour, type, geometry, motion, imagery and the component set. Triggers on: design a page, new section, restyle, brand, mock up, make it look like the site, add a component.
user-invocable: true
---

# Peninsula AI — design system

The visual system behind psd401.ai. Ported from the Claude Design project
`5db21ee4`; the full written spec is in that project's `readme.md`.

Peninsula School District (Gig Harbor, Washington — 9,100 students, 17
schools) publishes its AI work in public. The audience, in priority order:
district leaders and superintendents nationally; PSD's own staff; other
districts that want to run this themselves.

## Two rules that matter more than the rest

**1. One section colour per page.** Set `data-section` once on the page
wrapper; every component beneath reads `--sec`. Never mix two section colours
in one view. The homepage is the only exception, because it is the index of
all five.

**2. Never invent a number, and never hide a failure.** Counts are computed
from content (`getCounts()` in `src/lib/content.ts`). If you cannot compute
it, leave it out. "What flopped" is a first-class category.

## The five sections

|     | Section                | Colour  | Token                 | Route                     |
| --- | ---------------------- | ------- | --------------------- | ------------------------- |
| 01  | Writing                | cobalt  | `--sec-writing`       | `/writing`                |
| 02  | Software               | teal    | `--sec-software`      | `/software`               |
| 03  | Guidance               | green   | `--sec-guidance`      | `/guidance`               |
| 04  | Presentations          | magenta | `--sec-presentations` | `/presentations`          |
| 05  | Open Adaptive District | violet  | `--sec-oad`           | `/open-adaptive-district` |

The reference library (`data-section="practice"`) resolves `--sec` to `--ink`,
not a sixth colour — it must not compete with the five.

```html
<div data-section="guidance">
  <!-- every --sec below is now green -->
</div>
```

## Where things live

```
src/styles/tokens/     colours, type, spacing, motion, fonts, responsive
src/styles/ds.css      every component's styles, .ds-* classes
src/components/ds/     core.tsx · navigation.tsx · Masthead.tsx ·
                       ThemeToggle.tsx · content.tsx · forms.tsx
```

Import from `@/components/ds`.

## Components

**core** — `Button` (solid/outline/quiet × sm/md/lg) · `Chip`
(solid/outline/ghost) · `SectionRule` (ground: none/tint/strong) · `StatCell` ·
`ImageFrame` · `CodeBlock` · `PullQuote` · `BrowserFrame`

**navigation** — `UtilityBar` · `Masthead` · `Breadcrumb` · `SideNav` ·
`OnThisPage`

**content** — `SectionHeader` · `PostCard` · `DocCard` · `SpecTable` ·
`StepRow` · `ProductCard`

**forms** — `TextInput` · `SubscribeForm`

`SectionRule` is the signature band: a 9px rule in the section colour, an
optional tinted ground, the page gutter. Every major block sits in one.

## Foundations

**Type.** Four families, no overlap in role.

- **Gabarito** — display only. Headings, numerals, product names. The tight
  tracking is the signature and it must scale with size: `-0.026em` at 20px
  tightening to `-0.045em` at 76px.
- **Public Sans** — everything read in sentences.
- **IBM Plex Mono** — labels, breadcrumbs, metadata, code. Always uppercase
  and tracked out 1.1–1.8px. Never a sentence.
- **Newsreader italic 300** — pull quotes only, at most once per screen.

Use the role tokens (`--font-display`, `--font-body`, `--font-mono`,
`--font-quote`), never a family name.

**Colour.** One ink at hue 250 does all text and all rules. Emphasis is
opacity (`--text-body` .86, `--text-muted` .72, `--text-label` .6), never a
second grey. Three grounds: white, a near-white inset, and a permanently dark
code ground. Section colour appears as a 9px rule, a 5px card accent, a solid
chip, a numeral, or an 8–13% tint — never as large flat areas, never two at
once.

**Geometry.** `border-radius: 0` everywhere. There is no radius token because
there is no radius. The only rounded shapes in the system are the three
browser-chrome dots on a product screenshot. Four line weights: 9px section
rule, 5px card accent, 1px hairline at 20% of current colour, 1px faint at 13%.

**Cards.** A hairline box with a left accent in the section colour. No shadow,
no radius, no gradient, no lift.

**Backgrounds.** Flat. No gradients anywhere, no patterns, no textures, no
blurs, no glassmorphism. The one repeating pattern is the 45° hatch inside an
unfilled `ImageFrame`, which exists to look unfinished.

**Motion.** The system barely moves. Hover fills the ground to the 8% section
tint, fades to 82%, or takes the section colour. No transforms, no scales, no
lifts, no shadows on hover, nothing bounces. 120–180ms. Respects
`prefers-reduced-motion`.

**Dark mode.** A real theme, not an inversion. `[data-theme="dark"]` lifts
each section colour into a lighter, more chromatic variant so it still reads
on ink, and flips `--on-accent` to dark because a light chip carries dark text.

**Layout.** 1440px canvas, 40px page gutters, full-width bands each opening
with its 9px rule. Prose caps at 720px, lead paragraphs at 58ch. Alternate
tinted and untinted grounds down a page so bands separate without borders.

## Iconography

There is almost none, deliberately. Structure is carried by rules, numerals
and mono labels.

- The district logo (`/images/psd-logo.png`) — never redraw, recolour or
  substitute it.
- Two inline SVGs only: the GitHub octocat on product CTAs, and the Creative
  Commons badges.
- Arrows are the literal characters → and ←. Not icons, not an icon font.
- Section numbers (01–05) and step numbers do the work an icon set would do.
- **No icon library.** No Lucide, no Heroicons, no Font Awesome.
- **No emoji, ever.**

## Imagery

Documentary photography of real people doing real work, Pacific Northwest
daylight, cool neutral white balance, unposed. Commissioned diagrams are flat
and two-colour.

**Banned:** robots, glowing brains, circuit boards, blue particle networks,
humanoid AI figures, anything with rendered text.

**All photography on the site today is generated placeholder work** and is
meant to be replaced by real Peninsula photography. Generated classroom scenes
including students are acceptable for that purpose — the district's call. The
one thing still not to do is attach a generated portrait to a real named
byline. See `docs/image-shoot-list.md`.

For classroom scenes, the line that matters most: _candid and unposed —
nobody looking at the camera, nobody smiling at the lens, not a stock photo._

Every slot has an ID (`HP-01`, `WR-03`, `PD-01`). A slot with no brief is a bug.

## Voice

First person plural, past tense, specific. "We" is the district; "you" is
another district deciding whether to try this. Never "users". Sentence case
headings. No emoji.

**Avoid:** empower, unlock, leverage, journey, revolutionise, game-changing,
seamless, robust, cutting-edge, insights, solutions. If a sentence would
survive being pasted onto any other district's website, it is not written yet.

**Calls to action name the thing** — "Get the code", not "Learn more".

## Working outside this repo

For slides, mocks or throwaway prototypes: copy the token files out of
`src/styles/tokens/` and write static HTML against them. The tokens are
self-contained; only `fonts.css` needs changing, back to the Google Fonts
`@import` the design source used.
