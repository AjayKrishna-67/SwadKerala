import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  plugins: [require('@tailwindcss/forms')],
  important: '#app',

  theme: {
    extend: {
      screens: {
        mob: '425px',
        md: '768px',
      },
      colors: {
        // SWAD KERALA Logo Colors
        // Primary: Deep Navy Blue / Dark Teal
        'navy': {
          DEFAULT: '#1E3A5F',
          dark: '#0F172A',
          light: '#2D4A6B',
          50: '#E8EDF3',
          100: '#D1DBE7',
          200: '#A3B7CF',
          300: '#7593B7',
          400: '#476F9F',
          500: '#1E3A5F',
          600: '#182E4C',
          700: '#122239',
          800: '#0C1626',
          900: '#060B13',
        },
        // Accent: Metallic Gold / Bronze
        'spice': {
          DEFAULT: '#CD7F32',
          gold: '#D4AF37',
          light: '#E8C28A',
          50: '#FAF5EB',
          100: '#F5EBD7',
          200: '#EBD7AF',
          300: '#E1C387',
          400: '#D7AF5F',
          500: '#CD7F32',
          600: '#A36628',
          700: '#7A4D1E',
          800: '#523314',
          900: '#291A0A',
        },
        'gold': {
          DEFAULT: '#D4AF37',
          light: '#E8C28A',
          dark: '#B8860B',
        },
        // Background: Cream tones
        'cream': {
          DEFAULT: '#FFFEF0',
          light: '#FAF3E0',
          background: '#FFFEF8',
        },
        // Legacy support - map to new colors
        'primary': {
          DEFAULT: '#1E3A5F',
          50: '#E8EDF3',
          100: '#D1DBE7',
          200: '#A3B7CF',
          300: '#7593B7',
          400: '#476F9F',
          500: '#1E3A5F',
          600: '#182E4C',
          700: '#122239',
          800: '#0C1626',
          900: '#060B13',
        },
      },
      animation: {
        dropIn: 'dropIn 0.2s ease-out',
        marquee: 'marquee 20s linear infinite',
      },
      keyframes: {
        dropIn: {
          '0%': { transform: 'translateY(-100px)' },
          '100%': { transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
} satisfies Config;
