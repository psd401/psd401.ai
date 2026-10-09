# Playbook: an author's text and images → a blog post

Input: the post's text (a Google Doc link, pasted text, or a file) and any
images. Output: a merged PR and a live page at `/writing/<slug>`.

**The author's words are published exactly as written.** Your job is the
frontmatter, the formatting, the images and the shipping. You do not edit the
writing.

These commands use the `gws` Google Workspace CLI (`gws auth login -s drive`
if it reports an auth error). Any tool that can export a Google Doc works the
same way.

## 1. Get the text

- **Google Doc** (`docs.google.com/document/d/<ID>/…`):

  ```bash
  gws drive files export --params '{"fileId":"<ID>","mimeType":"text/markdown"}' --output source.md
  ```

  A 403 or 404 means the account you run as cannot open the Doc. Ask the
  person to share it with that account.

  If the Doc has images in it, the markdown export references them but does
  not give you files you can use. Export the Doc as a zip as well
  (`"mimeType":"application/zip"`) and take the image files from its
  `images/` folder.

- **Pasted text or a markdown file:** use it as given.
- **A .docx:** convert with `pandoc -t gfm` if available. Otherwise ask for the
  Doc link or the text.

## 2. Work out the details

```bash
grep -h '^author:' src/content/writing/*.md | sort | uniq -c | sort -rn
grep -h -A4 '^tags:' src/content/writing/*.md | grep '^  - ' | sort | uniq -c | sort -rn
```

| Field         | Where it comes from                                                                                                               |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `title`       | The Doc's title line, with the author's capitalisation.                                                                           |
| `author`      | The byline ("A note from Superintendent Krestin Bahr", "By …"), spelled as in the list above. Ask if there is none.               |
| `date`        | Today (`date +%F`) unless the person gives a date.                                                                                |
| `tags`        | Usually one existing tag (AI in Action, Information Sharing, …). Add a new tag only when none fits.                               |
| `slug`        | 3–6 whole words of the title: lowercase, hyphens, no apostrophes. Check `src/content/writing/<slug>.md` does not exist.           |
| `description` | You write it: one sentence, at most 160 characters. For a bylined post, lead with the person: "Superintendent Krestin Bahr on …". |

Set the slug yourself with `--slug`. The default from a long title is too long
for a permanent URL.

The title line and the byline line move into frontmatter. Do not repeat them
in the body. Keep a closing bio line ("Krestin Bahr is the Superintendent
of …") in the body, in italics.

## 3. Format the body, without changing a word

Allowed:

- A bold line standing alone as a section heading becomes a `## ` heading,
  worded exactly as it was.
- A standalone pull quote becomes a blockquote: `> _“…”_`.
- Keep the author's bold, italics, lists and links.
- You may add a link to a site page on its first mention without changing the
  words, e.g. `[Open Adaptive District](/open-adaptive-district)` or
  `[AI Studio](/software/ai-studio.md)`.

Not allowed: fixing spelling or grammar, tightening, restyling to the house
voice, adding or removing sentences. If you see a typo, leave it and say so in
your report. The person can decide.

Then prove the words survived. Strip the markdown from both versions and
compare. Remove the title and byline lines from the source first, since they
moved to frontmatter.

```bash
norm() { sed -E 's/\*|_|^#+ |^> //g; s/\[([^]]*)\]\([^)]*\)/\1/g; s/[[:space:]]+$//' | grep -v '^$'; }
norm < source-body.md > a.txt
awk 'f>=2{print} /^---$/{f++}' src/content/writing/<slug>.md | norm > b.txt
diff a.txt b.txt && echo "BODY TEXT IDENTICAL"
```

Do not ship until that prints `BODY TEXT IDENTICAL`.

## 4. Images

**The header image** goes in `image:`. The post page shows it in a 16:9
frame, cropped to fill, and it is also the picture shown when someone shares
the post. Crop it to 16:9 yourself so nothing important is lost:

1. Look at the image. Find what must stay: faces, heads and feet, any sign or
   text that matters.
2. Work out a 16:9 box that keeps it. For a 2048×1536 photo that is
   2048×1152, and only the vertical offset is yours to choose.
3. Crop, then look at the result before using it:

   ```bash
   sips -c <height> <width> --cropOffset <y> <x> in.jpg --out public/images/blogs/<slug>.jpg   # macOS
   magick in.jpg -crop <width>x<height>+<x>+<y> +repage public/images/blogs/<slug>.jpg      # ImageMagick
   ```

Photos are JPEG. Screenshots and graphics are PNG. Keep the longest side at
2400 px or less. The site serves smaller AVIF and WebP versions itself.

**Images in the body** go where the author put them, saved as
`public/images/blogs/<slug>-2.jpg`, `-3`, … and written as:

```markdown
![<what the image shows, for someone who cannot see it>](/images/blogs/<slug>-2.jpg)
```

**Ask before publishing a photo where a student can be identified.** Confirm
the person has checked that the student is cleared for publication. Do not
generate a portrait for a byline, or a realistic image of a child. A post with
no image is fine.

## 5. Scaffold and write

```bash
npm run content:new -- --type post --title "<title>" --slug <slug> \
  --author "<author>" --tags "<tag>" --description "<one sentence>" [--date <YYYY-MM-DD>]
```

Then:

- Add `image: /images/blogs/<slug>.jpg` to the frontmatter, if there is one.
- Delete the `status: draft` line. That is the act of publishing.
- Replace the scaffold's TODO body with the formatted post from step 3.

Run the step 3 comparison again on the final file.

## 6. Ship

Follow [ship.md](ship.md). The live URL is `https://psd401.ai/writing/<slug>`.
In the report, quote the description you wrote, since the author has not
seen it.
