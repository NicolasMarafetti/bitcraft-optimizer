/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bitcraft-primary': '#4F46E5',
        'bitcraft-secondary': '#10B981',
        'bitcraft-accent': '#F59E0B',
        'bitcraft-dark': '#1F2937',
        'bitcraft-light': '#F9FAFB',
      },
    },
  },
  plugins: [],
}