// routes/index.js
const express = require('express');
const router = express.Router();

/**
 * GET /
 * Route pour la page d'accueil
 */
router.get('/', (req, res) => {
    res.render('index', { results: [], phenotypes: '' });
});

module.exports = router;
