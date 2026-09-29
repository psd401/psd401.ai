/**
 * Use cases — category grouping.
 *
 * The only content type that needs its own library: its route is
 * /use-cases/[category]/[slug], where `category` is the raw frontmatter
 * value, URL-encoded. Everything else reads src/lib/content.ts directly.
 *
 * The encoding is load-bearing. Categories contain spaces and ampersands
 * ("Data Analysis & Insights for Decision Making"), so live URLs look like
 * /use-cases/Data%20Analysis%20%26%20Insights.../slug. That is the existing
 * public contract and it must not change — do not "tidy" these into slugs.
 */
import { cache } from 'react';
import { getConcepts, getConcept, type Concept } from './content';
import type { UseCase as UseCaseFields } from './schemas';

export type UseCase = Concept<UseCaseFields>;

export type Category = {
  /** Raw category name, exactly as authored. */
  name: string;
  /** URL segment — encodeURIComponent(name). */
  slug: string;
  count: number;
};

export const getAllUseCases = cache(async (): Promise<UseCase[]> => {
  const items = await getConcepts('use-cases');
  return items.sort((a, b) => a.title.localeCompare(b.title));
});

/** The public URL for a use case. */
export function getUseCaseUrl(useCase: Pick<UseCase, 'category' | 'slug'>): string {
  return `/use-cases/${encodeURIComponent(useCase.category)}/${useCase.slug}`;
}

export const getCategories = cache(async (): Promise<Category[]> => {
  const useCases = await getAllUseCases();
  const counts = new Map<string, number>();

  for (const uc of useCases) {
    counts.set(uc.category, (counts.get(uc.category) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, slug: encodeURIComponent(name), count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
});

/**
 * Look up by category + slug. The category is matched but not required to be
 * correct for the lookup to succeed — the slug is unique across the whole
 * directory, so a stale category in an old link still resolves rather than
 * 404ing. The page canonicalises to the right URL.
 */
export const getUseCaseBySlug = cache(
  async (category: string, slug: string): Promise<UseCase | null> => {
    void category;
    const item = await getConcept('use-cases', slug);
    return item ?? null;
  }
);

export const getUseCasesByCategory = cache(async (category: string): Promise<UseCase[]> => {
  const decoded = decodeURIComponent(category);
  const useCases = await getAllUseCases();
  return useCases.filter(uc => uc.category === decoded);
});
