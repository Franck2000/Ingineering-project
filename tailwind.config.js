/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Thème Cyber Security - Violet/Rose
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        cyber: {
          dark: '#1a0a2e',
          darker: '#0f0518',
          purple: '#7c3aed',
          violet: '#8b5cf6',
          pink: '#ec4899',
          magenta: '#d946ef',
          accent: '#c084fc',
          glow: '#a855f7',
        },
        surface: {
          primary: '#1e1033',
          secondary: '#2d1f4a',
          tertiary: '#3d2a5f',
          card: 'rgba(45, 31, 74, 0.8)',
          glass: 'rgba(138, 92, 246, 0.1)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #1a0a2e 0%, #2d1f4a 50%, #1e1033 100%)',
        'purple-glow': 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
        'card-gradient': 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)',
        'accent-gradient': 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
        'button-gradient': 'linear-gradient(135deg, #9333ea 0%, #7c3aed 50%, #6366f1 100%)',
      },
      boxShadow: {
        'cyber': '0 0 30px rgba(139, 92, 246, 0.3)',
        'cyber-lg': '0 0 50px rgba(139, 92, 246, 0.4)',
        'glow-purple': '0 4px 20px rgba(147, 51, 234, 0.4)',
        'glow-pink': '0 4px 20px rgba(236, 72, 153, 0.3)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(139, 92, 246, 0.1)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
