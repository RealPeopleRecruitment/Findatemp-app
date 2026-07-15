import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0b5fff',
          dark: '#0847c9',
          light: '#eef2ff',
        },
      },
    },
  },
  plugins: [],
};
export default config;
