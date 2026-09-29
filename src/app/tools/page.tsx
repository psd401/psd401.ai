import React from 'react';
import type { Metadata } from 'next';
import { DEFAULT_OG_IMAGE } from '@/lib/site';
import { Breadcrumb, SectionHeader, SectionRule } from '@/components/ds';
import ContentIndex, { type IndexItem } from '@/components/ContentIndex';
import { getConcepts } from '@/lib/content';
import JsonLd, { createBreadcrumbSchema, createCollectionSchema } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Tools',
  description:
    'AI tools reviewed for use in Peninsula School District — what each one does, who provides it, where the data goes, and how far we have taken it.',
  alternates: { canonical: '/tools' },
  openGraph: { title: 'Tools — Peninsula AI', url: '/tools', images: [DEFAULT_OG_IMAGE] },
};

export default async function ToolsIndex() {
  const tools = (await getConcepts('tools')).sort((a, b) => a.title.localeCompare(b.title));

  const items: IndexItem[] = tools.map(t => ({
    href: t.resource,
    title: t.title,
    description: t.description,
    tags: t.tags ?? [],
    kind: t.maturity,
    meta: t.provider,
  }));

  return (
    <div data-section="practice">
      <JsonLd
        data={[
          createCollectionSchema({
            name: 'Tools — Peninsula AI',
            description: 'AI tools reviewed for use in Peninsula School District.',
            url: '/tools',
            items: tools.map(t => ({
              title: t.title,
              url: t.resource,
              description: t.description,
            })),
          }),
          createBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Reference library', url: '/practice' },
            { name: 'Tools', url: '/tools' },
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
          items={[{ label: 'Reference library', href: '/practice' }, { label: 'Tools' }]}
        />
      </div>

      <SectionRule as="header" style={{ borderTop: 0 }}>
        <SectionHeader
          as="h1"
          title="Tools"
          meta={`${tools.length} reviewed`}
          lead="What we have looked at, who provides it, and where the data goes. A listing here is not an endorsement."
        />
        <ContentIndex items={items} variant="doc" noun="tools" />
      </SectionRule>
    </div>
  );
}
