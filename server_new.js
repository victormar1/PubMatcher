
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const csv = require('csv-parser');
const fs = require('fs');
const app = express();
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));  // Serve static files, like the image

const XLSX = require('xlsx');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// Load the databases into memory
const mouseDBPath = path.join(__dirname, 'BDD', 'Mouse.xlsx');
const proteinDBPath = path.join(__dirname, 'BDD', 'Protein.xlsx');

const mouseDB = XLSX.readFile(mouseDBPath);
const proteinDB = XLSX.readFile(proteinDBPath);
const mouseData = XLSX.utils.sheet_to_json(mouseDB.Sheets[mouseDB.SheetNames[0]]);
const proteinData = XLSX.utils.sheet_to_json(proteinDB.Sheets[proteinDB.SheetNames[0]]);

app.get('/', (req, res) => {
    res.render('index', { results: [] });
});

app.post('/search', async (req, res) => {
    const genes = req.body.genes.split(',').map(gene => gene.trim());
    const phenotypes = req.body.phenotypes.split(',').map(phenotype => phenotype.trim());
    
    let results = [];
    
    for (let gene of genes) {
        const queries = phenotypes.map(phenotype => `(${gene} AND ${phenotype})`);
        const combinedQuery = queries.join(' OR ');
        const url = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(combinedQuery)}`;
            
        try {
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);
                
            const titleSelector = "#search-results > section > div.search-results-chunks > div > article:nth-child(2) > div.docsum-wrap > div.docsum-content > a";
            const countSelector = "#search-results > div.top-wrapper > div.results-amount-container > div.results-amount > h3 > span";

            const title = $(titleSelector).text().trim();
            const countText = $(countSelector).text().trim().replace(',', '');
            const count = parseInt(countText, 10);

            // Match with the databases
            const mouseMatch = mouseData.find(row => row.Gene === gene);
            const proteinMatch = proteinData.find(row => row.Gene === gene);
            let mousePhenotype
         
            results.push({
                gene,
                title: title || "Pas de résultats",
                count: isNaN(count) ? 0 : count,
                function: proteinMatch ? proteinMatch.annotation : "Pas de correspondance",
                mousePhenotype: (mouseMatch && !(typeof mouseMatch['Souris KO'] === "undefined")) ? mouseMatch['Souris KO'] : "Pas de correspondance",
                url: url
            });
        } catch (error) {
            console.error(`Erreur lors de la recherche pour ${combinedQuery}:`, error);
        }
    }

    res.render('index', { results });
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
