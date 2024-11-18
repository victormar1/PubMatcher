// utils/fetchGeneCARD.js
const axios = require('axios');
const xml2js = require('xml2js');
const Gene = require('../models/gene.js'); // Import the Gene model

/**
 * Récupère et valide les informations d'un gène depuis l'API GeneCARD
 * @param {String} gene - Symbole du gène à rechercher
 * @returns {Object|Boolean|null} - Objet contenant les informations validées du gène, false si non trouvé, null en cas d'erreur
 */
async function fetchGeneCARD(gene) {
    try {
        const response = await axios.get(`https://rest.genenames.org/fetch/symbol/${gene}`, {
            headers: { 'Accept': 'application/xml' }
        });
        let xmlData = response.data.replace(/^\uFEFF/, '');

        if (response.status === 200) {
            const parsedData = await parseXML(xmlData);
            const numFound = parseInt(parsedData.response.result?.[0]?.$?.numFound, 10);

            if (numFound > 0) {
                const doc = parsedData.response.result[0].doc[0];
                
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
                
                const validatedGene = new Gene(
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
                );


                return validatedGene;
            } else {
                console.log("No gene found");
                return false;
            }
        } else {
            console.error("Failed to fetch data from HGNC API.");
            return null;
        }
    } catch (error) {
        console.error("Error fetching GeneCARD:", error);
        return null;
    }
}


function parseXML(xml) {
    return new Promise((resolve, reject) => {
        xml2js.parseString(xml, (err, result) => {
            if (err) {
                console.error("Error parsing XML:", err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

module.exports = fetchGeneCARD;
