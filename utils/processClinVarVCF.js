const fs = require('fs');
const readline = require('readline');

// Critères pour variantes LOF et Missense
const LOF_CRITERIA = [
    'frameshift_variant',
    'nonsense',
    'splice_donor_variant',
    'splice_acceptor_variant',
    'splice_region_variant'
];

const MISSENSE_CRITERIA = ['missense_variant'];

/**
 * Parse et filtre un fichier VCF pour obtenir des comptes précis des variants
 * @param {string} inputFile - Chemin vers le fichier VCF
 * @param {string} outputFile - Chemin vers le fichier JSON de sortie
 */
async function parseVCF(inputFile, outputFile) {
    const geneVariantCounts = {};
    const rl = readline.createInterface({
        input: fs.createReadStream(inputFile),
        crlfDelay: Infinity,
    });

    for await (const line of rl) {
        if (line.startsWith('#')) continue; // Ignorer les en-têtes

        const columns = line.split('\t');
        const infoField = columns[7]; // Champ INFO
        const ref = columns[3];
        const alt = columns[4];

        const info = parseInfoField(infoField);

        const gene = info['GENEINFO']?.split(':')[0];
        const clnsig = info['CLNSIG'];
        const mc = info['MC']?.split('|')[1]; // Molecular Consequence

        if (!gene || !clnsig || !mc) continue;

        // Vérifier la longueur du variant (VARLEN)
        const varLen = Math.abs(ref.length - alt.length);
        if (varLen < 0 || varLen > 49) continue;

        // Initialiser les compteurs pour ce gène
        if (!geneVariantCounts[gene]) {
            geneVariantCounts[gene] = { 
                lofVariants: 0, 
                missenseVariants: 0, 
                lofUnknown: 0,
                missenseUnknown: 0
            };
        }

        // Vérifier si la variante est pathogène ou probablement pathogène
        const isPathogenic = ['Pathogenic', 'Likely_pathogenic'].some((sig) => clnsig.includes(sig));
        const isUncertain = clnsig.includes('Uncertain_significance');

        // Compter les variantes selon les critères
        if (isPathogenic) {
            if (LOF_CRITERIA.some((criteria) => mc.includes(criteria))) {
                geneVariantCounts[gene].lofVariants += 1;
            } else if (MISSENSE_CRITERIA.some((criteria) => mc.includes(criteria))) {
                geneVariantCounts[gene].missenseVariants += 1;
            }
        } else if (isUncertain) {
            if (LOF_CRITERIA.some((criteria) => mc.includes(criteria))) {
                geneVariantCounts[gene].lofUnknown += 1;
            } else if (MISSENSE_CRITERIA.some((criteria) => mc.includes(criteria))) {
                geneVariantCounts[gene].missenseUnknown += 1;
            }
        }
    }

    // Écrire les résultats dans un fichier JSON
    fs.writeFileSync(outputFile, JSON.stringify(geneVariantCounts, null, 2));
    console.log(`Résultats écrits dans ${outputFile}`);
}

/**
 * Parse un champ INFO du fichier VCF en objet clé-valeur
 * @param {string} infoField - Le champ INFO d'une ligne VCF
 * @returns {Object} - Un objet avec les paires clé-valeur
 */
function parseInfoField(infoField) {
    const info = {};
    const fields = infoField.split(';');
    for (const field of fields) {
        const [key, value] = field.split('=');
        info[key] = value;
    }
    return info;
}

// Exemple d'utilisation
(async () => {
    const inputFile = './BDD/clinvar.vcf'; // Chemin vers le fichier VCF
    const outputFile = './BDD/clinvarCountsPerGene.json'; // Fichier de sortie JSON

    try {
        await parseVCF(inputFile, outputFile);
    } catch (error) {
        console.error('Erreur lors du traitement du fichier VCF:', error);
    }
})();
