/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
        },
        surface: {
          DEFAULT: "var(--color-surface)",
          tint: "var(--color-bg-tint)",
          bg: "var(--color-bg)",
        },
        content: {
          DEFAULT: "var(--color-text)",
          muted: "var(--color-text-muted)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
        },
        border: {
          DEFAULT: "var(--color-border)",
        },
        severity: {
          red: {
            DEFAULT: "var(--color-severity-red)",
            tint: "var(--color-severity-red-tint)",
          },
          yellow: {
            DEFAULT: "var(--color-severity-yellow)",
            tint: "var(--color-severity-yellow-tint)",
          },
          green: {
            DEFAULT: "var(--color-severity-green)",
            tint: "var(--color-severity-green-tint)",
          },
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

