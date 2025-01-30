const axios = require('axios')
const logger = require('../services/logger')
const flow = 'PANELAPP'
let fetchDuration = 0
let processDuration = 0

async function getPanelApps(gene) {
  const startTime = Date.now()

  try {
    const [panelAppEnglandResponse, panelAppAustraliaResponse] = await Promise.all([axios.get(`https://panelapp.genomicsengland.co.uk/api/v1/genes/?entity_name=${gene}&format=json`), axios.get(`https://panelapp.agha.umccr.org/api/v1/genes/?entity_name=${gene}&format=json`)])

    fetchDuration = ((Date.now() - startTime) / 1000).toFixed(3) + 's'
    processDuration = ((Date.now() - startTime) / 1000).toFixed(3) + 's'
    logger.info(`⚙️ PROCESS: ${processDuration} | 📢 API FETCH: ${fetchDuration} | ${flow}`)
    return {
      panelAppEnglandCount: panelAppEnglandResponse.data.count,
      panelAppAustraliaCount: panelAppAustraliaResponse.data.count
    }
  } catch (error) {
    const fetchDuration = ((Date.now() - startTime) / 1000).toFixed(3) + 's'

    logger.warn(`${fetchDuration} | ${flow} | ❔ NO DATA FOUND`, {
      resolveDuration: fetchDuration
    })

    return {
      panelAppEnglandCount: 'Error',
      panelAppAustraliaCount: 'Error'
    }
  }
}

module.exports = getPanelApps
