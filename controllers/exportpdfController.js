// controllers/exportPdfController.js
const pdfService = require('../services/pdfservice.js');
const moment = require('moment');

/**
 * Controller pour générer et exporter les résultats de recherche en PDF
 * @param {Request} req - Objet requête Express
 * @param {Response} res - Objet réponse Express
 */
exports.exportPdf = async (req, res) => {
    try {
        const results = JSON.parse(req.body.results);
        const phenotypes = req.body.phenotypes;

        const pdfBuffer = await pdfService.generatePdf(results, phenotypes);
        const filename = `PM_${moment().format('DDMMYY_HHmm')}.pdf`;

        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
};
