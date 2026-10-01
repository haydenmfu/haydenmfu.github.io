/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#203b43',
        paper: '#f8f5e9',
        'paper-mid': '#eee9d7',
        'paper-dark': '#d9d2bc',
        accent: '#3d858c',
        'accent-dim': '#286b73',
        cyan: '#a9d6d0',
      },
      fontFamily: {
        display: ['"Nunito"', 'system-ui', 'sans-serif'],
        label: ['"Nunito"', 'system-ui', 'sans-serif'],
        body: ['"Nunito"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        deco: ['"Pastry Cream"', 'cursive'],
      },
      borderWidth: {
        3: '3px',
      },
      boxShadow: {
        'offset-sm': '4px 4px 0 #203b43',
        'offset-md': '6px 6px 0 #203b43',
        'offset-lg': '10px 10px 0 #203b43',
        'offset-accent': '6px 6px 0 #3d858c',
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
