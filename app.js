// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const { configureServer } = require('./config/server');
const configureNodemailer = require('./config/nodemailer');

// Initialiser l'application Express
const app = express();

// Configuration des middleware
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configurer Nodemailer
configureNodemailer(app);

// Configurer le démarrage du serveur
configureServer(app);

// Charger les routes
const indexRoutes = require('./routes/index');
const reportBugRoutes = require('./routes/reportBug');
const searchRoutes = require('./routes/search');
const apiRoutes = require('./routes/api');
const exportPdfRoutes = require('./routes/exportPdf');
const extractGenesRoutes = require('./routes/extractGenes');

// Utiliser les routes
app.use('/', indexRoutes);
app.use('/reportbug', reportBugRoutes);
app.use('/search', searchRoutes);
app.use('/api', apiRoutes);
app.use('/export-pdf', exportPdfRoutes);
app.use('/extract-genes', extractGenesRoutes);

// Exporter l'application pour les tests ou autres utilisations
module.exports = app;
