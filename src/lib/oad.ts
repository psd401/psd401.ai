/**
 * The Open Adaptive District artefacts.
 *
 * Five hand-authored HTML documents live in public/openadaptivedistrict/.
 * They are designed documents — the flyer is meant to be printed and put on a
 * wall — so they stay there, self-contained and directly linkable at their
 * original .html URLs.
 *
 * This module reads them at build time and extracts the authored content so
 * the same documents can also render as real pages inside the site chrome:
 * masthead, footer, breadcrumbs, theme, metadata, JSON-LD, sitemap and search.
 * Those app routes are canonical; the static files carry a <link rel=
 * "canonical"> pointing at them, so the two copies never compete.
 *
 * Nothing is rewritten. The extraction drops only the document's own <header>
 * and mini-nav, which the site chrome replaces.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { cache } from 'react';

const DIR = path.join(process.cwd(), 'public/openadaptivedistrict');

export type OadArtifact = {
  slug: string;
  /** The original static file, still served and still linkable. */
  file: string;
  title: string;
  description: string;
  /** Position in the reading order, e.g. '01'. */
  n: string;
  /** Authored HTML, with the document's own header and nav removed. */
  html: string;
};

/**
 * Reading order and framing. Each description is the card text on the section
 * page and the meta description of the artefact page itself.
 */
const ARTIFACTS: Array<Omit<OadArtifact, 'title' | 'html'>> = [
  {
    n: '01',
    slug: 'start-here',
    file: '01-Start-Here.html',
    description:
      'What the protocol is, why we run it, and how a cycle works. Five minutes, and the only required reading.',
  },
  {
    n: '02',
    slug: 'playbook',
    file: '02-The-Playbook.html',
    description:
      'The three documents a team uses (build plan, weekly check-in and wrap-up) with templates.',
  },
  {
    n: '03',
    slug: 'what-were-learning',
    file: '03-What-Were-Learning.html',
    description: "Every team's wrap-up as it is published, including the builds that were stopped.",
  },
  {
    n: '04',
    slug: 'deep-dive',
    file: '04-The-Deep-Dive.html',
    description: 'The reasoning and research behind the design, for anyone who wants it.',
  },
  {
    n: '05',
    slug: 'get-started',
    file: '05-Get-Started-Flyer.html',
    description: 'The whole cycle as twelve steps on one page, for printing.',
  },
];

function extractTitle(html: string): string {
  const m = /<title>([\s\S]*?)<\/title>/i.exec(html);
  return m ? m[1].trim() : 'The Open Adaptive District';
}

/**
 * Everything inside `.wrap` after the document's own nav, minus the closing
 * `.wrap` div. The header and nav are dropped because the site chrome and
 * breadcrumb replace them; every other byte is the author's.
 */
function extractBody(html: string, file: string): string {
  const afterNav = html.split('</nav>')[1];
  if (afterNav === undefined) {
    throw new Error(
      `${file}: expected a </nav> to split on. The artefact's structure changed — ` +
        `check src/lib/oad.ts before this ships a blank page.`
    );
  }
  const close = afterNav.lastIndexOf('</div>');
  if (close === -1) {
    throw new Error(`${file}: could not find the closing .wrap div.`);
  }
  return afterNav.slice(0, close).trim();
}

export const getOadArtifacts = cache(async (): Promise<OadArtifact[]> => {
  return Promise.all(
    ARTIFACTS.map(async meta => {
      const raw = await fs.readFile(path.join(DIR, meta.file), 'utf8');
      return {
        ...meta,
        title: extractTitle(raw).replace(/\s*—\s*Peninsula School District\s*$/, ''),
        html: extractBody(raw, meta.file),
      };
    })
  );
});

export const getOadArtifact = cache(async (slug: string): Promise<OadArtifact | null> => {
  const all = await getOadArtifacts();
  return all.find(a => a.slug === slug) ?? null;
});
