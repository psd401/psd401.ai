# psd401.ai

Peninsula School District's public record of its AI work — the software it
builds, the policies it writes, the talks it gives, and the experiments that
failed. Gig Harbor, Washington.

Everything here is licensed CC BY-NC-SA 4.0 and intended to be forked by other
districts.

## For machines

The content is an [Open Knowledge Format](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf)
v0.2 bundle — a directory of markdown files with typed frontmatter. It is not
an export: `src/content/` is both the OKF bundle and the site's source, so what
an agent reads and what a reader sees cannot drift apart.

| Surface                                                   | What it gives you                                              |
| --------------------------------------------------------- | -------------------------------------------------------------- |
| [`/llms.txt`](https://psd401.ai/llms.txt)                 | Index of everything, with links                                |
| [`/llms-full.txt`](https://psd401.ai/llms-full.txt)       | Every document, full text, one file                            |
| [`/okf`](https://psd401.ai/okf)                           | The bundle, browsable. `/okf/<dir>/<slug>.md` for raw markdown |
| [`/api/content.json`](https://psd401.ai/api/content.json) | Typed index of every concept                                   |
| `<any page>.md`                                           | That page's markdown source                                    |
| [`/feed.xml`](https://psd401.ai/feed.xml)                 | RSS across every content type                                  |

```bash
git clone https://github.com/psd401/psd401.ai
cd psd401.ai/src/content   # the bundle root
```

## Sections

|     | Section                                                            | What it holds                                                     |
| --- | ------------------------------------------------------------------ | ----------------------------------------------------------------- |
| 01  | [Writing](https://psd401.ai/writing)                               | Notes from the people doing the work, including what did not work |
| 02  | [Software](https://psd401.ai/software)                             | Products the district builds and runs, all open source            |
| 03  | [Guidance](https://psd401.ai/guidance)                             | The policy documents our own staff work from                      |
| 04  | [Presentations](https://psd401.ai/presentations)                   | Talks and slides, published as given                              |
| 05  | [Open Adaptive District](https://psd401.ai/open-adaptive-district) | The six-week cycle underneath all of it                           |

Plus a [reference library](https://psd401.ai/practice) of staff use cases,
reviewed tools, and external research.

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind v4 ·
markdown content with `gray-matter` · Zod-validated frontmatter. No component
library.

## Getting started

```bash
git clone https://github.com/psd401/psd401.ai
cd psd401.ai
npm install
npm run dev
```

Then open http://localhost:3000.

## Working on it

```bash
npm run content:new -- --type post --title "..."   # scaffold a new concept
npm run okf:build                                   # refresh bundle indexes
npm run content:validate                            # OKF + schemas + links + images
npm run type-check && npm run lint && npm run build
```

If you touch routes or redirects, run the URL audit — every URL that existed
before the 2026 redesign must still resolve:

```bash
npm start          # one terminal
npm run links:audit # another
```

`npm run content:validate` and `npm run links:audit` both run in CI.

**Contributing or working with an AI agent?** Read [AGENTS.md](AGENTS.md)
first — it is the working contract. Field reference is in
[docs/CONTENT.md](docs/CONTENT.md).

## Licence

Content: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
Code: see [LICENSE](LICENSE).

© Peninsula School District
