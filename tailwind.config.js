/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Change this if necessary

  content: [
    './index.html',
    './src/**/*.{html,js,vue}',
    './node_modules/flowbite/**/*.js'

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
  plugins: [require('flowbite/plugin')]
}
