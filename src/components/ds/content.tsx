/**
 * Design system — content components.
 *
 * Ported from Claude Design project 5db21ee4, `components/content/`:
 * SectionHeader · PostCard · DocCard · SpecTable · StepRow
 * plus ProductCard, which the homepage and software index both inline in the
 * source screens rather than importing.
 *
 * All server components.
 */
import React from 'react';
import Link from 'next/link';
import { ImageFrame } from './core';

/** Accepts any `cond && 'class'` expression, including ReactNode conditions. */
const cx = (...parts: unknown[]) =>
  parts.filter((p): p is string => typeof p === 'string' && p.length > 0).join(' ');

/** Internal hrefs get next/link prefetching; external ones stay plain. */
function Anchor({
  href,
  className,
  children,
  ...rest
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const external = /^(https?:)?\/\//.test(href) || href.startsWith('mailto:');
  if (external) {
    return (
      <a href={href} className={className} rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} {...rest}>
      {children}
    </Link>
  );
}

/* -------------------------------------------------------- SectionHeader */

type SectionHeaderProps = {
  /** Section number, e.g. '02'. Renders as the solid chip. */
  number?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  /** Trailing right-aligned note, e.g. '15 posts'. Must be a real count. */
  meta?: React.ReactNode;
  size?: 'page' | 'section';
  /**
   * Heading level. Defaults to h2 — a page supplies exactly one h1, and on
   * most screens that is the hero, not a band header. Section landing pages
   * pass `as="h1"` explicitly.
   */
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
};

/** Numbered chip + Gabarito display title, with an optional trailing meta note. */
export function SectionHeader({
  number,
  title,
  lead,
  meta,
  size = 'page',
  as: Heading = 'h2',
  className,
}: SectionHeaderProps) {
  return (
    <header className={className}>
      <div className={cx('ds-secthead__row', lead && 'ds-secthead__row--lead')}>
        {number && <span className="ds-secthead__n">{number}</span>}
        <Heading className={cx('ds-display', `ds-display--${size}`)}>{title}</Heading>
        {meta && <span className="ds-secthead__meta">{meta}</span>}
      </div>
      {lead && <p className="ds-lead">{lead}</p>}
    </header>
  );
}

/* ------------------------------------------------------------- PostCard */

type PostCardProps = {
  href: string;
  title: React.ReactNode;
  /** Mono kicker in the section colour, e.g. 'Engineering · Jun 2'. */
  meta?: React.ReactNode;
  excerpt?: React.ReactNode;
  byline?: React.ReactNode;
  image?: { id?: string; src?: string; brief?: string; alt?: string; ratio?: string };
  priority?: boolean;
  className?: string;
};

/** Blog card: image, mono meta in the section colour, display title, standfirst. */
export function PostCard({
  href,
  title,
  meta,
  excerpt,
  byline,
  image,
  priority = false,
  className,
}: PostCardProps) {
  return (
    <Anchor href={href} className={cx('ds-postcard', className)}>
      {image && (
        <ImageFrame
          ratio={image.ratio ?? '16/10'}
          id={image.id}
          src={image.src}
          brief={image.brief}
          alt={image.alt ?? ''}
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      )}
      {meta && <span className="ds-postcard__meta">{meta}</span>}
      <span className="ds-postcard__title">{title}</span>
      {excerpt && <span className="ds-postcard__excerpt">{excerpt}</span>}
      {byline && <span className="ds-postcard__byline">{byline}</span>}
    </Anchor>
  );
}

/* -------------------------------------------------------------- DocCard */

type DocCardProps = {
  href: string;
  title: React.ReactNode;
  /** Left-hand category label in the section colour. */
  kind?: React.ReactNode;
  /** Right-hand metadata, e.g. 'rev 4 · Mar 2026'. */
  meta?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  accent?: 'strong' | 'thin';
  className?: string;
};

/**
 * The left-accent card used for policies, docs, tutorials and talks.
 * The 5px accent is the only decoration; there is no shadow and no radius.
 */
export function DocCard({
  href,
  title,
  kind,
  meta,
  description,
  actions,
  accent = 'strong',
  className,
}: DocCardProps) {
  return (
    <Anchor
      href={href}
      className={cx('ds-doccard', accent === 'thin' && 'ds-doccard--thin', className)}
    >
      {(kind || meta) && (
        <span className="ds-doccard__row">
          <span className="ds-doccard__kind">{kind}</span>
          <span className="ds-doccard__meta">{meta}</span>
        </span>
      )}
      <span className="ds-doccard__title">{title}</span>
      {description && <span className="ds-doccard__desc">{description}</span>}
      {actions && <span className="ds-doccard__actions">{actions}</span>}
    </Anchor>
  );
}

/* ------------------------------------------------------------ SpecTable */

export type SpecRow = { k: string; v: React.ReactNode };

type SpecTableProps = {
  rows: SpecRow[];
  columns?: 1 | 2;
  /** Accessible name for the table, e.g. 'Technical specification'. */
  caption?: string;
  className?: string;
};

/**
 * Two-column key/value spec. Keys are mono caps; values are plain sentences.
 * Rendered as a real <dl> so a screen reader reads pairs, not loose text.
 */
export function SpecTable({ rows, columns = 2, caption, className }: SpecTableProps) {
  return (
    <dl className={cx('ds-spec', `ds-spec--${columns}`, className)} aria-label={caption}>
      {rows.map(r => (
        <div key={r.k} className="ds-spec__row">
          <dt className="ds-spec__k">{r.k}</dt>
          <dd className="ds-spec__v" style={{ margin: 0 }}>
            {r.v}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* -------------------------------------------------------------- StepRow */

export type Step = { n: string; title: string; body: string };

type StepRowProps = {
  steps: Step[];
  className?: string;
};

/** Numbered how-it-works columns, each with the short section-colour bar. */
export function StepRow({ steps, className }: StepRowProps) {
  return (
    <ol
      className={cx('ds-steps', className)}
      style={{
        gridTemplateColumns: `repeat(${steps.length}, 1fr)`,
        listStyle: 'none',
        margin: 0,
        padding: 0,
      }}
    >
      {steps.map(s => (
        <li key={s.title} className="ds-steps__item">
          <span className="ds-steps__bar" aria-hidden="true" />
          <span className="ds-steps__n">{s.n}</span>
          <span className="ds-steps__title">{s.title}</span>
          <span className="ds-steps__body">{s.body}</span>
        </li>
      ))}
    </ol>
  );
}

/* ---------------------------------------------------------- ProductCard */

type ProductCardProps = {
  href: string;
  name: string;
  line?: string;
  /** Tech stack, e.g. 'Next.js · AWS'. */
  stack?: string;
  /** PRODUCTION | PILOT | BETA. Rendered in the section colour. */
  status?: string;
  className?: string;
};

/** The software index card. Hairline box, 4px left accent, no lift on hover. */
export function ProductCard({ href, name, line, stack, status, className }: ProductCardProps) {
  return (
    <Anchor href={href} className={cx('ds-productcard', className)}>
      {(stack || status) && (
        <span className="ds-productcard__row">
          <span>{stack}</span>
          {status && <span className="ds-productcard__status">{status}</span>}
        </span>
      )}
      <span className="ds-productcard__name">{name}</span>
      {line && <span className="ds-productcard__line">{line}</span>}
    </Anchor>
  );
}
