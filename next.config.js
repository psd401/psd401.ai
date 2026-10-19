/** @type {import('next').NextConfig} */

/**
 * Redirect contract.
 *
 * The redesign renumbered the site's information architecture. Every URL that
 * existed before it must still resolve — these are in slide decks, QR codes,
 * press links and other districts' documentation. `permanent: true` emits a
 * 308, which search engines treat as a 301 for ranking purposes and which
 * preserves the request method.
 *
 * NOT redirected, on purpose: /tools, /articles and /use-cases. Those are 92
 * of roughly 200 pages. The redesign de-prioritises them in navigation (they
 * are footer-linked, not in the masthead) but moving their URLs would put the
 * largest content set on the site behind a redirect hop for no gain.
 *
 * scripts/links-audit.ts asserts every entry here actually resolves. Add a
 * redirect and the audit covers it automatically.
 */
const redirects = [
  // 01 Writing — was /blog
  { source: '/blog', destination: '/writing', permanent: true },
  { source: '/blog/:slug', destination: '/writing/:slug', permanent: true },

  // 02 Software — the AI Studio page becomes one product among six
  { source: '/aistudio', destination: '/software/ai-studio', permanent: true },

  // 03 Guidance — was /policies
  { source: '/policies', destination: '/guidance', permanent: true },
  { source: '/policies/:slug', destination: '/guidance/:slug', permanent: true },

  // 05 Open Adaptive District — was a bare static directory.
  // NOTE: no :path* wildcard here. The printable pages at
  // /openadaptivedistrict/0*.html (served by app/openadaptivedistrict/[file])
  // and the first-draft/ archive must keep resolving — a wildcard would break
  // every inbound link to them. The old static index.html is deleted; its URL
  // redirects below.
  { source: '/openadaptivedistrict', destination: '/open-adaptive-district', permanent: true },
  {
    source: '/openadaptivedistrict/index.html',
    destination: '/open-adaptive-district',
    permanent: true,
  },
  // The fellowship action plan now lives in the content bundle and renders
  // inside the site. Its archived static copy is deleted; the old URL, which
  // other archive pages still link to, redirects to the in-site page.
  {
    source: '/openadaptivedistrict/first-draft/03-Fellowship-Action-Plan-FILLED.html',
    destination: '/open-adaptive-district/action-plan',
    permanent: true,
  },
];

/** Content directories whose concepts render at /<dir>/<slug>. */
const CONCEPT_DIRS =
  'writing|software|guidance|presentations|open-adaptive-district|tools|articles';

/**
 * Matches an Accept header that asks for markdown and does not ask for HTML.
 * Next anchors `value` as ^...$. A browser's Accept always lists text/html,
 * so this never changes what a person sees.
 */
const WANTS_MARKDOWN = {
  type: 'header',
  key: 'accept',
  value: '(?!.*text/html).*text/markdown.*',
};

const nextConfig = {
  // Pin the workspace root to this directory. Without it, a git worktree (or
  // any checkout nested under another package-lock.json) makes Turbopack infer
  // the parent as the root and warn on every build.
  turbopack: { root: import.meta.dirname },

  images: {
    // AVIF first where the browser takes it: noticeably smaller than WebP
    // for the photographic images this site uses.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'fastly.picsum.photos' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'mirrors.creativecommons.org' },
    ],
  },

  async redirects() {
    return redirects;
  },

  async rewrites() {
    return {
      beforeFiles: [
        // Any page's markdown source sits beside it: /writing/my-post.md.
        // A widely-followed convention for agent-readable sites, and it costs
        // nothing — both shapes hit the same handler that serves the bundle.
        // The use-cases rule comes first because its URLs carry an extra
        // category segment; the category is not needed to resolve the file.
        // These must precede the negotiation rules below, which would
        // otherwise read `my-post.md` as a slug.
        {
          source: '/use-cases/:category/:slug.md',
          destination: '/okf/use-cases/:slug.md',
        },
        {
          source: `/:dir(${CONCEPT_DIRS})/:slug.md`,
          destination: '/okf/:dir/:slug.md',
        },

        // Content negotiation (acceptmarkdown.com). The same URL answers
        // with markdown when the request asks for it and not for HTML.
        // Browsers always send text/html, so they never match.
        { source: '/', has: [WANTS_MARKDOWN], destination: '/markdown/home' },
        {
          source: '/:page(about|contact|privacy)',
          has: [WANTS_MARKDOWN],
          destination: '/markdown/:page',
        },
        {
          source: '/use-cases/:category/:slug',
          has: [WANTS_MARKDOWN],
          destination: '/okf/use-cases/:slug.md',
        },
        {
          source: `/:dir(${CONCEPT_DIRS})/:slug`,
          has: [WANTS_MARKDOWN],
          destination: '/okf/:dir/:slug.md',
        },
      ],
      afterFiles: [{ source: '/robots.txt', destination: '/api/robots' }],
      // Fallback rewrites run only when no page, file or dynamic route
      // matched: the request is about to 404. An agent gets the 404 as
      // markdown, with links to llms.txt and the sitemap.
      fallback: [{ source: '/:path*', has: [WANTS_MARKDOWN], destination: '/markdown/not-found' }],
    };
  },
};

export default nextConfig;
