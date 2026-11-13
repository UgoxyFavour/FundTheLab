/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#05070E',
        surface: {
          50: '#141A29',
          100: '#0E131F',
          200: '#0A0E17',
          card: 'rgba(14, 19, 31, 0.75)',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        brand: {
          cyan: '#00F0FF',
          teal: '#00D2BA',
          purple: '#8B5CF6',
          indigo: '#6366F1',
          emerald: '#10B981',
          amber: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 30px -5px rgba(0, 240, 255, 0.25)',
        'glow-purple': '0 0 35px -5px rgba(139, 92, 246, 0.25)',
        'glow-teal': '0 0 30px -5px rgba(0, 210, 186, 0.25)',
        'card-hover': '0 16px 36px -12px rgba(0, 240, 255, 0.12)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
