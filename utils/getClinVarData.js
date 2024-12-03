const axios = require('axios');

/**
 * Fetch ClinVar data for LOF and Missense variants
 * @param {string} gene - The gene name to query
 * @returns {Promise<{lofVariants: number, missenseVariants: number}>} - Counts of LOF and Missense variants
 */
async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getClinVarData(gene) {
    try {
        await delay(500); // Ajoute un délai de 500ms entre les requêtes

        // Requête pour LOF
        const lofResponse = await axios.get('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi', {
            params: {
                db: 'clinvar',
                term: `(${gene}[gene]) AND ((("clinsig pathogenic"[Properties] OR "clinsig pathogenic low penetrance"[Properties] OR "clinsig established risk allele"[Properties]) OR ("clinsig likely pathogenic"[Properties] OR "clinsig likely pathogenic low penetrance"[Properties] OR "clinsig likely risk allele"[Properties])) AND (("frameshift variant"[Molecular consequence]) OR ("nonsense"[Molecular consequence] OR "SO 0001587"[Molecular consequence]) OR ("splice 3"[Molecular consequence] OR "splice 5"[Molecular consequence] OR "splice site"[Molecular consequence] OR "splice donor variant"[Molecular consequence] OR "splice acceptor variant"[Molecular consequence]))) AND 0[VARLEN] : 49[VARLEN]`,
                retmode: 'json',
            },
        });

        const lofCount = parseInt(lofResponse.data.esearchresult.count, 10);

        await delay(500); // Ajoute un délai avant la prochaine requête

        // Requête pour Missense
        const missenseResponse = await axios.get('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi', {
            params: {
                db: 'clinvar',
                term: `(${gene}[gene]) AND ((("clinsig pathogenic"[Properties] OR "clinsig pathogenic low penetrance"[Properties] OR "clinsig established risk allele"[Properties]) OR ("clinsig likely pathogenic"[Properties] OR "clinsig likely pathogenic low penetrance"[Properties] OR "clinsig likely risk allele"[Properties])) AND (("missense variant"[Molecular consequence]) OR ("SO 0001583"[Molecular consequence])) AND 0[VARLEN] : 49[VARLEN])`,
                retmode: 'json',
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
