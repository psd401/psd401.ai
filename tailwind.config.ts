import type { Config } from 'tailwindcss';
import { heroui } from '@heroui/react';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Logo Colors
        'sea-glass': '#6CA18A',
        pacific: '#25424C',
        driftwood: '#D7CDBE',
        // Supporting Brand Colors
        cedar: '#466857',
        whulge: '#346780',
        'sea-foam': '#EEEBE4',
        meadow: '#5D9068',
        ocean: '#7396A9',
        skylight: '#FFFAEC',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
    },
  },
  darkMode: 'class',
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            background: '#FFFFFF',
            foreground: '#25424C', // Pacific
            content1: '#FFFFFF',
            content2: '#EEEBE4', // Sea Foam
            content3: '#D7CDBE', // Driftwood
            content4: '#FFFAEC', // Skylight
            divider: '#D7CDBE', // Driftwood
            primary: {
              50: '#EEEBE4', // Sea Foam
              100: '#D7CDBE', // Driftwood
              200: '#7396A9', // Ocean
              300: '#6CA18A', // Sea Glass
              400: '#5D9068', // Meadow
              500: '#346780', // Whulge
              600: '#466857', // Cedar
              700: '#25424C', // Pacific
              800: '#1A2F36', // Darker Pacific
              900: '#0F1C20', // Darkest Pacific
              DEFAULT: '#346780', // Whulge
              foreground: '#FFFFFF',
            },
            secondary: {
              50: '#FFFAEC', // Skylight
              100: '#EEEBE4', // Sea Foam
              200: '#D7CDBE', // Driftwood
              300: '#6CA18A', // Sea Glass
              400: '#5D9068', // Meadow
              500: '#466857', // Cedar
              600: '#346780', // Whulge
              700: '#25424C', // Pacific
              800: '#1A2F36', // Darker Pacific
              900: '#0F1C20', // Darkest Pacific
              DEFAULT: '#6CA18A', // Sea Glass
              foreground: '#FFFFFF',
            },
          },
        },
        dark: {
          colors: {
            background: '#1A2F36', // Darker Pacific
            foreground: '#EEEBE4', // Sea Foam
            content1: '#25424C', // Pacific
            content2: '#346780', // Whulge
            content3: '#466857', // Cedar
            content4: '#5D9068', // Meadow
            divider: '#346780', // Whulge
            primary: {
              50: '#EEEBE4', // Sea Foam
              100: '#D7CDBE', // Driftwood
              200: '#7396A9', // Ocean
              300: '#6CA18A', // Sea Glass
              400: '#5D9068', // Meadow
              500: '#6CA18A', // Changed to Sea Glass for better visibility
              600: '#7396A9', // Changed to Ocean for better visibility
              700: '#EEEBE4', // Changed to Sea Foam for better visibility
              800: '#D7CDBE', // Changed to Driftwood for better visibility
              900: '#FFFFFF', // White for maximum contrast
              DEFAULT: '#6CA18A', // Sea Glass
              foreground: '#FFFFFF',
            },
            secondary: {
              50: '#FFFAEC', // Skylight
              100: '#EEEBE4', // Sea Foam
              200: '#D7CDBE', // Driftwood
              300: '#6CA18A', // Sea Glass
              400: '#5D9068', // Meadow
              500: '#6CA18A', // Changed to Sea Glass for better visibility
              600: '#7396A9', // Changed to Ocean for better visibility
              700: '#EEEBE4', // Changed to Sea Foam for better visibility
              800: '#D7CDBE', // Changed to Driftwood for better visibility
              900: '#FFFFFF', // White for maximum contrast
              DEFAULT: '#6CA18A', // Sea Glass
              foreground: '#FFFFFF',
            },
          },
        },
      },
    }),
  ],
};

export default config;
