/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        haji: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
          primary: '#0F5132', // Deep Islamic emerald green
          dark: '#08331E',
          light: '#E8F5E9',
        },
        papua: {
          gold: '#C59B27', // Asmat ochre / Papuan gold
          goldDark: '#997312',
          goldLight: '#FDF6E2',
          red: '#B91C1C',
          earth: '#8B4513',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'elevation': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'luxury': '0 12px 35px -8px rgba(15, 81, 50, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'glass': '0 8px 30px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
