const axios = require('axios')

async function getUniProtFunction(uniprotId) {
  try {
    // * FETCH UNIPROT API
    const uniProtApiUrl = `https://www.ebi.ac.uk/proteins/api/proteins/${uniprotId}.xml`
    const urlAccession = `https://www.uniprot.org/uniprotkb/${uniprotId}/entry`

    const response = await axios.get(uniProtApiUrl, { headers: { Accept: 'application/json' } })
    // * FETCH KEYWORDS LIST
    const getKeywordsCSV = await axios.get('https://ftp.uniprot.org/pub/databases/uniprot/current_release/knowledgebase/complete/docs/keywlist.txt')
    const keywordsCSV = getKeywordsCSV.data
    let functionKeywords = []
    const bioProcessKeywordsOnly = []

    if (response.status === 200) {
      const data = response.data
      let geneFunction = null
      if (data.comments && Array.isArray(data.comments)) {
        data.comments.some((element) => {
          if (element.type === 'FUNCTION') {
            // * STORE GENE FUNCTION
            geneFunction = element.text[0].value
            // * EXTRACT FUNCTION KEYWORDS
            for (let i = 0; i < Object.keys(data.keywords).length; i++) {
              functionKeywords.push(data.keywords[i].value)
            }
            // * GET ONLY BIOLOGICAL PROCESS KEYWORDS
            functionKeywords.forEach((keyword) => {
              const keywordEntry = keywordsCSV.split('//').find((entry) => entry.includes(`ID   ${keyword}`))
              if (keywordEntry) {
                const isBiologicalProcess = keywordEntry.split('\n').some((line) => line.startsWith('CA') && line.includes('Biological process'))
                if (isBiologicalProcess) {
                  bioProcessKeywordsOnly.push(keyword)
                }
              }
            })
            return true // ! Exit once keyword has been found
          }
        })
      }
      // * RETURN THE RESULT
      return {
        geneFunction,
        bioProcessKeywordsOnly,
        urlAccession
      }
    } else {
      console.error(`UniProt API responded with status: ${response.status}`)
      return 'No match'
    }
  } catch (error) {
    console.error('Error fetching UniProt data:', error.message)
  }
}

module.exports = getUniProtFunction
