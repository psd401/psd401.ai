/**
 * Cross-content linking.
 *
 * The site holds 156 concepts across seven types, and before this they only
 * linked within their own type: a use case never pointed at the tool it used,
 * or the policy that governs it. That is the difference between an archive
 * and something you can actually follow a thread through.
 *
 * Relatedness is scored, not filtered, and the score deliberately favours
 * crossing type boundaries — a post about IEPs is more useful next to the
 * policy on student data than next to another post.
 */
import { cache } from 'react';
import { getConcepts } from './content';
import { ALL_SECTIONS } from './site';
import type { ContentDir } from './schemas';

export type RelatedItem = {
  title: string;
  description: string;
  url: string;
  type: string;
  section: string;
  score: number;
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

type Candidate = {
  title: string;
  description: string;
  url: string;
  type: string;
  section: string;
  tags: Set<string>;
  /** Lowercased title words, for the title-mention signal. */
  titleTokens: string[];
  body: string;
};

const STOPWORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'from',
  'that',
  'this',
  'our',
  'ai',
  'a',
  'an',
  'of',
  'in',
  'to',
  'on',
  'how',
  'what',
  'why',
  'using',
  'use',
  'is',
  'are',
  'we',
  'your',
  'it',
]);

const buildCandidates = cache(async (): Promise<Candidate[]> => {
  const groups = await Promise.all(
    DIRS.map(dir => getConcepts(dir).then(items => ({ dir, items })))
  );

  const out: Candidate[] = [];
  for (const { dir, items } of groups) {
    const section = ALL_SECTIONS.find(s => s.contentDir === dir);
    for (const item of items) {
      out.push({
        title: item.title,
        description: item.description,
        url: item.resource,
        type: item.type,
        section: section?.name ?? dir,
        tags: new Set(item.tags ?? []),
        titleTokens: item.title
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter(w => w.length > 3 && !STOPWORDS.has(w)),
        body: item.content.toLowerCase(),
      });
    }
  }
  return out;
});

/**
 * Concepts related to the one at `url`.
 *
 * Scoring:
 *   +3  a shared tag
 *   +4  the other concept's title is named in this body (a real citation)
 *   +2  crossing a type boundary — the whole point of this function
 *   +1  a distinctive title word in common
 */
export const getRelated = cache(async (url: string, limit = 4): Promise<RelatedItem[]> => {
  const all = await buildCandidates();
  const self = all.find(c => c.url === url);
  if (!self) return [];

  const scored: RelatedItem[] = [];

  for (const other of all) {
    if (other.url === self.url) continue;

    let score = 0;

    for (const tag of self.tags) if (other.tags.has(tag)) score += 3;

    // Does either document actually name the other? Strongest signal there is.
    if (other.title.length > 8) {
      if (self.body.includes(other.title.toLowerCase())) score += 4;
      if (other.body.includes(self.title.toLowerCase())) score += 4;
    }

    if (score > 0 && other.type !== self.type) score += 2;

    const shared = self.titleTokens.filter(t => other.titleTokens.includes(t)).length;
    if (shared) score += Math.min(shared, 2);

    if (score >= 3) {
      scored.push({
        title: other.title,
        description: other.description,
        url: other.url,
        type: other.type,
        section: other.section,
        score,
      });
    }
  }

  scored.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  // Spread across types rather than returning four of the same thing.
  const picked: RelatedItem[] = [];
  const perType = new Map<string, number>();
  for (const item of scored) {
    const n = perType.get(item.type) ?? 0;
    if (n >= 2) continue;
    perType.set(item.type, n + 1);
    picked.push(item);
    if (picked.length >= limit) break;
  }
  return picked;
});
