/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bites-brown': '#4a2c2a',
        'bites-cream': '#FFC383',
        'bites-gold': '#d4af37',
        'bites-dark-brown': '#2d1a19',
        'bites-cream-light': '#fdf5e6', // El centro claro
        'bites-cream-dark': '#f9ecd2',  // El tono más cálido para el borde
      },
      backgroundImage: {
      'bites-gradient': "radial-gradient(circle, var(--tw-gradient-stops))",
    }
    },
  },
  plugins: [],
}