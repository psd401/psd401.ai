import React from 'react';
import type { Metadata } from 'next';
import { DEFAULT_OG_IMAGE } from '@/lib/site';
import { notFound } from 'next/navigation';
import { Breadcrumb, Chip, SectionRule, SpecTable } from '@/components/ds';
import MarkdownContent from '@/components/MarkdownContent';
import Related from '@/components/Related';
import { getConcept, getConcepts } from '@/lib/content';
import { formatDate } from '@/lib/format';
import JsonLd, { createBreadcrumbSchema, createPresentationSchema } from '@/components/JsonLd';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const items = await getConcepts('presentations');
  return items.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getConcept('presentations', slug);
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
      images: [item.thumbnail ? { url: item.thumbnail } : DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: item.title,
      description: item.description,
      ...(item.thumbnail ? { images: [item.thumbnail] } : {}),
    },
  };
}

export default async function PresentationPage({ params }: Props) {
  const { slug } = await params;
  const item = await getConcept('presentations', slug);
  if (!item) notFound();

  const specRows = [
    item.format ? { k: 'Format', v: item.format } : null,
    item.audience ? { k: 'Audience', v: item.audience } : null,
    item.presenters?.length ? { k: 'Presenters', v: item.presenters.join(', ') } : null,
    { k: 'Given', v: formatDate(item.date) },
  ].filter((r): r is { k: string; v: string } => r !== null);

  return (
    <article data-section="presentations">
      <JsonLd
        data={[
          createPresentationSchema({
            title: item.title,
            description: item.description,
            url: item.resource,
            date: item.date,
            image: item.thumbnail,
            tags: item.tags,
            presenters: item.presenters,
            audience: item.audience,
            format: item.format,
            slides: item.slides,
          }),
          createBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Presentations', url: '/presentations' },
            { name: item.title, url: item.resource },
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
          items={[{ label: '03 Presentations', href: '/presentations' }, { label: item.title }]}
        />
      </div>

      <SectionRule as="header" style={{ borderTop: 0 }}>
        <div style={{ maxWidth: '860px' }}>
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
            <span className="ds-label ds-label--muted" style={{ textTransform: 'none' }}>
              {formatDate(item.date)}
            </span>
          </div>
          <h1 className="ds-display ds-display--page" style={{ marginBottom: 20 }}>
            {item.title}
          </h1>
          <p className="ds-lead">{item.description}</p>
        </div>
      </SectionRule>

      {item.slides && (
        <div style={{ padding: '0 var(--gutter-page) 8px' }}>
          <div
            style={{
              border: '1px solid var(--hairline)',
              position: 'relative',
              width: '100%',
              aspectRatio: '16/9',
            }}
          >
            <iframe
              src={item.slides}
              title={`Slides — ${item.title}`}
              allowFullScreen
              loading="lazy"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
            />
          </div>
          <p className="ds-label ds-label--sm" style={{ marginTop: 10 }}>
            <a
              href={item.slides}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--sec)' }}
            >
              Open the slides in a new tab →
            </a>
          </p>
        </div>
      )}

      <SectionRule ground="tint" as="section" style={{ marginTop: 36 }}>
        <SpecTable rows={specRows} columns={2} caption="Presentation details" />
      </SectionRule>

      <div style={{ padding: '36px var(--gutter-page) 48px' }}>
        <MarkdownContent content={item.content} />
      </div>

      <Related url={item.resource} />
    </article>
  );
}
