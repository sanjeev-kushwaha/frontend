/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1D2D44',     // for main UI background
        secondary: '#3E5C76',   // for cards or mid-backgrounds
        accent: '#748CAB',      // for buttons, icons, highlights
        light: '#F0EBD8',       // for text or light backgrounds
        dark: '#0D1321',        // for deep backgrounds
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
  
}


