/** Tailwind theme: every color resolves to a CSS variable from src/styles/variables.css */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: 'var(--color-primary)', hover: 'var(--color-primary-hover)' },
        page: 'var(--color-bg)',
        surface: { DEFAULT: 'var(--color-surface)', tint: 'var(--color-bg-tint)' },
        content: { DEFAULT: 'var(--color-text)', muted: 'var(--color-text-muted)' },
        accent: 'var(--color-accent)',
        border: 'var(--color-border)',
        soft: { blue: 'var(--color-soft-blue)', sage: 'var(--color-sage)', cream: 'var(--color-warm-cream)' },
        severity: {
          red: 'var(--color-severity-red)',
          'red-tint': 'var(--color-severity-red-tint)',
          yellow: 'var(--color-severity-yellow)',
          'yellow-tint': 'var(--color-severity-yellow-tint)',
          green: 'var(--color-severity-green)',
          'green-tint': 'var(--color-severity-green-tint)',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
