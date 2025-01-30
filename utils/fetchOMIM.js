const axios = require('axios')
const logger = require('../services/logger')
const flow = 'MIM'
let fetchDuration = 0
let processDuration = 0

const fetchMimMorbidData = async (ensemblId) => {
  const start = Date.now()
  const url = `https://rest.ensembl.org/phenotype/gene/homo_sapiens/${ensemblId}?content-type=application/json`

  try {
    const response = await axios.get(url)
    fetchDuration = ((Date.now() - start) / 1000).toFixed(3) + 's'

    const phenotypeData = response.data

    const mimMorbidDescriptions = []
    const seen = new Set()

    phenotypeData.forEach((entry, index) => {
      // Check if "MIM morbid" exists in the source field
      if (entry.source && entry.source.toLowerCase() === 'mim morbid') {
        const description = entry.description || 'No description'

        // Avoid duplicates based on the description
        if (!seen.has(description)) {
          mimMorbidDescriptions.push(description)
          seen.add(description)
        }
      }
    })
    processDuration = ((Date.now() - start) / 1000).toFixed(3) + 's'
    logger.info(`⚙️ PROCESS: ${processDuration} | 📢 API FETCH: ${fetchDuration} | ${flow}`)

    return { mim: mimMorbidDescriptions }
  } catch (error) {
    logger.warn(`${fetchDuration} | ${flow} | ❔ NO DATA FOUND`, {
      resolveDuration: processDuration
    })
    return []
  }
}

module.exports = fetchMimMorbidData
