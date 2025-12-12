const axios = require('axios')

const fetchMimMorbidData = async (ensemblId) => {
  const url = `https://rest.ensembl.org/phenotype/gene/homo_sapiens/${ensemblId}?content-type=application/json`

  try {
    const response = await axios.get(url)
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

    return { mim: mimMorbidDescriptions }
  } catch (error) {
    return []
  }
}

module.exports = fetchMimMorbidData
