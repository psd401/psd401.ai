/** @type {import('tailwindcss').Config} */
const config = {
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
  plugins: [],
};

export default config;
