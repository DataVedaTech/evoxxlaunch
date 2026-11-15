/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        evoxx: {
          orange: '#FF6B00',
          orangeHover: '#E65F00',
          navy: '#101828',
          bg: '#F7F8FA',
          text: '#111827',
          success: '#16A34A',
          warning: '#F59E0B',
          error: '#DC2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"Roboto Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
