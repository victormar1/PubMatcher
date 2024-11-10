// services/pdfService.js
const PdfPrinter = require('pdfmake');
const path = require('path');
const moment = require('moment');

/**
 * Génère un PDF basé sur les résultats de recherche et les phénotypes
 * @param {Array} results - Liste des résultats de recherche
 * @param {String} phenotypes - Liste des phénotypes associés
 * @returns {Buffer} pdfBuffer - Buffer contenant le PDF généré
 */
async function generatePdf(results, phenotypes) {
    const fonts = {
        Roboto: {
            normal: 'Helvetica',
            bold: 'Helvetica-Bold',
            italics: 'Helvetica-Oblique',
            bolditalics: 'Helvetica-BoldOblique'
        }
    };

    /**
     * Crée une cellule pour le tableau PDF, avec une image ou du texte
     * @param {String} content - Contenu de la cellule
     * @param {Number} fontSize - Taille de la police
     * @returns {Object} Cellule formatée pour pdfmake
     */
    function createCell(content, fontSize = 8) {
        if (content === "No match") {
            return { image: path.join(__dirname, '..', 'public', 'cross.png'), width: 10, alignment: 'center' };
        }
        return { text: content, alignment: 'center', fontSize, margin: [0, 5] };
    }

    // Largeurs des colonnes
    const colWidths = [50, 90, 30, 140, 100, 40];

    // Définition du document PDF
    const docDefinition = {
        pageSize: 'A4',
        pageOrientation: 'portrait',
        pageMargins: [20, 20, 20, 40],
        content: [
            {
                columns: [
                    { image: path.join(__dirname, '..', 'public', 'logo.png'), width: 50 },
                    {
                        width: '*',
                        stack: [
                            { text: 'Search Results', style: 'header', alignment: 'center' },
                            { text: `Generated on: ${moment().format('MMMM Do YYYY, h:mm:ss a')}`, style: 'subheader', alignment: 'center' },
                            { text: 'Phenotypes:', style: 'subheader', alignment: 'center' },
                            { text: phenotypes, alignment: 'center', margin: [0, 5, 0, 0] }
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
                        ['Gene', 'Title', 'Count', 'Function', 'Mouse Phenotype', 'PanelApp\nENG/AUS'].map(header => ({ text: header, fontSize: 8, bold: true, alignment: 'center' })),
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
                fontSize: 18,
                bold: true,
                margin: [0, 5, 0, 5]
            },
            subheader: {
                fontSize: 12,
                bold: true,
                margin: [0, 5, 0, 5]
            },
            tableExample: {
                margin: [0, 5, 0, 15]
            }
        },
        footer: function (currentPage, pageCount) {
            return {
                columns: [
                    { text: '', alignment: 'left' },
                    { image: path.join(__dirname, '..', 'public', 'logo.png'), width: 20, alignment: 'right' }
                ],
                margin: [20, 0]
            };
        }
    };

    // Générer le PDF et le retourner en tant que buffer
    return new Promise((resolve, reject) => {
        const printer = new PdfPrinter(fonts);
        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        const chunks = [];

        pdfDoc.on('data', chunk => chunks.push(chunk));
        pdfDoc.on('end', () => {
            const result = Buffer.concat(chunks);
            resolve(result);
        });
        pdfDoc.on('error', err => reject(err));
        pdfDoc.end();
    });
}

module.exports = { generatePdf };
