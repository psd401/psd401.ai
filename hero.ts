import { heroui } from '@heroui/react';

export default heroui({
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
});
