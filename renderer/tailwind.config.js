/** @type {import('tailwindcss').Config} */
export default {
  // CRITICAL: This must be 'selector' or 'class' for your button to work
  darkMode: 'selector', 
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(16px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        slideUp: 'slideUp 0.3s ease-out'
      }
    },
  },
  plugins: [],
}