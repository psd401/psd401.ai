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
    "Peninsula School District's AI policy documents: principles and beliefs, rights and responsibilities, data security guidance, and classroom-ready syllabus language. Published in Markdown and licensed so other districts can fork them.",
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
              lead="The documents our own staff work from. Written in plain language, published in Markdown as well as on the page, and licensed so you can fork them and put your district's name on them."
            />
            <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
              <Button variant="solid" href="/okf">
                Download all as a pack
              </Button>
              <Button variant="outline" href="/open-adaptive-district">
                How to adapt these →
              </Button>
            </div>
          </div>
          {/* Standing in for GU-01, which wants a real photograph of a board
              work session — see docs/image-shoot-list.md. */}
          <ImageFrame
            id="GU-01"
            ratio="4/3"
            priority
            src="/images/sections/hp-03-policy-document.jpg"
            alt="A printed policy document on a table, annotated in blue ballpoint with margin notes"
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
              actions={
                <>
                  <span style={{ color: 'var(--sec)' }}>Read →</span>
                  <span style={{ opacity: 0.55 }}>Markdown</span>
                </>
              }
            />
          ))}
        </div>
      </div>

      <div style={{ padding: '0 var(--gutter-page) 52px' }}>
        <PullQuote bar cite="— AI PRINCIPLES & BELIEFS">
          We will not use AI to make a decision about a student that we would not be willing to
          explain to that student&rsquo;s family, in person, in plain language.
        </PullQuote>
      </div>
    </div>
  );
}
