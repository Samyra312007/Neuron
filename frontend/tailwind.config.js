/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          20: 'rgb(var(--primary-20, 2 36 72) / <alpha-value>)',
          30: 'rgb(var(--primary-30, 4 53 108) / <alpha-value>)',
          40: 'rgb(var(--primary-40, 6 82 145) / <alpha-value>)',
          95: 'rgb(var(--primary-95, 227 242 251) / <alpha-value>)',
          DEFAULT: '#022448',
        },
        secondary: {
          40: 'rgb(var(--secondary-40, 0 105 114) / <alpha-value>)',
          DEFAULT: '#006972',
        },
        neutral: {
          10: 'rgb(var(--neutral-10, 25 28 30) / <alpha-value>)',
          20: 'rgb(var(--neutral-20, 47 48 51) / <alpha-value>)',
          30: 'rgb(var(--neutral-30, 69 71 74) / <alpha-value>)',
          40: '#5d5f62',
          50: 'rgb(var(--neutral-50, 116 119 127) / <alpha-value>)',
          60: 'rgb(var(--neutral-60, 142 145 153) / <alpha-value>)',
          70: 'rgb(var(--neutral-70, 169 172 180) / <alpha-value>)',
          80: 'rgb(var(--neutral-80, 196 198 207) / <alpha-value>)',
          90: 'rgb(var(--neutral-90, 224 226 234) / <alpha-value>)',
        },
        'surface-container': {
          lowest: 'rgb(var(--surface-lowest, 255 255 255) / <alpha-value>)',
          low: 'rgb(var(--surface, 247 249 251) / <alpha-value>)',
          DEFAULT: 'rgb(var(--surface-container, 236 238 240) / <alpha-value>)',
          high: 'rgb(var(--surface-container-high, 230 232 234) / <alpha-value>)',
        },
        health: {
          optimal: '#22C55E',
          functional: '#EAB308',
          degraded: '#F97316',
          critical: '#EF4444',
          collapse: '#7F1D1D',
        },
        infection: {
          low: '#22C55E',
          medium: '#EAB308',
          high: '#EF4444',
        },
        'dark-matter': '#8B5CF6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
