import React from 'react';
import type { Metadata } from 'next';
import { Gabarito, Public_Sans, IBM_Plex_Mono, Newsreader } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import SiteChrome from '@/components/SiteChrome';
import Script from 'next/script';
import JsonLd, { createOrganizationSchema, createWebSiteSchema } from '@/components/JsonLd';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';

/**
 * Four families, no overlap in role. Self-hosted through next/font rather
 * than the Google CDN the design source used: no third-party request on page
 * load, and next/font generates size-adjusted fallbacks so there is no shift
 * when they swap in.
 *
 * The CSS variables here are consumed by src/styles/tokens/fonts.css, which
 * maps them onto the four role names every component reads.
 */
const gabarito = Gabarito({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-gabarito',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-public-sans',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
});

// Pull quotes only, italic 300, at most once per screen.
const newsreader = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  style: ['italic'],
  weight: ['300', '400'],
  variable: '--font-newsreader',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Peninsula School District`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: `${SITE_NAME}: everything published` }],
      'text/markdown': [{ url: '/llms.txt', title: 'Site index for language models' }],
    },
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ['/images/og-default.jpg'],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Peninsula School District — AI in the open',
      },
    ],
  },
  icons: {
    icon: [
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${gabarito.variable} ${publicSans.variable} ${ibmPlexMono.variable} ${newsreader.variable}`}
    >
      <head>
        <JsonLd data={[createOrganizationSchema(), createWebSiteSchema()]} />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-N2ZC6D1BDX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-N2ZC6D1BDX');
          `}
        </Script>
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
