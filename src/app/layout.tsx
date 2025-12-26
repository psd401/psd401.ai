import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Layout from '@/components/Layout';
import Script from 'next/script';
import JsonLd, { createOrganizationSchema } from '@/components/JsonLd';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://psd401.ai'),
  title: {
    default: 'Peninsula SD AI',
    template: '%s | Peninsula SD AI',
  },
  description: 'AI resources and guidance for Peninsula School District',
  twitter: {
    card: 'summary_large_image',
    title: 'Peninsula SD AI',
    description: 'AI resources and guidance for Peninsula School District',
    images: ['/images/og-image.png'],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://psd401.ai',
    siteName: 'Peninsula SD AI',
    title: 'Peninsula SD AI',
    description: 'AI resources and guidance for Peninsula School District',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Peninsula School District AI Hub',
      },
    ],
  },
  icons: {
    icon: [
      {
        url: '/icon.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <JsonLd data={createOrganizationSchema()} />
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
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
