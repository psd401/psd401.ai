/**
 * The Open Adaptive District documents.
 *
 * Source: src/content/open-adaptive-district/*.md, OKF type `protocol` — the
 * five documents of the protocol plus the fellowship action plan. Each one
 * renders twice, from the same HTML so the two cannot drift apart:
 *
 *   /open-adaptive-district/<slug>       canonical, inside the site chrome
 *   /openadaptivedistrict/<printable>    self-contained and formatted for
 *                                        printing, at the documents' original
 *                                        static URLs (app/openadaptivedistrict)
 *
 * Bodies are markdown with a little raw HTML: the copy-button placeholders in
 * the Playbook, and the action plan's own designed markup. Both are written by
 * district staff and committed to this repository, never user input, so they
 * are rendered without sanitising.
 */
import { cache } from 'react';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import { getConcepts, type Concept } from './content';
import type { Protocol } from './schemas';

/**
 * Where other districts send questions. A Google Form owned by hagelk@psd401.net,
 * used instead of a published email address. Responses land in the form.
 */
export const OAD_CONTACT_FORM =
  'https://docs.google.com/forms/d/e/1FAIpQLSfXMAZqz4haz2TpK6DDSMejKd4W400BaT47i5pRU7_EdlZSBQ/viewform';

export type OadDoc = Concept<Protocol> & {
  /** The rendered document, ready for .oad-doc (site) or .wrap (printable). */
  html: string;
};

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 'The goals stay the same' → 'the-goals-stay-the-same'. */
function slugify(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z#0-9]+;/gi, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function renderBody(markdown: string): Promise<string> {
  const html = String(
    await remark().use(remarkGfm).use(remarkHtml, { sanitize: false }).process(markdown)
  );
  // Anchor ids on section headings, as the hand-written HTML had.
  return html.replace(
    /<h([2-4])>([\s\S]*?)<\/h\1>/g,
    (_m, level: string, inner: string) => `<h${level} id="${slugify(inner)}">${inner}</h${level}>`
  );
}

/**
 * A document's HTML. For the usual layout that is the title as the h1 and the
 * body after it, inside .lede, which both stylesheets key on (the paragraph
 * straight after the h1 is the lead). The plan layout's body carries its own
 * h1 and structure.
 */
async function renderOadHtml(doc: Concept<Protocol>): Promise<string> {
  const body = (await renderBody(doc.content)).trim();
  if (doc.layout === 'plan') return body;
  return `<div class="lede">\n<h1 id="${doc.slug}">${escapeHtml(doc.title)}</h1>\n${body}\n</div>`;
}

/** Every OAD document, the action plan included. */
export const getOadDocs = cache(async (): Promise<OadDoc[]> => {
  const concepts = await getConcepts('open-adaptive-district');
  const docs = await Promise.all(concepts.map(async c => ({ ...c, html: await renderOadHtml(c) })));
  return docs.sort((a, b) => (a.n ?? '99').localeCompare(b.n ?? '99'));
});

/** The five documents of the protocol, in reading order (those with an `n`). */
export const getOadSeries = cache(async (): Promise<OadDoc[]> => {
  return (await getOadDocs()).filter(d => d.n);
});

export const getOadDoc = cache(async (slug: string): Promise<OadDoc | null> => {
  return (await getOadDocs()).find(d => d.slug === slug) ?? null;
});

/** The document served at /openadaptivedistrict/<file>, or null. */
export const getOadPrintable = cache(async (file: string): Promise<OadDoc | null> => {
  return (await getOadDocs()).find(d => d.printable === file) ?? null;
});
