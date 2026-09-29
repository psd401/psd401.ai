import React from 'react';
import type { Metadata } from 'next';
import { CodeBlock, SectionHeader, SectionRule, SpecTable, StatCell } from '@/components/ds';
import { getAllConcepts } from '@/lib/all-content';
import { OKF_VERSION } from '@/lib/okf';
import { DIR_TO_TYPE, type ContentDir } from '@/lib/schemas';
import { DEFAULT_OG_IMAGE, SITE_URL } from '@/lib/site';
import JsonLd, { createBreadcrumbSchema, createWebPageSchema } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Open Knowledge bundle',
  description:
    'Everything Peninsula School District publishes about AI, as an Open Knowledge Format bundle an agent can read without a custom integration.',
  alternates: { canonical: '/okf' },
  openGraph: {
    title: 'Open Knowledge bundle — Peninsula AI',
    url: '/okf',
    images: [DEFAULT_OG_IMAGE],
  },
};

const DIR_LABELS: Record<ContentDir, string> = {
  writing: 'Writing',
  software: 'Software',
  guidance: 'Guidance',
  presentations: 'Presentations',
  'open-adaptive-district': 'Open Adaptive District',
  'use-cases': 'Use cases',
  tools: 'Tools',
  articles: 'Research',
};

export default async function OkfPage() {
  const concepts = await getAllConcepts();

  const byDir = new Map<ContentDir, number>();
  for (const c of concepts) byDir.set(c.dir, (byDir.get(c.dir) ?? 0) + 1);

  return (
    <div data-section="software">
      <JsonLd
        data={[
          createWebPageSchema({
            name: 'Open Knowledge bundle',
            description: `Peninsula School District's content as an OKF v${OKF_VERSION} bundle.`,
            url: '/okf',
          }),
          createBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Open Knowledge bundle', url: '/okf' },
          ]),
        ]}
      />

      <SectionRule as="header">
        <SectionHeader
          as="h1"
          title="Open Knowledge bundle"
          meta={`OKF v${OKF_VERSION}`}
          lead="Every post, product page, guidance document, presentation, Open Adaptive District document, use case, tool review and research summary on this site is published as an Open Knowledge Format bundle: a directory of markdown files with typed frontmatter. These are the same files the website renders, so what an agent reads and what a reader sees stay the same."
        />
      </SectionRule>

      <div className="ds-statband">
        <div>
          <StatCell value={concepts.length} label="Concepts in the bundle" />
        </div>
        <div>
          <StatCell value={Object.keys(DIR_TO_TYPE).length} label="Directories" />
        </div>
        <div>
          <StatCell value={new Set(concepts.map(c => c.type)).size} label="Concept types" />
        </div>
        <div>
          <StatCell value={`v${OKF_VERSION}`} label="Format version" />
        </div>
      </div>

      <SectionRule as="section">
        <SectionHeader title="Read it" size="section" />
        <div style={{ marginTop: 24, display: 'grid', gap: 18, maxWidth: 860 }}>
          <CodeBlock label="Whole bundle, over git">
            {`git clone https://github.com/psd401/psd401.ai
cd psd401.ai/src/content   # this is the bundle root`}
          </CodeBlock>

          <CodeBlock label="Over HTTP">
            {`${SITE_URL}/okf/index.md              # bundle root, carries okf_version
${SITE_URL}/okf/writing/index.md      # one directory's listing
${SITE_URL}/okf/writing/<slug>.md     # one concept
${SITE_URL}/api/content.json          # every concept as JSON, no bodies
${SITE_URL}/llms-full.txt             # every concept, full text, one file`}
          </CodeBlock>

          <p
            style={{ fontSize: 'var(--body-small)', lineHeight: 1.6, opacity: 'var(--text-muted)' }}
          >
            Any of those pages also serves its own markdown: append{' '}
            <code style={{ fontFamily: 'var(--font-mono)' }}>.md</code> to its URL.
          </p>
        </div>
      </SectionRule>

      <SectionRule ground="tint" as="section">
        <SectionHeader title="What is in it" size="section" />
        <div style={{ marginTop: 24 }}>
          <SpecTable
            columns={1}
            caption="Bundle contents"
            rows={(Object.keys(DIR_TO_TYPE) as ContentDir[]).map(dir => ({
              k: DIR_LABELS[dir],
              v: (
                <>
                  <a href={`/okf/${dir}/index.md`} style={{ color: 'var(--sec)' }}>
                    /{dir}/
                  </a>{' '}
                  — {byDir.get(dir) ?? 0} concepts of type{' '}
                  <code style={{ fontFamily: 'var(--font-mono)' }}>{DIR_TO_TYPE[dir]}</code>
                </>
              ),
            }))}
          />
        </div>
      </SectionRule>

      <SectionRule as="section">
        <SectionHeader title="Conventions" size="section" />
        <div style={{ marginTop: 24 }}>
          <SpecTable
            columns={2}
            caption="Bundle conventions"
            rows={[
              {
                k: 'Required field',
                v: "Every concept carries a non-empty `type`. That is OKF's only hard requirement.",
              },
              { k: 'resource', v: "The concept's canonical URL path on this site." },
              {
                k: 'Cross-links',
                v: 'Bundle-absolute, e.g. /writing/my-post.md — they survive a document moving.',
              },
              {
                k: 'status',
                v: 'draft | stable | deprecated. Draft means the copy has not been reviewed; treat it as a placeholder.',
              },
              {
                k: 'generated / verified',
                v: 'Who wrote a concept and who checked it. An actor prefixed `human:` means a person reviewed it.',
              },
              {
                k: 'sources',
                v: 'Provenance. External research carries a link to the original paper here.',
              },
              {
                k: 'Reserved files',
                v: 'index.md and log.md are never concepts — they describe the bundle.',
              },
              { k: 'License', v: 'CC BY-NC-SA 4.0. Adapt it for your district, with credit.' },
            ]}
          />
        </div>
      </SectionRule>
    </div>
  );
}
