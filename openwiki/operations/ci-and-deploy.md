---
type: Operations
title: CI, validation scripts, deploy and repo automation
description: How psd401.ai is validated, built and deployed (GitHub Actions CI, org reusable workflows, Amplify bun build spec, husky hooks, Dependabot, OpenWiki workflow) and which audit scripts act as the repository's tests.
tags: [ci, github-actions, amplify, bun, audits, dependabot]
openwiki:
  roles: [operations, delivery, testing]
  change_kinds: [ci, deploy, tooling]
  source_paths: [.github/workflows/ci.yml, .github/workflows/psd-ci.yml, .github/workflows/openwiki-update.yml, .github/workflows/security-scan.yml, .github/workflows/claude-review.yml, .github/workflows/claude.yml, .github/dependabot.yml, amplify.yml, package.json, .husky/pre-commit, scripts/links-audit.ts, scripts/agent-audit.ts]
  test_paths: [scripts/content-validate.ts, scripts/field-notes-selftest.ts, scripts/links-audit.ts, scripts/agent-audit.ts]
  invariants:
    - There is no unit-test runner; the content validator and the Field Notes self-test are the tests.
    - links:audit needs full git history because it reads a pinned pre-redesign baseline commit.
    - Workflow uses refs are pinned to commit SHAs and kept current by Dependabot.
    - bun installs and runs scripts; Node still runs next build and tsx.
  validation_commands: ['bun run content:validate', 'bun run field-notes:selftest', 'bun run type-check', 'bun run lint']
---

# CI, validation and deploy

## Runtime and tooling

The repo standardised on **bun** (lockfile `bun.lock`, no `package-lock.json`; Bun pinned to `1.2.23` in both `ci.yml` and `amplify.yml`). Node 20 still runs Next.js and the `tsx` scripts. Package scripts live in `package.json`; `bun run validate` chains lint, `format:check` and `content:validate`. The pre-commit hook (`.husky/pre-commit`) runs `lint-staged` (Prettier on js/ts/json/md); `.prettierignore` excludes `src/content/` (authored text, see [publishing](../workflows/publishing-content.md)), `public/openadaptivedistrict/` and `openwiki/`.

## What counts as a test

There is no test framework. The checks are:

| Check | Command | Covers | Cost |
| --- | --- | --- | --- |
| Content validator | `bun run content:validate` | OKF conformance, schemas, links, images, index freshness ([content bundle](../architecture/content-bundle.md)) | Fast; default for content or schema edits |
| Field Notes self-test | `bun run field-notes:selftest` | Consent flow, routes, issue sending on the memory driver ([Field Notes](../integrations/field-notes-newsletter.md)) | Fast; run when `src/lib/field-notes/`, `subscribe.ts` or the API routes change |
| Types and lint | `bun run type-check`, `bun run lint` | TypeScript strict, ESLint | Fast; default for code edits |
| Build | `bun run build` | Static params, route handlers, rewrites compile | Conditional: routes, config, or before PR |
| Redirect audit | `bun run links:audit` | Every pre-redesign URL (from baseline commit `e776864`) plus every `STATIC_ROUTES` entry resolves | Conditional: needs `build` + `start`; run when routes, redirects or slugs change |
| Agent audit | `bun run agent:audit` | Markdown negotiation, `Vary`, markdown 404, homepage metadata, JSON-LD, trust pages | Conditional: same trigger as above ([surfaces](../architecture/machine-readable-surfaces.md)) |

## GitHub Actions

- `ci.yml` (push/PR to `main`, read-only token, `fetch-depth: 0`): install with `--frozen-lockfile` → `content:validate` → `field-notes:selftest` → `type-check` → `lint` → `build` → start server and run `links:audit && agent:audit`.
- `psd-ci.yml`: calls the org reusable `PSD401/.github` PSD CI; `typecheck-command` is `bun run type-check` (the script is named `type-check`, not `typecheck`) and `test-command` is `bun run content:validate && bun run field-notes:selftest`.
- `security-scan.yml`: org reusable security scan on PR, push and weekly cron.
- `claude-review.yml` / `claude.yml`: org reusable Claude review on PRs (skipped for Dependabot with a no-op job that still reports the required `claude-review` check) and an `@claude` mention bot.
- `openwiki-update.yml`: calls the org reusable OpenWiki workflow on push to `main`, weekly, or manually (concurrency group cancels superseded runs). It regenerates `openwiki/`; hand edits to generated pages are discouraged by the block in [AGENTS.md](../../AGENTS.md).
- All `uses:` refs are SHA-pinned; `.github/dependabot.yml` updates `github-actions` and `bun` weekly with a 7-day cooldown, grouping minor and patch bumps.

## Deploy

The site is an AWS Amplify Next.js SSR app (the app id is noted in `amplify.yml`). The checked-in `amplify.yml` overrides the console build settings: `npm install -g bun@1.2.23`, `bun install --frozen-lockfile`, `bun run build`, artifacts from `.next`, cache `.next/cache`. Server-side configuration for Field Notes (`FIELD_NOTES_*` variables, compute-role IAM policy) is documented in [docs/field-notes.md](../../docs/field-notes.md); Amplify console variables are not visible to server code at runtime unless written into `.env.production` during the build. The current `amplify.yml` has no such step, so it is a documented requirement that is not in the file, worth verifying before relying on the production sign-up routes.

`next.config.js` pins `turbopack.root` to the repo directory and allows remote images only from `picsum.photos`, `fastly.picsum.photos` and `mirrors.creativecommons.org`; images are served as AVIF then WebP.

## Change navigation

- Changing the install tool or Bun version: update `ci.yml`, `amplify.yml`, and docs together (the Bun conversion touched workflows, skills, scripts' usage text, README and AGENTS).
- Adding a script that should gate merges: add it to `ci.yml` and, if it is cheap and offline, to the `test-command` in `psd-ci.yml`.
- Do not run the audits by default; only when routing, redirects, rewrites or machine-readable surfaces changed. They fail with a clear message if the baseline commit is missing (shallow clone).
