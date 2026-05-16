/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F6F3',
        surface: '#FFFFFF',
        border: '#E4E2DC',
        text: {
          primary: '#111111',
          muted: '#888880',
        },
        accent: {
          DEFAULT: '#2B5CE6',
          hover: '#1E46C4',
          light: '#EEF2FF',
        },
        tag: '#F0EFEB',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'xl': '14px',
      }
    },
  },
  plugins: [],
}
