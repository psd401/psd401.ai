import React from 'react';
import type { Metadata } from 'next';
import {
  Button,
  DocCard,
  ImageFrame,
  PullQuote,
  SectionHeader,
  SectionRule,
} from '@/components/ds';
import { getConcepts } from '@/lib/content';
import { formatMonthYear } from '@/lib/format';
import { SECTIONS } from '@/lib/site';
import JsonLd, { createBreadcrumbSchema, createCollectionSchema } from '@/components/JsonLd';

const SECTION = SECTIONS.find(s => s.key === 'guidance')!;

export const metadata: Metadata = {
  title: 'Guidance',
  description:
    "Peninsula School District's AI guidance: principles and beliefs, rights and responsibilities, data security, and syllabus language for classrooms. Other districts are welcome to adapt it, with credit.",
  alternates: { canonical: '/guidance' },
  openGraph: { title: 'Guidance — Peninsula AI', url: '/guidance' },
};

export default async function GuidanceIndex() {
  const policies = (await getConcepts('guidance')).sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0
  );

  return (
    <div data-section="guidance">
      <JsonLd
        data={[
          createCollectionSchema({
            name: 'Guidance — Peninsula AI',
            description: SECTION.description,
            url: '/guidance',
            items: policies.map(p => ({
              title: p.title,
              url: p.resource,
              description: p.description,
            })),
          }),
          createBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Guidance', url: '/guidance' },
          ]),
        ]}
      />

      <SectionRule ground="tint" as="header">
        <div className="ds-split" style={{ gap: 48, alignItems: 'center' }}>
          <div>
            <SectionHeader
              as="h1"
              number="03"
              title="Guidance"
              meta={`${policies.length} documents`}
              lead="The guidance our own staff work from, in plain language. Other districts are welcome to adapt it, with credit to Peninsula School District."
            />
            <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
              <Button variant="outline" href="/okf">
                Get the source files
              </Button>
            </div>
          </div>
          <ImageFrame
            id="GU-01"
            ratio="4/3"
            priority
            src="/images/sections/gu-01-board-session.jpg"
            alt="A public meeting in progress, seen wide from the back of the room"
            sizes="(max-width: 768px) 100vw, 45vw"
          />
        </div>
      </SectionRule>

      <div
        style={{
          padding: '44px var(--gutter-page) 52px',
        }}
      >
        <div className="ds-grid ds-grid--2" style={{ gap: 22 }}>
          {policies.map(p => (
            <DocCard
              key={p.slug}
              href={p.resource}
              kind={p.category}
              meta={formatMonthYear(p.date)}
              title={p.title}
              description={p.description}
              actions={<span style={{ color: 'var(--sec)' }}>Read →</span>}
            />
          ))}
        </div>
      </div>

      <div style={{ padding: '0 var(--gutter-page) 52px' }}>
        {/* Verbatim from src/content/guidance/principles-and-beliefs.md. A
            quote credited to a district document must be findable in it. */}
        <PullQuote bar cite="— AI PRINCIPLES AND BELIEFS">
          All staff in the Peninsula School District must be diligent custodians of student data,
          safeguarding the privacy and security of our learners.
        </PullQuote>
      </div>
    </div>
  );
}
