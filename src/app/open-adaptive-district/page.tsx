import React from 'react';
import type { Metadata } from 'next';
import { Button, DocCard, ImageFrame, SectionHeader, SectionRule } from '@/components/ds';
import JsonLd, { createBreadcrumbSchema, createCollectionSchema } from '@/components/JsonLd';
import OadCycle from '@/components/OadCycle';
import { getOadArtifacts, OAD_CONTACT_FORM } from '@/lib/oad';

export const metadata: Metadata = {
  title: 'The Open Adaptive District',
  description:
    "Peninsula School District's protocol for AI work: a small team picks one problem, spends six weeks building a better way to handle it, and publishes what happened, including what didn't work. Free for any district to adopt.",
  alternates: { canonical: '/open-adaptive-district' },
  openGraph: {
    title: 'The Open Adaptive District — Peninsula AI',
    description:
      'Plan, do, study, share: a six-week protocol for AI work that any district can adopt.',
    url: '/open-adaptive-district',
  },
};

/**
 * Section 05.
 *
 * The five artefacts are hand-authored HTML in public/openadaptivedistrict/.
 * They now render twice, deliberately:
 *
 *   /open-adaptive-district/<slug>          canonical, inside the site chrome
 *   /openadaptivedistrict/<file>.html       the original, self-contained and
 *                                           formatted for printing
 *
 * The static copies carry a <link rel="canonical"> pointing at the app route,
 * so the two never compete in search. next.config.js redirects the bare
 * /openadaptivedistrict path here but leaves the .html files serving, so
 * every existing link into an individual artefact still resolves.
 */
export default async function OpenAdaptiveDistrict() {
  const artifacts = await getOadArtifacts();

  return (
    <div data-section="oad">
      <JsonLd
        data={[
          createCollectionSchema({
            name: 'The Open Adaptive District',
            description:
              "Peninsula School District's protocol for AI work, in six-week plan, do, study and share cycles, published for other districts to adopt.",
            url: '/open-adaptive-district',
            items: artifacts.map(a => ({
              title: a.title,
              url: `/open-adaptive-district/${a.slug}`,
              description: a.description,
            })),
          }),
          createBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Open Adaptive District', url: '/open-adaptive-district' },
          ]),
        ]}
      />

      <SectionRule as="header">
        <div className="ds-split" style={{ gap: 48, alignItems: 'center' }}>
          <div>
            <SectionHeader
              as="h1"
              number="05"
              title="The Open Adaptive District"
              lead="A protocol for AI work. A team of three to six staff picks one problem, spends six weeks building a better way to handle it, and publishes what happened, including what didn't work. We run it at Peninsula, and any district can adopt it."
            />
            <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
              <Button variant="solid" size="lg" href="/open-adaptive-district/start-here">
                Start here
              </Button>
              <Button variant="outline" size="lg" href="/open-adaptive-district/playbook">
                Read the playbook →
              </Button>
            </div>
          </div>
          <ImageFrame
            id="OAD-01"
            ratio="4/5"
            priority
            src="/images/sections/oad-01-cycle-session.jpg"
            alt="Four staff around a table mid-discussion, a whiteboard behind them carrying sticky notes in a rough loop"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </div>
      </SectionRule>

      <SectionRule ground="tint" as="section">
        <SectionHeader
          title="The cycle"
          size="section"
          lead="Six weeks of work, then two weeks between cycles. A team runs one build per cycle."
        />
        <div style={{ marginTop: 36 }}>
          <OadCycle />
        </div>
      </SectionRule>

      <SectionRule as="section">
        <SectionHeader
          title="Read the protocol"
          size="section"
          meta={`${artifacts.length} documents`}
          lead="Start Here is the only required reading. The rest are there when a team needs them. Other districts are welcome to copy and adapt all five."
        />
        <div className="ds-grid ds-grid--2" style={{ gap: 22, marginTop: 28 }}>
          {artifacts.map(a => (
            <DocCard
              key={a.slug}
              href={`/open-adaptive-district/${a.slug}`}
              kind={a.n}
              title={a.title}
              description={a.description}
              // DocCard is itself an anchor, so this must not contain a link.
              // The printable standalone copy is linked from the artefact page.
              actions={<span style={{ color: 'var(--sec)' }}>Read →</span>}
            />
          ))}
        </div>
      </SectionRule>

      <SectionRule ground="strong" as="section">
        <div className="ds-split--even ds-split" style={{ gap: 48, alignItems: 'center' }}>
          <div>
            <h2 className="ds-display ds-display--block" style={{ marginBottom: 10 }}>
              Running it in your district
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
              Everything here is free to copy and adapt under{' '}
              <a
                href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                rel="license noopener noreferrer"
                style={{ color: 'inherit' }}
              >
                CC BY-NC-SA 4.0
              </a>
              . If you want to talk it through before you start, or you are already running it, send
              us a question.
            </p>
          </div>
          <Button variant="solid" size="lg" href={OAD_CONTACT_FORM}>
            Ask us a question →
          </Button>
        </div>
      </SectionRule>
    </div>
  );
}
