/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        disaster: {
          critical: "#EF4444",
          high: "#F97316",
          moderate: "#EAB308",
          low: "#10B981",
          dark: "#0F172A",
          card: "#1E293B",
          border: "#334155"
        }
      }
    },
  },
  plugins: [],
}
