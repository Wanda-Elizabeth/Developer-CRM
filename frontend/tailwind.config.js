/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  extend: {
    keyframes: {
      ticker: {
        "0%": { transform: "translateX(0)" },
        "100%": { transform: "translateX(-33.33%)" },
      },
    },
    animation: {
      ticker: "ticker 25s linear infinite",
    },
  },
},

  plugins: [],
}

