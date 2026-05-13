/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#d9467a',
        'primary-dark': '#b83267',
        text: '#2d1b24',
        muted: '#7a5d68',
        border: '#f1d7e1',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '18px',
        '2xl': '22px',
      },
      boxShadow: {
        'soft': '0 10px 30px rgba(80, 25, 46, 0.08)',
      }
    },
  },
  plugins: [],
}