/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        estinator: {
          bg: '#0a0a0a',
          surface: '#141414',
          border: '#262626',
          accent: '#ef4444',  // Terminator red
          text: '#fafafa',
          muted: '#a1a1aa',
        }
      }
    },
  },
  plugins: [],
}
