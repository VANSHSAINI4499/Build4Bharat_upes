import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#050508',
          secondary: '#0d0d14',
          card: 'rgba(255,255,255,0.04)',
        },
        accent: {
          purple: '#7c3aed',
          blue: '#3b82f6',
          green: '#10b981',
          cyan: '#06b6d4',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'purple-blue': 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
        'green-cyan': 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
      },
      animation: {
        'gradient-x': 'gradient-x 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'waveform': 'waveform 1.2s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'beam': 'beam 10s linear infinite',
        'fade-up': 'fade-up 0.6s ease forwards',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'float': {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'waveform': {
          '0%,100%': { transform: 'scaleY(0.25)' },
          '50%': { transform: 'scaleY(1)' },
        },
        'beam': {
          '0%': { transform: 'translateX(-100%) rotate(-30deg)' },
          '100%': { transform: 'translateX(300%) rotate(-30deg)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
