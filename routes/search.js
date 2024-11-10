// routes/search.js
const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController.js');

/**
 * POST /search
 * Route pour traiter les requêtes de recherche via un formulaire
 */
router.post('/', searchController.search);

/**
 * GET /search
 * Route pour traiter les requêtes de recherche via des paramètres de requête
 */
router.get('/', searchController.search);

module.exports = router;
