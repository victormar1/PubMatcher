const axios = require('axios')

const HEADERS = {
  'User-Agent': 'PubMatcher/1.0 (https://github.com/your-org/PubMatcher; genomics-research-tool)'
}

async function getPanelApps(gene) {
  let panelAppEnglandCount = null
  let panelAppAustraliaCount = null
  let panelAppEnglandError = null
  let panelAppAustraliaError = null

  try {
    const res = await axios.get(`https://panelapp.genomicsengland.co.uk/api/v1/genes/?entity_name=${gene}&format=json`, { headers: HEADERS })
    panelAppEnglandCount = res.data.count
  } catch (error) {
    console.error(`Error fetching PanelApp England data for gene ${gene}: `, error.message)
    panelAppEnglandError = `PanelApp UK is currently unavailable`
  }

  try {
    const res = await axios.get(`https://panelapp-aus.org/api/v1/genes/?entity_name=${gene}&format=json`, { headers: HEADERS })
    panelAppAustraliaCount = res.data.count
  } catch (error) {
    console.warn(`PanelApp Australia main instance failed for gene ${gene}, trying fallback...`)
    try {
      const res = await axios.get(`https://panelapp-aus-staging.org/api/v1/genes/?entity_name=${gene}&format=json`, { headers: HEADERS })
      panelAppAustraliaCount = res.data.count
    } catch (fallbackError) {
      console.error(`Error fetching PanelApp Australia data for gene ${gene}: `, fallbackError.message)
      panelAppAustraliaError = `PanelApp Australia is currently unavailable`
    }
  }

  return {
    panelAppEnglandCount,
    panelAppAustraliaCount,
    panelAppEnglandError,
    panelAppAustraliaError
  }
}

module.exports = getPanelApps
