/**
 * Flat view of the whole bundle, for the machine-facing routes.
 *
 * sitemap.xml, llms.txt, feed.xml, /api/content.json and the raw .md routes
 * all need "every concept, with its URL and date". Deriving that in one place
 * is what stops those four from drifting apart — which is exactly how the
 * pre-redesign sitemap ended up advertising /about and /contact, neither of
 * which ever existed.
 */
import { cache } from 'react';
import { getConcepts } from './content';
import { ALL_SECTIONS, SECTIONS, PRACTICE_HUB } from './site';
import type { ContentDir } from './schemas';

export type FlatConcept = {
  dir: ContentDir;
  slug: string;
  type: string;
  title: string;
  description: string;
  /** Canonical site path, from the concept's OKF `resource`. */
  url: string;
  /** Bundle-relative markdown path, e.g. /writing/my-post.md */
  bundlePath: string;
  date: string;
  tags: string[];
  status: string;
  section: string;
  content: string;
};

const DIRS: ContentDir[] = [
  'writing',
  'software',
  'guidance',
  'presentations',
  'use-cases',
  'tools',
  'articles',
];

export const getAllConcepts = cache(async (): Promise<FlatConcept[]> => {
  const groups = await Promise.all(
    DIRS.map(dir => getConcepts(dir).then(items => ({ dir, items })))
  );

  const out: FlatConcept[] = [];
  for (const { dir, items } of groups) {
    const section = ALL_SECTIONS.find(s => s.contentDir === dir);
    for (const item of items) {
      out.push({
        dir,
        slug: item.slug,
        type: item.type,
        title: item.title,
        description: item.description,
        url: item.resource,
        bundlePath: `/${dir}/${item.slug}.md`,
        date: item.date,
        tags: item.tags ?? [],
        status: item.status,
        section: section?.name ?? dir,
        content: item.content,
      });
    }
  }

  return out.sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));
});

/**
 * Static routes that genuinely exist. Anything added here must be a real
 * page — `npm run links:audit` fetches every one of them.
 */
export const STATIC_ROUTES: Array<{ path: string; priority: string; changefreq: string }> = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  ...SECTIONS.map(s => ({ path: s.href, priority: '0.9', changefreq: 'weekly' })),
  { path: PRACTICE_HUB.href, priority: '0.6', changefreq: 'monthly' },
  { path: '/use-cases', priority: '0.7', changefreq: 'monthly' },
  { path: '/tools', priority: '0.7', changefreq: 'monthly' },
  { path: '/articles', priority: '0.7', changefreq: 'monthly' },
];

/** Concepts that should be indexed — drafts are excluded. */
export function indexable(concepts: FlatConcept[]): FlatConcept[] {
  return concepts.filter(c => c.status !== 'draft');
}
