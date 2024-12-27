import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - Peninsula School District AI',
  description: 'Stories and updates about AI implementation across Peninsula School District',
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
