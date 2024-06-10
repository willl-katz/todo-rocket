import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Produto
        'blue-dark': '#1E6F9F',
        'blue': '#4EA8DE',
        'blue-hover': '#227DB5',
        'purple-dark': '#5E60CE',
        'purple': '#8284FA',
        // Base
        'gray-700': '#0D0D0D',
        'gray-600': '#1A1A1A',
        'gray-500': '#262626',
        'gray-400': '#333333',
        'gray-300': '#808080',
        'gray-200': '#D9D9D9',
        'gray-100': '#F2F2F2',
        // Feedback
        'danger': '#E25858'
      },
      width: {
        'profile-user': '3.125rem'
      },
      height: {
        'profile-user': '3.125rem'
      },
      maxWidth: {
        'grid': '724px'
      }
    },
  },
  plugins: [],
};
export default config;
