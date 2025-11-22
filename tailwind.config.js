/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        'background-light': '#1a1a1a',
        foreground: '#e0e0e0',
        primary: '#00f6ff',
        secondary: '#ff00f5',
        accent: '#f5d547',
        muted: '#888888',
        'status-available': '#39ff14',
        'status-enroute': '#00f6ff',
        'status-busy': '#f5d547',
        'status-athospital': '#a855f7',
        'priority-critical': '#ff073a',
        'priority-high': '#ff7f00',
        'priority-medium': '#f5d547',
        'priority-low': '#00f6ff',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"Roboto Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-primary': '0 0 15px rgba(0, 246, 255, 0.4), 0 0 5px rgba(0, 246, 255, 0.6)',
        'glow-secondary': '0 0 15px rgba(255, 0, 245, 0.4), 0 0 5px rgba(255, 0, 245, 0.6)',
      },
      textShadow: {
        'glow-primary': '0 0 8px rgba(0, 246, 255, 0.7)',
      },
      animation: {
        'background-pan': 'background-pan 15s ease infinite',
        'subtle-pulse': 'subtle-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'background-pan': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
         'subtle-pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
      },
    },
  },
  plugins: [
     require('tailwindcss/plugin')(function({ theme, addUtilities }) {
      const newUtilities = {
        '.text-shadow-glow-primary': {
          textShadow: theme('textShadow.glow-primary'),
        },
      }
      addUtilities(newUtilities)
    })
  ],
}