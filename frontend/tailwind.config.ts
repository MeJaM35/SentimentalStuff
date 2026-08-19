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
        brand: {
          bg: "#F8F9FA",
          text: "#1A1C20",
          muted: "#6B7280",
          accent: "#4F46E5",
          positive: "#10B981",
          neutral: "#D1D5DB",
          negative: "#EF4444",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      boxShadow: {
        'none': 'none',
      },
      borderRadius: {
        'sm': '2px',
        DEFAULT: '4px',
        'md': '4px',
        'lg': '4px',
        'xl': '4px',
        '2xl': '4px',
        '3xl': '4px',
      }
    },
  },
  plugins: [],
};
export default config;
