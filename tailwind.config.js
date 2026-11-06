/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FAF7F2',
          100: '#F4EFE6',
          200: '#E9E1D2',
        },
        navy: {
          50: '#F1F4F8',
          100: '#DCE3EE',
          200: '#B9C6D9',
          300: '#8DA1BD',
          400: '#5F7BA0',
          500: '#3D5C84',
          600: '#2B4569',
          700: '#1E3251',
          800: '#13233D',
          900: '#0B1D36',
        },
        gold: {
          50: '#FBF7EC',
          100: '#F5EACB',
          200: '#EDD79E',
          300: '#E2C070',
          400: '#D6AE4E',
          500: '#C9A24B',
          600: '#A9832F',
          700: '#86662A',
          800: '#6B5226',
          900: '#4F3C1D',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'scale-in': {
          from: { opacity: '0', transform: 'translateY(12px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'scale-in': 'scale-in 240ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slide-up 320ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
