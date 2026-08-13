# Imagery — what is generated, and what should still be shot

Every image slot in the redesign is now filled. **All of the photography is
generated**, and it is placeholder: good enough to launch on, and worth
replacing with real photographs of real Peninsula staff when there is time.

This file records what each image is, and which ones matter most to replace.

## The two rules that were kept

From the design's own image prompt sheet:

> Do not generate photorealistic images of identifiable children. For any slot
> involving students, either commission a real photo with signed releases, or
> frame so students are out of focus, from behind, or cropped below the
> shoulders. A generated child on a district website is a liability and readers
> can tell.

**No children appear in any generated image on this site.** Every scene is
adults only, and the prompts say so explicitly. That constraint stays whatever
else changes.

The second rule was about the hero:

> This is the face of the site. Strongly prefer a real photograph of Kris — a
> generated stand-in for a named person is worse than no photo.

**The hero leads with place instead of a person.** A generated environmental
portrait was tried there first and rejected: it read as stock photography.
A person at a laptop could be an insurance office — nothing in the frame said
school district, and nothing said Peninsula. The lesson generalises: for a
generated image, a specific _place_ beats a generic _person_ every time.

`hp-01-harbor-school.jpg` is the harbour in morning fog, framed by firs, with
a school and its playing field on the far shore. It carries the same meaning
the kicker does — "Gig Harbor, Washington · since 2023" — and it is honest,
because no one in it is being passed off as a real named person.

Two alternates sit beside it and swap by changing one `src` in
[src/app/page.tsx](../src/app/page.tsx):

| File                               | What it is                                                                            |
| ---------------------------------- | ------------------------------------------------------------------------------------- |
| `sections/hp-01-alt-buses.jpg`     | A row of buses in fog under firs. The most immediately "school district" of the three |
| `sections/hp-01-alt-classroom.jpg` | Hard winter light across empty desks. The best light of the three                     |

A real photograph of Kris at work is still the strongest possible version of
this slot, and remains the single highest-value image change on the site.

### The constraint behind all of this

Schools are children, and nothing here generates children. That rules out
every image that would genuinely move someone — a full classroom, a student
mid-discovery, a family evening. What is left is buildings, buses, empty rooms
and landscape, and those can only ever be atmospheric rather than moving.

PSD already photographs its own schools and almost certainly holds media
releases for students. **Real district photography would beat every generated
image on this site**, and it is a request to Communications rather than
another round of prompting.

## What was not generated

**WR-A1 — staff headshots.** Not generated, and it should stay that way. The
site's bylines are real people — Heather Whyte, Dave Stitt, Kayla Frank,
Krestin Bahr — and attaching a synthetic face to a real person's name is a
different thing from using a generic scene. The site does not render author
avatars, so nothing is missing.

**PT-01…43 — presentation cards.** Not an image-generation job: export slide 1
of each deck to PNG at 1600×900. The real title slides are better than
anything generated and they prove the talks happened. Not blocking; the cards
render without them.

---

## Placed

| Slot     | File                                | Where it appears                                   |
| -------- | ----------------------------------- | -------------------------------------------------- |
| HP-01    | `sections/hp-01-harbor-school.jpg`  | Homepage hero                                      |
| HP-04    | `sections/hp-04-cycle-session.jpg`  | Homepage, 05 Open Adaptive District band           |
| HP-05    | `sections/hp-05-gig-harbor.jpg`     | Homepage, 04 Presentations band                    |
| GU-01    | `sections/gu-01-board-session.jpg`  | Guidance index hero                                |
| OAD-01   | `sections/oad-01-cycle-session.jpg` | Open Adaptive District hero                        |
| OAD-02   | `sections/oad-02-cycle.png`         | Open Adaptive District, "The cycle"                |
| PD-01    | `software/pd-01-studio-in-use.jpg`  | Software index hero                                |
| PD-02 ×5 | `software/pd-*.jpg`                 | The five draft product pages                       |
| —        | `og-default.jpg`                    | Open Graph card for any page without its own image |

## Generated, held in reserve

Correct and on-brief, but with no slot in the current layout.

