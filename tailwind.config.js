/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./context/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#0066ff",         // Pure Blue
        primary: "#0A3D62",       // Deep Blue
        accent: "#0066ff",        // Pure Blue
        royal: "#3A6EA5",         // Royal Sky
        surface: "#ffffff",       // Light Mode Background
        iceWhite: "#F5FAFF",      
        mistGray: "#E3E8EF",      
        slateInk: "#1E293B",      
        success: "#16A34A",       
        warning: "#F59E0B",       
      },
      boxShadow: {
        blueGlow: "0 8px 24px rgba(0, 102, 255, 0.25)",
        structure: "0 6px 18px rgba(0,0,0,0.06)",
        glow: "0 8px 24px rgba(0, 102, 255, 0.18)",
      },
      keyframes: {
        overlayMove: {
          '0%, 100%': { transform: 'translate3d(0,0,0)', opacity: '0.10' },
          '50%': { transform: 'translate3d(2%, -2%, 0)', opacity: '0.16' },
        },
        clickPop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.96)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        overlayMove: 'overlayMove 14s ease-in-out infinite',
        clickPop: 'clickPop 200ms ease-out',
      },
      borderRadius: {
        lg: '8px', // ROUND_EIGHT from Stitch
        xl: '1rem',
      }
    },
  },
  plugins: [],
};
