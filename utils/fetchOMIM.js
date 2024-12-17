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
          console.log(`MIM Morbid Description Found: ${description}`)
        }
      }
    })

    console.log('Filtered MIM Morbid Descriptions:', mimMorbidDescriptions)
    return { mim: mimMorbidDescriptions }
  } catch (error) {
    console.error('Error fetching MIM morbid data:', error.message)
    return []
  }
}

module.exports = fetchMimMorbidData
