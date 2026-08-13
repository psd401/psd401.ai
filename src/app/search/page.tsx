import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Chip, SectionHeader, SectionRule } from '@/components/ds';
import { searchContent } from '@/lib/search';
import { getCounts } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search everything Peninsula School District publishes about its AI work.',
  alternates: { canonical: '/search' },
  // A search results page has no stable content to index, and indexing one
  // creates thin duplicate pages for every query string.
  robots: { index: false, follow: true },
};

type Props = { searchParams: Promise<{ q?: string; type?: string }> };

/**
 * Search runs on the server.
 *
 * The whole corpus is 156 markdown files; searching it server-side is fast,
 * needs no client-side index shipped to the browser, and means results are
 * real URLs that work without JavaScript. The previous version matched title,
 * description and tags only — body text is now included, which is what people
 * were actually searching for.
 */
export default async function SearchPage({ searchParams }: Props) {
  const { q = '', type } = await searchParams;
  const query = q.trim();

  const [results, counts] = await Promise.all([
    query ? searchContent(query, { types: type ? [type] : undefined }) : Promise.resolve([]),
    getCounts(),
  ]);

  const byType = new Map<string, number>();
  for (const r of results) byType.set(r.type, (byType.get(r.type) ?? 0) + 1);

  return (
    <div data-section="practice">
      <SectionRule as="header">
        <SectionHeader
          as="h1"
          title="Search"
          meta={`${counts.total} concepts`}
          lead="Everything the district publishes: writing, software, guidance, talks, use cases, tools and research."
        />

        <form action="/search" role="search" style={{ marginTop: 28, maxWidth: 640 }}>
          <label htmlFor="q" className="sr-only">
            Search all content
          </label>
          <div style={{ display: 'flex', borderBottom: '2px solid currentColor' }}>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Try: IEP, prompting, data security…"
              className="ds-input"
              style={{ borderBottom: 0 }}
              autoFocus
            />
            <button
              type="submit"
              style={{
                background: 'transparent',
                border: 0,
                color: 'var(--sec)',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '1.6px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                padding: '12px 2px',
              }}
            >
              Search →
            </button>
          </div>
        </form>
      </SectionRule>

      <div style={{ padding: '36px var(--gutter-page) 60px' }}>
        {!query ? (
          <p style={{ opacity: 'var(--text-muted)', maxWidth: '60ch' }}>
            Enter a term above, or browse{' '}
            <Link href="/writing" style={{ color: 'var(--sec)' }}>
              writing
            </Link>
            ,{' '}
            <Link href="/software" style={{ color: 'var(--sec)' }}>
              software
            </Link>
            ,{' '}
            <Link href="/guidance" style={{ color: 'var(--sec)' }}>
              guidance
            </Link>{' '}
            or the{' '}
            <Link href="/practice" style={{ color: 'var(--sec)' }}>
              reference library
            </Link>
            .
          </p>
        ) : results.length === 0 ? (
          <div style={{ maxWidth: '60ch' }}>
            <p style={{ fontSize: 'var(--body-intro)', marginBottom: 12 }}>
              Nothing matches <strong>{query}</strong>.
            </p>
            <p style={{ opacity: 'var(--text-muted)' }}>
              Search covers titles, descriptions, tags and the full text of all {counts.total}{' '}
              concepts. Try a shorter or more general term.
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                alignItems: 'center',
                marginBottom: 32,
              }}
            >
              <span className="ds-label ds-label--sm ds-label--muted" style={{ marginRight: 6 }}>
                {results.length} {results.length === 1 ? 'result' : 'results'}
              </span>
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                className={`ds-chip ${!type ? 'ds-chip--solid' : 'ds-chip--outline'}`}
                style={{ textDecoration: 'none' }}
              >
                All
              </Link>
              {[...byType.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([t, n]) => (
                  <Link
                    key={t}
                    href={`/search?q=${encodeURIComponent(query)}&type=${encodeURIComponent(t)}`}
                    className={`ds-chip ${type === t ? 'ds-chip--solid' : 'ds-chip--outline'}`}
                    style={{ textDecoration: 'none' }}
                  >
                    {t} ({n})
                  </Link>
                ))}
            </div>

            <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 2 }}>
              {results.map(r => (
                <li key={r.url}>
                  <Link
                    href={r.url}
                    style={{
                      display: 'block',
                      padding: '20px 0',
                      borderBottom: '1px solid var(--hairline-faint)',
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'center',
                        marginBottom: 8,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Chip variant="outline" size="sm">
                        {r.section}
                      </Chip>
                      {r.matchedIn === 'body' && (
                        <span className="ds-label ds-label--xs ds-label--muted">
                          matched in body
                        </span>
                      )}
                    </span>
                    <span
                      className="ds-display ds-display--item"
                      style={{ display: 'block', marginBottom: 6 }}
                    >
                      {r.title}
                    </span>
                    <span
                      style={{
                        display: 'block',
                        fontSize: 'var(--body-small)',
                        lineHeight: 'var(--body-small-lh)',
                        opacity: 'var(--text-muted)',
                        maxWidth: '72ch',
                      }}
                    >
                      {r.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </div>
  );
}
