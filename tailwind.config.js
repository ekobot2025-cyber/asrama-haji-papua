/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Kiswah Gold & Charcoal Palette (siap-haji-papua.vercel.app)
        kiswah: {
          50: '#FAF9F5', // Cream body background
          100: '#fbf8ee', // Gold light badge & hover
          200: '#f4ebd0', // Gold cream active
          300: '#e8dfc8', // Warm gold border
          400: '#d4af37', // Metallic gold highlight
          500: '#c9a961', // Signature Kiswah Gold
          600: '#b8941e', // Rich Gold Dark / Ochre
          700: '#8a6d2b', // Deep Gold Text
          800: '#7a6122', // Darker Gold Text
          900: '#2A2018', // Kiswah Dark Charcoal
          950: '#1A1410', // Deepest Kiswah Black
        },
        haji: {
          50: '#FAF9F5',
          100: '#fbf8ee',
          200: '#f4ebd0',
          300: '#e8dfc8',
          400: '#d4af37',
          500: '#c9a961',
          600: '#b8941e',
          700: '#8a6d2b',
          800: '#7a6122',
          900: '#2A2018',
          950: '#1A1410',
          primary: '#c9a961', // Signature Kiswah Gold
          secondary: '#b8941e', // Kiswah Gold Dark
          gold: '#c9a961',
          dark: '#1A1410', // Kiswah Black
          light: '#FAF9F5',
          border: '#e8dfc8',
        },
        papua: {
          gold: '#c9a961',
          goldDark: '#b8941e',
          goldLight: '#fbf8ee',
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
