'use client';

import React from 'react';
import { HeroUIProvider } from '@heroui/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      forcedTheme="system"
    >
      <HeroUIProvider>{children}</HeroUIProvider>
    </NextThemesProvider>
  );
}
