/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff7ff",
          100: "#dbeeff",
          200: "#bee0ff",
          300: "#91ccff",
          400: "#5aaeff",
          500: "#2f8cff",
          600: "#1f6de9",
          700: "#1d57d5",
          800: "#2047ac",
          900: "#223f87",
        },
      },
      boxShadow: {
        glass: "0 10px 30px rgba(15, 23, 42, 0.12)",
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(circle at 0% 0%, rgba(59,130,246,0.2), transparent 50%), radial-gradient(circle at 100% 0%, rgba(147,51,234,0.2), transparent 45%)",
      },
    },
  },
  plugins: [],
}

