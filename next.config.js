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
  // NOTE: only the bare path redirects. The six real .html files under
  // public/openadaptivedistrict/ must keep resolving, so no :path* wildcard
  // here — a wildcard would break every inbound link to the playbook pages.
  { source: '/openadaptivedistrict', destination: '/open-adaptive-district', permanent: true },
  {
    source: '/openadaptivedistrict/index.html',
    destination: '/open-adaptive-district',
    permanent: true,
  },
  // The fellowship action plan now renders inside the site. Only this one
  // archive file moves; the rest of first-draft/ keeps its original look.
  {
    source: '/openadaptivedistrict/first-draft/03-Fellowship-Action-Plan-FILLED.html',
    destination: '/open-adaptive-district/action-plan',
    permanent: true,
  },
];

const nextConfig = {
  // Pin the workspace root to this directory. Without it, a git worktree (or
  // any checkout nested under another package-lock.json) makes Turbopack infer
  // the parent as the root and warn on every build.
  turbopack: { root: import.meta.dirname },

  images: {
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
    return [
      { source: '/robots.txt', destination: '/api/robots' },

      // Any page's markdown source sits beside it: /writing/my-post.md.
      // A widely-followed convention for agent-readable sites, and it costs
      // nothing — both shapes hit the same handler that serves the bundle.
      // The use-cases rule comes first because its URLs carry an extra
      // category segment; the category is not needed to resolve the file.
      {
        source: '/use-cases/:category/:slug.md',
        destination: '/okf/use-cases/:slug.md',
      },
      {
        source:
          '/:dir(writing|software|guidance|presentations|open-adaptive-district|tools|articles)/:slug.md',
        destination: '/okf/:dir/:slug.md',
      },
    ];
  },
};

export default nextConfig;
