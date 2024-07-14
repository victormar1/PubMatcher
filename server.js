require('dotenv').config();

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
const moment = require('moment');
const PdfPrinter = require('pdfmake');
const nodemailer = require('nodemailer');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json())

// Configuration de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Route pour rapporter un bug
app.post('/reportbug', (req, res) => {
    console.log('Received /reportbug request'); // Ajout de message de débogage

    const { name, message } = req.body;
    console.log('Bug report data:', { name, message }); // Ajout de message de débogage

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: 'Bug Report from Pubmatcher',
        text: `Name: ${name}\n\nMessage: ${message}`
    };

    console.log('Mail Options:', mailOptions); // Ajout de message de débogage

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            res.status(500).send('Error sending email');
        } else {
            console.log('Email sent:', info.response);
            res.status(200).send('Email sent');
        }
    });
    res.status(200).send("Bug report received");
});

console.log('Bug report route configured.');

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
    const genes = req.body.genes.split(',').map(gene => gene.trim()).filter(item => item !== "N/A");
    const genesWithoutDuplicate = Array.from(new Set(genes));
    const phenotypes = req.body.phenotypes.split(',').map(phenotype => phenotype.trim());

    const results = await Promise.all(genesWithoutDuplicate.map(async (gene) => {
        const queries = phenotypes.map(phenotype => `(${gene} AND ${phenotype})`);
        const combinedQuery = queries.join(' OR ');
        const url = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(combinedQuery)}`;
        const uniprotapi = `https://www.ebi.ac.uk/proteins/api/proteins?offset=0&size=100&exact_gene=${gene}&organism=homo%20sapiens`;

        try {
            const [response, responseuniprot] = await Promise.all([axios.get(url), axios.get(uniprotapi)]);
            const $ = cheerio.load(response.data);
            const titleSelector = "#search-results > section > div.search-results-chunks > div > article:nth-child(2) > div.docsum-wrap > div.docsum-content > a";
            const countSelector = "#search-results > div.top-wrapper > div.results-amount-container > div.results-amount > h3 > span";

            const title = $(titleSelector).text().trim();
            const countText = $(countSelector).text().trim().replace(',', '');
            const count = parseInt(countText, 10);

            let proteinMatch = "";
            if (responseuniprot.status === 200) {
                await responseuniprot.data.some((element) => {
                    if (element.comments) {
                        const comments = element.comments;
                        const finded = comments.some((comment) => {
                            if (comment.type === 'FUNCTION') {
                                proteinMatch = comment.text[0].value;
                                return true;
                            }
                        });
                        if (finded) return true;
                    }
                });
            }

            if (proteinMatch.length > 800) {
                proteinMatch = proteinMatch.substring(0, 800) + " [...]";
            }

            const mouseMatch = mouseData.find(row => row.Gene === gene);
            const path = response.request.path;

            if (path.includes("term")) {
                return {
                    gene,
                    title: title || "No result",
                    count: isNaN(count) ? 0 : count,
                    function: proteinMatch !== "" ? proteinMatch : "No match",
                    mousePhenotype: (mouseMatch && !(typeof mouseMatch['Souris KO'] === "undefined")) ? mouseMatch['Souris KO'] : "No match",
                    url: url
                };
            } else {
                return {
                    gene,
                    title: $("#full-view-heading > h1.heading-title").text().trim(),
                    count: 1,
                    function: proteinMatch ? proteinMatch : "No match",
                    mousePhenotype: (mouseMatch && !(typeof mouseMatch['Souris KO'] === "undefined")) ? mouseMatch['Souris KO'] : "No match",
                    url: url
                };
            }
        } catch (error) {
            console.error(`Erreur lors de la recherche pour ${combinedQuery}:`, error);
            return null;
        }
    }));

    const validResults = results.filter(result => result !== null);

    await Promise.all(validResults.map(async (result) => {
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
    }));

    return validResults;
}


