import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#f3f3f4',
          card: '#ffffff',
          text: '#111111',
          muted: '#6f6f75',
          border: '#ececef'
        }
      },
      fontFamily: {
        sans: ['SF Pro Text', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif']
      },
      boxShadow: {
        soft: '0 12px 40px rgba(0,0,0,0.08)'
      },
      borderRadius: {
        ios: '28px'
      }
    }
  },
  plugins: []
};

export default config;
