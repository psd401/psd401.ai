/**
 * An issue of the newsletter: a markdown file with frontmatter.
 *
 *   ---
 *   subject: What we learned from six weeks of AI-drafted IEPs
 *   id: 2026-10-06            # optional; defaults to the file name
 *   ---
 *   Markdown body. Use absolute URLs for links and images — relative paths
 *   mean nothing inside an email.
 *
 * The body is rendered with the same remark plugins the site uses, and
 * remark-html's default sanitising stays on: an issue is written by staff,
 * but it is still HTML going into hundreds of inboxes.
 */
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import { z } from 'zod';
import { NEWSLETTER } from '../newsletter';

export type Issue = {
  /** Stable id recorded against each recipient, so a re-run skips them. */
  id: string;
  subject: string;
  markdown: string;
  html: string;
};

const Frontmatter = z.object({
  subject: z.string().trim().min(1, 'an issue needs a subject').max(200),
  // YAML reads an unquoted `id: 2026-10-06` as a Date, and a bare number as a
  // number. Both are natural ids, so normalise them to strings first.
  id: z.preprocess(
    v => (v instanceof Date ? v.toISOString().slice(0, 10) : typeof v === 'number' ? String(v) : v),
    z
      .string()
      .regex(/^[a-z0-9][a-z0-9-]{0,63}$/, 'id: lowercase letters, digits and hyphens')
      .optional()
  ),
});

export async function loadIssue(raw: string, fileName: string): Promise<Issue> {
  const { data, content } = matter(raw);
  const fm = Frontmatter.parse(data);
  const id = fm.id ?? fileName.replace(/\.md$/, '').toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(id)) {
    throw new Error(`Issue id "${id}" is not usable — set an \`id:\` in the frontmatter.`);
  }
  const markdown = content.trim();
  if (!markdown) throw new Error('The issue has no body.');
  const html = String(await remark().use(remarkGfm).use(remarkHtml).process(markdown));
  return { id, subject: fm.subject, markdown, html };
}

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** One recipient's copy. The unsubscribe link is theirs alone. */
export function renderIssueEmail(
  issue: Issue,
  opts: { unsubscribePageUrl: string; postalAddress?: string }
) {
  const why = `You are getting this because you subscribed to ${NEWSLETTER.name} at psd401.ai.`;
  const place = opts.postalAddress ?? 'Peninsula School District · Gig Harbor, Washington';

  const text = `${issue.markdown}

—
${why}
Unsubscribe: ${opts.unsubscribePageUrl}
${place}
`;

  const html = `<!doctype html>
<html lang="en"><body style="margin:0;padding:32px 20px;background:#ffffff;color:#16202b;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6">
<div style="max-width:600px;margin:0 auto;border-top:6px solid #2a57c9;padding-top:20px">
<p style="margin:0 0 24px;font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:#2a57c9">${escape(NEWSLETTER.name)} · Peninsula School District</p>
<div>${issue.html}</div>
<hr style="border:0;border-top:1px solid #d9dde2;margin:32px 0 16px">
<p style="margin:0 0 6px;color:#5b6570;font-size:13px">${escape(why)}</p>
<p style="margin:0 0 6px;font-size:13px"><a href="${escape(opts.unsubscribePageUrl)}" style="color:#5b6570">Unsubscribe</a></p>
<p style="margin:0;color:#5b6570;font-size:13px">${escape(place)}</p>
</div></body></html>`;

  return { subject: issue.subject, text, html };
}
