/** @type {import('tailwindcss').Config} */
// Colores institucionales de la v1 (#3b8842, #a6ce7d, #f6fff8, #5a318e, #82a915), organizados en escalas.
// Para texto sobre fondo de color se usan los tonos 700+ (contraste AA ≥ 4.5:1 con blanco).
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        verde: {
          50: '#f6fff8',
          100: '#e6f4e1',
          200: '#c9e6b4',
          300: '#a6ce7d',
          400: '#74b05a',
          500: '#4f9a50',
          600: '#3b8842',
          700: '#2f6e35',
          800: '#26582b',
          900: '#1d4321',
          950: '#122a15'
        },
        lima: { 400: '#9cc42a', 500: '#82a915', 600: '#6a8a10' },
        morado: { 50: '#f5f0fb', 100: '#e9dff5', 500: '#6c3fa8', 600: '#5a318e', 700: '#4a2775', 800: '#3b1f5d' }
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'system-ui', '-apple-system', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif']
      },
      boxShadow: { suave: '0 1px 2px rgb(16 40 20 / 0.06), 0 4px 16px rgb(16 40 20 / 0.06)' }
    }
  },
  plugins: []
}
