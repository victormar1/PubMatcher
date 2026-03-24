const axios = require('axios')
const { cacheGet, cacheSet } = require('./cache')

const HEADERS = {
  'User-Agent': 'PubMatcher/1.0 (genomics-research-tool)',
}

/**
 * Fetches gene panel data from PanelApp UK and Australia.
 * Now includes caching, timeouts, proper error handling per source,
 * and a fallback to the PanelApp Australia staging endpoint.
 */
async function getPanelApps(gene) {
  const cacheKey = `panelapp:${gene}`
  const cached = cacheGet(cacheKey)
  if (cached !== undefined) return cached

  let panelAppEnglandCount = null
  let panelAppAustraliaCount = null
  let panelAppEnglandError = null
  let panelAppAustraliaError = null

  try {
    const res = await axios.get(
      `https://panelapp.genomicsengland.co.uk/api/v1/genes/?entity_name=${encodeURIComponent(gene)}&format=json`,
      { headers: HEADERS, timeout: 10000 },
    )
    panelAppEnglandCount = res.data.count
  } catch (error) {
    panelAppEnglandError = 'PanelApp UK is currently unavailable'
    console.error(`PanelApp UK failed for ${gene}: ${error.message}`)
  }

  try {
    const res = await axios.get(
      `https://panelapp-aus.org/api/v1/genes/?entity_name=${encodeURIComponent(gene)}&format=json`,
      { headers: HEADERS, timeout: 10000 },
    )
    panelAppAustraliaCount = res.data.count
  } catch {
    try {
      const res = await axios.get(
        `https://panelapp-aus-staging.org/api/v1/genes/?entity_name=${encodeURIComponent(gene)}&format=json`,
        { headers: HEADERS, timeout: 10000 },
      )
      panelAppAustraliaCount = res.data.count
    } catch (error) {
      panelAppAustraliaError = 'PanelApp Australia is currently unavailable'
      console.error(`PanelApp Australia failed for ${gene}: ${error.message}`)
    }
  }

  const result = {
    panelAppEnglandCount,
    panelAppAustraliaCount,
    panelAppEnglandError,
    panelAppAustraliaError,
  }
  cacheSet(cacheKey, result)
  return result
}

module.exports = getPanelApps
