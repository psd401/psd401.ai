'use client';

/**
 * The filterable index used by every section landing page.
 *
 * Before the redesign each section shipped its own near-identical client
 * component (blog-client, tools-client, articles-client, presentations-client,
 * use-cases-client) — five copies of the same chip filter. This is the one
 * copy.
 *
 * It is a client component because filtering is interactive, but the items
 * are rendered from data passed down by a server component, so the markdown
 * parsing and file reads stay on the server.
 *
 * The chips are real <button>s with aria-pressed, not styled divs — the
 * previous implementation used HeroUI Chips that keyboard users could not
 * operate.
 */
import React from 'react';
import { Chip, DocCard, PostCard, ProductCard } from '@/components/ds';

export type IndexItem = {
  href: string;
  title: string;
  description: string;
  tags: string[];
  /** Mono kicker — a date, a category, a stack line. */
  meta?: string;
  /** Left-hand label on a DocCard. */
  kind?: string;
  /** Byline under a PostCard. */
  byline?: string;
  image?: string;
  /** Status label for a ProductCard. */
  status?: string;
  /** Sort key, ISO date. */
  date?: string;
};

type Props = {
  items: IndexItem[];
  variant: 'post' | 'doc' | 'product';
  /** Fallback ImageFrame slot prefix, e.g. 'WR'. Post variant only. */
  slotPrefix?: string;
  /** Noun for the "All N" chip and the empty state, e.g. 'posts'. */
  noun: string;
};

export default function ContentIndex({ items, variant, slotPrefix, noun }: Props) {
  const [active, setActive] = React.useState<string | null>(null);

  const tags = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      for (const t of item.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag]) => tag);
  }, [items]);

  const shown = active ? items.filter(i => i.tags.includes(active)) : items;

  return (
    <>
      {tags.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            marginTop: 26,
          }}
        >
          <span className="ds-label ds-label--sm ds-label--muted" style={{ marginRight: 6 }}>
            Filter
          </span>
          <button
            type="button"
            className={`ds-chip ${active === null ? 'ds-chip--solid' : 'ds-chip--outline'}`}
            aria-pressed={active === null}
            onClick={() => setActive(null)}
          >
            All {items.length}
          </button>
          {tags.map(tag => (
            <button
              key={tag}
              type="button"
              className={`ds-chip ${active === tag ? 'ds-chip--solid' : 'ds-chip--outline'}`}
              aria-pressed={active === tag}
              onClick={() => setActive(active === tag ? null : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <div aria-live="polite" className="sr-only">
        {shown.length} {noun} shown{active ? `, filtered by ${active}` : ''}
      </div>

      {shown.length === 0 ? (
        <p style={{ marginTop: 40, opacity: 'var(--text-muted)' }}>No {noun} match that filter.</p>
      ) : (
        <div
          className={variant === 'post' ? 'ds-grid ds-grid--3' : 'ds-grid ds-grid--2'}
          style={{ gap: variant === 'post' ? 30 : 22, marginTop: 32 }}
        >
          {shown.map((item, i) => {
            if (variant === 'post') {
              return (
                <PostCard
                  key={item.href}
                  href={item.href}
                  title={item.title}
                  meta={item.meta}
                  excerpt={item.description}
                  byline={item.byline}
                  priority={i < 3}
                  image={
                    item.image
                      ? { src: item.image, alt: '' }
                      : {
                          id: `${slotPrefix ?? 'IMG'}-${String(i + 1).padStart(2, '0')}`,
                          brief: item.title,
                        }
                  }
                />
              );
            }
            if (variant === 'product') {
              return (
                <ProductCard
                  key={item.href}
                  href={item.href}
                  name={item.title}
                  line={item.description}
                  stack={item.meta}
                  status={item.status}
                />
              );
            }
            return (
              <DocCard
                key={item.href}
                href={item.href}
                kind={item.kind}
                meta={item.meta}
                title={item.title}
                description={item.description}
                actions={
                  item.tags.length ? (
                    <>
                      {item.tags.slice(0, 3).map(t => (
                        <Chip key={t} size="sm" variant="outline">
                          {t}
                        </Chip>
                      ))}
                    </>
                  ) : undefined
                }
              />
            );
          })}
        </div>
      )}
    </>
  );
}
