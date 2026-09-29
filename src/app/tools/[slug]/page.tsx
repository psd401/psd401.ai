import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumb, Button, Chip, SectionRule, SpecTable } from '@/components/ds';
import MarkdownContent from '@/components/MarkdownContent';
import Related from '@/components/Related';
import { getConcept, getConcepts } from '@/lib/content';
import { formatDate } from '@/lib/format';
import JsonLd, { createBreadcrumbSchema, createToolSchema } from '@/components/JsonLd';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const tools = await getConcepts('tools');
  return tools.map(t => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getConcept('tools', slug);
  if (!tool) return { title: 'Not found', robots: { index: false, follow: false } };

  return {
    title: tool.title,
    description: tool.description,
    alternates: { canonical: tool.resource },
    keywords: tool.tags,
    openGraph: { title: tool.title, description: tool.description, url: tool.resource },
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = await getConcept('tools', slug);
  if (!tool) notFound();

  const specRows = [
    tool.provider ? { k: 'Provider', v: tool.provider } : null,
    tool.category ? { k: 'Category', v: tool.category } : null,
    tool.format ? { k: 'Kind', v: tool.format } : null,
    tool.privacy ? { k: 'Data handling', v: tool.privacy } : null,
    tool.access_type ? { k: 'Access', v: tool.access_type } : null,
    tool.maturity ? { k: 'Our use', v: tool.maturity } : null,
    { k: 'Added', v: formatDate(tool.date) },
  ].filter((r): r is { k: string; v: string } => r !== null);

  return (
    <article data-section="practice">
      <JsonLd
        data={[
          createToolSchema({
            title: tool.title,
            description: tool.description,
            url: tool.resource,
            date: tool.date,
            tags: tool.tags,
            provider: tool.provider,
            demoUrl: tool.demoUrl,
          }),
          createBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Reference library', url: '/practice' },
            { name: 'Tools', url: '/tools' },
            { name: tool.title, url: tool.resource },
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
            { label: 'Tools', href: '/tools' },
            { label: tool.title },
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
            {tool.maturity && <Chip variant="solid">{tool.maturity}</Chip>}
            {tool.privacy && <Chip variant="outline">{tool.privacy}</Chip>}
          </div>
          <h1 className="ds-display ds-display--page" style={{ marginBottom: 20 }}>
            {tool.title}
          </h1>
          <p className="ds-lead" style={{ marginBottom: 22 }}>
            {tool.description}
          </p>
          {tool.demoUrl && (
            <Button variant="outline" href={tool.demoUrl}>
              Visit {tool.title} →
            </Button>
          )}
        </div>
      </SectionRule>

      <SectionRule ground="tint" as="section" style={{ borderTop: '1px solid var(--hairline)' }}>
        <SpecTable rows={specRows} columns={2} caption={`${tool.title} details`} />
      </SectionRule>

      <div style={{ padding: '36px var(--gutter-page) 48px' }}>
        <MarkdownContent content={tool.content} />
      </div>

      <Related url={tool.resource} />
    </article>
  );
}
