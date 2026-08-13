import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumb, Button, Chip, SectionRule } from '@/components/ds';
import MarkdownContent from '@/components/MarkdownContent';
import Related from '@/components/Related';
import { getConcept, getConcepts } from '@/lib/content';
import { formatDate } from '@/lib/format';
import JsonLd, { createBreadcrumbSchema, createResearchSchema } from '@/components/JsonLd';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const items = await getConcepts('articles');
  return items.map(r => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getConcept('articles', slug);
  if (!item) return { title: 'Not found', robots: { index: false, follow: false } };

  return {
    title: item.title,
    description: item.description,
    alternates: { canonical: item.resource },
    keywords: item.tags,
    openGraph: {
      type: 'article',
      title: item.title,
      description: item.description,
      url: item.resource,
      publishedTime: item.date,
    },
  };
}

export default async function ResearchPage({ params }: Props) {
  const { slug } = await params;
  const item = await getConcept('articles', slug);
  if (!item) notFound();

  return (
    <article data-section="practice">
      <JsonLd
        data={[
          createResearchSchema({
            title: item.title,
            description: item.description,
            url: item.resource,
            date: item.date,
            author: item.author,
            tags: item.tags,
            source: item.source,
            externalUrl: item.externalUrl,
            format: item.format,
          }),
          createBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Reference library', url: '/practice' },
            { name: 'Research', url: '/articles' },
            { name: item.title, url: item.resource },
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
            { label: 'Research', href: '/articles' },
            { label: item.title },
          ]}
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
            {item.format && <Chip variant="solid">{item.format}</Chip>}
            {item.source && <Chip variant="outline">{item.source}</Chip>}
            <span className="ds-label ds-label--muted" style={{ textTransform: 'none' }}>
              {formatDate(item.date)}
            </span>
          </div>
          <h1 className="ds-display ds-display--page" style={{ marginBottom: 20 }}>
            {item.title}
          </h1>
          {item.author && (
            <p className="ds-label ds-label--sm ds-label--muted" style={{ marginBottom: 20 }}>
              {item.author}
            </p>
          )}
          {item.externalUrl && (
            <>
              <Button variant="solid" href={item.externalUrl}>
                Read the original →
              </Button>
              <p
                style={{
                  marginTop: 14,
                  fontSize: 'var(--body-fine)',
                  opacity: 'var(--text-muted)',
                  maxWidth: '58ch',
                }}
              >
                What follows is our summary, written for district staff. It is not the paper. If
                this is going to inform a decision, read the original.
              </p>
            </>
          )}
        </div>
      </SectionRule>

      <div style={{ padding: '20px var(--gutter-page) 48px' }}>
        <MarkdownContent content={item.content} />
      </div>

      <Related url={item.resource} />
    </article>
  );
}
