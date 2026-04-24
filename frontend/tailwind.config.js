/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /** Marca tech (verde neón); `primary-*` del proyecto apunta aquí para consistencia */
        primary: {
          50: '#ecfdf8',
          100: '#d0fae8',
          200: '#a3f0d4',
          300: '#5fe8b8',
          400: '#2ee89e',
          500: '#00ff88',
          600: '#00d975',
          700: '#00b35f',
          800: '#047857',
          900: '#064e3b',
        },
        accent: {
          50: '#ecfdf8',
          100: '#d0fae8',
          200: '#a3f0d4',
          300: '#5fe8b8',
          400: '#2ee89e',
          500: '#00ff88',
          600: '#00d975',
          700: '#00b35f',
          800: '#047857',
          900: '#064e3b',
        },
      },
      boxShadow: {
        glow: '0 0 28px rgba(0, 255, 136, 0.18)',
        'glow-sm': '0 0 16px rgba(0, 255, 136, 0.12)',
      },
    },
  },
  plugins: [],
}
