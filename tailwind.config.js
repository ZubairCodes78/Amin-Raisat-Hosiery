/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#09090c',
          surface: '#121217',
          card: '#181820',
          hover: '#20202b',
          border: '#252530',
          'border-light': '#353545',
        },
        brand: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#09090c',
        },
        gold: {
          50: '#FAF6ED',
          100: '#F4ECDA',
          200: '#E9DAB5',
          300: '#DFC791',
          400: '#D5B56C',
          500: '#D4AF37',
          600: '#B59226',
          700: '#8E7118',
          800: '#66500C',
        },
        burgundy: {
          DEFAULT: '#722F37',
          light: '#8D3B45',
          dark: '#542127',
        },
        whatsapp: '#25D366',
        'whatsapp-dark': '#128C7E',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.35s ease-out forwards',
        'slide-up': 'slideUp 0.35s ease-out forwards',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseSubtle: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 4px 14px 0 rgba(37, 211, 102, 0.35)' },
          '50%': { transform: 'scale(1.025)', boxShadow: '0 6px 20px 2px rgba(37, 211, 102, 0.45)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.25)',
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        card: '0 4px 12px -2px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.4)',
        elevation: '0 10px 30px -5px rgba(0, 0, 0, 0.7), 0 8px 12px -6px rgba(0, 0, 0, 0.5)',
        'glow-primary': '0 4px 20px -2px rgba(212, 175, 55, 0.2)',
        'glow-whatsapp': '0 4px 16px 0 rgba(37, 211, 102, 0.35)',
        'glow-gold': '0 0 20px -2px rgba(212, 175, 55, 0.3)',
      },
    },
  },
  plugins: [],
};
