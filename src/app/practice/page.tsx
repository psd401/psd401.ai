import React from 'react';
import type { Metadata } from 'next';
import { Button, DocCard, SectionHeader, SectionRule, StatCell } from '@/components/ds';
import { byDateDesc, getConcepts, getCounts } from '@/lib/content';
import { getCategories, getUseCaseUrl } from '@/lib/use-cases';
import { formatDate } from '@/lib/format';
import JsonLd, { createBreadcrumbSchema, createWebPageSchema } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'The reference library',
  description:
    "Staff-submitted use cases, reviewed AI tools, and external research — the reference material behind Peninsula School District's AI work.",
  alternates: { canonical: '/practice' },
  openGraph: { title: 'The reference library — Peninsula AI', url: '/practice' },
};

/**
 * The reference library hub.
 *
 * This is not a sixth numbered section and it is not in the masthead — it is
 * linked from the footer and from the sections it supports. It holds the
 * largest part of the site by page count, so it gets a real front door rather
 * than three orphan indexes.
 *
 * The three underlying indexes keep their original URLs (/use-cases, /tools,
 * /articles): 92 pages' worth of inbound links is not worth spending on a
 * tidier path.
 *
 * `data-section="practice"` maps to --ink, not a colour — the library must
 * not compete with the five standing sections.
 */
export default async function PracticeHub() {
  const [counts, categories, tools, research] = await Promise.all([
    getCounts(),
    getCategories(),
    getConcepts('tools'),
    getConcepts('articles'),
  ]);

  const recentResearch = byDateDesc(research).slice(0, 4);
  const useCases = await getConcepts('use-cases');
  const sampleUseCases = [...useCases].sort((a, b) => a.title.localeCompare(b.title)).slice(0, 4);

  return (
    <div data-section="practice">
      <JsonLd
        data={[
          createWebPageSchema({
            name: 'The reference library',
            description:
              'Staff-submitted use cases, reviewed AI tools, and external research from Peninsula School District.',
            url: '/practice',
          }),
          createBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Reference library', url: '/practice' },
          ]),
        ]}
      />

      <SectionRule as="header">
        <SectionHeader
          as="h1"
          title="The reference library"
          lead="What staff actually did, which tools we reviewed, and the outside research we read. This is the filing cabinet behind the five sections — kept open, kept current, and not dressed up."
        />
      </SectionRule>

      <div className="ds-statband">
        <div>
          <StatCell value={counts.useCases} label="Use cases from staff" />
        </div>
        <div>
          <StatCell value={counts.tools} label="Tools reviewed" />
        </div>
        <div>
          <StatCell value={counts.research} label="Research pieces read" />
        </div>
        <div>
          <StatCell value={categories.length} label="Use-case categories" />
        </div>
      </div>

      {/* --------------------------------------------------- use cases */}
      <SectionRule as="section">
        <SectionHeader
          title="Use cases"
          size="section"
          meta={`${counts.useCases} entries`}
          lead="Practical examples submitted by Peninsula staff — what the task was, which tool they used, and what came out."
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '24px 0 28px' }}>
          {categories.map(c => (
            <a
              key={c.slug}
              href={`/use-cases/${c.slug}`}
              className="ds-chip ds-chip--outline"
              style={{ textDecoration: 'none' }}
            >
              {c.name} ({c.count})
            </a>
          ))}
        </div>
        <div className="ds-grid ds-grid--2" style={{ gap: 22 }}>
          {sampleUseCases.map(uc => (
            <DocCard
              key={uc.slug}
              href={getUseCaseUrl(uc)}
              kind={uc.category}
              meta={uc.school}
              title={uc.title}
              description={uc.description}
              accent="thin"
            />
          ))}
        </div>
        <div style={{ marginTop: 26 }}>
          <Button variant="outline" href="/use-cases">
            All {counts.useCases} use cases
          </Button>
        </div>
      </SectionRule>

      {/* ------------------------------------------------------- tools */}
      <SectionRule ground="tint" as="section">
        <SectionHeader
          title="Tools"
          size="section"
          meta={`${counts.tools} reviewed`}
          lead="AI tools we have looked at for district use, with where the data goes and how far we have taken each one."
        />
        <div className="ds-grid ds-grid--2" style={{ gap: 22, marginTop: 28 }}>
          {tools
            .sort((a, b) => a.title.localeCompare(b.title))
            .slice(0, 4)
            .map(t => (
              <DocCard
                key={t.slug}
                href={t.resource}
                kind={t.maturity}
                meta={t.provider}
                title={t.title}
                description={t.description}
                accent="thin"
              />
            ))}
        </div>
        <div style={{ marginTop: 26 }}>
          <Button variant="outline" href="/tools">
            All {counts.tools} tools
          </Button>
        </div>
      </SectionRule>

      {/* ---------------------------------------------------- research */}
      <SectionRule as="section">
        <SectionHeader
          title="Research"
          size="section"
          meta={`${counts.research} pieces`}
          lead="External papers, studies and opinion we have read and summarised. Each entry links to the original."
        />
        <div className="ds-grid ds-grid--2" style={{ gap: 22, marginTop: 28 }}>
          {recentResearch.map(r => (
            <DocCard
              key={r.slug}
              href={r.resource}
              kind={r.format}
              meta={formatDate(r.date)}
              title={r.title}
              description={r.description}
              accent="thin"
            />
          ))}
        </div>
        <div style={{ marginTop: 26 }}>
          <Button variant="outline" href="/articles">
            All {counts.research} research pieces
          </Button>
        </div>
      </SectionRule>
    </div>
  );
}
