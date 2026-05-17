/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        echo: {
          bg: '#0A0A0F',
          surface: '#111118',
          card: '#16161F',
          border: '#1E1E2E',
          accent: '#7C3AED',
          'accent-light': '#9F67FF',
          'accent-glow': '#7C3AED40',
          text: '#E2E2F0',
          muted: '#6B6B80',
          success: '#22C55E',
          danger: '#EF4444',
        }
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'radial-gradient(at 40% 20%, hsla(267,100%,50%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(197,100%,50%,0.1) 0px, transparent 50%)',
      }
    },
  },
  plugins: [],
}
