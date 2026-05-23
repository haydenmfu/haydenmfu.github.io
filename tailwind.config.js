/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a0a0a',
        paper: '#f4f2ee',
        'paper-mid': '#e8e4dc',
        'paper-dark': '#c8c2b4',
        accent: '#9b30ff',
        'accent-dim': '#7b1ff0',
        cyan: '#00e5ff',
      },
      fontFamily: {
        display: ['"CC Wild Words"', '"Space Grotesk"', 'system-ui', 'sans-serif'],
        label: ['"Komika"', '"Space Grotesk"', 'sans-serif'],
        body: ['"DM Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        deco: ['"Pastry Cream"', 'cursive'],
      },
      borderWidth: {
        3: '3px',
      },
      boxShadow: {
        'offset-sm': '4px 4px 0 #0a0a0a',
        'offset-md': '6px 6px 0 #0a0a0a',
        'offset-lg': '10px 10px 0 #0a0a0a',
        'offset-accent': '6px 6px 0 #9b30ff',
        'offset-white': '6px 6px 0 #ffffff',
      },
      keyframes: {
        'slide-in': {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
};
