import React from 'react';
import type { Metadata } from 'next';
import { DEFAULT_OG_IMAGE } from '@/lib/site';
import { Breadcrumb, SectionHeader, SectionRule } from '@/components/ds';
import ContentIndex, { type IndexItem } from '@/components/ContentIndex';
import { byDateDesc, getConcepts } from '@/lib/content';
import { formatDate } from '@/lib/format';
import JsonLd, { createBreadcrumbSchema, createCollectionSchema } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Research',
  description:
    'External research, papers and opinion on AI in education that Peninsula School District has read and summarised. Every entry links to the original.',
  alternates: { canonical: '/articles' },
  openGraph: { title: 'Research — Peninsula AI', url: '/articles', images: [DEFAULT_OG_IMAGE] },
};

export default async function ResearchIndex() {
  const research = byDateDesc(await getConcepts('articles'));

  const items: IndexItem[] = research.map(r => ({
    href: r.resource,
    title: r.title,
    description: r.description,
    tags: r.tags ?? [],
    kind: r.format,
    meta: [r.source, formatDate(r.date)].filter(Boolean).join(' · '),
    date: r.date,
  }));

  return (
    <div data-section="practice">
      <JsonLd
        data={[
          createCollectionSchema({
            name: 'Research — Peninsula AI',
            description: 'External research and articles on AI in education.',
            url: '/articles',
            items: research.map(r => ({
              title: r.title,
              url: r.resource,
              description: r.description,
            })),
          }),
          createBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Reference library', url: '/practice' },
            { name: 'Research', url: '/articles' },
          ]),
        ]}
      />

      <div
        style={{
          borderTop: 'var(--border-rule) solid var(--sec)',
          padding: '14px var(--gutter-page)',
          borderBottom: '1px solid var(--hairline-faint)',
        }}
      >
        <Breadcrumb
          items={[{ label: 'Reference library', href: '/practice' }, { label: 'Research' }]}
        />
      </div>

      <SectionRule as="header" style={{ borderTop: 0 }}>
        <SectionHeader
          as="h1"
          title="Research"
          meta={`${research.length} pieces`}
          lead="Papers, studies and opinion from outside the district that we have read. Each entry is our summary; the link goes to the original, which you should read if it matters to a decision."
        />
        <ContentIndex items={items} variant="doc" noun="research pieces" />
      </SectionRule>
    </div>
  );
}
