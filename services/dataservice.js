// services/dataService.js
const fetchGeneCARD = require('../utils/fetchgenecard.js');
const getUniProtFunction = require('../utils/getuniprotfunction.js');
const axios = require('axios');
const cheerio = require('cheerio');
const xml2js = require('xml2js');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

let constraints = {};
let svgIcons = [];


/**
 * Charge les contraintes depuis le fichier CSV une seule fois au démarrage
 */
function loadConstraints(datasetKey, fileName) {
    const constraintsPath = path.join(__dirname, '..', 'BDD', fileName);

    // Ensure constraints container for the datasetKey exists
    if (!constraints[datasetKey]) {
        constraints[datasetKey] = {};
    }

    fs.createReadStream(constraintsPath)
        .pipe(csv({ separator: ';' }))
        .on('data', (row) => {
            constraints[datasetKey][row.gene] = {
                pLI: row.pLI,
                oe_mis_upper: row.oe_mis_upper,
                oe_lof_upper: row.oe_lof_upper,
                mis_z: row.mis_z
            };
        })
        .on('end', () => {
            console.log(`Constraints CSV file (${datasetKey}) successfully processed`);
        })
        .on('error', (error) => {
            console.error(`Error reading constraints CSV (${datasetKey}):`, error);
        });
}



//load the svgData.json 


function loadSVGIcons() {
    const entries = [];
    const folderPath = 'BDD/SVG/';

    // Lire tous les fichiers dans le dossier
    const files = fs.readdirSync(folderPath);

    files.forEach((file) => {
        const filePath = path.join(folderPath, file);

        // Vérifier si le fichier est un SVG
        if (path.extname(file) === '.svg') {
            // Lire le contenu du fichier SVG
            let svgContent = fs.readFileSync(filePath, 'utf-8');

            svgContent = svgContent
                .replace(/width="[^"]*"/, 'width="25px"')// DEGUELASSE A CHANGER ASAP
                .replace(/height="[^"]*"/, 'height="25px"');

            // Push the modified SVG icon to the array
            svgIcons.push({
                name: path.basename(file, '.svg'), // File name without extension
                path: svgContent, // Modified SVG content
            });
        }
    });
    return svgIcons;
}



// Initialiser les contraintes
loadConstraints('v2', 'constraints_v2.csv'); // Load v2 constraints
loadConstraints('v4', 'constraints_v4.csv'); // Load v4 constraints
const constraints_v2 = constraints.v2 || {};
const constraints_v4 = constraints.v4 || {};
loadSVGIcons();

/**
 * getData traite les requêtes de recherche en récupérant et en compilant les données nécessaires
 * @param {Request} req - Objet requête Express
 * @returns {Array} results - Liste des résultats de recherche
 */
