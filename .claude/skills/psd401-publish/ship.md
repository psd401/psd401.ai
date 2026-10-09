# Ship: from a finished file to a live page

The last part of every playbook. Run it from the root of a psd401.ai checkout,
after the content file and its images are written.

## 1. Branch from current main

```bash
git fetch origin
git switch -c content/<slug> origin/main
```

If the checkout has uncommitted work that is not yours, leave it alone and use
a worktree instead:

```bash
git worktree add ../psd401-<slug> -b content/<slug> origin/main
cd ../psd401-<slug> && npm ci
```

Install dependencies once per checkout: `npm ci` if `node_modules/` is missing.

## 2. Build the bundle and run the checks

```bash
npm run okf:build
npm run content:validate && npm run type-check && npm run lint && npm run build
```

All four must pass. `content:validate` names the file and field on failure;
the fixes are in the table at the end of [SKILL.md](SKILL.md).

Validation does not catch a scaffold placeholder left behind. This must print
nothing:

```bash
grep -n 'TODO\|status: draft' src/content/<dir>/<slug>.md
```

## 3. Commit

Stage only what the playbook produced: the content file, its images, and the
files `okf:build` rewrote.

```bash
git add src/content/<dir>/<slug>.md public/images/<...> \
  src/content/index.md src/content/<dir>/index.md src/content/log.md
git status --short   # nothing else should be staged
```

Commit messages on this repo are detailed. Say what was added, where it came
from (the Doc or Slides link), what you changed and what you wrote yourself
(the description, the presentation summary), how images were cropped, and
which checks passed. Do not add `Co-Authored-By` or any other AI attribution.

## 4. Pull request

```bash
git push -u origin content/<slug>
gh pr create --repo psd401/psd401.ai --base main --head content/<slug> \
  --title "<Publish ...>" --body "<the same facts, shorter>"
```

One PR per run. Several decks or posts in one run can share a PR.

## 5. Wait for CI, then merge

```bash
gh pr checks <n> --repo psd401/psd401.ai --watch --interval 30
```

Checks take a few seconds to register. If it says no checks were reported,
wait 15 seconds and run it again.

- **A check failed:** read the log (`gh run view <run-id> --repo psd401/psd401.ai --log-failed`),
  fix it, commit, push, and watch again. Never merge with a failing check.
- **The Claude review left comments:** read them with
  `gh pr view <n> --repo psd401/psd401.ai --comments`. Fix factual problems in
  text you wrote. Never change an author's words to satisfy a reviewer. List
  anything you did not act on in your report.

When every check has passed:

```bash
gh pr merge <n> --repo psd401/psd401.ai --merge
```

If your own environment refuses the merge (a permission rule or an approval
you cannot get), stop. Do not look for another way to merge. Give the person
the exact command above and say that CI passed.

## 6. Confirm it is live

`main` deploys to psd401.ai automatically. It usually takes several minutes.
Poll the page, for up to 20 minutes:

```bash
URL=https://psd401.ai/<section>/<slug>
for i in $(seq 40); do
  [ "$(curl -s -o /dev/null -w '%{http_code}' "$URL")" = 200 ] && echo live && break
  sleep 30
done
```

Then check what a reader and a search engine will see:

```bash
curl -s "$URL" | grep -o '<title>[^<]*\|og:image" content="[^"]*\|noindex'
curl -s https://psd401.ai/llms.txt | grep -c "<slug>"
```

The title and image should be right, `noindex` should not appear, and the
llms.txt count should be at least 1.

## 7. Report

Tell the person, briefly:

- The live URL and the PR link.
- What you wrote yourself: the description, and for a presentation the whole
  summary. They have not seen these.
- Anything you could not find and filled with a stated assumption.
- Typos you noticed in an author's text and did not fix.
- Review comments you did not act on.
