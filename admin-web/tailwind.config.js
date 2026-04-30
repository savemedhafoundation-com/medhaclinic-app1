/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        clinic: {
          50: '#eefbf3',
          100: '#d7f5e2',
          200: '#afe9c6',
          500: '#2f9e5c',
          600: '#23864a',
          700: '#1f6b3e',
          800: '#1b5534',
          900: '#153d28',
          950: '#0b2317',
        },
        ink: '#17211b',
      },
      boxShadow: {
        panel: '0 18px 45px rgba(23, 33, 27, 0.08)',
      },
    },
  },
  plugins: [],
};
