// utils/loadGenesFromFile.js
const fs = require('fs');
const csv = require('csv-parser');

/**
 * Charge la liste des gènes depuis un fichier CSV
 * @param {String} filePath - Chemin vers le fichier CSV contenant les gènes
 * @returns {Promise<Array>} - Promesse résolue avec un tableau de noms de gènes
 */
function loadGenesFromFile(filePath) {
    return new Promise((resolve, reject) => {
        const genes = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                genes.push(row.geneName); // Assurez-vous que 'geneName' correspond à la clé de votre fichier CSV
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

module.exports = loadGenesFromFile;