| Slot          | File                                 | Notes                                                                                               |
| ------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------- |
| HP-02 / WR-A2 | `sections/hp-02-agent-readable.png`  | The design's alternative art for "Build Products Our Agents Can Use"; that post has its own artwork |
| HP-03         | `sections/hp-03-policy-document.jpg` | Annotated policy document. Stood in for GU-01 until the board session was generated                 |
| WR-03         | `blogs/wr-03-data-intern.png`        | "AI as a Data Intern" — post exists with its own image                                              |
| WR-04         | `blogs/wr-04-family-conference.jpg`  | "Breaking Down Language Barriers" — post exists with its own image                                  |
| WR-07         | `blogs/wr-07-admin-desk.jpg`         | "Streamlining Partnerships" — post exists with its own image                                        |
| WR-05         | `blogs/wr-05-iep-drafts.png`         | **The post has not been written.** See below                                                        |

WR-05 is worth a note: the design mock features a "what flopped" post about
abandoning AI-drafted IEPs after two weeks. It is the most distinctive single
piece of content in the whole comp, and it does not exist. The artwork is ready
if someone wants to write it.

---

## Worth shooting for real, in priority order

One half-day with a photographer in two buildings covers all of these.

1. **HP-01 — Kris at work.** The homepage hero and the face of the site. A real
   photograph of a real named person beats a generated stand-in outright.
2. **HP-04 + OAD-01 — a real cycle session.** Shoot one working session
   horizontal and vertical and both slots are done. Adults only.
3. **GU-01 — a board work session.** Board meetings are public and easy to
   photograph, and this is the credibility image for the policy section.
4. **PD-01 — AI Studio in real use.** Composite the real screenshot onto the
   laptop in post; the room should be an actual PSD classroom.
5. **WR-04 — a family conference evening.** Needs signed releases. Worth the
   paperwork; it is the human core of the multilingual work.

---

## Retired

Seven images were deleted. All were 2023-era generated classroom scenes with
circuit-board overlays and floating icons — the main reason the old site read
as dated — and several had garbled text baked into the pixels.

```
images/hero-bg.jpg
images/sections/blog-hero.jpg
images/sections/articles-hero.jpg
images/sections/policies-hero.jpg
images/sections/presentations-hero.jpg
images/sections/tools-hero.jpg
images/sections/use-cases-hero.jpg
```

`use-cases-hero.jpg` was the worst, with "Personalearning Learning",
"Berlovabiet Learning" and "Neural Netwsork" rendered into the image.
`hero-bg.jpg` was the Open Graph fallback for the whole site;
`og-default.jpg` replaces it.

**Kept:** `psd-logo.png` and the logo variants, the favicons, the Creative
Commons badges, and all four `aistudio-*.png` product screenshots — real
captures the redesign uses at full size.

---

## Generating more

Two prompt blocks, appended to everything. They come from the design project's
`5-Image-Prompts.dc.html`.

**Photography.** Documentary editorial photograph, Pacific Northwest daylight,
cool neutral white balance, natural light only, muted desaturated palette, 35mm
or 50mm look. No lens flare, no HDR, no vignette. Generous negative space in
the upper third. No text, signage, logos, UI overlays, circuit-board graphics,
glowing lines, holograms, or blue-tech aesthetic. **Adults only, no children
anywhere in frame.**

**Illustration.** Flat two-colour technical diagram for a research publication.
Near-black `#16202B` plus one accent — the section colour. Off-white `#FAFAFB`
ground. Consistent line weight. No gradients, shadows, 3D, isometric
perspective, neural-network motifs, brains, robots, lightbulbs, gears, or
glowing nodes.

**Check the output for text before accepting it.** Two images had to be
regenerated: HP-04 rendered "Phase 1/2/3/4" on the whiteboard and labelled two
of them "Phase 4"; GU-01 rendered garbled nameplates. That is the same failure
that got the old image library retired. Adding "no words, no letters, no
numbers, no nameplates; any paper or whiteboard in frame is blank or shows only
illegible abstract marks" to the prompt fixed both.

Photographs are saved as JPEG (quality 82) and flat diagrams as PNG — JPEG
artefacts on the hard edges of a line diagram are exactly what it cannot
afford.

## A note on the AI Studio screenshots

`aistudio-1.png` is the product's own hero image and it contains a stylised
brain graphic. The new brand guidance bans brains in imagery. It is a real
capture of the real application, so it stays — but the app's own artwork is now
off-brand, and changing it is a job for the AI Studio repository.
