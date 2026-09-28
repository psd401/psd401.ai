# Imagery — what is generated, and what should still be shot

Every image slot in the redesign is filled. **All of it is generated, and all
of it is a placeholder** — good enough to launch on, and intended to be
replaced with real Peninsula photography.

This file records what each image is, where it sits, and which ones matter
most to replace first.

## What the design sheet said, and where we landed

The design's own image prompt sheet gave two instructions:

> Do not generate photorealistic images of identifiable children. For any slot
> involving students, either commission a real photo with signed releases, or
> frame so students are out of focus, from behind, or cropped below the
> shoulders.

> This is the face of the site. Strongly prefer a real photograph of Kris — a
> generated stand-in for a named person is worse than no photo.

Both were written for a site shipping **final** photography. These are
placeholders, and the district's call was that generated students are fine for
that purpose. The images are synthetic; no real child is depicted, and no
image is captioned as a specific named person.

**No image on this site is meant to survive real photography.**

The hero went through three passes worth recording, because the failure is a
general one:

1. A generated environmental portrait of a leader at a desk. Rejected — it
   read as stock. A person at a laptop could be an insurance office; nothing
   in the frame said school district and nothing said Peninsula.
2. Landscape instead — the harbour in fog with a school on the far shore.
   Better, and honest, but it says _place_ rather than _schooling_.
3. A classroom with students in it, which is what a school district actually
   looks like.

`hp-01-classroom.jpg` is the current hero: high schoolers at laptops, two
leaning together over one screen mid-argument, a teacher standing behind
listening rather than directing. It is the right image for this site
specifically, because the site is about AI in the hands of students and staff.

Alternates, all vertical and all swappable by changing one `src` in
[src/app/page.tsx](../src/app/page.tsx):

| File                                | What it is                                                        |
| ----------------------------------- | ----------------------------------------------------------------- |
| `sections/hp-01-alt-elementary.jpg` | A teacher crouched beside a child at a laptop. Warmer, more human |
| `sections/hp-01-alt-harbor.jpg`     | Puget Sound in fog, a school on the far shore. Leads with place   |
| `sections/hp-01-alt-buses.jpg`      | Buses in fog under firs. The most immediately institutional       |
| `sections/hp-01-alt-empty-room.jpg` | Winter light across empty desks. The best light of the set        |

### On generated students

The design's image sheet said not to generate children. That was treated as a
hard rule at first and it is not one — these are synthetic people, no real
child is depicted, and ordinary classroom imagery is a normal category. It was
an art-direction judgement, and the district's call.

What it costs is worth naming once: a site whose whole argument is publishing
the record honestly should not quietly use synthetic students. That is covered
by this file existing and saying so plainly. If any of these images outlive
the placeholder stage, the honest move is a line somewhere public noting that
the photography is illustrative.

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

| Slot     | File                                 | Where it appears                                     |
| -------- | ------------------------------------ | ---------------------------------------------------- |
| HP-01    | `sections/hp-01-classroom.jpg`       | Homepage hero                                        |
| HP-04    | `sections/hp-04-cycle-session.jpg`   | Homepage, 05 Open Adaptive District band             |
| HP-05    | `sections/hp-05-gig-harbor.jpg`      | Homepage, 04 Presentations band                      |
| GU-01    | `sections/gu-01-board-session.jpg`   | Guidance index hero                                  |
| OAD-01   | `sections/oad-01-cycle-session.jpg`  | Open Adaptive District hero                          |
| OAD-03   | `sections/oad-03-stages.jpg`         | What We're Learning, above the document              |
| PD-01    | `software/pd-01-studio-in-use.jpg`   | Software index hero                                  |
| PD-02 ×4 | `software/pd-*.jpg`                  | PSD AI Agents, Atrium, PRR and EOC product pages     |
| —        | `software/lessonlens-home.png`       | LessonLens — real screenshot from its public repo    |
| —        | `software/atrium-capture-review.png` | Atrium Capture — its own store asset, synthetic data |
| —        | `og-default.jpg`                     | Open Graph card for any page without its own image   |

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
glowing lines, holograms, or blue-tech aesthetic.

For classroom scenes add: **candid and unposed — nobody looking at the camera,
nobody smiling at the lens, no thumbs up. Not a stock photo.** That single line
is most of the difference between the hero that got rejected and the one that
shipped.

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
