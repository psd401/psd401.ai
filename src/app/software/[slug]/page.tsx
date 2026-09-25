import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import {
  Breadcrumb,
  BrowserFrame,
  Button,
  Chip,
  ImageFrame,
  SectionHeader,
  SectionRule,
  SpecTable,
} from '@/components/ds';
import MarkdownContent from '@/components/MarkdownContent';
import Related from '@/components/Related';
import { getConcept, getConcepts } from '@/lib/content';
import { formatDate } from '@/lib/format';
import JsonLd, { createBreadcrumbSchema, createSoftwareSchema } from '@/components/JsonLd';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const items = await getConcepts('software');
  return items.map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getConcept('software', slug);
  if (!item) return { title: 'Not found', robots: { index: false, follow: false } };

  return {
    title: item.title,
    description: item.description,
    alternates: { canonical: item.resource },
    keywords: item.tags,
    openGraph: {
      title: item.title,
      description: item.description,
      url: item.resource,
      ...(item.image ? { images: [{ url: item.image }] } : {}),
    },
    // Drafts carry unreviewed copy written from the product name alone.
    // Keep them off search results until a human has been through them.
    ...(item.status === 'draft' ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function SoftwarePage({ params }: Props) {
  const { slug } = await params;
  const item = await getConcept('software', slug);
  if (!item) notFound();

  return (
    <article data-section="software">
      <JsonLd
        data={[
          createSoftwareSchema({
            title: item.title,
            description: item.description,
            url: item.resource,
            date: item.date,
            image: item.image,
            tags: item.tags,
            repo: item.repo,
            license: item.license,
            maturity: item.maturity,
            stack: item.stack,
          }),
          createBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Software', url: '/software' },
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
        <Breadcrumb items={[{ label: '02 Software', href: '/software' }, { label: item.title }]} />
      </div>

      <div
        className="ds-split--even ds-split"
        style={{ padding: '60px var(--gutter-page) 0', gap: 56, alignItems: 'center' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Chip variant="solid">{item.status === 'draft' ? 'Draft' : item.maturity}</Chip>
            {item.license && <Chip variant="ghost">{item.license} licence</Chip>}
            <span className="ds-label ds-label--muted" style={{ textTransform: 'none' }}>
              Updated {formatDate(item.date)}
            </span>
          </div>

          <h1 className="ds-display ds-display--hero">{item.title}</h1>

          <p
            style={{
              margin: 0,
              fontSize: 'var(--body-lead)',
              lineHeight: 'var(--body-lead-lh)',
              fontWeight: 500,
              letterSpacing: '-0.012em',
              maxWidth: '36ch',
            }}
          >
            {item.description}
          </p>

          {(item.repo || item.contact) && (
            <div style={{ display: 'flex', gap: 12, paddingTop: 6, flexWrap: 'wrap' }}>
              {item.repo && (
                <Button variant="solid" size="lg" href={item.repo}>
                  Get the code
                </Button>
              )}
              {item.contact && (
                <Button variant="outline" size="lg" href={`mailto:${item.contact}`}>
                  Email us →
                </Button>
              )}
            </div>
          )}
        </div>

        {item.image && item.appUrl ? (
          // A web screenshot: show it in browser chrome with the real address.
          <BrowserFrame url={item.appUrl}>
            <Image
              src={item.image}
              alt={item.imageAlt ?? `${item.title} interface`}
              width={1200}
              height={760}
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{
                display: 'block',
                width: '100%',
                height: 380,
                objectFit: 'cover',
                objectPosition: 'top',
              }}
            />
          </BrowserFrame>
        ) : item.image ? (
          // A photograph, native app window or product asset: no fake chrome.
          <ImageFrame
            src={item.image}
            alt={item.imageAlt ?? ''}
            ratio="3/2"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : null}
      </div>

      <SectionRule as="section" style={{ marginTop: 48 }}>
        <MarkdownContent content={item.content} />
      </SectionRule>

      {item.spec && item.spec.length > 0 && (
        <SectionRule ground="tint" as="section">
          <SectionHeader title="Technical specification" size="section" />
          <div style={{ marginTop: 24 }}>
            <SpecTable rows={item.spec} caption="Technical specification" />
          </div>
        </SectionRule>
      )}

      {item.repo && (
        <SectionRule ground="strong" as="section">
          <div className="ds-split--even ds-split" style={{ gap: 48, alignItems: 'center' }}>
            <div>
              <h2 className="ds-display ds-display--block" style={{ marginBottom: 10 }}>
                Run it in your district
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 17,
                  lineHeight: 1.6,
                  opacity: 'var(--text-muted)',
                  maxWidth: '60ch',
                }}
              >
                Clone it and self-host, or email us and we will help you stand it up. We are not
                selling anything — we would rather more districts had this.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {item.repo && (
                <Button variant="solid" size="lg" href={item.repo}>
                  {item.repo.replace(/^https?:\/\//, '')}
                </Button>
              )}
              {item.contact && (
                <Button variant="outline" size="lg" href={`mailto:${item.contact}`}>
                  {item.contact}
                </Button>
              )}
            </div>
          </div>
        </SectionRule>
      )}

      <Related url={item.resource} />
    </article>
  );
}
