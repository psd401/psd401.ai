# Imagery — what was generated, what still needs a camera

The redesign's image sheet defines 27 slots. This records what happened to
each, and why six of them were deliberately left empty.

## The rule that decided this

From the design's own image prompt sheet:

> Do not generate photorealistic images of identifiable children. For any slot
> involving students, either commission a real photo with signed releases, or
> frame so students are out of focus, from behind, or cropped below the
> shoulders. A generated child on a district website is a liability and readers
> can tell.

and, on the hero slot:

> This is the face of the site. Strongly prefer a real photograph of Kris — a
> generated stand-in for a named person is worse than no photo.

Both were followed. Every generated image below is either a flat diagram, a
scene with no people in it, or an adult in a workplace framed so no specific
person is identifiable. No children appear in any generated image.

---

## Generated and placed

| Slot     | File                                 | Where it appears                                     |
| -------- | ------------------------------------ | ---------------------------------------------------- |
| HP-05    | `sections/hp-05-gig-harbor.jpg`      | Homepage, 04 Presentations band                      |
| HP-03    | `sections/hp-03-policy-document.jpg` | Guidance index hero (standing in for GU-01)          |
| OAD-02   | `sections/oad-02-cycle.png`          | Open Adaptive District, "The cycle"                  |
| PD-02 ×5 | `software/pd-*.jpg`                  | The five draft product pages                         |
| —        | `og-default.jpg`                     | Open Graph card for every page without its own image |

## Generated, not yet placed

Briefed for posts that exist in the design's sample data but not in the real
content. They are correct, on-brief, and ready for the post that needs them.

| Slot          | File                                | Briefed for                                                                                                             |
| ------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| HP-02 / WR-A2 | `sections/hp-02-agent-readable.png` | "Build Products Our Agents Can Use" — the post exists and already has its own artwork; this is the design's alternative |
| WR-03         | `blogs/wr-03-data-intern.png`       | "AI as a Data Intern" — post exists with its own image                                                                  |
| WR-05         | `blogs/wr-05-iep-drafts.png`        | "IEP drafts: stopped after two weeks" — **this post has not been written**                                              |
| WR-07         | `blogs/wr-07-admin-desk.jpg`        | "Streamlining Partnerships" — post exists with its own image                                                            |

WR-05 is worth noting: the design mock features a "what flopped" post about
abandoning AI-drafted IEPs after two weeks. It is the single most distinctive
piece of content in the whole comp, and it does not exist. The artwork is
ready if someone wants to write it.

---

## Needs a real camera — six slots

These are held as hatched holding frames. Generating them would either
misrepresent a real person or put a synthetic child on a district website.

| Slot               | What                          | Why not generated                                                                                                                                  |
| ------------------ | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HP-01**          | Kris at work                  | The homepage hero, and a named person. A generated stand-in for a real, named individual is the most damaging shortcut available on this site.     |
| **HP-04 / OAD-01** | A real six-week cycle session | Shoot horizontal and vertical in one sitting and both slots are filled. Adults only.                                                               |
| **WR-A1**          | Staff headshots               | Every byline needs one. ~8 authors across 15 posts. Never generate a portrait for a named byline.                                                  |
| **GU-01**          | A board work session          | Board meetings are public and easy to photograph, and this is the credibility image for the policy section. Currently showing HP-03 as a stand-in. |
| **PD-01**          | AI Studio in real use         | Composite the real screenshot onto the laptop in post; the room must be a real PSD classroom.                                                      |
| **WR-04**          | A family conference evening   | Needs signed releases. Worth the paperwork — it is the human core of the multilingual work.                                                        |

The design sheet's estimate: one half-day with a photographer in two buildings
covers all six.

## Not an image job

**PT-01…43** — the 43 presentation cards. These are slide captures, not
generated art: export slide 1 of each deck to PNG at 1600×900. The real title
slides are better than anything generated and they prove the talks happened.
Not blocking; the cards render without them.

---

## Retired

Seven images were deleted. All were 2023-era generated classroom scenes with
circuit-board overlays and floating icons — the dominant reason the old site
read as dated — and several had garbled text baked into the pixels.

```
images/hero-bg.jpg
images/sections/blog-hero.jpg
images/sections/articles-hero.jpg
images/sections/policies-hero.jpg
images/sections/presentations-hero.jpg
images/sections/tools-hero.jpg
images/sections/use-cases-hero.jpg
```

`use-cases-hero.jpg` was the worst of them, with "Personalearning Learning",
"Berlovabiet Learning" and "Neural Netwsork" rendered into the image.

`hero-bg.jpg` was the Open Graph fallback for every page on the site;
`og-default.jpg` replaces it.

**Kept:** `psd-logo.png`, the favicons, the Creative Commons badges, and all
four `aistudio-*.png` product screenshots — those are real captures and the
redesign uses them at full size.

---

## Generating more

House style, appended to every prompt, is in the design project's
`5-Image-Prompts.dc.html`. The short version:

**Photography.** Documentary editorial photograph, Pacific Northwest daylight,
cool neutral white balance, natural light only, muted desaturated palette, 35mm
or 50mm look. No lens flare, no HDR, no vignette. Generous negative space in the
upper third. No text, signage, logos, UI overlays, circuit-board graphics,
glowing lines, holograms, or blue-tech aesthetic.

**Illustration.** Flat two-colour technical diagram for a research publication.
Near-black `#16202B` plus one accent — the section colour. Off-white `#FAFAFB`
ground. Consistent line weight. No gradients, shadows, 3D, isometric
perspective, neural-network motifs, brains, robots, lightbulbs, gears, or
glowing nodes.

The script used was `scripts/generate.py` from the `image-gen` skill; the exact
prompts are in the scratchpad script that produced this set. Photographs are
saved as JPEG (quality 82) and flat diagrams as PNG — JPEG artefacts on the
hard edges of a line diagram are exactly what it cannot afford.

## A note on the AI Studio screenshots

`aistudio-1.png` is the product's own hero image and it contains a stylised
brain graphic. The new brand guidance bans brains in imagery. This is a real
capture of the real application, so it stays — but the app's own artwork is now
off-brand, and changing it is a job for the AI Studio repository.
