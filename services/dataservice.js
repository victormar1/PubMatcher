// services/dataService.js
const fetchGeneCARD = require('../utils/fetchgenecard.js');
const getUniProtFunction = require('../utils/getuniprotfunction.js');
const axios = require('axios');
const cheerio = require('cheerio');
const xml2js = require('xml2js');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const XLSX = require('xlsx');

let constraints = {};

/**
 * Charge les contraintes depuis le fichier CSV une seule fois au démarrage
 */
function loadConstraints() {
    const constraintsPath = path.join(__dirname, '..', 'BDD', 'constraints.csv');
    fs.createReadStream(constraintsPath)
        .pipe(csv({ separator: ';' }))
        .on('data', (row) => {
            constraints[row.gene] = {
                pLI: row.pLI,
                oe_mis_upper: row.oe_mis_upper,
                oe_lof_upper: row.oe_lof_upper,
                mis_z: row.mis_z
            };
        })
        .on('end', () => {
            console.log('Constraints CSV file successfully processed');
        })
        .on('error', (error) => {
            console.error('Error reading constraints CSV:', error);
        });
}

// Initialiser les contraintes
loadConstraints();

// Charger les bases de données Excel
const mouseDBPath = path.join(__dirname, '..', 'BDD', 'Mouse.xlsx');
const proteinDBPath = path.join(__dirname, '..', 'BDD', 'Protein.xlsx');

const mouseDB = XLSX.readFile(mouseDBPath);
const proteinDB = XLSX.readFile(proteinDBPath);
const mouseData = XLSX.utils.sheet_to_json(mouseDB.Sheets[mouseDB.SheetNames[0]]);
const proteinData = XLSX.utils.sheet_to_json(proteinDB.Sheets[proteinDB.SheetNames[0]]);

/**
 * getData traite les requêtes de recherche en récupérant et en compilant les données nécessaires
 * @param {Request} req - Objet requête Express
 * @returns {Array} results - Liste des résultats de recherche
 */
async function getData(req) {
    // Extraire et nettoyer les entrées
    const genes = req.body.genes.split(',').map(gene => gene.trim()).filter(item => item !== "N/A");
    const genesWithoutDuplicate = Array.from(new Set(genes));
    const phenotypes = req.body.phenotypes.split(',').map(phenotype => phenotype.trim());

    const results = await Promise.all(genesWithoutDuplicate.map(async (gene) => {
        const queries = phenotypes.map(phenotype => `${gene} AND ${phenotype}`);
        const combinedQuery = queries.join(' OR ');
        const validatedGene = await fetchGeneCARD(gene);

        if (!validatedGene) {
            return null;
        }

        try {
            // Appel à l'API PubMed
            const url = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(combinedQuery)}`;
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);
            const titleSelector = "#search-results > section > div.search-results-chunks > div > article:nth-child(2) > div.docsum-wrap > div.docsum-content > a";
            const countSelector = "#search-results > div.top-wrapper > div.results-amount-container > div.results-amount > h3 > span";
            const title = $(titleSelector).text().trim();
            const countText = $(countSelector).text().trim().replace(',', '');
            const count = parseInt(countText, 10);

            // Fetch UniProt function
            let uniProtFunction = await getUniProtFunction(validatedGene.uniprotIds);

            // Tronquer le texte si trop long
            if (uniProtFunction && uniProtFunction.length > 800) {
                uniProtFunction = uniProtFunction.substring(0, 800) + "... ";
            }

            // Fetch Mouse Phenotypes
            const mouseUrl = `https://www.ebi.ac.uk/mi/impc/solr/genotype-phenotype/select?q=marker_accession_id:"${validatedGene.mgdId}"`;      
            let mouseMatch = "No match";
            
            try {
                const mouseResponse = await axios.get(mouseUrl);
                const mouseKOPhenotypes = mouseResponse.data.response.docs.map(result => result.mp_term_name);
                const mouseKOPhenotypesRemoveDuplicate = Array.from(new Set(mouseKOPhenotypes)).join(" - ");
                mouseMatch = {
                    Gene: validatedGene.geneName,
                    'Souris KO': mouseKOPhenotypesRemoveDuplicate
                };
            } catch (error) {
                console.error("Error fetching phenotypes from Alliance:", error);
            }

            // Obtenir le chemin de la requête
            const requestPath = response.request.path;

            // Construire l'objet résultat
            let result = {
                gene, // Nom  
                function: uniProtFunction || "No match", // Fonction
                mousePhenotype: mouseMatch?.['Souris KO'] || "No match", // MouseKO
                url, // Pubmed
                panelAppEnglandCount: 0,  // Valeur par défaut
                panelAppAustraliaCount: 0, // Valeur par défaut
                urlAccession: `https://www.uniprot.org/uniprotkb/${validatedGene.uniprotIds}/entry`, // URL vers UniProt
                geneLink: validatedGene.hgncId ? `https://search.thegencc.org/genes/${validatedGene.hgncId}` : "" // URL vers HGNC
            };

            if (!requestPath.includes("term")) {
                result.title = $("#full-view-heading > h1.heading-title").text().trim();
                result.count = 1;
            } else {
                result.title = title || "No result";
                result.count = isNaN(count) ? 0 : count;
            }

            if (constraints[gene]) {
                result.constraints = constraints[gene];
            } else {
                result.constraints = { pLI: 'N/A', oe_mis_upper: 'N/A', oe_lof_upper: 'N/A', mis_z: 'N/A' };
            }

            return result;

        } catch (error) {
            console.error(`Erreur lors de la recherche PubMed pour ${combinedQuery}:`, error);
            return null;
        }
    }));

    const validResults = results.filter(result => result !== null);
    await Promise.all(validResults.map(async (result) => {
        if (result) {
            try {
                const [panelAppEnglandResponse, panelAppAustraliaResponse] = await Promise.all([
                    axios.get(`https://panelapp.genomicsengland.co.uk/api/v1/genes/?entity_name=${result.gene}&format=json`),
                    axios.get(`https://panelapp.agha.umccr.org/api/v1/genes/?entity_name=${result.gene}&format=json`)
                ]);

                result.panelAppEnglandCount = panelAppEnglandResponse.data.count;
                result.panelAppAustraliaCount = panelAppAustraliaResponse.data.count;
            } catch (error) {
                console.error(`Error fetching PanelApp data for gene ${result.gene}: `, error);
                result.panelAppEnglandCount = 'Error';
                result.panelAppAustraliaCount = 'Error';
            }
        }
    }));

    return validResults;
}

module.exports = getData;