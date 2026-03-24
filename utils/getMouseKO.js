const axios = require('axios')
const path = require('path')
const fs = require('fs')
const { cacheGet, cacheSet } = require('./cache')

let svgIcons = []

/**
 * Fetches mouse knockout phenotypes from the IMPC SOLR API.
 * Now includes caching, timeouts, and proper error handling.
 * SVG icon loading is preserved for web app backward compatibility.
 */
async function getMouseKO(mgdId) {
  if (!mgdId) {
    return { mousePhenotypes: {}, impcUrl: null }
  }

  const cacheKey = `impc:${mgdId}`
  const cached = cacheGet(cacheKey)
  if (cached !== undefined) return cached

  const impcUrl = `https://www.mousephenotype.org/data/genes/${mgdId}`

  try {
    const url = `https://www.ebi.ac.uk/mi/impc/solr/genotype-phenotype/select?q=marker_accession_id:"${mgdId}"&rows=500&wt=json`
    const response = await axios.get(url, { timeout: 10000 })
    const docs = response.data.response?.docs || []

    const groupedPhenotypes = {}
    const seen = new Set()

    for (const doc of docs) {
      const name = doc.mp_term_name
      const category = (doc.top_level_mp_term_name?.[0] || 'other')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toLowerCase()

      if (seen.has(name)) continue
      seen.add(name)

      if (!groupedPhenotypes[category]) {
        groupedPhenotypes[category] = {
          names: [],
          icon: null,
        }
      }

      groupedPhenotypes[category].names.push(name.charAt(0).toUpperCase() + name.slice(1))

      // Match SVG icon for web app
      const matchingIcon = svgIcons.find((icon) => icon.name === category)
      if (matchingIcon) {
        groupedPhenotypes[category].icon = matchingIcon.path.replace(/^"|"$/g, '')
      }
    }

    // Add "noMatch" fallback for web app
    if (Object.keys(groupedPhenotypes).length === 0) {
      groupedPhenotypes['noMatch'] = {
        names: ['No Match'],
        icon: svgIcons.find((icon) => icon.name === 'noMatch')?.path.replace(/^"|"$/g, '') || '',
      }
    }

    const result = {
      mousePhenotypes: groupedPhenotypes,
      phenotypeCount: seen.size,
      categoryCount: Object.keys(groupedPhenotypes).length,
      impcUrl,
    }
    cacheSet(cacheKey, result)
    return result
  } catch (error) {
    console.error(`IMPC fetch failed for ${mgdId}: ${error.message}`)
    return {
      mousePhenotypes: {},
      phenotypeCount: 0,
      categoryCount: 0,
      impcUrl,
      error: error.message,
    }
  }
}

function loadSVGIcons() {
  const folderPath = path.join(__dirname, '..', 'BDD', 'SVG')
  try {
    const files = fs.readdirSync(folderPath)
    files.forEach((file) => {
      if (path.extname(file) === '.svg') {
        let svgContent = fs.readFileSync(path.join(folderPath, file), 'utf-8')
        svgContent = svgContent
          .replace(/width="[^"]*"/, 'width="25px"')
          .replace(/height="[^"]*"/, 'height="25px"')
        svgIcons.push({
          name: path.basename(file, '.svg'),
          path: svgContent,
        })
      }
    })
  } catch {
    // SVG folder may not exist in MCP-only mode — that's fine
  }
}

loadSVGIcons()

module.exports = getMouseKO
