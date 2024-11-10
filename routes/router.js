// routes/router.js
const express = require('express');
const router = express.Router();

// Import contrôleurs
const searchController = require('../controllers/searchController');
const reportbugController = require('../controllers/reportbugController');
const exportpdfController = require('../controllers/exportpdfController');
const extractgenesController = require('../controllers/extractgenesController');
const apiController = require('../controllers/apiController');


// Route pour la recherche
router.post('/search', searchController.search);

// Route pour le rapport de bug
router.post('/reportbug', reportbugController.reportBug);

// Route pour l'exportation en PDF
router.post('/exportpdf', exportpdfController.exportPdf);

// Route pour l'extraction de gènes
router.post('/extractgenes', extractgenesController.extractGenes);

// Route pour api
router.get('/api/search', apiController.searchApi);


// Route root
router.get('/', (req, res) => {
    res.render('index', { results: [], phenotypes: '' });
});



module.exports = router;
