import React from 'react';
import type { Metadata } from 'next';
import { SectionHeader, SectionRule } from '@/components/ds';
import ContentIndex, { type IndexItem } from '@/components/ContentIndex';
import { byDateDesc, getConcepts } from '@/lib/content';
import { formatDate } from '@/lib/format';
import { DEFAULT_OG_IMAGE, SECTIONS } from '@/lib/site';
import JsonLd, { createBreadcrumbSchema, createCollectionSchema } from '@/components/JsonLd';

const SECTION = SECTIONS.find(s => s.key === 'presentations')!;

export const metadata: Metadata = {
  title: 'Presentations',
  description:
    'Talks, workshops and board sessions on AI in K-12 education from Peninsula School District, each with its slides.',
  alternates: { canonical: '/presentations' },
  openGraph: {
    title: 'Presentations — Peninsula AI',
    url: '/presentations',
    images: [DEFAULT_OG_IMAGE],
  },
};

export default async function PresentationsIndex() {
  const presentations = byDateDesc(await getConcepts('presentations'));

  const items: IndexItem[] = presentations.map(p => ({
    href: p.resource,
    title: p.title,
    description: p.description,
    tags: p.tags ?? [],
    kind: p.format,
    meta: formatDate(p.date),
    date: p.date,
  }));

  return (
    <div data-section="presentations">
      <JsonLd
        data={[
          createCollectionSchema({
            name: 'Presentations — Peninsula AI',
            description: SECTION.description,
            url: '/presentations',
            items: presentations.map(p => ({
              title: p.title,
              url: p.resource,
              description: p.description,
            })),
          }),
          createBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Presentations', url: '/presentations' },
          ]),
        ]}
      />

      <SectionRule ground="tint" as="header">
        <SectionHeader
          as="h1"
          number="04"
          title="Presentations"
          meta={`${presentations.length} talks`}
          lead="Conference sessions, workshops, professional learning and board presentations, each with its slides, and most with a short summary."
        />
      </SectionRule>

      <SectionRule as="section" style={{ borderTop: 0, paddingTop: 0 }}>
        <ContentIndex items={items} variant="doc" noun="talks" />
      </SectionRule>
    </div>
  );
}
