// controllers/extractGenesController.js
const loadGenesFromFile = require('../utils/loadgenesfromfile.js');
const path = require('path');

let genesList = [];

// Charger les gènes au démarrage
loadGenesFromFile(path.join(__dirname, '..', 'BDD', 'genes.csv'))
    .then(genes => {
        genesList = genes;
        console.log('Genes loaded successfully.');
    })
    .catch(error => {
        console.error('Error loading genes:', error);
    });

/**
 * Controller pour extraire des gènes à partir d'un texte donné
 * @param {Request} req - Objet requête Express
 * @param {Response} res - Objet réponse Express
 */
exports.extractGenes = (req, res) => {
    const text = req.body.text;
    const foundGenes = genesList.filter(gene => {
        const regex = new RegExp(`\\b${gene}\\b`, 'i'); // Correspondance exacte insensible à la casse
        return regex.test(text);
    });

    // Trier les gènes trouvés selon leur ordre d'apparition dans le texte
    foundGenes.sort((a, b) => text.indexOf(a) - text.indexOf(b));
    res.json({ genes: foundGenes });
};
