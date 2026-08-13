import React from 'react';
import type { Metadata } from 'next';
import { SectionHeader, SectionRule, SubscribeForm } from '@/components/ds';
import ContentIndex, { type IndexItem } from '@/components/ContentIndex';
import { byDateDesc, getConcepts } from '@/lib/content';
import { SECTIONS } from '@/lib/site';
import JsonLd, { createBreadcrumbSchema, createCollectionSchema } from '@/components/JsonLd';
import { formatDate } from '@/lib/format';

const SECTION = SECTIONS.find(s => s.key === 'writing')!;

export const metadata: Metadata = {
  title: 'Writing',
  description:
    'Notes from the people doing the work — what we tried, what it cost, what we would do differently. The posts about failures are the ones other districts email us about.',
  alternates: { canonical: '/writing' },
  openGraph: { title: 'Writing — Peninsula AI', url: '/writing' },
};

export default async function WritingIndex() {
  const posts = byDateDesc(await getConcepts('writing'));

  const items: IndexItem[] = posts.map(p => ({
    href: p.resource,
    title: p.title,
    description: p.description,
    tags: p.tags ?? [],
    meta: [p.tags?.[0], formatDate(p.date)].filter(Boolean).join(' · '),
    byline: p.author,
    image: p.image,
    date: p.date,
  }));

  return (
    <div data-section="writing">
      <JsonLd
        data={[
          createCollectionSchema({
            name: 'Writing — Peninsula AI',
            description: SECTION.description,
            url: '/writing',
            items: posts.map(p => ({
              title: p.title,
              url: p.resource,
              description: p.description,
            })),
          }),
          createBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Writing', url: '/writing' },
          ]),
        ]}
      />

      <SectionRule ground="tint" as="header">
        <SectionHeader
          as="h1"
          number="01"
          title="Writing"
          meta={`${posts.length} posts`}
          lead="Notes from the people doing the work — what we tried, what it cost, what we would do differently. The posts about failures are the ones other districts email us about."
        />
      </SectionRule>

      <SectionRule as="section" style={{ borderTop: 0, paddingTop: 0 }}>
        <ContentIndex items={items} variant="post" slotPrefix="WR" noun="posts" />
      </SectionRule>

      <div
        style={{
          borderTop: '1px solid var(--hairline)',
          background: 'var(--sec-ground)',
          padding: '44px var(--gutter-page)',
        }}
      >
        <SubscribeForm blurb="One thing we built, one thing we learned, one thing we would do differently." />
      </div>
    </div>
  );
}
