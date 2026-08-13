import React from 'react';
import type { Metadata } from 'next';
import { Button, DocCard, ImageFrame, SectionHeader, SectionRule, StepRow } from '@/components/ds';
import JsonLd, { createBreadcrumbSchema, createCollectionSchema } from '@/components/JsonLd';
import { getOadArtifacts } from '@/lib/oad';

export const metadata: Metadata = {
  title: 'The Open Adaptive District',
  description:
    'How Peninsula School District gets its AI work done: six-week cycles where a team picks one problem, builds a better way, studies what moved, and publishes what happened — including the flops.',
  alternates: { canonical: '/open-adaptive-district' },
  openGraph: {
    title: 'The Open Adaptive District — Peninsula AI',
    description:
      'Six-week cycles: plan, do, study, share. The operating model underneath everything else on this site.',
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
              "Peninsula School District's operating model for AI work: six-week plan / do / study / share cycles, published openly.",
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
              lead="How the work gets done — the loop underneath all five sections. Every six weeks, a team picks one problem and builds a better way. The agent keeps the notes. We share what happened, even when it flops."
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
            brief="Vertical framing of a working session: four adults around a table seen from slightly above, a whiteboard behind them carrying sticky notes in a rough loop."
          />
        </div>
      </SectionRule>

      <SectionRule ground="tint" as="section">
        <SectionHeader title="The cycle" size="section" />
        <div style={{ marginTop: 28, maxWidth: 760 }}>
          <ImageFrame
            id="OAD-02"
            ratio="3/2"
            src="/images/sections/oad-02-cycle.png"
            alt="A four-phase cycle drawn as a continuous track with week markers and one branch that leaves and rejoins"
            sizes="(max-width: 768px) 100vw, 760px"
          />
        </div>
        <div style={{ marginTop: 28 }}>
          <StepRow
            steps={[
              {
                n: 'STEP 1',
                title: 'Plan',
                body: 'Pick one problem worth six weeks. Write down what better looks like.',
              },
              {
                n: 'STEP 2',
                title: 'Do',
                body: 'Build the better way. Small, real, in front of students or staff.',
              },
              {
                n: 'STEP 3',
                title: 'Study',
                body: 'The agent keeps the notes. Look honestly at what moved.',
              },
              { n: 'STEP 4', title: 'Share', body: 'Publish it here. Especially the flops.' },
            ]}
          />
        </div>
      </SectionRule>

      <SectionRule as="section">
        <SectionHeader
          title="The artefacts"
          size="section"
          meta={`${artifacts.length} documents`}
          lead="Take these, change the district name, and run it. That is what they are for."
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
              Running one yourself
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
              Everything here is licensed CC BY-NC-SA 4.0. If you want to talk it through before you
              start, email us — we would rather you got it right than got it from scratch.
            </p>
          </div>
          <Button variant="solid" size="lg" href="mailto:hagelk@psd401.net">
            hagelk@psd401.net
          </Button>
        </div>
      </SectionRule>
    </div>
  );
}
