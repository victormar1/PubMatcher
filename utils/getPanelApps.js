const axios = require('axios')

async function getPanelApps(gene) {
  try {
    const panelAppEnglandResponse = await axios.get(`https://panelapp.genomicsengland.co.uk/api/v1/genes/?entity_name=${gene}&format=json`)
    const panelAppAustraliaResponse = await axios.get(`https://panelapp.agha.umccr.org/api/v1/genes/?entity_name=${gene}&format=json`)
    return {
      panelAppEnglandCount: panelAppEnglandResponse.data.count,
      panelAppAustraliaCount: panelAppAustraliaResponse.data.count
    }
  } catch (error) {
    console.error(`Error fetching PanelApp data for gene ${gene}: `, error)
    return {
      panelAppEnglandCount: 'Error',
      panelAppAustraliaCount: 'Error'
    }
  }
}

module.exports = getPanelApps
