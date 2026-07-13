/** @type {import('tailwindcss').Config} */
module.exports = {
  // Busca estilos en tu archivo raíz App.tsx y dentro de toda la carpeta src
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#FFE600',
          DEFAULT: '#FACC15',
          dark: '#CA8A04',
        }
      },
    },
  },
  plugins: [],
}