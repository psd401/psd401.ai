import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumb, SectionRule } from '@/components/ds';
import { getOadArtifact, getOadArtifacts } from '@/lib/oad';
import JsonLd, { createArticleSchema, createBreadcrumbSchema } from '@/components/JsonLd';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const artifacts = await getOadArtifacts();
  return artifacts.map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getOadArtifact(slug);
  if (!doc) return { title: 'Not found', robots: { index: false, follow: false } };

  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: `/open-adaptive-district/${doc.slug}` },
    openGraph: {
      type: 'article',
      title: doc.title,
      description: doc.description,
      url: `/open-adaptive-district/${doc.slug}`,
    },
  };
}

/**
 * An Open Adaptive District artefact, rendered inside the site.
 *
 * The document's authored HTML is injected as-is; only its own header and
 * mini-nav are dropped, replaced by the real masthead, breadcrumb and footer.
 * The markup is ours, written by district staff and committed to this
 * repository — it is not user input.
 *
 * The self-contained static file stays available at its original .html URL for
 * printing and direct download, and points its canonical here.
 */
export default async function OadArtifactPage({ params }: Props) {
  const { slug } = await params;
  const doc = await getOadArtifact(slug);
  if (!doc) notFound();

  const url = `/open-adaptive-district/${doc.slug}`;

  return (
    <article data-section="oad">
      <JsonLd
        data={[
          createArticleSchema({
            title: doc.title,
            description: doc.description,
            url,
          }),
          createBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Open Adaptive District', url: '/open-adaptive-district' },
            { name: doc.title, url },
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
            { label: `${doc.n} ${doc.title}` },
          ]}
        />
      </div>

      <SectionRule as="section" style={{ borderTop: 0 }}>
        {/* SAFE: doc.html is authored markup read from this repository at
            build time (public/openadaptivedistrict/*.html). It is never user
            input and never fetched at runtime. */}
        <div className="oad-doc" dangerouslySetInnerHTML={{ __html: doc.html }} />

        <p className="ds-label ds-label--sm ds-label--muted" style={{ marginTop: 40 }}>
          <a href={`/openadaptivedistrict/${doc.file}`} style={{ color: 'var(--sec)' }}>
            Open the standalone version
          </a>{' '}
          — self-contained, and formatted for printing.
        </p>
      </SectionRule>

      <OadPager slug={doc.slug} />
    </article>
  );
}

/** Previous / next through the five artefacts, in reading order. */
async function OadPager({ slug }: { slug: string }) {
  const all = await getOadArtifacts();
  const i = all.findIndex(a => a.slug === slug);
  const prev = i > 0 ? all[i - 1] : null;
  const next = i < all.length - 1 ? all[i + 1] : null;

  return (
    <nav
      aria-label="Artefacts"
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
          <Link
            href={`/open-adaptive-district/${prev.slug}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
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
          <Link
            href={`/open-adaptive-district/${next.slug}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
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
