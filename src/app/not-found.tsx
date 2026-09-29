import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Button, SectionHeader, SectionRule } from '@/components/ds';
import { SECTIONS } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div data-section="writing">
      <SectionRule as="header">
        <SectionHeader
          as="h1"
          title="That page is not here"
          lead="The site was reorganized in 2026, and most old links redirect automatically. This one did not, and that is our mistake."
        />

        <div style={{ display: 'flex', gap: 12, marginTop: 26, flexWrap: 'wrap' }}>
          <Button variant="solid" href="/search">
            Search the site
          </Button>
          <Button variant="outline" href="/">
            Go to the homepage
          </Button>
        </div>

        <div style={{ marginTop: 44 }}>
          <div className="ds-label ds-label--sm ds-label--muted" style={{ marginBottom: 14 }}>
            The five sections
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 2 }}>
            {SECTIONS.map(s => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'baseline',
                    padding: '12px 0',
                    borderBottom: '1px solid var(--hairline-faint)',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <span className="ds-label ds-label--xs ds-label--muted">{s.n}</span>
                  <span className="ds-display ds-display--item">{s.name}</span>
                  <span
                    style={{
                      fontSize: 'var(--body-fine)',
                      opacity: 'var(--text-muted)',
                      marginLeft: 'auto',
                      textAlign: 'right',
                      maxWidth: '46ch',
                    }}
                  >
                    {s.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </SectionRule>
    </div>
  );
}
