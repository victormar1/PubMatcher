require('dotenv').config()
const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const bodyParser = require('body-parser')
const { configureServer } = require('./config/server')
const logger = require('./services/logger') // Adjust path if needed
const router = require('./routes/router')

// Initialize the Express app
const app = express()

logger.info('🚀 Starting PubMatcher Backend...')

// Middleware configuration
try {
  app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
  app.use(express.static(path.join(__dirname, 'dist'))) // Serve Vue's built files
  app.use(express.static(path.join(__dirname, 'public'))) // Static files
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json())
  logger.info('✔️ Middleware configured successfully.')
} catch (error) {
  logger.error('❌ Error configuring middleware.')
}

// Configure server startup
try {
  configureServer(app)
  logger.info('✔️ Server configuration applied.')
} catch (error) {
  logger.error('❌ Error applying server configuration.')
}

// Handle API routes
try {
  app.use('/api', router)
  logger.info('✔️ API routes registered successfully.')
} catch (error) {
  logger.error('❌ Error registering API routes.')
}

// Handle SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html')) // Always serve the Vue SPA
})

logger.info('📡 Backend is running.')

// Export the app for tests or other uses
module.exports = app
