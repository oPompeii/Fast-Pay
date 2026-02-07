/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          600: '#2C3E50',
          700: '#1a2634',
          800: '#141e2a',
          900: '#0d1620',
        },
      },
    },
  },
  plugins: [],
};