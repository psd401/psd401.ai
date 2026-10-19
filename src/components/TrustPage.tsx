import React from 'react';
import type { Metadata } from 'next';
import { SectionRule } from '@/components/ds';
import MarkdownContent from '@/components/MarkdownContent';
import JsonLd, { createBreadcrumbSchema, createWebPageSchema } from '@/components/JsonLd';
import { DEFAULT_OG_IMAGE, SITE_NAME } from '@/lib/site';
import { TRUST_PAGES, type TrustPageKey } from '@/lib/trust-pages';

/**
 * /about, /contact and /privacy. The body is the same markdown an agent gets
 * from these URLs with `Accept: text/markdown` (src/lib/trust-pages.ts).
 *
 * `data-section="practice"` maps to --ink: these pages belong to no section
 * and must not borrow one's colour.
 */
export function trustPageMetadata(key: TrustPageKey): Metadata {
  const page = TRUST_PAGES[key];
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      type: 'website',
      title: `${page.title} — ${SITE_NAME}`,
      description: page.description,
      url: page.path,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default function TrustPage({ page: key }: { page: TrustPageKey }) {
  const page = TRUST_PAGES[key];

  return (
    <article data-section="practice">
      <JsonLd
        data={[
          createWebPageSchema({ name: page.title, description: page.description, url: page.path }),
          createBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: page.title, url: page.path },
          ]),
        ]}
      />

      <SectionRule as="header">
        <div className="ds-prose-measure">
          <h1 className="ds-display ds-display--page" style={{ marginBottom: 20 }}>
            {page.title}
          </h1>
          <p className="ds-lead">{page.description}</p>
        </div>
      </SectionRule>

      <div style={{ padding: '20px var(--gutter-page) 48px' }}>
        <MarkdownContent content={page.body} />
      </div>
    </article>
  );
}
