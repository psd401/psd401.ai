import React from 'react';
import type { Metadata } from 'next';
import { DEFAULT_OG_IMAGE } from '@/lib/site';
import { notFound } from 'next/navigation';
import { Breadcrumb, Chip, SectionRule, SpecTable } from '@/components/ds';
import MarkdownContent from '@/components/MarkdownContent';
import Related from '@/components/Related';
import { getAllUseCases, getUseCaseBySlug, getUseCaseUrl } from '@/lib/use-cases';
import { formatDate } from '@/lib/format';
import JsonLd, { createBreadcrumbSchema, createHowToSchema } from '@/components/JsonLd';

type Props = { params: Promise<{ category: string; slug: string }> };

export async function generateStaticParams() {
  const useCases = await getAllUseCases();
  // The category segment is URL-encoded in the live contract; Next encodes
  // params itself, so pass the raw value here or it double-encodes.
  return useCases.map(uc => ({ category: uc.category, slug: uc.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const useCase = await getUseCaseBySlug(decodeURIComponent(category), slug);
  if (!useCase) return { title: 'Not found', robots: { index: false, follow: false } };

  return {
    title: useCase.title,
    description: useCase.description,
    // Canonical always points at the concept's own resource, so a link that
    // arrives with a stale category segment consolidates onto one URL.
    alternates: { canonical: useCase.resource },
    keywords: useCase.tags,
    openGraph: {
      type: 'article',
      title: useCase.title,
      description: useCase.description,
      url: useCase.resource,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function UseCasePage({ params }: Props) {
  const { category, slug } = await params;
  const useCase = await getUseCaseBySlug(decodeURIComponent(category), slug);
  if (!useCase) notFound();

  const specRows = [
    useCase.subject ? { k: 'Subject', v: useCase.subject } : null,
    useCase.grade_level ? { k: 'Level', v: useCase.grade_level } : null,
    useCase.tools_used?.length ? { k: 'Tools used', v: useCase.tools_used.join(', ') } : null,
    useCase.author ? { k: 'Submitted by', v: useCase.author } : null,
    useCase.school ? { k: 'Site', v: useCase.school } : null,
    { k: 'Published', v: formatDate(useCase.date) },
  ].filter((r): r is { k: string; v: string } => r !== null);

  return (
    <article data-section="practice">
      <JsonLd
        data={[
          createHowToSchema({
            title: useCase.title,
            description: useCase.description,
            url: useCase.resource,
            date: useCase.date,
            author: useCase.author,
            tags: useCase.tags,
            tools: useCase.tools_used,
            category: useCase.category,
          }),
          createBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Reference library', url: '/practice' },
            { name: 'Use cases', url: '/use-cases' },
            { name: useCase.category, url: `/use-cases/${encodeURIComponent(useCase.category)}` },
            { name: useCase.title, url: getUseCaseUrl(useCase) },
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
            {
              label: useCase.category,
              href: `/use-cases/${encodeURIComponent(useCase.category)}`,
            },
            { label: useCase.title },
          ]}
        />
      </div>

      <SectionRule as="header" style={{ borderTop: 0 }}>
        <div className="ds-prose-measure">
          <h1 className="ds-display ds-display--page" style={{ marginBottom: 20 }}>
            {useCase.title}
          </h1>
          <p className="ds-lead" style={{ marginBottom: 20 }}>
            {useCase.description}
          </p>
          {useCase.tools_used?.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {useCase.tools_used.map(t => (
                <Chip key={t} variant="ghost" size="sm">
                  {t}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </SectionRule>

      <SectionRule ground="tint" as="section" style={{ borderTop: '1px solid var(--hairline)' }}>
        <SpecTable rows={specRows} columns={2} caption="Use case details" />
      </SectionRule>

      <div style={{ padding: '36px var(--gutter-page) 48px' }}>
        <MarkdownContent content={useCase.content} />
      </div>

      <Related url={useCase.resource} />
    </article>
  );
}
