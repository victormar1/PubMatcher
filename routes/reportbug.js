// routes/reportBug.js
const express = require('express');
const router = express.Router();
const reportBugController = require('../controllers/reportbugController.js');

/**
 * POST /reportbug
 * Route pour rapporter un bug via un formulaire
 */
router.post('/', reportBugController.reportBug);

module.exports = router;
