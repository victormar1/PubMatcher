
//#region imports
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
const http = require('http'); // Import http for dev server
const favicon = require('serve-favicon');
const xml2js = require('xml2js');
//#endregion imports

//#region Server Startup
// Conditional configuration for HTTP/HTTPS server
const mode = process.env.NODE_ENV || 'development'; // Par défaut, 'development' si NODE_ENV n'est pas défini
console.log(`Server is starting in ${mode} mode...`);
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
    const privateKeyPath = '/etc/letsencrypt/live/pubmatcher.fr/privkey.pem';
    const certificatePath = '/etc/letsencrypt/live/pubmatcher.fr/fullchain.pem';
    
    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    const certificate = fs.readFileSync(certificatePath, 'utf8');
    const credentials = { key: privateKey, cert: certificate };
    
    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(443, () => {
        console.log(`Running on https://localhost:443`);
    });
} else {
    const httpServer = http.createServer(app);
    httpServer.listen(3000, () => {
        console.log('Running on http://localhost:3000');
    });
}
//#endregion Server Startup


app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
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
});

console.log('Bug report route configured.');

// Load the databases into memory
const mouseDBPath = path.join(__dirname, 'BDD', 'Mouse.xlsx');
const proteinDBPath = path.join(__dirname, 'BDD', 'Protein.xlsx');
const constraints = {};

const mouseDB = XLSX.readFile(mouseDBPath);
const proteinDB = XLSX.readFile(proteinDBPath);
const mouseData = XLSX.utils.sheet_to_json(mouseDB.Sheets[mouseDB.SheetNames[0]]);
const proteinData = XLSX.utils.sheet_to_json(proteinDB.Sheets[proteinDB.SheetNames[0]]);

fs.createReadStream(path.join(__dirname, 'BDD', 'constraints.csv'))
    .pipe(csv({ separator: ';' })) // Specify the correct delimiter if needed
    .on('data', (row) => {
        // Ensure the gene names match those in your results
        constraints[row.gene] = {
        pLI: row.pLI,
        oe_mis_upper: row.oe_mis_upper,
        oe_lof_upper: row.oe_lof_upper,
        mis_z: row.mis_z
        };
    })
    .on('end', () => {
        console.log('Constraints CSV file successfully processed');
    });

app.get('/', (req, res) => {
    res.render('index', { results: [], phenotypes: '' });
});

app.post('/search', async (req, res) => {
    const results = await getData(req);
    res.render('index', { results, phenotypes: req.body.phenotypes });
});

