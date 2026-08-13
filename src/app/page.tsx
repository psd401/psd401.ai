import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Button,
  DocCard,
  ImageFrame,
  PostCard,
  ProductCard,
  PullQuote,
  SectionHeader,
  SectionRule,
  StatCell,
  StepRow,
} from '@/components/ds';
import { byDateDesc, getConcepts, getCounts } from '@/lib/content';
import { SITE_DESCRIPTION, SITE_TAGLINE } from '@/lib/site';
import JsonLd, { createWebPageSchema } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Peninsula AI — a public school district doing its AI work in the open',
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: { title: SITE_TAGLINE, description: SITE_DESCRIPTION, url: '/' },
};

/**
 * The homepage is the index of all five sections, and the ONE screen in the
 * system permitted to show more than one section colour. Every band below
 * sets its own `data-section`; nothing here mixes two colours inside a band.
 *
 * Every number on this page is computed from src/content/ — the design's rule
 * is "numbers are real or absent". The design comp showed "11 six-week cycles
 * completed"; that is not derivable from anything in the repository, so it is
 * absent rather than guessed.
 */
export default async function Home() {
  const [counts, posts, software, policies] = await Promise.all([
    getCounts(),
    getConcepts('writing'),
    getConcepts('software'),
    getConcepts('guidance'),
  ]);

  const latestPosts = byDateDesc(posts).slice(0, 3);
  const featuredSoftware = [...software].sort((a, b) => {
    // Production first, then alphabetical — drafts should not lead.
    const rank = (m: string) => (m === 'Production' ? 0 : m === 'Pilot' ? 1 : 2);
    return rank(a.maturity) - rank(b.maturity) || a.title.localeCompare(b.title);
  });

  return (
    <>
      <JsonLd
        data={createWebPageSchema({ name: SITE_TAGLINE, description: SITE_DESCRIPTION, url: '/' })}
      />

      {/* ---------------------------------------------------------- hero */}
      <div data-section="writing">
        <SectionRule as="header">
          <div className="ds-split" style={{ gap: 56, alignItems: 'center' }}>
            <div>
              <div className="ds-label ds-label--sec" style={{ marginBottom: 20 }}>
                Gig Harbor, Washington · since 2023
              </div>
              <h1 className="ds-display ds-display--hero" style={{ marginBottom: 22 }}>
                {SITE_TAGLINE}
              </h1>
              <p
                className="ds-lead"
                style={{ marginBottom: 28, fontSize: 'var(--body-intro)', maxWidth: '52ch' }}
              >
                Peninsula School District has been putting AI to work across teaching, operations,
                policy and professional learning — and publishing the whole record, including the
                parts that did not work.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Button variant="solid" size="lg" href="/writing">
                  Read the latest
                </Button>
                <Button variant="outline" size="lg" href="/software">
                  See the software
                </Button>
              </div>
            </div>
            {/* The hero leads with place, not a person. The design brief asked
                for a portrait of a named person here, and a generated stand-in
                for that reads as stock — it could be any office anywhere and
                says nothing about a school district.

                Two alternates are in public/images/sections/ and swap by
                changing this one src: hp-01-alt-buses.jpg (buses in fog — the
                most immediately institutional) and hp-01-alt-classroom.jpg
                (winter light across empty desks). */}
            <ImageFrame
              id="HP-01"
              ratio="4/5"
              priority
              src="/images/sections/hp-01-harbor-school.jpg"
              alt="Puget Sound in morning fog seen through Douglas firs, a school and its playing field on the far shore"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>
        </SectionRule>
      </div>

      {/* ------------------------------------------------- real counts */}
      <div className="ds-statband">
        <div>
          <StatCell
            section="software"
            value={counts.softwareInProduction}
            label="Products in production"
          />
        </div>
        <div>
          <StatCell
            section="presentations"
            value={counts.presentations}
            label="Talks and slide decks published"
          />
        </div>
        <div>
          <StatCell section="writing" value={counts.posts} label="Posts written by staff" />
        </div>
        <div>
          <StatCell section="oad" value={counts.total} label="Public artefacts to fork" />
        </div>
      </div>

      {/* ------------------------------------------------- 02 software */}
      <div data-section="software">
        <SectionRule ground="tint">
          <SectionHeader
            number="02"
            title="Software we build"
            size="section"
            meta={`${counts.software} products`}
            lead="Built by district staff for district problems, and open source so another district can run them without paying us anything."
          />
          <div className="ds-grid ds-grid--3" style={{ gap: 16, marginTop: 28 }}>
            {featuredSoftware.map(p => (
              <ProductCard
                key={p.slug}
                href={p.resource}
                name={p.title}
                line={p.description}
                stack={p.stack}
                status={p.status === 'draft' ? 'DRAFT' : p.maturity.toUpperCase()}
              />
            ))}
          </div>
        </SectionRule>
      </div>

      {/* -------------------------------------------------- 01 writing */}
      <div data-section="writing">
        <SectionRule>
          <SectionHeader
            number="01"
            title="Writing"
            size="section"
            meta={`${counts.posts} posts`}
            lead="Notes from the people doing the work."
          />
          <div className="ds-grid ds-grid--3" style={{ gap: 30, marginTop: 28 }}>
            {latestPosts.map(p => (
              <PostCard
                key={p.slug}
                href={p.resource}
                title={p.title}
                meta={formatMeta(p.tags?.[0], p.date)}
                excerpt={p.description}
                byline={p.author}
                image={p.image ? { src: p.image, alt: '' } : { id: 'WR-XX', brief: p.title }}
              />
            ))}
          </div>
        </SectionRule>
      </div>

      {/* ------------------------------------------------- 03 guidance */}
      <div data-section="guidance">
        <SectionRule ground="tint">
          <SectionHeader
            number="03"
            title="Guidance"
            size="section"
            meta={`${counts.policies} documents`}
            lead="The documents our own staff work from. Plain language, published in Markdown as well as on the page, and licensed so you can fork them and put your district's name on them."
          />
          <div className="ds-grid ds-grid--2" style={{ gap: 22, marginTop: 28 }}>
            {policies.map(p => (
              <DocCard
                key={p.slug}
                href={p.resource}
                kind={p.category}
                meta={p.date}
                title={p.title}
                description={p.description}
              />
            ))}
          </div>
        </SectionRule>
      </div>

      {/* -------------------------------------------- 04 presentations */}
      <div data-section="presentations">
        <SectionRule>
          <div className="ds-split" style={{ gap: 48, alignItems: 'center' }}>
            <div>
              <SectionHeader
                number="04"
                title="Presentations"
                size="section"
                lead={`${counts.presentations} talks, workshops and board sessions, published as given — slides included, not summarised.`}
              />
              <div style={{ marginTop: 24 }}>
                <Button variant="outline" href="/presentations">
                  Browse the talks
                </Button>
              </div>
            </div>
            <ImageFrame
              id="HP-05"
              ratio="21/9"
              src="/images/sections/hp-05-gig-harbor.jpg"
              alt="Puget Sound in early morning fog, conifers on the headland, a low school building in the middle distance"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>
        </SectionRule>
      </div>

      {/* ------------------------------------------------------ 05 OAD */}
      <div data-section="oad">
        <SectionRule ground="tint">
          <SectionHeader
            number="05"
            title="The Open Adaptive District"
            size="section"
            lead="How the work gets done — the loop underneath all five sections."
          />
          <div
            className="ds-split--wide ds-split"
            style={{ gap: 40, alignItems: 'center', margin: '26px 0 28px' }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 27,
                lineHeight: 1.38,
                fontWeight: 500,
                letterSpacing: '-0.02em',
              }}
            >
              Every six weeks, a team picks one problem and builds a better way. Your AI agent keeps
              the notes. We all share what happened — even when it flops.
            </p>
            <ImageFrame
              id="HP-04"
              ratio="3/2"
              src="/images/sections/hp-04-cycle-session.jpg"
              alt="School staff mid-working-session around a table, a loop of sticky notes on the whiteboard behind them"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>
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
          <div style={{ marginTop: 32 }}>
            <Button variant="solid" href="/open-adaptive-district">
              Read the playbook
            </Button>
          </div>
        </SectionRule>
      </div>

      {/* --------------------------------------------- reference library */}
      <div data-section="practice">
        <SectionRule>
          <div className="ds-split" style={{ gap: 48, alignItems: 'center' }}>
            <div>
              <SectionHeader
                title="The reference library"
                size="section"
                lead={`${counts.useCases} use cases from staff, ${counts.tools} tools we have reviewed, and ${counts.research} pieces of outside research. Not a headline section — a filing cabinet, kept open.`}
              />
              <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
                <Button variant="outline" href="/practice">
                  Open the library
                </Button>
                <Button variant="quiet" href="/search">
                  Search everything →
                </Button>
              </div>
            </div>
            <PullQuote bar cite="— AI PRINCIPLES & BELIEFS">
              We will not use AI to make a decision about a student that we would not be willing to
              explain to that student&rsquo;s family, in person, in plain language.
            </PullQuote>
          </div>
        </SectionRule>
      </div>

      {/* ------------------------------------------------- for machines */}
      <div data-section="software">
        <SectionRule ground="strong" as="section">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 40,
              alignItems: 'center',
            }}
            className="ds-split--even"
          >
            <div>
              <h2 className="ds-display ds-display--block" style={{ marginBottom: 10 }}>
                Built for agents to read
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 17,
                  lineHeight: 1.6,
                  opacity: 'var(--text-muted)',
                  maxWidth: '62ch',
                }}
              >
                Everything on this site is published as an Open Knowledge Format bundle — plain
                markdown with typed frontmatter, the same files the site renders. Point an agent at
                it and it works without a custom integration.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Button variant="solid" href="/okf">
                Open Knowledge bundle
              </Button>
              <Button variant="outline" href="/llms.txt">
                llms.txt
              </Button>
            </div>
          </div>
        </SectionRule>
      </div>

      <div style={{ padding: '0 var(--gutter-page) 40px' }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '1px',
            opacity: 0.5,
          }}
        >
          <Link href="/search">SEARCH</Link> · <Link href="/practice">LIBRARY</Link> ·{' '}
          <a href="/feed.xml">RSS</a>
        </p>
      </div>
    </>
  );
}

/** 'Engineering · Jun 2' — the mono kicker on a post card. */
function formatMeta(tag: string | undefined, date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  const when = Number.isNaN(d.getTime())
    ? date
    : d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      });
  return tag ? `${tag} · ${when}` : when;
}
