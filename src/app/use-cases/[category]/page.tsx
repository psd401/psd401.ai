import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumb, DocCard, SectionHeader, SectionRule } from '@/components/ds';
import { getCategories, getUseCasesByCategory, getUseCaseUrl } from '@/lib/use-cases';
import JsonLd, { createBreadcrumbSchema, createCollectionSchema } from '@/components/JsonLd';

type Props = { params: Promise<{ category: string }> };

/**
 * A category index. New in the redesign — before it, /use-cases/<category>
 * with no slug was a 404 even though the segment appeared in every use-case
 * URL, so anyone truncating a link landed on nothing.
 */
export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map(c => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const name = decodeURIComponent(category);
  const items = await getUseCasesByCategory(category);
  if (items.length === 0) return { title: 'Not found', robots: { index: false, follow: false } };

  return {
    title: name,
    description: `${items.length} Peninsula School District use cases in ${name}.`,
    alternates: { canonical: `/use-cases/${category}` },
  };
}

export default async function UseCaseCategory({ params }: Props) {
  const { category } = await params;
  const name = decodeURIComponent(category);
  const items = await getUseCasesByCategory(category);
  if (items.length === 0) notFound();

  const url = `/use-cases/${category}`;

  return (
    <div data-section="practice">
      <JsonLd
        data={[
          createCollectionSchema({
            name,
            description: `Peninsula School District use cases in ${name}.`,
            url,
            items: items.map(uc => ({
              title: uc.title,
              url: getUseCaseUrl(uc),
              description: uc.description,
            })),
          }),
          createBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Reference library', url: '/practice' },
            { name: 'Use cases', url: '/use-cases' },
            { name, url },
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
          items={[
            { label: 'Reference library', href: '/practice' },
            { label: 'Use cases', href: '/use-cases' },
            { label: name },
          ]}
        />
      </div>

      <SectionRule as="header" style={{ borderTop: 0 }}>
        <SectionHeader as="h1" title={name} meta={`${items.length} use cases`} />
        <div className="ds-grid ds-grid--2" style={{ gap: 22, marginTop: 32 }}>
          {items.map(uc => (
            <DocCard
              key={uc.slug}
              href={getUseCaseUrl(uc)}
              kind={uc.subject}
              meta={[uc.school, uc.grade_level].filter(Boolean).join(' · ')}
              title={uc.title}
              description={uc.description}
              accent="thin"
            />
          ))}
        </div>
      </SectionRule>
    </div>
  );
}
