'use client';

/**
 * Design system — theme toggle.
 *
 * Dark mode is a real theme, not an inversion: tokens/colors.css lifts each
 * section colour into a lighter, more chromatic variant under
 * [data-theme="dark"] and flips --on-accent to dark. This just writes the
 * attribute; next-themes persists the choice and handles the no-flash script.
 */
import React from 'react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  // Before hydration the resolved theme is unknown. Render a stable
  // placeholder of the same size so the utility bar does not reflow.
  if (!mounted) {
    return (
      <button type="button" className="ds-themetoggle" aria-hidden="true" tabIndex={-1}>
        Dark mode
      </button>
    );
  }

  const dark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      className="ds-themetoggle"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
    >
      {dark ? 'Light mode' : 'Dark mode'}
    </button>
  );
}
