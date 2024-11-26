const getData = require('../services/dataservice.js');
/**
 * Controller pour gérer les requêtes de recherche (GET et POST)
 * @param {Request} req - Objet requête Express
 * @param {Response} res - Objet réponse Express
 */
exports.search = async (req, res) => {
    try {

        const genes = req.method === 'POST' ? req.body.genes : req.query.genes;
        const phenotypes = req.method === 'POST' ? req.body.phenotypes : req.query.phenotypes;

        const queryParams = { body: { genes, phenotypes } };
        const results = await getData(queryParams);

        res.json({ results });
        } catch (error) {
        console.error('Error during search:', error);
        res.status(500).send('Internal Server Error');
    }
};
