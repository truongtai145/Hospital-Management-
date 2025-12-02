/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1f2b6c",
        secondary: "#159eec",
        accent: "#bfd2f8",
      },
      fontFamily: {
        serif: ['"Yeseva One"', "serif"],
        sans: ['"Work Sans"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
