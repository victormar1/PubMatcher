const axios = require('axios');

const apiKey = 'd4f7a9923cb983c15c387c6fe5d21a388d08'; // Votre clé API
const DELAY_MS = 100; // Délai pour respecter 10 requêtes par seconde

/**
 * Ajoute un délai pour respecter les limites de l'API
 * @param {number} ms - Durée en millisecondes
 * @returns {Promise<void>}
 */
async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch ClinVar data for LOF and Missense variants
 * @param {string} gene - The gene name to query
 * @returns {Promise<{lofVariants: number, missenseVariants: number}>} - Counts of LOF and Missense variants
 */
async function getClinVarData(gene) {
    try {
        // Requête pour LOF
        const lofResponse = await axios.get('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi', {
            params: {
                db: 'clinvar',
                term: `(${gene}[gene]) AND ((("clinsig pathogenic"[Properties] OR "clinsig pathogenic low penetrance"[Properties] OR "clinsig established risk allele"[Properties]) OR ("clinsig likely pathogenic"[Properties] OR "clinsig likely pathogenic low penetrance"[Properties] OR "clinsig likely risk allele"[Properties])) AND (("frameshift variant"[Molecular consequence]) OR ("nonsense"[Molecular consequence] OR "SO 0001587"[Molecular consequence]) OR ("splice 3"[Molecular consequence] OR "splice 5"[Molecular consequence] OR "splice site"[Molecular consequence] OR "splice donor variant"[Molecular consequence] OR "splice acceptor variant"[Molecular consequence]))) AND 0[VARLEN] : 49[VARLEN]`,
                retmode: 'json',
                api_key: apiKey, // Ajout de la clé API
            },
        });

        const lofCount = parseInt(lofResponse.data.esearchresult.count, 10);

        await delay(DELAY_MS); // Ajoute un délai avant la prochaine requête

        // Requête pour Missense
        const missenseResponse = await axios.get('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi', {
            params: {
                db: 'clinvar',
                term: `(${gene}[gene]) AND ((("clinsig pathogenic"[Properties] OR "clinsig pathogenic low penetrance"[Properties] OR "clinsig established risk allele"[Properties]) OR ("clinsig likely pathogenic"[Properties] OR "clinsig likely pathogenic low penetrance"[Properties] OR "clinsig likely risk allele"[Properties])) AND (("missense variant"[Molecular consequence]) OR ("SO 0001583"[Molecular consequence])) AND 0[VARLEN] : 49[VARLEN])`,
                retmode: 'json',
                api_key: apiKey, // Ajout de la clé API
            },
        });

        const missenseCount = parseInt(missenseResponse.data.esearchresult.count, 10);

        return {
            lofVariants: lofCount,
            missenseVariants: missenseCount,
        };
    } catch (error) {
        console.error(`Error fetching ClinVar data for gene ${gene}:`, error);
        return { lofVariants: 0, missenseVariants: 0 };
    }
}

module.exports = getClinVarData;
