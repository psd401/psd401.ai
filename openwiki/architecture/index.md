# Files

- [The OKF content bundle, schemas and loader](content-bundle.md) - How src/content/ doubles as an Open Knowledge Format v0.2 bundle and the site's source, how Zod schemas validate frontmatter, how the shared loader reads concepts, and what content:validate enforces.
- [Machine-readable surfaces, redirects and content negotiation](machine-readable-surfaces.md) - The agent-facing endpoints of psd401.ai (llms.txt, llms-full.txt, /okf, .md rewrites, Accept text/markdown negotiation, content.json, sitemap, feed, robots) and the permanent-URL redirect contract in next.config.js.
- [Open Adaptive District documents (dual rendering)](open-adaptive-district.md) - How the Open Adaptive District protocol documents and fellowship action plan are stored as protocol concepts and rendered twice from one HTML source, in-site and as printable static-URL pages, with matching stylesheets.
- [psd401.ai architecture overview](overview.md) - High-level architecture of the psd401.ai Next.js 16 site, covering the content-as-source data flow, route map, section model, rendering defaults and where each concern lives.
- [Site UI, design system, search and related content](site-ui.md) - The psd401.ai design system rules (square corners, one ink, section colours), component layout, JSON-LD helpers, and the content-discovery libraries for search and cross-type related links.
