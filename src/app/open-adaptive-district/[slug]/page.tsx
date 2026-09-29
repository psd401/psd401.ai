import React from 'react';
import type { Metadata } from 'next';
import { DEFAULT_OG_IMAGE } from '@/lib/site';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumb, ImageFrame, SectionRule } from '@/components/ds';
import OadCopyButtons from '@/components/OadCopyButtons';
import { getOadDoc, getOadDocs, getOadSeries } from '@/lib/oad';
import JsonLd, { createArticleSchema, createBreadcrumbSchema } from '@/components/JsonLd';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const docs = await getOadDocs();
  return docs.map(d => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getOadDoc(slug);
  if (!doc) return { title: 'Not found', robots: { index: false, follow: false } };

  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: doc.resource },
    openGraph: {
      type: 'article',
      title: doc.title,
      description: doc.description,
      url: doc.resource,
      images: [doc.image ? { url: doc.image } : DEFAULT_OG_IMAGE],
    },
  };
}

/**
 * An Open Adaptive District document, rendered inside the site.
 *
 * The HTML comes from src/content/open-adaptive-district/<slug>.md through
 * renderOadHtml in src/lib/oad.ts — the same HTML the printable copy at
 * /openadaptivedistrict/<printable> serves. The five documents of the series
 * get a previous/next pager; the action plan (no `n`) does not.
 */
export default async function OadDocPage({ params }: Props) {
  const { slug } = await params;
  const doc = await getOadDoc(slug);
  if (!doc) notFound();

  const crumb = doc.n ? `${doc.n} ${doc.title}` : doc.label;

  return (
    <article data-section="oad">
      <JsonLd
        data={[
          createArticleSchema({
            title: doc.title,
            description: doc.description,
            url: doc.resource,
            date: doc.date,
          }),
          createBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Open Adaptive District', url: '/open-adaptive-district' },
            { name: doc.n ? doc.title : doc.label, url: doc.resource },
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
          items={[
            { label: '05 Open Adaptive District', href: '/open-adaptive-district' },
            { label: crumb },
          ]}
        />
      </div>

      <SectionRule as="section" style={{ borderTop: 0 }}>
        {doc.image && (
          <div style={{ maxWidth: 'var(--measure-prose)', marginBottom: 40 }}>
            <ImageFrame
              ratio="3/2"
              priority
              src={doc.image}
              alt={doc.imageAlt ?? ''}
              sizes="(max-width: 768px) 100vw, 720px"
            />
          </div>
        )}
        {/* SAFE: doc.html is rendered at build time from markdown committed to
            this repository (src/content/open-adaptive-district/). It is never
            user input and never fetched at runtime. */}
        <div
          className={doc.layout === 'plan' ? 'oad-doc oad-plan' : 'oad-doc'}
          dangerouslySetInnerHTML={{ __html: doc.html }}
        />
        <OadCopyButtons />

        {doc.printable && (
          <p className="ds-label ds-label--sm ds-label--muted" style={{ marginTop: 40 }}>
            <a href={`/openadaptivedistrict/${doc.printable}`} style={{ color: 'var(--sec)' }}>
              Open the printable version
            </a>
          </p>
        )}
      </SectionRule>

      {doc.n && <OadPager slug={doc.slug} />}
    </article>
  );
}

/** Previous / next through the five documents, in reading order. */
async function OadPager({ slug }: { slug: string }) {
  const series = await getOadSeries();
  const i = series.findIndex(d => d.slug === slug);
  const prev = i > 0 ? series[i - 1] : null;
  const next = i >= 0 && i < series.length - 1 ? series[i + 1] : null;

  return (
    <nav
      aria-label="Open Adaptive District documents"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 20,
        borderTop: '1px solid var(--hairline)',
        padding: '28px var(--gutter-page) 44px',
      }}
    >
      <div>
        {prev && (
          <Link href={prev.resource} style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="ds-label ds-label--xs ds-label--muted" style={{ display: 'block' }}>
              ← Previous
            </span>
            <span className="ds-display ds-display--item">
              {prev.n} {prev.title}
            </span>
          </Link>
        )}
      </div>
      <div style={{ textAlign: 'right' }}>
        {next && (
          <Link href={next.resource} style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="ds-label ds-label--xs ds-label--muted" style={{ display: 'block' }}>
              Next →
            </span>
            <span className="ds-display ds-display--item">
              {next.n} {next.title}
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}
