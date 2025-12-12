const fs = require('fs');
const path = require('path');

let genesList = [];
let isReady = false;

function loadGenesFromJson(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        return reject(err);
      }
      try {
        const parsed = JSON.parse(data);
        genesList = parsed;
        isReady = true;
        console.log(`Loaded ${genesList.length} genes from JSON`);
        resolve();
      } catch (parseErr) {
        reject(parseErr);
      }
    });
  });
}

const jsonPath = path.resolve(__dirname, '..', 'BDD', 'genes.json');
loadGenesFromJson(jsonPath).catch((err) => {
  console.error('Error loading genes JSON:', err);
});

exports.getGenesList = (req, res) => {
  if (!isReady) {
    return res.status(503).json({ error: 'Genes list not ready yet.' });
  }
  res.json({ genes: genesList });
};

exports.genesReady = () => isReady;
