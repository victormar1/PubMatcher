const axios = require('axios')
const { cacheGet, cacheSet } = require('./cache')

let keywordsData = null
let keywordsLoadPromise = null

async function loadKeywords() {
  if (keywordsData) return keywordsData
  if (keywordsLoadPromise) return keywordsLoadPromise

  keywordsLoadPromise = (async () => {
    try {
      console.log('[PubMatcher] Downloading UniProt keywords list...')
      const res = await axios.get(
        'https://ftp.uniprot.org/pub/databases/uniprot/current_release/knowledgebase/complete/docs/keywlist.txt',
        { timeout: 30000 },
      )
      keywordsData = res.data
      console.log('[PubMatcher] UniProt keywords loaded')
      return keywordsData
    } catch (error) {
      console.warn(`[PubMatcher] Warning: Failed to load UniProt keywords: ${error.message}`)
      keywordsData = ''
      return keywordsData
    } finally {
      keywordsLoadPromise = null
    }
  })()

  return keywordsLoadPromise
}

/**
 * Fetches protein function and biological process keywords from UniProt.
 * Now includes caching, parallel fetching of keywords, and proper timeouts.
 *
 * Returns both legacy keys (geneFunction, bioProcessKeywordsOnly, urlAccession)
 * for backward compatibility, and enhanced keys (bioProcessKeywords, uniprotUrl).
 */
async function getUniProtFunction(uniprotId) {
  if (!uniprotId) {
    return { geneFunction: null, bioProcessKeywordsOnly: [], urlAccession: null, bioProcessKeywords: [], uniprotUrl: null }
  }

  const cacheKey = `uniprot:${uniprotId}`
  const cached = cacheGet(cacheKey)
  if (cached !== undefined) return cached

  try {
    const [proteinRes, keywords] = await Promise.all([
      axios.get(`https://www.ebi.ac.uk/proteins/api/proteins/${uniprotId}`, {
        headers: { Accept: 'application/json' },
        timeout: 10000,
      }),
      loadKeywords(),
    ])

    const data = proteinRes.data
    let geneFunction = null
    const bioProcessKeywords = []

    if (data.comments && Array.isArray(data.comments)) {
      const funcComment = data.comments.find((c) => c.type === 'FUNCTION')
      if (funcComment) {
        geneFunction = funcComment.text?.[0]?.value || null
        if (geneFunction && geneFunction.length > 500) {
          geneFunction = geneFunction.substring(0, 500) + '...'
        }
      }
    }

    // Extract biological process keywords
    if (data.keywords && Array.isArray(data.keywords) && keywords) {
      const entries = keywords.split('//')
      for (const kw of data.keywords) {
        const kwValue = kw.value
        const entry = entries.find((e) => e.includes(`ID   ${kwValue}`))
        if (entry) {
          const isBioProcess = entry.split('\n').some((line) => line.startsWith('CA') && line.includes('Biological process'))
          if (isBioProcess) {
            bioProcessKeywords.push(kwValue)
          }
        }
      }
    }

    const uniprotUrl = `https://www.uniprot.org/uniprotkb/${uniprotId}/entry`
    const result = {
      // Legacy keys (web app backward compat)
      geneFunction,
      bioProcessKeywordsOnly: bioProcessKeywords,
      urlAccession: uniprotUrl,
      // Enhanced keys
      bioProcessKeywords,
      uniprotUrl,
    }
    cacheSet(cacheKey, result)
    return result
  } catch (error) {
    console.error(`UniProt fetch failed for ${uniprotId}: ${error.message}`)
    const uniprotUrl = `https://www.uniprot.org/uniprotkb/${uniprotId}/entry`
    return {
      geneFunction: null,
      bioProcessKeywordsOnly: [],
      urlAccession: uniprotUrl,
      bioProcessKeywords: [],
      uniprotUrl,
      error: error.message,
    }
  }
}

module.exports = getUniProtFunction
