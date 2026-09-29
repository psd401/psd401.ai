/**
 * Design system — core primitives.
 *
 * Ported from Claude Design project 5db21ee4, `components/core/`:
 * Button · Chip · SectionRule · StatCell · ImageFrame · CodeBlock · PullQuote
 *
 * The source used React inline styles. Here the styling lives in
 * `src/styles/ds.css` under `.ds-*` classes so hover, focus-visible and media
 * queries are expressible. Props and their semantics are unchanged.
 *
 * All server components — none of these hold state.
 */
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

/** Accepts any `cond && 'class'` expression, including ReactNode conditions. */
const cx = (...parts: unknown[]) =>
  parts.filter((p): p is string => typeof p === 'string' && p.length > 0).join(' ');

/* -------------------------------------------------------------- Button */

type ButtonVariant = 'solid' | 'outline' | 'quiet';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  children: React.ReactNode;
  className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'href'>;

/**
 * Solid = the one real action on a screen. Outline = everything beside it.
 * Quiet = a link that happens to sit in a row of buttons.
 * Square corners, no shadow, no transform on hover.
 */
export function Button({
  variant = 'solid',
  size = 'md',
  href,
  children,
  className,
  ...rest
}: ButtonProps) {
  const classes = cx('ds-btn', `ds-btn--${variant}`, `ds-btn--${size}`, className);

  if (href) {
    const external = /^(https?:)?\/\//.test(href) || href.startsWith('mailto:');
    const anchorProps = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
    if (external) {
      return (
        <a
          href={href}
          className={classes}
          {...(href.startsWith('mailto:') ? {} : { rel: 'noopener noreferrer' })}
          {...anchorProps}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  const buttonProps = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type="button" className={classes} {...buttonProps}>
      {children}
    </button>
  );
}

/* ---------------------------------------------------------------- Chip */

type ChipProps = {
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLSpanElement>;

/** Mono, uppercase, tracked out. Solid for status, outline for filters/tags. */
export function Chip({
  variant = 'outline',
  size = 'md',
  children,
  className,
  ...rest
}: ChipProps) {
  return (
    <span
      className={cx('ds-chip', `ds-chip--${variant}`, size === 'sm' && 'ds-chip--sm', className)}
      {...rest}
    >
      {children}
    </span>
  );
}

/* --------------------------------------------------------- SectionRule */

type SectionRuleProps = {
  ground?: 'none' | 'tint' | 'strong';
  as?: 'div' | 'section' | 'header' | 'footer';
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLElement>;

/**
 * The signature band. A 9px rule in the section colour, an optionally tinted
 * ground, and the standard page gutter. Every major block on every page is
 * wrapped in one of these.
 */
export function SectionRule({
  ground = 'none',
  as: Tag = 'section',
  children,
  className,
  ...rest
}: SectionRuleProps) {
  return (
    <Tag className={cx('ds-rule', ground !== 'none' && `ds-rule--${ground}`, className)} {...rest}>
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------ StatCell */

type StatCellProps = {
  value: string | number;
  label: string;
  bar?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** Section colour override, e.g. 'software'. Homepage index only. */
  section?: SectionKey;
  className?: string;
};

/** A big Gabarito numeral over a short label, with a short colour bar above. */
export function StatCell({
  value,
  label,
  bar = true,
  size = 'md',
  section,
  className,
}: StatCellProps) {
  return (
    <div
      className={cx('ds-stat', size !== 'md' && `ds-stat--${size}`, className)}
      {...(section ? { 'data-section': section } : {})}
    >
      {bar && <span className="ds-stat__bar" aria-hidden="true" />}
      <span className="ds-stat__row">
        <span className="ds-stat__value">{value}</span>
        <span className="ds-stat__label">{label}</span>
      </span>
    </div>
  );
}

/* ---------------------------------------------------------- ImageFrame */

type ImageFrameProps = {
  /** Slot ID from the image prompt sheet, e.g. 'HP-01'. */
  id?: string;
  /** CSS aspect-ratio, e.g. '16/9'. */
  ratio?: string;
  /** Art-direction brief. Shown in the holding frame when there is no src. */
  brief?: string;
  src?: string;
  alt?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

/**
 * A holding frame for imagery that does not exist yet. Carries the slot ID,
 * the aspect ratio and the art-direction brief, so an unfilled design is
 * still a complete instruction. Pass `src` once the real image exists and
 * the frame becomes an ordinary image.
 *
 * The brief renders only in development. In production an unfilled slot is a
 * plain tinted frame — a reader should never see production notes, but a
 * developer should never lose them.
 */
export function ImageFrame({
  id,
  ratio = '16/9',
  brief,
  src,
  alt = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, 50vw',
  className,
}: ImageFrameProps) {
  if (src) {
    // next/image with `fill`, inside a wrapper that owns the aspect ratio.
    // `fill` is what lets this work without intrinsic dimensions, which the
    // ImageFrame contract does not carry — and the optimisation is not
    // optional here: some existing blog images in public/ are 4 MB PNGs and
    // JPEGs, so serving the originals would cost more than the rest of the
    // page combined.
    return (
      <div
        className={cx('ds-frame__img', className)}
        style={{ position: 'relative', width: '100%', aspectRatio: ratio }}
      >
        {/* `priority` is deprecated in Next 16. For the above-the-fold image
            it now maps to preload (early discovery), eager loading, and
            fetchpriority=high, which Lighthouse found missing on the hero. */}
        <Image
          src={src}
          alt={alt}
          fill
          preload={priority}
          loading={priority ? 'eager' : undefined}
          fetchPriority={priority ? 'high' : undefined}
          sizes={sizes}
          style={{ objectFit: 'cover' }}
        />
      </div>
    );
  }

  const showBrief = process.env.NODE_ENV !== 'production' && brief;

  return (
    <div
      className={cx('ds-frame', className)}
      style={{ aspectRatio: ratio }}
      role="img"
      aria-label={alt || (id ? `Image slot ${id}, not yet produced` : 'Image not yet produced')}
    >
      {id && (
        <span className="ds-frame__id" aria-hidden="true">
          {id} · {String(ratio).replace('/', ':')}
        </span>
      )}
      {showBrief && (
        <span className="ds-frame__brief" aria-hidden="true">
          {brief}
        </span>
      )}
    </div>
  );
}

/* ----------------------------------------------------------- CodeBlock */

type CodeBlockProps = {
  label?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

/** Always dark, in both themes. The one place the ink ground appears inline. */
export function CodeBlock({ label, action, children, className }: CodeBlockProps) {
  return (
    <div className={cx('ds-code', className)}>
      {(label || action) && (
        <div className="ds-code__head">
          <span className="ds-code__label">{label}</span>
          {action && <span className="ds-code__action">{action}</span>}
        </div>
      )}
      <div className="ds-code__body">{children}</div>
    </div>
  );
}

/* ----------------------------------------------------------- PullQuote */

type PullQuoteProps = {
  cite?: string;
  bar?: boolean;
  children: React.ReactNode;
  className?: string;
};

/** Newsreader italic 300. One per screen, maximum. */
export function PullQuote({ cite, bar = false, children, className }: PullQuoteProps) {
  return (
    <blockquote className={cx('ds-quote', bar && 'ds-quote--bar', className)}>
      <p className="ds-quote__text">{children}</p>
      {cite && <footer className="ds-quote__cite">{cite}</footer>}
    </blockquote>
  );
}

/* -------------------------------------------------------- browser frame */

type BrowserFrameProps = {
  url: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * The chrome around a product screenshot. Its three dots are the only
 * rounded shapes in the entire design system — see the note in ds.css.
 */
export function BrowserFrame({ url, children, className }: BrowserFrameProps) {
  return (
    <div className={cx('ds-browser', className)}>
      <div className="ds-browser__bar">
        <span className="ds-browser__dot" aria-hidden="true" />
        <span className="ds-browser__dot" aria-hidden="true" />
        <span className="ds-browser__dot" aria-hidden="true" />
        <span className="ds-browser__url">{url}</span>
      </div>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------ sections */

export const SECTION_KEYS = [
  'writing',
  'software',
  'guidance',
  'presentations',
  'oad',
  'practice',
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];