app.get('/search', async (req, res) => {
    req.body = req.query
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


async function fetchGeneCARD(gene) {
    //gene="ldlr"
    const hgncresponse = await fetch(`https://rest.genenames.org/fetch/symbol/${gene}`);
    let xmlData = await hgncresponse.text();

    if (hgncresponse.status === 200) {
        xmlData = xmlData.replace(/^\uFEFF/, '');

        // Parse XML data in a Promise
        const validatedGene = await new Promise((resolve, reject) => {
            xml2js.parseString(xmlData, (err, result) => {
                if (err) {
                console.error("Error parsing XML:", err);
                reject(err);
                return;
                }

                // Check if there are any genes found
                const numFound = parseInt(result.response.result?.[0]?.$?.numFound, 10);
                if (numFound > 0) {
                    const doc = result.response.result[0].doc[0];

                    // Extract specific fields with fallback to "No match"
                    const geneName = doc.str?.find(item => item.$.name === "name")?._ || "No match";
                    const location = doc.str?.find(item => item.$.name === "location")?._ || "No match";
                    const aliasName = doc.arr?.find(item => item.$.name === "alias_name")?.str?.[0] || "No match";
                    const maneSelect = doc.arr?.find(item => item.$.name === "mane_select")?.str || "No match";
                    const mgdId = doc.arr?.find(item => item.$.name === "mgd_id")?.str?.[0] || "No match";
                    const enzymeId = doc.arr?.find(item => item.$.name === "enzyme_id")?.str?.[0] || "No match";
                    const uniprotIds = doc.arr?.find(item => item.$.name === "uniprot_ids")?.str?.map(item => item)[0] || "No match";
                    const hgncId = doc.str?.find(item => item.$.name === "hgnc_id")?._ || "No match";
                    const rgdId = doc.arr?.find(item => item.$.name === "rgd_id")?.str?.[0] || "No match";
                    const ensemblGeneId = doc.str?.find(item => item.$.name === "ensembl_gene_id")?._ || "No match";
                    const orphanet = doc.int?.find(item => item.$.name === "orphanet")?._ || "No match";
                    const dateModified = doc.date?.find(item => item.$.name === "date_modified")?._ || "No match";
                    const dateApprovedReserved = doc.date?.find(item => item.$.name === "date_approved_reserved")?._ || "No match";

                    // Create the validatedGene object with extracted data
                    const validatedGene = {
                        geneName,
                        aliasName,
                        location,
                        maneSelect,
                        mgdId,
                        enzymeId,
                        uniprotIds,
                        hgncId,
                        rgdId,
                        ensemblGeneId,
                        orphanet,
                        dateModified,
                        dateApprovedReserved
                    };

                    resolve(validatedGene); // Resolve with the validated gene data
                } else {
                    console.log("No gene found");
                    resolve(false)// Resolve with null if no genes found
                }
            });
        });

        return validatedGene; // Return validatedGene after parse completion
    } else {
        console.error("Failed to fetch data from HGNC API.");
        return null;
    }
}
async function getUniProtFunction(uniprotId) {
    try {

        const uniProtApiUrl = `https://www.ebi.ac.uk/proteins/api/proteins/${uniprotId}.xml`;
        const responseuniprot = await axios.get(uniProtApiUrl);
        if (responseuniprot.status === 200) {
            let proteinMatch = null;
            await responseuniprot.data.comments.some((element) => {
                if (element.type === "FUNCTION") {
                    proteinMatch = element.text[0].value;
                    return; // 
                }
            });
            return proteinMatch
        }else {
            return "No match"
        }
    } catch (error) {
        console.error("Error fetching UniProt data:", error);
        return "No uniprot match"
    }
}
async function getData(req) {
    //Get input / clean / remove spaces
    const genes = req.body.genes.split(',').map(gene => gene.trim()).filter(item => item !== "N/A");
    //Remove duplicates
    const genesWithoutDuplicate = Array.from(new Set(genes));
    //Get phenotypes  
    const phenotypes = req.body.phenotypes.split(',').map(phenotype => phenotype.trim());
    const results = await Promise.all(genesWithoutDuplicate.map(async (gene) => {

        const queries = phenotypes.map(phenotype => `${gene} AND ${phenotype}`);
        const combinedQuery = queries.join(' OR ');
        const validatedGene = await fetchGeneCARD(gene);
        //If gene is non existent, exit
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

            //fecth function  
            let uniProtFunction = await getUniProtFunction(validatedGene.uniprotIds);

            //Crops function text
            if(uniProtFunction){
                if (uniProtFunction.length > 800) {
                    uniProtFunction = uniProtFunction.substring(0, 800) + "... ";
                }
            }

            //Get mouse phenotypes corresp
            const mouseUrl = `https://www.ebi.ac.uk/mi/impc/solr/genotype-phenotype/select?q=marker_accession_id:"${validatedGene.mgdId}"`;      
            console.log(mouseUrl)
            var mouseMatch = "No match"
            
            try {
                const response = await axios.get(mouseUrl);
                console.log(response.data.response.docs)
                //const markerSymbol = response.data.response.docs[0].marker_symbol;
                const mouseKOPhenotypes = response.data.response.docs.map(result => result.mp_term_name).join(' ');
                console.log(validatedGene.mgdId)
                mouseMatch = {
                    Gene:validatedGene.geneName,
                    'Souris KO':mouseKOPhenotypes
                }
                console.log(mouseMatch)
            } catch (error) {
                console.error("Error fetching phenotypes from Alliance:", error);
                
            }

            //Get path ??
            const path = response.request.path;

            //Build result
            let result = {
                gene,//Name  
                function: uniProtFunction || "No match",//Function
                mousePhenotype: mouseMatch?.['Souris KO'] || "No match",//MouseKO
                url,//Pubmed
                panelAppEnglandCount: 0,  // Valeur par défaut
                panelAppAustraliaCount: 0, // Valeur par défaut
                urlAccession: `https://www.uniprot.org/uniprotkb/${validatedGene.uniprotIds}/entry`,//Url to UniProt
                geneLink: validatedGene.hgncId ? `https://search.thegencc.org/genes/${validatedGene.hgncId}` : ""//Url to HGNC
            };


            if (!path.includes("term")) {
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
            console.error(`Erreur lors de la recherche pubmed pour ${combinedQuery}:`, error);
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


