// routes/extractGenes.js
const express = require('express');
const router = express.Router();
const extractGenesController = require('../controllers/extractgenesController.js');

/**
 * POST /extract-genes
 * Route pour extraire des gènes à partir d'un texte donné
 */
router.post('/', extractGenesController.extractGenes);

module.exports = router;
