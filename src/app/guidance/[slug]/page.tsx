import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumb, Chip, SectionRule } from '@/components/ds';
import MarkdownContent from '@/components/MarkdownContent';
import Related from '@/components/Related';
import { getConcept, getConcepts } from '@/lib/content';
import { formatDate } from '@/lib/format';
import JsonLd, { createArticleSchema, createBreadcrumbSchema } from '@/components/JsonLd';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const policies = await getConcepts('guidance');
  return policies.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const policy = await getConcept('guidance', slug);
  if (!policy) return { title: 'Not found', robots: { index: false, follow: false } };

  return {
    title: policy.title,
    description: policy.description,
    alternates: { canonical: policy.resource },
    keywords: policy.tags,
    openGraph: {
      type: 'article',
      title: policy.title,
      description: policy.description,
      url: policy.resource,
      publishedTime: policy.date,
    },
  };
}

export default async function GuidancePage({ params }: Props) {
  const { slug } = await params;
  const policy = await getConcept('guidance', slug);
  if (!policy) notFound();

  return (
    <article data-section="guidance">
      <JsonLd
        data={[
          createArticleSchema({
            title: policy.title,
            description: policy.description,
            url: policy.resource,
            date: policy.date,
            tags: policy.tags,
          }),
          createBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Guidance', url: '/guidance' },
            { name: policy.title, url: policy.resource },
          ]),
        ]}
      />

      <div
        style={{
          borderTop: 'var(--border-rule) solid var(--sec)',
          background: 'var(--sec-ground)',
          padding: '14px var(--gutter-page)',
          borderBottom: '1px solid var(--hairline-faint)',
        }}
      >
        <Breadcrumb
          items={[{ label: '03 Guidance', href: '/guidance' }, { label: policy.title }]}
        />
      </div>

      <SectionRule as="header" style={{ borderTop: 0 }}>
        <div className="ds-prose-measure">
          <div
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              marginBottom: 18,
              flexWrap: 'wrap',
            }}
          >
            {policy.category && <Chip variant="solid">{policy.category}</Chip>}
            <span className="ds-label ds-label--muted" style={{ textTransform: 'none' }}>
              Last revised {formatDate(policy.date)}
            </span>
          </div>
          <h1 className="ds-display ds-display--page" style={{ marginBottom: 20 }}>
            {policy.title}
          </h1>
          <p className="ds-lead" style={{ marginBottom: 18 }}>
            {policy.description}
          </p>
          <div className="ds-label ds-label--sm ds-label--muted">
            <a href={`${policy.resource}.md`} style={{ color: 'var(--sec)' }}>
              Read as markdown
            </a>{' '}
            · Licensed CC BY-NC-SA 4.0 — fork it
          </div>
        </div>
      </SectionRule>

      <div style={{ padding: '20px var(--gutter-page) 48px' }}>
        <MarkdownContent content={policy.content} />
      </div>

      <Related url={policy.resource} />
    </article>
  );
}
