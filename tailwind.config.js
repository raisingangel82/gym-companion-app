/** @type {import('tailwindcss').Config} */
export default {
  // AGGIUNTA CHIAVE: Abilita la modalità scura basata su una classe CSS
  darkMode: 'class', 
  
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
