
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const app = express();
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
    res.render('index', { results: [], phenotypes: '' });
});

app.post('/search', async (req, res) => {
    const genes = req.body.genes.split(',').map(gene => gene.trim()).filter(item => item !== "N/A")
    const genesWithoutDuplicate = [...new Set(genes)];
    const phenotypes = req.body.phenotypes.split(',').map(phenotype => phenotype.trim());
    
    let results = [];
    
    for (let gene of genesWithoutDuplicate) {
        const queries = phenotypes.map(phenotype => `(${gene} AND ${phenotype})`);
        const combinedQuery = queries.join(' OR ');
        const url = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(combinedQuery)}`;
            
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
            const proteinMatch = proteinData.find(row => row.Gene === gene);
            let mousePhenotype

            if (path.includes("term")) {
                results.push({
                    gene,
                    title: title || "No result",
                    count: isNaN(count) ? 0 : count,
                    function: proteinMatch ? proteinMatch.annotation : "No match",
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

res.render('index', { results, phenotypes: req.body.phenotypes });


});

const PORT = 8080;
app.use('/public', express.static(path.join(__dirname, 'public')));
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
