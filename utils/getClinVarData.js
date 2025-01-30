const fs = require('fs')
const logger = require('../services/logger')
const flow = 'CLINVAR'
let processDuration = 0
let fetchDuration = 0

/**
 * Récupère les données ClinVar pour un gène donné à partir de la base de données JSON locale
 * @param {string} gene - Nom du gène
 * @param {string} jsonFilePath - Chemin vers le fichier JSON contenant les données
 * @returns {Promise<{lofVariants: number, missenseVariants: number, lofUnknown: number, missenseUnknown: number}>}
 */
async function getClinVarData(gene, jsonFilePath = './BDD/clinvarCountsPerGene.json') {
  try {
    const start = Date.now()
    // Charger les données JSON
    const data = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'))

    // Vérifier si le gène existe dans la base
    if (!data[gene]) {
      console.warn(`Gène ${gene} introuvable dans la base de données.`)
      return { lofVariants: 0, missenseVariants: 0, lofUnknown: 0, missenseUnknown: 0 }
    }

    fetchDuration = ((Date.now() - start) / 1000).toFixed(3) + 's'
    processDuration = ((Date.now() - start) / 1000).toFixed(3) + 's'
    logger.info(`⚙️ PROCESS: ${processDuration} | 📢 API FETCH: ${fetchDuration} | ${flow}`)

    // Retourner les données du gène
    return {
      lofVariants: data[gene].lofVariants || 0,
      missenseVariants: data[gene].missenseVariants || 0,
      lofUnknown: data[gene].lofUnknown || 0,
      missenseUnknown: data[gene].missenseUnknown || 0
    }
  } catch (error) {
    const fetchDuration = ((Date.now() - start) / 1000).toFixed(3) + 's'
    logger.warn(`${fetchDuration} | ${flow} | ❔ NO DATA FOUND`, {
      resolveDuration: fetchDuration,
      gene: gene
    })
    return { lofVariants: 0, missenseVariants: 0, lofUnknown: 0, missenseUnknown: 0 }
  }
}

module.exports = getClinVarData
