import React from 'react';
import type { Metadata } from 'next';
import { ImageFrame, SectionHeader, SectionRule } from '@/components/ds';
import ContentIndex, { type IndexItem } from '@/components/ContentIndex';
import { getConcepts } from '@/lib/content';
import { SECTIONS } from '@/lib/site';
import JsonLd, { createBreadcrumbSchema, createCollectionSchema } from '@/components/JsonLd';

const SECTION = SECTIONS.find(s => s.key === 'software')!;

export const metadata: Metadata = {
  title: 'Software',
  description:
    'Products Peninsula School District builds and runs, all open source. Built by district staff for district problems — clone them or ask us to help you stand one up.',
  alternates: { canonical: '/software' },
  openGraph: { title: 'Software — Peninsula AI', url: '/software' },
};

const MATURITY_RANK: Record<string, number> = { Production: 0, Pilot: 1, Beta: 2, Retired: 3 };

export default async function SoftwareIndex() {
  const software = (await getConcepts('software')).sort(
    (a, b) =>
      (MATURITY_RANK[a.maturity] ?? 9) - (MATURITY_RANK[b.maturity] ?? 9) ||
      a.title.localeCompare(b.title)
  );

  const items: IndexItem[] = software.map(s => ({
    href: s.resource,
    title: s.title,
    description: s.description,
    tags: s.tags ?? [],
    meta: s.stack,
    status: s.status === 'draft' ? 'DRAFT' : s.maturity.toUpperCase(),
  }));

  const inProduction = software.filter(s => s.maturity === 'Production').length;

  return (
    <div data-section="software">
      <JsonLd
        data={[
          createCollectionSchema({
            name: 'Software — Peninsula AI',
            description: SECTION.description,
            url: '/software',
            items: software.map(s => ({
              title: s.title,
              url: s.resource,
              description: s.description,
            })),
          }),
          createBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Software', url: '/software' },
          ]),
        ]}
      />

      <SectionRule ground="tint" as="header">
        <div className="ds-split" style={{ gap: 48, alignItems: 'center' }}>
          <SectionHeader
            as="h1"
            number="02"
            title="Software we build"
            meta={`${inProduction} in production of ${software.length}`}
            lead="Built by district staff for district problems, then published so another district can run the same thing. We are not selling anything — clone it and self-host, or email us and we will help you stand it up."
          />
          <ImageFrame
            id="PD-01"
            ratio="3/2"
            priority
            src="/images/software/pd-01-studio-in-use.jpg"
            alt="Two staff members looking at a laptop together in a classroom after hours"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </div>
      </SectionRule>

      <SectionRule as="section" style={{ borderTop: 0, paddingTop: 0 }}>
        <ContentIndex items={items} variant="product" noun="products" />
      </SectionRule>
    </div>
  );
}
