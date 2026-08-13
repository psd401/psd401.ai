'use client';

/**
 * Rendered markdown body.
 *
 * Styling comes from the `.prose` rules in globals.css, which are built on
 * the design tokens — headings use the display scale, code sits on the
 * permanently dark ground, blockquotes get the 5px section accent.
 *
 * Two deliberate removals from the pre-redesign version:
 *
 *   · react-syntax-highlighter. 36 files carry fenced code, but they are
 *     almost all ```md and ```prompt — prompts and markdown, not source.
 *     The design specifies a single dark code ground with no highlighting,
 *     and the library was the heaviest client dependency on the site.
 *   · The HeroUI Button behind the copy control, now a plain button.
 *
 * One correctness fix: links used to open every href in a new tab, including
 * internal ones. Only external links do now.
 */
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          /* clipboard blocked — leave the label alone */
        }
      }}
      style={{
        position: 'absolute',
        right: 10,
        top: 10,
        background: 'transparent',
        border: '1px solid rgba(255,255,255,.28)',
        color: 'var(--on-code)',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '1.2px',
        textTransform: 'uppercase',
        padding: '5px 9px',
        cursor: 'pointer',
      }}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function YouTube({ src, title }: { src: string; title?: string }) {
  const id = src.includes('youtu.be')
    ? src.split('youtu.be/')[1]?.split(/[?&]/)[0]
    : src.split('v=')[1]?.split('&')[0] || src.split('/embed/')[1]?.split(/[?&]/)[0];

  if (!id) return null;

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', margin: '2em 0' }}>
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title={title || 'Video'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
      />
    </div>
  );
}

/**
 * Normalise heading levels so a body always starts at h2.
 *
 * The page supplies the h1. But 36 of the markdown bodies open with their own
 * `# Title` (duplicating the page heading) and 9 more start at `###` with no
 * `##` above them — 45 pages with a broken heading outline between them.
 *
 * Rather than edit 45 authored documents, shift every heading by a constant
 * so the shallowest one in the body lands on h2. Relative structure inside
 * the document is preserved exactly; only the offset changes.
 */
function shiftHeadings(markdown: string): string {
  const lines = markdown.split('\n');

  // Pass one: find the shallowest heading, ignoring fenced code — a '#' at
  // the start of a line inside a shell block is a comment, not a heading.
  let min = 7;
  let inFence = false;
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{1,6})\s/.exec(line);
    if (m) min = Math.min(min, m[1].length);
  }
  if (min === 7) return markdown;

  const shift = 2 - min;
  if (shift === 0) return markdown;

  // Pass two: apply the shift, clamped to h2–h6.
  inFence = false;
  return lines
    .map(line => {
      if (/^\s*```/.test(line)) {
        inFence = !inFence;
        return line;
      }
      if (inFence) return line;
      return line.replace(/^(#{1,6})(\s)/, (_, hashes: string, space: string) => {
        const level = Math.min(6, Math.max(2, hashes.length + shift));
        return '#'.repeat(level) + space;
      });
    })
    .join('\n');
}

export default function MarkdownContent({ content }: { content: string }) {
  const normalized = React.useMemo(() => shiftHeadings(content), [content]);

  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          pre({ children }) {
            // Pull the raw text out for the copy button.
            const child = React.Children.toArray(children)[0];
            let text = '';
            if (React.isValidElement(child)) {
              const props = child.props as { children?: React.ReactNode };
              text = String(props.children ?? '').replace(/\n$/, '');
            }
            return (
              <div style={{ position: 'relative' }}>
                {text && <CopyButton text={text} />}
                <pre>{children}</pre>
              </div>
            );
          },
          a({ href, children, ...rest }) {
            const external = !!href && /^(https?:)?\/\//.test(href);
            return (
              <a
                href={href}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                {...rest}
              >
                {children}
              </a>
            );
          },
          iframe(props) {
            const { src, title } = props as { src?: string; title?: string };
            if (src && (src.includes('youtube.com') || src.includes('youtu.be'))) {
              return <YouTube src={src} title={title} />;
            }
            return <iframe {...props} />;
          },
        }}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
}
