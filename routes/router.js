// routes/router.js
const express = require('express')
const router = express.Router()

// Import contrôleurs
const searchController = require('../controllers/searchController')
const reportbugController = require('../controllers/reportbugController')
const exportpdfController = require('../controllers/exportpdfController')
const extractgenesController = require('../controllers/extractgenesController')
const registerController = require('../controllers/registerController')
const loginController = require('../controllers/loginController')
const authenticateToken = require('../src/authentication')
const userHistoryController = require('../controllers/userHistoryController')
const sendPwResetMailController = require('../controllers/sendPwResetMailController')
const resetPasswordController = require('../controllers/resetPasswordController') // Add your new controller

// Route pour la recherche
router.post('/search', searchController.search)

// Route GET pour la recherche
router.get('/search', searchController.search)

// Route pour le rapport de bug
router.post('/reportbug', reportbugController.reportBug)

// Route pour l'exportation en PDF
router.post('/exportpdf', exportpdfController.exportPdf)

// Route pour l'extraction de gènes
router.get('/geneslist', extractgenesController.getGenesList)

router.post('/register', registerController.register)

router.post('/login', loginController.login)

router.get('/account', authenticateToken, (req, res) => {
  res.json({ user: req.user })
})

router.get('/getuserhistory', authenticateToken, userHistoryController.getHistory)

router.post('/sendPwResetMail', sendPwResetMailController)
router.get('/reset-password:token', resetPasswordController.validateToken)
router.post('/reset-password', resetPasswordController.resetPassword)

router.get('/account', authenticateToken, (req, res) => {
  userHistoryController.getHistory(req, res)
})

// Route root
router.get('/', (req, res) => {
  res.render('index', { results: [], phenotypes: '' })
})

module.exports = router
