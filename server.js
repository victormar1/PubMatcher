
const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const XLSX = require('xlsx');
const { get } = require('http');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json())

// Load the databases into memory
const mouseDBPath = path.join(__dirname, 'BDD', 'Mouse.xlsx');
const proteinDBPath = path.join(__dirname, 'BDD', 'Protein.xlsx');

const mouseDB = XLSX.readFile(mouseDBPath);
const proteinDB = XLSX.readFile(proteinDBPath);
const mouseData = XLSX.utils.sheet_to_json(mouseDB.Sheets[mouseDB.SheetNames[0]]);
const proteinData = XLSX.utils.sheet_to_json(proteinDB.Sheets[proteinDB.SheetNames[0]]);

app.get('/', (req, res) => {
    res.render('index', { results: [], phenotypes: '' });
});

app.post('/search', async (req, res) => {
    const results = await getData(req);
    res.render('index', { results, phenotypes: req.body.phenotypes });
});


app.get('/api/search', async (req, res) => {
    const genesQuery = req.query.genes ? req.query.genes.split(',') : [];
    const phenotypesQuery = req.query.phenotypes ? req.query.phenotypes.split(',') : [];

    req.body = req.query
    const results = await getData(req);

    res.json({
        query: {
            genes: genesQuery,
            phenotypes: phenotypesQuery
        },
        results: results
    });
});

async function getData(req) {
    const genes = req.body.genes.split(',').map(gene => gene.trim()).filter(item => item !== "N/A")
    const genesWithoutDuplicate = [...new Set(genes)];
    const phenotypes = req.body.phenotypes.split(',').map(phenotype => phenotype.trim());
    
    let results = [];
    
    for (let gene of genesWithoutDuplicate) {
        const queries = phenotypes.map(phenotype => `(${gene} AND ${phenotype})`);
        const combinedQuery = queries.join(' OR ');
        const url = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(combinedQuery)}`;
        const uniprotapi = `https://www.ebi.ac.uk/proteins/api/proteins?offset=0&size=100&exact_gene=${gene}&organism=homo%20sapiens`
            
        try {
            const response = await axios.get(url);
            const respReq = response.request
            const path = respReq['path']
            const $ = cheerio.load(response.data);
                
            const titleSelector = "#search-results > section > div.search-results-chunks > div > article:nth-child(2) > div.docsum-wrap > div.docsum-content > a";
            const countSelector = "#search-results > div.top-wrapper > div.results-amount-container > div.results-amount > h3 > span";

            const title = $(titleSelector).text().trim();
            const countText = $(countSelector).text().trim().replace(',', '');
            const count = parseInt(countText, 10);

            // Match with the databases
            const mouseMatch = mouseData.find(row => row.Gene === gene);


            //Version Get Uniprot

            const responseuniprot = await axios.get(uniprotapi);
            let proteinMatch = "";
            if (responseuniprot.status === 200) {
                await responseuniprot.data.some(function (element){
                    if(element.comments){
                        const comments = element.comments
                        const finded = comments.some(function(comment) {
                            if (comment.type === 'FUNCTION') {
                                proteinMatch = comment.text[0].value;
                                return true;
                            }
                        })
                        if (finded) return true
                    }
                }); 
            }

           
            // Version DB Excel en
            //const proteinMatch = proteinData.find(row => row.Gene === gene);

            let mousePhenotype
            if (path.includes("term")) {
                results.push({
                    gene,
                    title: title || "No result",
                    count: isNaN(count) ? 0 : count,
                    function: proteinMatch !== "" ? proteinMatch : "No match",
                    mousePhenotype: (mouseMatch && !(typeof mouseMatch['Souris KO'] === "undefined")) ? mouseMatch['Souris KO'] : "No match",
                    url: url
                });
            } else {
                results.push({
                    gene,
                    title: $("#full-view-heading > h1.heading-title").text().trim(),
                    count: 1,
                    function: proteinMatch ? proteinMatch.annotation : "No match",
                    mousePhenotype: (mouseMatch && !(typeof mouseMatch['Souris KO'] === "undefined")) ? mouseMatch['Souris KO'] : "No match",
                    url: url
                });
            }
        } catch (error) {
            console.error(`Erreur lors de la recherche pour ${combinedQuery}:`, error);
        }
    }


    // Récupération des données PanelApp pour chaque gène
    for (let i = 0; i < results.length; i++) {
        try {
            const panelAppResponse = await axios.get(`https://panelapp.genomicsengland.co.uk/api/v1/genes/?entity_name=${results[i].gene}&format=json`);
            results[i].panelApp = panelAppResponse.data.count;
        } catch (error) {
            console.error(`Error fetching PanelApp data for gene ${results[i].gene}: `, error);
            results[i].panelApp = 'Error';
        }
    }

    return results;
}

// Chemins vers votre certificat SSL et votre clé privée
const privateKeyPath = '/etc/letsencrypt/live/pubmatcher.fr/privkey.pem';
const certificatePath = '/etc/letsencrypt/live/pubmatcher.fr/fullchain.pem';

// Lire les fichiers de certificat
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
const certificate = fs.readFileSync(certificatePath, 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Créer un serveur HTTPS avec les certificats
const httpsServer = https.createServer(credentials, app);

const PORT = 443;
httpsServer.listen(PORT, () => {
    console.log(`Server is running on https://localhost:${PORT}`);
});

let genesList = []; // Pour stocker les gènes du fichier CSV

// Fonction pour lire et stocker les gènes du fichier CSV
function loadGenesFromFile(filePath) {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        genesList.push(row.geneName); 
      })
      .on('end', () => {
        console.log('CSV file successfully processed');
      });
}

// Appel de la fonction pour charger les gènes
loadGenesFromFile('/BDD/genes.csv'); // Remplacez par le chemin correct de votre fichier CSV

// Route pour traiter le texte libre et extraire les gènes
app.post('/extract-genes', (req, res) => {
    const text = req.body.text;
    const foundGenes = genesList.filter(gene => text.includes(gene));
    res.json({ genes: foundGenes });
});
