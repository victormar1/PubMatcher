// utils/fetchGeneCARD.js
const axios = require('axios')
const xml2js = require('xml2js')
const Gene = require('../models/gene.js') // Import the Gene model dzad
const fs = require('fs')
const path = require('path')
const csvParser = require('csv-parser')

// ranking
const classificationRanking = ['Definitive', 'Strong', 'Moderate', 'Supportive', 'Limited', 'Disputed Evidence', 'Refuted', 'Animal', 'No Known', 'No Known Disease Relationship'] // Ordered by importance

const validityMap = new Map()

function loadCSV() {
  const csvFilePath = path.join(__dirname, '../BDD/gene_validity.csv')

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on('data', (row) => {
        const hgncId = row['gene_curie']?.trim()
        const classification = row['classification_title']?.trim()

        if (hgncId && classification) {
          if (validityMap.has(hgncId)) {
            const existingClassification = validityMap.get(hgncId)
            // Compare, if more important replace
            if (classificationRanking.indexOf(classification) < classificationRanking.indexOf(existingClassification)) {
              validityMap.set(hgncId, classification)
            }
          } else {
            // Add
            validityMap.set(hgncId, classification)
          }
        }
      })
      .on('end', () => {
        resolve(validityMap) // Resolve with the map for further use
      })
      .on('error', (error) => {
        reject(error)
      })
  })
}

/**
 * Récupère et valide les informations d'un gène depuis l'API GeneCARD
 * @param {String} gene - Symbole du gène à rechercher
 * @returns {Object|Boolean|null} - Objet contenant les informations validées du gène, false si non trouvé, null en cas d'erreur
 */
async function fetchGeneCARD(gene) {
  try {
    const response = await axios.get(`https://rest.genenames.org/fetch/symbol/${gene}`, {
      headers: { Accept: 'application/xml' }
    })
    let xmlData = response.data.replace(/^\uFEFF/, '')

    if (response.status === 200) {
      const parsedData = await parseXML(xmlData)
      const numFound = parseInt(parsedData.response.result?.[0]?.$?.numFound, 10)

      if (numFound > 0) {
        const doc = parsedData.response.result[0].doc[0]
        const geneName = doc.str?.find((item) => item.$.name === 'name')?._ || 'No match'
        const location = doc.str?.find((item) => item.$.name === 'location')?._ || 'No match'
        const aliasName = doc.arr?.find((item) => item.$.name === 'alias_name')?.str?.[0] || 'No match'
        const maneSelect = doc.arr?.find((item) => item.$.name === 'mane_select')?.str || 'No match'
        const mgdId = doc.arr?.find((item) => item.$.name === 'mgd_id')?.str?.[0] || 'No match'
        const enzymeId = doc.arr?.find((item) => item.$.name === 'enzyme_id')?.str?.[0] || 'No match'
        const uniprotIds = doc.arr?.find((item) => item.$.name === 'uniprot_ids')?.str?.map((item) => item)[0] || 'No match'
        const hgncId = doc.str?.find((item) => item.$.name === 'hgnc_id')?._ || 'No match'
        const rgdId = doc.arr?.find((item) => item.$.name === 'rgd_id')?.str?.[0] || 'No match'
        const ensemblGeneId = doc.str?.find((item) => item.$.name === 'ensembl_gene_id')?._ || 'No match'
        const orphanet = doc.int?.find((item) => item.$.name === 'orphanet')?._ || 'No match'
        const dateModified = doc.date?.find((item) => item.$.name === 'date_modified')?._ || 'No match'
        const dateApprovedReserved = doc.date?.find((item) => item.$.name === 'date_approved_reserved')?._ || 'No match'
        const validityMarker = validityMap.get(hgncId) || 'No Known'
        const omimId = doc.arr?.find((item) => item.$.name === 'omim_id')?.str?.[0] || 'No match'
        const validatedGene = new Gene(geneName, aliasName, location, maneSelect, mgdId, enzymeId, uniprotIds, hgncId, rgdId, ensemblGeneId, orphanet, dateModified, dateApprovedReserved, validityMarker, omimId)
        // * RETURN THE RESULT
        return validatedGene
      } else {
        return false
      }
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

function parseXML(xml) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

;(async () => {
  //IIAFE
  try {
    await loadCSV()
  } catch (error) {}
})()

module.exports = fetchGeneCARD
