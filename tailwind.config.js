/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },
      colors: {
        // Cor da plataforma STCK
        brand: {
          50: '#EEF7F2',
          100: '#E4F1EA',
          200: '#C2E0CF',
          300: '#8CC6A7',
          400: '#4FA57B',
          500: '#178A60',
          600: '#0E6B4F',
          700: '#0A4E3A',
          800: '#08392B',
          900: '#06281F',
        },
        ink: {
          DEFAULT: '#10190F',
          muted: '#5B6B63',
          soft: '#8A978F',
        },
        canvas: '#FBFBFA',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16,25,15,0.04), 0 8px 24px -12px rgba(16,25,15,0.12)',
        lift: '0 24px 48px -24px rgba(16,25,15,0.25)',
      },
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-in': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'pop': { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.15)' }, '100%': { transform: 'scale(1)' } },
      },
      animation: {
        'fade-up': 'fade-up .5s cubic-bezier(.2,.7,.3,1) both',
        'fade-in': 'fade-in .2s ease both',
        'slide-in': 'slide-in .28s cubic-bezier(.2,.7,.3,1) both',
        pop: 'pop .4s ease',
      },
    },
  },
  plugins: [],
};
