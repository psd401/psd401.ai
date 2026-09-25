import React from 'react';
import type { Metadata } from 'next';
import { SectionHeader, SectionRule } from '@/components/ds';
import FieldNotesAction from '@/components/FieldNotesAction';

// Reached only from an emailed link. Never indexed, never in the sitemap.
export const metadata: Metadata = {
  title: 'Confirm your subscription',
  robots: { index: false, follow: false },
};

export default function FieldNotesConfirmPage() {
  return (
    <div data-section="writing">
      <SectionRule as="header">
        <SectionHeader
          as="h1"
          title="Confirm your subscription"
          lead="One click to start receiving Field Notes: one thing we built, one thing we learned, and one thing we would do differently."
        />
        <div style={{ marginTop: 28 }}>
          <FieldNotesAction mode="confirm" />
        </div>
      </SectionRule>
    </div>
  );
}
