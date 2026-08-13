'use client';

import React from 'react';
import { ThemeProvider } from 'next-themes';

/**
 * The only client-side provider on the site.
 *
 * `attribute="data-theme"` is what makes this work: src/styles/tokens/colors.css
 * scopes the dark palette to [data-theme="dark"], so next-themes writing that
 * attribute on <html> is the single switch for the whole system. Changing this
 * string silently disables dark mode everywhere.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      // `system` rather than `light`: with enableSystem but a hard-coded
      // default, a visitor whose OS is in dark mode still lands on the light
      // theme, which is not what either of them wants. An explicit choice
      // from the toggle still wins and persists.
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
