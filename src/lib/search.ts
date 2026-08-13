/**
 * Unified search across every content type.
 *
 * Fixes a real bug in the previous implementation: it built use-case URLs as
 * `/use-cases/${slug}`, but the route is `/use-cases/[category]/[slug]`. All
 * 50 use-case results pointed at 404s. URLs now come from each concept's OKF
 * `resource` field, which is the same value the sitemap and JSON-LD use — so
 * a URL can only be wrong in one place instead of five.
 *
 * Also widened: the old filter matched title, description and tags only.
 * Body text is now indexed, which is what people actually search for.
 */
import { cache } from 'react';
import { getConcepts } from './content';
import { ALL_SECTIONS } from './site';
import type { ContentDir } from './schemas';

export type SearchResult = {
  title: string;
  description: string;
  url: string;
  /** Human-readable section name, e.g. 'Writing'. */
  section: string;
  type: string;
  tags: string[];
  date?: string;
  /** Why this result matched — 'title' ranks above 'body'. */
  matchedIn: 'title' | 'description' | 'tag' | 'body';
};

type IndexEntry = Omit<SearchResult, 'matchedIn'> & {
  haystackTitle: string;
  haystackMeta: string;
  haystackTags: string;
  haystackBody: string;
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

/** Built once per request and reused across every query on the page. */
export const getSearchIndex = cache(async (): Promise<IndexEntry[]> => {
  const groups = await Promise.all(
    DIRS.map(dir => getConcepts(dir).then(items => ({ dir, items })))
  );

  const entries: IndexEntry[] = [];
  for (const { dir, items } of groups) {
    const section = ALL_SECTIONS.find(s => s.contentDir === dir);
    for (const item of items) {
      entries.push({
        title: item.title,
        description: item.description,
        // The OKF `resource` field IS the canonical path. One source of truth.
        url: item.resource,
        section: section?.name ?? dir,
        type: item.type,
        tags: item.tags ?? [],
        date: 'date' in item ? (item.date as string) : undefined,
        haystackTitle: item.title.toLowerCase(),
        haystackMeta: item.description.toLowerCase(),
        haystackTags: (item.tags ?? []).join(' ').toLowerCase(),
        haystackBody: item.content.toLowerCase(),
      });
    }
  }
  return entries;
});

export type SearchFilters = {
  /** Restrict to these OKF types. Empty means all. */
  types?: string[];
  tag?: string;
};

export async function searchContent(
  query: string,
  filters: SearchFilters = {}
): Promise<SearchResult[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const index = await getSearchIndex();
  const results: SearchResult[] = [];

  for (const e of index) {
    if (filters.types?.length && !filters.types.includes(e.type)) continue;
    if (filters.tag && !e.tags.includes(filters.tag)) continue;

    // First match wins, and the order here is the ranking order.
    const matchedIn: SearchResult['matchedIn'] | null = e.haystackTitle.includes(q)
      ? 'title'
      : e.haystackMeta.includes(q)
        ? 'description'
        : e.haystackTags.includes(q)
          ? 'tag'
          : e.haystackBody.includes(q)
            ? 'body'
            : null;

    if (!matchedIn) continue;

    results.push({
      title: e.title,
      description: e.description,
      url: e.url,
      section: e.section,
      type: e.type,
      tags: e.tags,
      date: e.date,
      matchedIn,
    });
  }

  const rank = { title: 0, description: 1, tag: 2, body: 3 } as const;
  return results.sort(
    (a, b) =>
      rank[a.matchedIn] - rank[b.matchedIn] || (a.date && b.date ? (a.date > b.date ? -1 : 1) : 0)
  );
}
