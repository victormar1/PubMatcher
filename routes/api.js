// routes/api.js
const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController.js');

/**
 * GET /api/search
 * Route API pour effectuer une recherche et renvoyer les résultats au format JSON
 */
router.get('/search', apiController.searchApi);

module.exports = router;
