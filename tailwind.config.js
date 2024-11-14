/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.{html,ejs,js}", // Add your EJS templates here
    "./public/**/*.{html,js}", // Add your HTML and JavaScript files here
  ],
  theme: {
    extend: {
      height: {
        '120': '30rem', // Adds a new height class `h-120` equivalent to 30rem (480px)
        '144': '36rem', // Adds `h-144` equivalent to 36rem (576px)
        // Add more custom heights as needed
      },
      minHeight: {
        '96': '24rem', // You could also add custom `min-h` values
        '120': '30rem', 
        '144': '36rem',
      },
    },
  },
  plugins: [],
}