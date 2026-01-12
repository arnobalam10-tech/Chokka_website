/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chokka-green': '#6DBE86',
        'chokka-dark': '#1a3325',
        'chokka-cream': '#FDFDF5',
        'chokka-accent': '#E8F358',
      },
      fontFamily: {
        'display': ['Impact', 'Haettenschweiler', 'sans-serif'],
        'body': ['Verdana', 'sans-serif'],
      },
      boxShadow: {
        'neo': '5px 5px 0px 0px rgba(26, 51, 37, 1)',
      }
    },
  },
  plugins: [],
}