// Route pour générer le PDF
app.post('/export-pdf', (req, res) => {
    const results = JSON.parse(req.body.results);
    const phenotypes = req.body.phenotypes;

    // Polices par défaut pour pdfmake
    const fonts = {
        Roboto: {
            normal: 'Helvetica',
            bold: 'Helvetica-Bold',
            italics: 'Helvetica-Oblique',
            bolditalics: 'Helvetica-BoldOblique'
        }
    };

    // Fonction pour créer une cellule avec une image ou du texte
    function createCell(content, fontSize = 8) {
        if (content === "No match") {
            return { image: path.join(__dirname, 'public', 'cross.png'), width: 10, alignment: 'center' };
        }
        return { text: content, alignment: 'center', fontSize, margin: [0, 5] };
    }

    // Ajustement des largeurs des colonnes
    const colWidths = [50, 90, 30, 140, 100, 40]; // Réduction de moitié de la colonne PanelApp ENG/AUS et augmentation de Function

    // Contenu du document PDF
    const docDefinition = {
        pageSize: 'A4',
        pageOrientation: 'portrait',
        pageMargins: [20, 20, 20, 40], // Réduction des marges en haut
        content: [
            {
                columns: [
                    { image: path.join(__dirname, 'public', 'logo.png'), width: 50 }, // Taille du logo réduite
                    {
                        width: '*',
                        stack: [
                            { text: 'Search Results', style: 'header', alignment: 'center' },
                            { text: `Generated on: ${moment().format('MMMM Do YYYY, h:mm:ss a')}`, style: 'subheader', alignment: 'center' },
                            { text: 'Phenotypes:', style: 'subheader', alignment: 'center' },
                            { text: phenotypes, alignment: 'center', margin: [0, 5, 0, 0] } // Marge ajustée
                        ]
                    }
                ]
            },
            {
                style: 'tableExample',
                table: {
                    headerRows: 1,
                    widths: colWidths,
                    body: [
                        ['Gene', 'Title', 'Count', 'Function', 'Mouse Phenotype', 'PanelApp\nENG/AUS'].map(header => ({ text: header, fontSize: 8, bold: true, alignment: 'center' })), // Retour à la ligne
                        ...results.map(result => [
                            createCell(result.gene),
                            createCell(result.title && result.title.length > 800 ? result.title.substring(0, 800) + '...' : result.title || "No result"),
                            createCell(result.count ? result.count.toString() : "0"),
                            createCell(result.function && result.function.length > 800 ? result.function.substring(0, 800) + '...' : result.function || "No match"),
                            createCell(result.mousePhenotype && result.mousePhenotype.length > 800 ? result.mousePhenotype.substring(0, 800) + '...' : result.mousePhenotype || "No match"),
                            createCell(`${result.panelAppEnglandCount.toString()}/${result.panelAppAustraliaCount.toString()}`)
                        ])
                    ]
                },
                layout: 'lightHorizontalLines'
            }
        ],
        styles: {
            header: {
                fontSize: 18, // Police ajustée
                bold: true,
                margin: [0, 5, 0, 5] // Réduction de la marge en haut et en bas
            },
            subheader: {
                fontSize: 12, // Police ajustée
                bold: true,
                margin: [0, 5, 0, 5] // Réduction de la marge en haut et en bas
            },
            tableExample: {
                margin: [0, 5, 0, 15] // Réduction de la marge
            }
        },
        footer: function (currentPage, pageCount) {
            return {
                columns: [
                    { text: '', alignment: 'left' },
                    { image: path.join(__dirname, 'public', 'logo.png'), width: 20, alignment: 'right' } // Petit logo en bas à droite
                ],
                margin: [20, 0]
            };
        }
    };

    // Génération du PDF
    const printer = new PdfPrinter(fonts);
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const filename = `PM_${moment().format('DDMMYY_HHmm')}.pdf`;
    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');
    pdfDoc.pipe(res);
    pdfDoc.end();
});



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
        genesList.push(row.geneName); // Assurez-vous que 'geneName' correspond à la clé de votre fichier CSV
      })
      .on('end', () => {
        console.log('CSV file successfully processed');
      });
}

// Appel de la fonction pour charger les gènes
loadGenesFromFile('./BDD/genes.csv'); // Remplacez par le chemin correct de votre fichier CSV

app.post('/extract-genes', (req, res) => {
    const text = req.body.text;
    const foundGenes = genesList.filter(gene => {
        const regex = new RegExp(`\\b${gene}\\b`, 'i'); // correspondance exacte insensible à la casse
        return regex.test(text);
    });
    // Trier les gènes trouvés selon leur ordre d'apparition dans le texte
    foundGenes.sort((a, b) => text.indexOf(a) - text.indexOf(b));
    res.json({ genes: foundGenes });
});

