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
        neuron: {
          50: '#eefbff',
          100: '#dcf5ff',
          200: '#b2edff',
          300: '#6de1ff',
          400: '#20cfff',
          500: '#00b8f0',
          600: '#0094cd',
          700: '#0075a5',
          800: '#006388',
          900: '#065271',
          950: '#04354c',
        },
        gene: {
          collaboration: '#00b8f0',
          decision: '#8b5cf6',
          knowledge: '#10b981',
          innovation: '#f59e0b',
          resilience: '#ef4444',
          vitality: '#ec4899',
        },
        infection: {
          low: '#10b981',
          medium: '#f59e0b',
          high: '#ef4444',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
