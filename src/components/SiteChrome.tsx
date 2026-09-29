import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Masthead, UtilityBar, ThemeToggle } from '@/components/ds';
import { LICENSE, MASTHEAD_SECTIONS, PRACTICE_SECTIONS, SECTIONS, SOCIAL_LINKS } from '@/lib/site';

/**
 * Global chrome: utility bar, masthead, main, footer.
 *
 * Replaces the pre-redesign HeroUI `Layout`. Note what is NOT here — the old
 * layout wrapped children in a centred `container mx-auto px-6 py-8`, which
 * fought the new system: sections are full-bleed bands that carry their own
 * 9px rule and page gutter. Pages own their own padding now.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const year = new Date().getFullYear();

  return (
    <div
      className="ds-canvas"
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      <a href="#main-content" className="ds-skiplink">
        Skip to main content
      </a>

      <UtilityBar
        right={
          <>
            <span style={{ opacity: 0.65 }}>Open source · free to run</span>
            <ThemeToggle />
          </>
        }
      />

      <Masthead sections={MASTHEAD_SECTIONS} />

      <main id="main-content" style={{ flexGrow: 1 }}>
        {children}
      </main>

      <footer className="ds-footer">
        <div className="ds-footer__cols">
          <div>
            <div className="ds-footer__heading">Sections</div>
            {SECTIONS.map(s => (
              <Link key={s.href} href={s.href} className="ds-footer__link">
                {s.n} {s.name}
              </Link>
            ))}
          </div>

          <div>
            <div className="ds-footer__heading">Reference library</div>
            {PRACTICE_SECTIONS.map(s => (
              <Link key={s.href} href={s.href} className="ds-footer__link">
                {s.name}
              </Link>
            ))}
            <Link href="/search" className="ds-footer__link">
              Search
            </Link>
          </div>

          <div>
            <div className="ds-footer__heading">For machines</div>
            <a href="/llms.txt" className="ds-footer__link">
              llms.txt
            </a>
            <a href="/okf" className="ds-footer__link">
              Open Knowledge bundle
            </a>
            <a href="/feed.xml" className="ds-footer__link">
              RSS feed
            </a>
            <a href="/api/content.json" className="ds-footer__link">
              Content API
            </a>
          </div>

          <div>
            <div className="ds-footer__heading">Elsewhere</div>
            {SOCIAL_LINKS.map(s => (
              <a
                key={s.href}
                href={s.href}
                className="ds-footer__link"
                rel="noopener noreferrer"
                target="_blank"
              >
                {s.name}
              </a>
            ))}
          </div>
        </div>

        <div className="ds-footer__bar">
          <span>© {year} Peninsula School District</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <a
              href={LICENSE.href}
              rel="license noopener noreferrer"
              target="_blank"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                textDecoration: 'none',
              }}
            >
              {LICENSE.name}
              {['cc', 'by', 'nc', 'sa'].map(badge => (
                <Image
                  key={badge}
                  src={`/images/cc/${badge}.svg`}
                  alt=""
                  width={18}
                  height={18}
                  aria-hidden="true"
                />
              ))}
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
