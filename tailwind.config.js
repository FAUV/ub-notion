
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#0ea5e9' }
      },
      boxShadow: { 'soft': '0 8px 30px rgba(0,0,0,0.08)' },
      borderRadius: { '2xl': '1.25rem' }
    }
  },
  plugins: []
}
