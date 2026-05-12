/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          crimson: '#8b1a1a',
          'crimson-dark': '#6b1414',
          royal: '#1e3a8a',
          navy: '#1a2744',
          amber: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
}
