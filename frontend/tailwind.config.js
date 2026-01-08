/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-green': '#00ff7f',
        'dark-bg': '#0b0e11',
      }
    },
  },
  plugins: [],
}