const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

let genesList = [];

/**
 * Function to load genes from a CSV file.
 * Returns a Promise that resolves to the list of genes.
 */
function loadGenesFromFile(filePath) {
    return new Promise((resolve, reject) => {
        const genes = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                genes.push(row.geneName); // Adjust 'geneName' to match your CSV column name
            })
            .on('end', () => {
                console.log('Genes CSV file successfully processed');
                resolve(genes);
            })
            .on('error', (error) => {
                console.error('Error reading genes CSV:', error);
                reject(error);
            });
    });
}

// Load genes during server startup
const csvPath = path.join(__dirname, '..', 'BDD', 'genes.csv');
loadGenesFromFile(csvPath)
    .then((genes) => {
        genesList = genes; // Cache the loaded genes in memory
        console.log('Genes loaded successfully.');
    })
    .catch((error) => {
        console.error('Error loading genes during startup:', error);
    });

/**
 * Controller to return the list of genes.
 * Responds with the cached genes list.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
exports.getGenesList = (req, res) => {
    console.log('Received /geneslist request');
    res.json({ genes: genesList });
};
