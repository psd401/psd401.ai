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

/**
 * Where other districts send questions. A Google Form owned by hagelk@psd401.net,
 * used instead of a published email address. Responses land in the form.
 */
export const OAD_CONTACT_FORM =
  'https://docs.google.com/forms/d/e/1FAIpQLSfXMAZqz4haz2TpK6DDSMejKd4W400BaT47i5pRU7_EdlZSBQ/viewform';

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
  /** Optional illustration shown above the document inside the site. */
  image?: string;
  imageAlt?: string;
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
    image: '/images/sections/oad-03-stages.jpg',
    imageAlt:
      'Four groups of staff around a looping track: planning at a table with sticky notes, building at a laptop and whiteboard, studying a bar chart, and pinning a finished page to a board',
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
  if (!m) return 'The Open Adaptive District';
  // The title becomes page metadata, which React escapes again, so entities
  // written in the HTML (e.g. &amp;) have to be decoded first.
  return m[1]
    .trim()
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
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

/* ---------------------------------------------------------- action plan */

/** The fellowship action plan, rendered in the site at this route. */
export const ACTION_PLAN_PATH = '/open-adaptive-district/action-plan';

/**
 * The action plan Peninsula submitted for the Google & GSV Ed Leader
 * Fellowship. It lives in the first-draft archive and is the one document in
 * the project that is never edited, so it is shown exactly as written: the
 * extraction keeps everything inside its <main> and drops only the archive's
 * own navigation bar and a decorative colour strip. Relative links into the
 * rest of the archive are made absolute so they still resolve from the
 * app route. The static file's URL redirects here (next.config.js).
 */
const ACTION_PLAN_FILE = 'first-draft/03-Fellowship-Action-Plan-FILLED.html';

export type ActionPlan = { title: string; html: string };

export const getActionPlan = cache(async (): Promise<ActionPlan> => {
  const raw = await fs.readFile(path.join(DIR, ACTION_PLAN_FILE), 'utf8');
  const main = /<main>([\s\S]*?)<\/main>/i.exec(raw)?.[1];
  if (!main) {
    throw new Error(
      `${ACTION_PLAN_FILE}: expected a <main> element. The file's structure changed — ` +
        `check getActionPlan in src/lib/oad.ts before this ships a blank page.`
    );
  }
  const html = main
    .replace(/<nav class="docnav">[\s\S]*?<\/nav>/i, '')
    .replace(/<div class="fellowship-strip">[\s\S]*?<\/div>/i, '')
    .replace(
      /href="(?!https?:|\/|#|mailto:)([^"]+)"/g,
      'href="/openadaptivedistrict/first-draft/$1"'
    )
    .trim();
  return { title: extractTitle(raw), html };
});
