/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: '#1E293B',
        input: '#1E293B',
        ring: '#06B6D4',
        background: '#050A14',
        foreground: '#F8FAFC',
        primary: {
          DEFAULT: '#06B6D4',
          foreground: '#0F172A',
        },
        secondary: {
          DEFAULT: '#1E293B',
          foreground: '#F8FAFC',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#F8FAFC',
        },
        muted: {
          DEFAULT: '#1E293B',
          foreground: '#94A3B8',
        },
        accent: {
          DEFAULT: '#3B82F6',
          foreground: '#F8FAFC',
        },
        popover: {
          DEFAULT: '#0F172A',
          foreground: '#F8FAFC',
        },
        card: {
          DEFAULT: '#0F172A',
          foreground: '#F8FAFC',
        },
        success: '#10B981',
        warning: '#F59E0B',
        chart: {
          1: '#06B6D4',
          2: '#3B82F6',
          3: '#10B981',
          4: '#F59E0B',
          5: '#EF4444',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      fontFamily: {
        heading: ['Barlow Condensed', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
