import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '320px',
      'sm': '375px', 
      'md': '768px',
      'lg': '1024px',
      'xl': '1440px',
      '2xl': '1920px',
    },
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
      },
      backgroundColor: {
        'app-bg': 'var(--background)',
        'card-bg': 'var(--card-bg)',
        'hover-bg': 'var(--hover)',
      },
      textColor: {
        'app-text': 'var(--foreground)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
      },
      borderColor: {
        'app-border': 'var(--card-border)',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      animation: {
        'in': 'in 0.3s ease-out',
        'out': 'out 0.3s ease-in',
      },
      keyframes: {
        in: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        out: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(10px)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};

export default config; 