async function getData(req) {
    // Extraire et nettoyer les entrées
    console.log(req)
    const genes = req.body.genes || [];
    const phenotypes = req.body.phenotypes || [];
    
    const results = await Promise.all(genes.map(async (gene) => {
        const validatedGene = await fetchGeneCARD(gene);
        if (!validatedGene) {
            return null;
        }

        let combinedQuery = ''; // Initialize as empty string
        if (phenotypes.length > 0) {
            const queries = phenotypes.map(phenotype => `(${gene} AND ${phenotype})`);
            combinedQuery = queries.join(' OR ');
        } else {
            combinedQuery = gene;
             // Search only by gene if no phenotypes are selected
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
            if (uniProtFunction.proteinMatch && uniProtFunction.proteinMatch.length > 300) {
                uniProtFunction.proteinMatch = uniProtFunction.proteinMatch.substring(0, 300) + "... ";
            }

            // Fetch Mouse Phenotypes
            const mouseUrl = `https://www.ebi.ac.uk/mi/impc/solr/genotype-phenotype/select?q=marker_accession_id:"${validatedGene.mgdId}"`;      
            let mouseMatch = "No match";
            
            const matchingPhenotypes=[]
            const groupedPhenotypes = {};

            try {
                const mouseResponse = await axios.get(mouseUrl);
            
                mouseResponse.data.response.docs.forEach(doc => {
                    const phenotype = {
                        phenotypeName: doc.mp_term_name, // Set the phenotype name
                        phenotypeCategory: doc.top_level_mp_term_name[0].replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() // Set the phenotype category
                    };
                    
                    matchingPhenotypes.push(phenotype); // Add to the list of matching phenotypes
                });
            
                const matchingPhenotypesNoDuplicates = [...new Map(matchingPhenotypes.map(item => [item.phenotypeName, item])).values()];
            
                matchingPhenotypesNoDuplicates.forEach(item => {
                    const { phenotypeCategory, phenotypeName } = item;
            
                    if (!groupedPhenotypes[phenotypeCategory]) {
                        groupedPhenotypes[phenotypeCategory] = {
                            names: [],
                            icon: null
                        };
                    }
                    groupedPhenotypes[phenotypeCategory].names.push(phenotypeName);
                    let matchingIcon = "NoICONFOUND";

                    try {
                        for (const key in svgIcons) {
                            if (svgIcons[key].name === phenotypeCategory) {
                                matchingIcon = svgIcons[key];
                                groupedPhenotypes[phenotypeCategory].icon = matchingIcon ? matchingIcon.path.replace(/^"|"$/g, '') : '';
                                break;
                            }
                        }
                    
                    } catch (error) {
                        console.error("Error finding SVG icon for category:", phenotypeCategory, error);
                    }


                });
            
            } catch (error) {
                console.error("Error fetching phenotypes from IMPC:", error);
            }

            //GOOFY ASS
            if (Object.keys(groupedPhenotypes).length === 0) {
                groupedPhenotypes["noMatch"] = {
                    names: ["No Match"], // Add "No Match" as the name
                    icon: svgIcons.find(icon => icon.name === "noMatch")?.path.replace(/^"|"$/g, '') || '' // Add the SVG icon
                };
            }



            // Obtenir le chemin de la requête
            const requestPath = response.request.path;

            // Construire l'objet résultat
            let result = {
                gene, // Nom  
                function: uniProtFunction.proteinMatch || "No match", // Fonction
                mousePhenotype: groupedPhenotypes, // <- Categories to display
                url, // Pubmed
                functionKeywords : uniProtFunction.keywordsMatch,
                panelAppEnglandCount: 0,  // Valeur par défaut
                panelAppAustraliaCount: 0, // Valeur par défaut
                urlAccession: `https://www.uniprot.org/uniprotkb/${validatedGene.uniprotIds}/entry`, // URL vers UniProt
                geneLink: validatedGene.hgncId ? `https://search.thegencc.org/genes/${validatedGene.hgncId}` : "", // URL vers HGNC
                geneValidity: validatedGene.validityMarker || "No validity found",
                hgncId: validatedGene.hgncId || "No HGNC ID",
            };

            //NoMatch icon
            if(Object.keys(groupedPhenotypes).length===0){
                result.mousePhenotype = "No match";
            }

            if (!requestPath.includes("term")) {
                result.title = $("#full-view-heading > h1.heading-title").text().trim();
                result.count = 1;
            } else {
                result.title = title || "No PubMed Articles";
                result.count = isNaN(count) ? 0 : count;
            }

            if (constraints_v2[gene]) {
                result.constraints_v2 = constraints_v2[gene];
            } else {
                result.constraints_v2 = { pLI: 'N/A', oe_mis_upper: 'N/A', oe_lof_upper: 'N/A', mis_z: 'N/A' };
                result.constraintsDelta = true //if NA in one of the set -> Flag cause difference
            }

            if (constraints_v4[gene]) {
                result.constraints_v4 = constraints_v4[gene];
            } else {
                result.constraints_v4 = { pLI: 'N/A', oe_mis_upper: 'N/A', oe_lof_upper: 'N/A', mis_z: 'N/A' };
                result.constraintsDelta = true
            }


            if(JSON.stringify(result.constraints_v2) === JSON.stringify(result.constraints_v4)) {
                result.constraintsDelta = false //If both na dnt flag
            }
            
            

            const perc = 1.5//perc
            if (constraints_v2[gene] && constraints_v4[gene]) {
                const parseValue = (value) => parseFloat(value.toString().replace(',', '.'));
            
                const v2 = {
                    oe_mis_upper: parseValue(constraints_v2[gene].oe_mis_upper),
                    oe_lof_upper: parseValue(constraints_v2[gene].oe_lof_upper),
                    pLI: parseValue(constraints_v2[gene].pLI),
                    mis_z: parseValue(constraints_v2[gene].mis_z),
                };
            
                const v4 = {
                    oe_mis_upper: parseValue(constraints_v4[gene].oe_mis_upper),
                    oe_lof_upper: parseValue(constraints_v4[gene].oe_lof_upper),
                    pLI: parseValue(constraints_v4[gene].pLI),
                    mis_z: parseValue(constraints_v4[gene].mis_z),
                };
                const condition1 =
                    v2.oe_mis_upper !== 0 &&
                    v4.oe_mis_upper !== 0 &&
                    v4.oe_mis_upper >= v2.oe_mis_upper * perc;
            
                const condition2 =
                    v2.oe_lof_upper !== 0 &&
                    v4.oe_lof_upper !== 0 &&
                    v4.oe_lof_upper >= v2.oe_lof_upper * perc;
            
                const condition3 =
                    v2.pLI !== 0 &&
                    v4.pLI !== 0 &&
                    v4.pLI >= v2.pLI * perc;
            
                const condition4 =
                    v2.mis_z !== 0 &&
                    v4.mis_z !== 0 &&
                    v4.mis_z >= v2.mis_z * perc;
            
                if (condition3 ) {
                    result.constraintsDelta = true;
                } else {
                    result.constraintsDelta = false;
                }

                console.log(v2, v4)
                
            
            
            }
            


            

            return result
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
    console.log(validResults)
}

module.exports = getData;
