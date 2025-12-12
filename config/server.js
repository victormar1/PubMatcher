// config/server.js
const http = require('http')

function configureServer(app) {
  const port = process.env.PORT || 3000
  const mode = process.env.NODE_ENV || 'development'

  console.log(`Server is starting in ${mode} mode...`)

  const server = http.createServer(app)

  server.listen(port, () => {
    console.log(`App listening on http://0.0.0.0:${port}`)
  })
}

module.exports = { configureServer }
