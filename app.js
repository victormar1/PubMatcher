require('dotenv').config();
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const { configureServer } = require('./config/server');
const configureNodemailer = require('./config/nodemailer');

// Initialize the Express app
const app = express();

// Middleware configuration
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public'))); // Static files
app.use(express.static(path.join(__dirname, 'dist'))); // Serve Vue's built files
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure Nodemailer
configureNodemailer(app);

// Configure server startup
configureServer(app);

// Handle API routes
const router = require('./routes/router');
app.use('/api', router); // Prefix API routes with '/api'

// Handle SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html')); // Always serve the Vue SPA
});




// Export the app for tests or other uses
module.exports = app;
