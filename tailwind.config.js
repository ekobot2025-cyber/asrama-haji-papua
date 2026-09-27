/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Official haji.go.id Palette: Royal Navy Blue, Kemenag Emerald, Kiswah Gold
        kemenag: {
          blue: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af', // haji.go.id --primary-color
            900: '#1e3a8a', // haji.go.id --primary-dark
            950: '#0f172a',
          },
          green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
            700: '#059669', // haji.go.id --secondary-color
            800: '#047857', // haji.go.id --secondary-dark
            900: '#064e3b',
            950: '#022c22',
          },
          gold: {
            50: '#fffdf5',
            100: '#fff8e7', // haji.go.id background tint
            200: '#fdf1cc',
            300: '#fbe4a3',
            400: '#f7cf6e',
            500: '#c9a961', // haji.go.id official gold
            600: '#b8941e', // haji.go.id --secondary-color in loading
            700: '#947214',
            800: '#795b16',
            900: '#674d17',
          }
        },
        haji: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#059669',
          800: '#047857',
          900: '#064e3b',
          950: '#0f172a',
          primary: '#1e40af', // haji.go.id Primary Royal Navy
          secondary: '#059669', // haji.go.id Secondary Emerald
          gold: '#c9a961', // haji.go.id Accent Gold
          dark: '#0f172a', // haji.go.id Dark Navy
          light: '#eff6ff',
        },
        papua: {
          gold: '#c9a961', // haji.go.id Gold
          goldDark: '#b8941e',
          goldLight: '#fff8e7',
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
