/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Change this if necessary

  content: [
    './src/**/*.{html,js,vue}'
    // Ajoute d'autres chemins si nécessaire
  ],
  theme: {
    extend: {
      fontFamily: {
        noto: ['Noto Sans'],
        poppins: ['Poppins', 'sans-serif']
      }
    }
  },
  plugins: []
}
