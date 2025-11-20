/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kh: {
          red: "#EF5350",     // Primary Action
          purple: "#B9A7D3",  // Brand/Logo
          dark: "#2C2E35",    // Text
          gray: "#696C75",    // Muted Text
          light: "#F7F7F9",   // Background
          surface: "#ffffff", // Card Background
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        'card-hover': '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
        'input': '0 0 0 1px #e5e7eb', // Subtle border
        'input-focus': '0 0 0 2px #EF5350', // Focus ring
      }
    },
  },
  plugins: [],
}