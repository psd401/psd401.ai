import React from 'react';
import type { Metadata } from 'next';
import { SectionHeader, SectionRule } from '@/components/ds';
import FieldNotesAction from '@/components/FieldNotesAction';

// Reached only from an emailed link. Never indexed, never in the sitemap.
export const metadata: Metadata = {
  title: 'Unsubscribe from Field Notes',
  robots: { index: false, follow: false },
};

export default function FieldNotesUnsubscribePage() {
  return (
    <div data-section="writing">
      <SectionRule as="header">
        <SectionHeader
          as="h1"
          title="Unsubscribe from Field Notes"
          lead="Press the button and your address is deleted from the list. No questions, no confirmation email."
        />
        <div style={{ marginTop: 28 }}>
          <FieldNotesAction mode="unsubscribe" />
        </div>
      </SectionRule>
    </div>
  );
}
