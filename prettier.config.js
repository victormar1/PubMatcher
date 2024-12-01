const config = {
  trailingComma: 'none',
  semi: false,
  singleQuote: true,
  jsxSingleQuote: true,
  printWidth: 500,
  tabWidth: 2,
  plugins: [require('prettier-plugin-tailwindcss')] // Add the Tailwind CSS plugin
}

module.exports = config
