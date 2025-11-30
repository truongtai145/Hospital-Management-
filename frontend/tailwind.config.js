/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Dòng này bắt buộc phải có để quét tất cả các file trong src
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1f2b6c', 
        secondary: '#159eec',
      },
      fontFamily: {
        serif: ['"Yeseva One"', 'serif'],
        sans: ['"Work Sans"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}