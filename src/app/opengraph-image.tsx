import { ImageResponse } from 'next/og';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site';

/**
 * The default social preview image (og:image), used by every page that does
 * not carry its own — section indexes, OAD documents, guidance, the library.
 * Pages with an `image` in their frontmatter still use that image instead.
 *
 * Rendered once at build time. It uses next/og's built-in font rather than
 * fetching Gabarito, so the build never depends on a network call for it.
 * The five bars are the five section colours, in order — the homepage is the
 * one place the design shows all five together, and this card stands for it.
 */
export const alt = `${SITE_NAME}: ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const INK = '#0a1016';
const SECTIONS = ['#005ccc', '#006c7b', '#006c28', '#a61b86', '#6a37bf'];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
          color: INK,
        }}
      >
        <div style={{ display: 'flex', height: 18 }}>
          {SECTIONS.map(c => (
            <div key={c} style={{ flex: 1, background: c }} />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 88px',
          }}
        >
          <div style={{ fontSize: 104, fontWeight: 700, letterSpacing: '-0.04em' }}>
            {SITE_NAME}
          </div>
          <div style={{ fontSize: 42, lineHeight: 1.25, marginTop: 20, maxWidth: 1030 }}>
            {SITE_TAGLINE}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 88px 56px',
            fontSize: 26,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#4a4f55',
          }}
        >
          <span>Peninsula School District · Gig Harbor, Washington</span>
          <span>psd401.ai</span>
        </div>
      </div>
    ),
    size
  );
}
