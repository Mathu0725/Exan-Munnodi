/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'tamil': ['Noto Sans Tamil', 'system-ui', 'sans-serif'],
        'tamil-serif': ['Tiro Tamil', 'Noto Sans Tamil', 'serif'],
        'sans': ['Noto Sans Tamil', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        midnight: {
          50: '#f4f7fb',
          100: '#e8eef6',
          200: '#cedbef',
          300: '#a8bde3',
          400: '#7a99d2',
          500: '#577bc3',
          600: '#3e5fb1',
          700: '#334c8f',
          800: '#2a3d72',
          900: '#1d2a4f',
        },
        gunmetal: {
          50: '#f5f6f8',
          100: '#eaeef1',
          200: '#cbd3da',
          300: '#aab5c0',
          400: '#7e8a9c',
          500: '#5d6c80',
          600: '#49556a',
          700: '#3d4657',
          800: '#303644',
          900: '#22262f',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}
