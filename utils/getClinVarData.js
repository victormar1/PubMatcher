const axios = require('axios')
const { cacheGet, cacheSet } = require('./cache')
const { rateLimitedGet } = require('./rateLimiter')

const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'

/**
 * Queries ClinVar E-utilities API for variant counts by gene, significance, and consequence.
 * Replaces the previous static JSON file approach (BDD/clinvarCountsPerGene.json).
 */
async function queryCount(gene, significance, consequence) {
  const terms = [`${gene}[gene]`, `${significance}[clinsig]`]
  if (consequence) terms.push(`${consequence}[molecular_consequence]`)
  const term = terms.join('+AND+')
  const url = `${EUTILS_BASE}/esearch.fcgi?db=clinvar&term=${term}&rettype=count&retmode=json`
  const res = await rateLimitedGet(axios, url)
  return parseInt(res.data.esearchresult?.count, 10) || 0
}

/**
 * Fetches ClinVar variant counts for a gene using the live NCBI ClinVar API.
 * Returns the same keys as before (lofVariants, missenseVariants, lofUnknown, missenseUnknown)
 * plus new keys (totalPathogenic, totalLikelyPathogenic, clinvarUrl).
 */
async function getClinVarData(gene) {
  const cacheKey = `clinvar:${gene}`
  const cached = cacheGet(cacheKey)
  if (cached !== undefined) return cached

  try {
    // Serialize queries to respect NCBI rate limits (3 req/s without API key)
    const lofVariants = await queryCount(gene, 'pathogenic', 'loss of function')
    const missenseVariants = await queryCount(gene, 'pathogenic', 'missense')
    const lofUnknown = await queryCount(gene, 'uncertain significance', 'loss of function')
    const missenseUnknown = await queryCount(gene, 'uncertain significance', 'missense')
    const totalPathogenic = await queryCount(gene, 'pathogenic', null)
    const totalLikelyPathogenic = await queryCount(gene, 'likely pathogenic', null)

    const result = {
      lofVariants,
      missenseVariants,
      lofUnknown,
      missenseUnknown,
      totalPathogenic,
      totalLikelyPathogenic,
      clinvarUrl: `https://www.ncbi.nlm.nih.gov/clinvar/?term=${encodeURIComponent(gene)}[gene]`,
    }
    cacheSet(cacheKey, result)
    return result
  } catch (error) {
    console.error(`ClinVar fetch failed for ${gene}: ${error.message}`)
    return {
      lofVariants: 0,
      missenseVariants: 0,
      lofUnknown: 0,
      missenseUnknown: 0,
      totalPathogenic: 0,
      totalLikelyPathogenic: 0,
      clinvarUrl: `https://www.ncbi.nlm.nih.gov/clinvar/?term=${encodeURIComponent(gene)}[gene]`,
      error: error.message,
    }
  }
}

module.exports = getClinVarData
