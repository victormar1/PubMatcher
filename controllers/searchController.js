// controllers/searchController.js
const getData = require('../services/dataservice.js');

/**
 * Controller pour gérer les requêtes de recherche
 * @param {Request} req - Objet requête Express
 * @param {Response} res - Objet réponse Express
 */
exports.search = async (req, res) => {
    try {
        const results = await getData(req);
        res.render('index', { results, phenotypes: req.body.phenotypes });
    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).send('Internal Server Error');
    }
};
