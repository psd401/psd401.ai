'use client';

/**
 * Design system — Masthead.
 *
 * Ported from Claude Design project 5db21ee4, `components/navigation/Masthead.jsx`.
 *
 * From the source's own note: the five sections are always all visible and
 * always numbered — that numbering is the site's spine, so never collapse it
 * into a "More" menu on desktop. Below 1024px there is no room for five
 * numbered links plus the wordmark, so it becomes a disclosure; the numbering
 * survives inside it.
 *
 * Client component: the disclosure holds state and closes on route change.
 */
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export type MastheadSection = {
  /** Two-digit section number, e.g. '01'. */
  n: string;
  name: string;
  href: string;
};

type MastheadProps = {
  sections: MastheadSection[];
  wordmark?: string;
  action?: React.ReactNode;
};

export function Masthead({ sections, wordmark = 'Peninsula AI', action }: MastheadProps) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Close the disclosure whenever the route changes.
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape closes it, matching native disclosure behaviour.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="ds-masthead">
      <Link href="/" className="ds-masthead__brand">
        <Image
          src="/images/psd-logo.png"
          alt=""
          width={38}
          height={38}
          priority
          style={{ display: 'block', objectFit: 'contain' }}
        />
        <span className="ds-masthead__wordmark">{wordmark}</span>
      </Link>

      <button
        type="button"
        className="ds-masthead__toggle"
        aria-expanded={open}
        aria-controls="masthead-nav"
        onClick={() => setOpen(o => !o)}
      >
        {open ? 'Close' : 'Sections'}
      </button>

      <nav
        id="masthead-nav"
        aria-label="Sections"
        className="ds-masthead__nav"
        data-open={open ? 'true' : 'false'}
      >
        {sections.map(s => (
          <Link
            key={s.n}
            href={s.href}
            className="ds-masthead__link"
            {...(isActive(s.href) ? { 'aria-current': 'page' as const } : {})}
          >
            <span className="ds-masthead__n" aria-hidden="true">
              {s.n}
            </span>
            <span>{s.name}</span>
          </Link>
        ))}
        {action}
      </nav>
    </header>
  );
}
