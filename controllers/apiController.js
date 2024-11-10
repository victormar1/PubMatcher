// controllers/apiController.js
const getData = require('../services/dataservice.js');

/**
 * Controller pour gérer les requêtes API de recherche
 * @param {Request} req - Objet requête Express
 * @param {Response} res - Objet réponse Express
 */
exports.searchApi = async (req, res) => {
    try {
        const genesQuery = req.query.genes ? req.query.genes.split(',') : [];
        const phenotypesQuery = req.query.phenotypes ? req.query.phenotypes.split(',') : [];

        req.body = req.query;
        const results = await getData(req);

        res.json({
            query: {
                genes: genesQuery,
                phenotypes: phenotypesQuery
            },
            results: results
        });
    } catch (error) {
        console.error('Error in API search:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

