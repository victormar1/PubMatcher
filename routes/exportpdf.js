// routes/exportPdf.js
const express = require('express');
const router = express.Router();
const exportPdfController = require('../controllers/exportpdfController.js');

/**
 * POST /export-pdf
 * Route pour générer et exporter les résultats de recherche au format PDF
 */
router.post('/', exportPdfController.exportPdf);

module.exports = router;
