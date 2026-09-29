import React from 'react';
import Link from 'next/link';
import { getRelated } from '@/lib/related';

/**
 * "Related across the site" — the block at the foot of every detail page.
 *
 * Renders nothing when there is nothing genuinely related. An empty related
 * block padded with whatever was newest would be worse than no block.
 */
export default async function Related({ url, limit = 4 }: { url: string; limit?: number }) {
  const items = await getRelated(url, limit);
  if (items.length === 0) return null;

  return (
    <section
      style={{
        borderTop: '1px solid var(--hairline)',
        padding: '36px var(--gutter-page) 44px',
      }}
      aria-labelledby="related-heading"
    >
      <h2
        id="related-heading"
        className="ds-label ds-label--lg ds-label--muted"
        style={{ marginBottom: 20, fontFamily: 'var(--font-mono)', fontWeight: 400 }}
      >
        Related across the site
      </h2>
      <div className="ds-grid ds-grid--4" style={{ gap: 20 }}>
        {items.map(item => (
          <Link
            key={item.url}
            href={item.url}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              textDecoration: 'none',
              color: 'inherit',
              borderTop: '2px solid var(--sec)',
              paddingTop: 14,
            }}
          >
            <span className="ds-label ds-label--xs ds-label--sec">{item.section}</span>
            <span className="ds-display ds-display--item">{item.title}</span>
            <span
              style={{
                fontSize: 'var(--body-fine)',
                lineHeight: 1.55,
                opacity: 'var(--text-muted)',
              }}
            >
              {item.description.length > 120
                ? `${item.description.slice(0, 117)}…`
                : item.description}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
