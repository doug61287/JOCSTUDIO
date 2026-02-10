/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'joc-blue': {
          900: '#1E3A8A',
          800: '#1E40AF',
          700: '#1D4ED8',
          600: '#2563EB',
          500: '#3B82F6',
        },
        'joc-gold': '#FFD700',
      },
    },
  },
  plugins: [],
}
