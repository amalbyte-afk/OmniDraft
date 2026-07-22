/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0E0A0A',
        'surface': '#3E4540',
        'bg-glass': 'rgba(14, 10, 10, 0.72)',
        'glass-border': 'rgba(255, 255, 255, 0.06)',
        primary: '#CA5826',
        'primary-hover': '#6C3318',
        accent: '#CA5826',
        'accent-hover': '#6C3318',
        highlight: '#FFF682',
        'text-primary': '#FFFFFF',
        'text-secondary': 'rgba(255, 255, 255, 0.65)',
        border: 'rgba(255, 255, 255, 0.08)',
        success: '#22C55E',
        error: '#EF4444',
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: ['Satoshi', 'General Sans', 'Inter', 'Manrope', 'system-ui', 'sans-serif'],
        heading: ['Equinox', 'General Sans', 'Inter', 'Manrope', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '14px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      backdropBlur: {
        glass: '20px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'float 7s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'glow-soft': 'glowSoft 3s ease-in-out infinite alternate',
        'shimmer-fast': 'shimmer 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 30px rgba(202, 88, 38, 0.08)' },
          '100%': { boxShadow: '0 0 60px rgba(202, 88, 38, 0.2)' },
        },
        glowSoft: {
          '0%': { boxShadow: '0 0 20px rgba(202, 88, 38, 0.05)' },
          '100%': { boxShadow: '0 0 40px rgba(202, 88, 38, 0.12)' },
        },
      },
    },
  },
  plugins: [],
};
