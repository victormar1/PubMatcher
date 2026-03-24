const axios = require('axios')
const { cacheGet, cacheSet } = require('./cache')

/**
 * Fetches OMIM disease associations via the Ensembl phenotype API.
 * Now includes caching, timeouts, and proper error handling.
 */
async function fetchOmimData(ensemblId) {
  if (!ensemblId) {
    return { mim: [] }
  }

  const cacheKey = `omim:${ensemblId}`
  const cached = cacheGet(cacheKey)
  if (cached !== undefined) return cached

  try {
    const url = `https://rest.ensembl.org/phenotype/gene/homo_sapiens/${ensemblId}?content-type=application/json`
    const response = await axios.get(url, { timeout: 10000 })
    const phenotypeData = response.data

    const mimDescriptions = []
    const seen = new Set()

    for (const entry of phenotypeData) {
      if (entry.source && entry.source.toLowerCase() === 'mim morbid') {
        const description = entry.description || 'No description'
        if (!seen.has(description)) {
          mimDescriptions.push(description)
          seen.add(description)
        }
      }
    }

    const result = { mim: mimDescriptions }
    cacheSet(cacheKey, result)
    return result
  } catch (error) {
    console.error(`OMIM/Ensembl fetch failed for ${ensemblId}: ${error.message}`)
    return { mim: [], error: error.message }
  }
}

module.exports = fetchOmimData
