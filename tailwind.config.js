/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
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
          950: '#020617',
        },
        accent: {
          DEFAULT: '#722F37',
          hover: '#5A252C',
          light: '#F5E6E8',
        },
        gold: {
          50: '#FFFBF5',
          100: '#FEF7E0',
          200: '#FDECC8',
          300: '#FCDF9E',
          400: '#FACC15',
          500: '#D4AF37',
          600: '#B8960C',
          700: '#9A7B0A',
        },
        burgundy: {
          DEFAULT: '#722F37',
          light: '#8B3D47',
          dark: '#5A252C',
        },
        whatsapp: '#25D366',
        'whatsapp-dark': '#128C7E',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        marquee: 'marquee 35s linear infinite',
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
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        elevation: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'glow-soft': '0 4px 20px -2px rgba(0, 0, 0, 0.12)',
        'glow-primary': '0 4px 18px -1px rgba(15, 23, 42, 0.22)',
        'glow-whatsapp': '0 4px 16px 0 rgba(37, 211, 102, 0.35)',
        'glow-gold': '0 0 18px -2px rgba(234, 179, 8, 0.22)',
      },
    },
  },
  plugins: [],
};
