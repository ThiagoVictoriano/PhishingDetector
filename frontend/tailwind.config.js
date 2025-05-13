/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",                      // Arquivo HTML principal
    "./src/**/*.{js,ts,jsx,tsx}",         // Incluir arquivos JS, TS, JSX e TSX dentro da pasta src
  ],
  theme: {
    extend: {},  // Aqui você pode adicionar customizações ao seu tema
  },
  plugins: [],
}
