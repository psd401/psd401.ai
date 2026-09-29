import React from 'react';
import type { Metadata } from 'next';
import { DEFAULT_OG_IMAGE } from '@/lib/site';
import { Breadcrumb, SectionHeader, SectionRule } from '@/components/ds';
import ContentIndex, { type IndexItem } from '@/components/ContentIndex';
import { getAllUseCases, getCategories, getUseCaseUrl } from '@/lib/use-cases';
import JsonLd, { createBreadcrumbSchema, createCollectionSchema } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Use cases',
  description:
    'Practical examples of AI in use across Peninsula School District, submitted by staff — the task, the tool, and what came out of it.',
  alternates: { canonical: '/use-cases' },
  openGraph: { title: 'Use cases — Peninsula AI', url: '/use-cases', images: [DEFAULT_OG_IMAGE] },
};

export default async function UseCasesIndex() {
  const [useCases, categories] = await Promise.all([getAllUseCases(), getCategories()]);

  const items: IndexItem[] = useCases.map(uc => ({
    href: getUseCaseUrl(uc),
    title: uc.title,
    description: uc.description,
    // Category and tools are what people actually filter by here, so they
    // join the tag facets rather than sitting inert in the card.
    tags: [uc.category, ...(uc.tools_used ?? []), ...(uc.tags ?? [])].filter(Boolean),
    kind: uc.category,
    meta: [uc.school, uc.grade_level].filter(Boolean).join(' · '),
  }));

  return (
    <div data-section="practice">
      <JsonLd
        data={[
          createCollectionSchema({
            name: 'Use cases — Peninsula AI',
            description: 'Practical examples of AI in use across Peninsula School District.',
            url: '/use-cases',
            items: useCases.map(uc => ({
              title: uc.title,
              url: getUseCaseUrl(uc),
              description: uc.description,
            })),
          }),
          createBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Reference library', url: '/practice' },
            { name: 'Use cases', url: '/use-cases' },
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
          items={[{ label: 'Reference library', href: '/practice' }, { label: 'Use cases' }]}
        />
      </div>

      <SectionRule as="header" style={{ borderTop: 0 }}>
        <SectionHeader
          as="h1"
          title="Use cases"
          meta={`${useCases.length} across ${categories.length} categories`}
          lead="What staff actually did: the task in front of them, the tool they reached for, and what came out. Submitted by the person who did the work."
        />
        <ContentIndex items={items} variant="doc" noun="use cases" />
      </SectionRule>
    </div>
  );
}
