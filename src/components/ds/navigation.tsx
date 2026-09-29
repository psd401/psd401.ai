/**
 * Design system — navigation components (server).
 *
 * Ported from Claude Design project 5db21ee4, `components/navigation/`:
 * UtilityBar · Breadcrumb · SideNav · OnThisPage
 *
 * Masthead lives in ./Masthead.tsx because its mobile disclosure needs state.
 */
import React from 'react';
import Link from 'next/link';

/** Accepts any `cond && 'class'` expression, including ReactNode conditions. */
const cx = (...parts: unknown[]) =>
  parts.filter((p): p is string => typeof p === 'string' && p.length > 0).join(' ');

/* ----------------------------------------------------------- UtilityBar */

type UtilityBarProps = {
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
};

/** The thin strip above the masthead: place, licence stance, theme toggle. */
export function UtilityBar({
  left = 'Peninsula School District · Gig Harbor, Washington',
  right,
  className,
}: UtilityBarProps) {
  return (
    <div className={cx('ds-utility', className)}>
      <span className="ds-utility__left">{left}</span>
      <span className="ds-utility__right">{right}</span>
    </div>
  );
}

/* ----------------------------------------------------------- Breadcrumb */

export type Crumb = { label: string; href?: string };

type BreadcrumbProps = {
  items: Crumb[];
  className?: string;
};

/** Mono, uppercase, slash-separated. The last crumb is in the section colour. */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cx('ds-crumbs', className)}>
      <ol
        style={{
          display: 'contents',
          listStyle: 'none',
          margin: 0,
          padding: 0,
        }}
      >
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <React.Fragment key={`${it.label}-${i}`}>
              {i > 0 && (
                <span className="ds-crumbs__sep" aria-hidden="true">
                  /
                </span>
              )}
              <li style={{ display: 'contents' }}>
                {last || !it.href ? (
                  <span className="ds-crumbs__current" aria-current="page">
                    {it.label}
                  </span>
                ) : (
                  <Link href={it.href} className="ds-crumbs__link">
                    {it.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

/* -------------------------------------------------------------- SideNav */

export type NavGroup = { group: string; items: Array<{ label: string; href: string }> };

type SideNavProps = {
  title?: string;
  groups: NavGroup[];
  /** href of the current page, for aria-current. */
  active?: string;
  className?: string;
};

/** Grouped document navigation. Group headings are Gabarito, small and caps. */
export function SideNav({ title, groups, active, className }: SideNavProps) {
  return (
    <nav aria-label={title ?? 'Section'} className={cx('ds-sidenav', className)}>
      {title && <div className="ds-sidenav__title">{title}</div>}
      {groups.map(g => (
        <div key={g.group} className="ds-sidenav__group">
          <div className="ds-sidenav__heading">{g.group}</div>
          {g.items.map(it => (
            <Link
              key={it.href}
              href={it.href}
              className="ds-sidenav__item"
              {...(active === it.href ? { 'aria-current': 'page' as const } : {})}
            >
              {it.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

/* ----------------------------------------------------------- OnThisPage */

export type TocItem = { label: string; href: string };

type OnThisPageProps = {
  title?: string;
  items: TocItem[];
  actions?: React.ReactNode;
  className?: string;
};

/** Right rail: in-page anchors, then page-level actions. */
export function OnThisPage({ title = 'On this page', items, actions, className }: OnThisPageProps) {
  return (
    <nav aria-label={title} className={cx('ds-otp', className)}>
      <div className="ds-otp__title">{title}</div>
      {items.map(it => (
        <a key={it.href} href={it.href} className="ds-otp__item">
          {it.label}
        </a>
      ))}
      {actions && <div className="ds-otp__actions">{actions}</div>}
    </nav>
  );
}
