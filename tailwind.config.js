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
        primary: {
          red: "#EF5350",     // main action color
          purple: "#B9A7D3",  // logo purple
        },
        accent: {
          red: "#F48FB1",
          purple: "#C9BCE1",
        },
        neutral: {
          dark: "#2C2E35",
          gray: "#696C75",
          light: "#F7F7F9",
          muted: "#9EA0A6"
        },
        ui: {
          surface: "#ffffff",
          highlight: "#F3F4F6"
        }
      },
      fontFamily: {
        inter: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        'md-lg': '12px'
      },
      boxShadow: {
        card: '0 6px 18px rgba(43,47,59,0.06)',
      }
    },
  },
  plugins: [],
}
