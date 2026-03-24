const axios = require('axios')
const xml2js = require('xml2js')
const Gene = require('../models/gene.js')
const { cacheGet, cacheSet } = require('./cache')

const CLINGEN_DOWNLOAD_URL = 'https://search.clinicalgenome.org/kb/gene-validity/download'
const CLASSIFICATION_RANKING = [
  'Definitive', 'Strong', 'Moderate', 'Supportive', 'Limited',
  'Disputed Evidence', 'Refuted', 'Animal', 'No Known', 'No Known Disease Relationship',
]

let validityMap = null
let validityLoadPromise = null

/**
 * Downloads and parses the ClinGen gene validity data from the official endpoint.
 * Replaces the previous local CSV approach (BDD/gene_validity.csv).
 * Data is downloaded once at first use and cached in memory.
 */
async function loadGeneValidity() {
  if (validityMap) return validityMap
  if (validityLoadPromise) return validityLoadPromise

  validityLoadPromise = (async () => {
    try {
      console.log('[PubMatcher] Downloading ClinGen gene validity data...')
      const response = await axios.get(CLINGEN_DOWNLOAD_URL, { timeout: 30000 })
      const lines = response.data.split('\n')
      const map = new Map()

      // Find header line
      let headerIndex = -1
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('GENE SYMBOL') && lines[i].includes('CLASSIFICATION')) {
          headerIndex = i
          break
        }
      }
      if (headerIndex === -1) {
        console.warn('[PubMatcher] Warning: Could not parse ClinGen CSV header')
        validityMap = map
        return map
      }

      const header = lines[headerIndex].split('","').map((h) => h.replace(/"/g, '').trim())
      const geneIdIdx = header.indexOf('GENE ID (HGNC)')
      const classIdx = header.indexOf('CLASSIFICATION')

      for (let i = headerIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line || line.startsWith('"+++')) continue
        const fields = line.split('","').map((f) => f.replace(/"/g, '').trim())
        if (fields.length <= Math.max(geneIdIdx, classIdx)) continue
        const hgncId = fields[geneIdIdx] || ''
        const classification = fields[classIdx] || ''

        if (hgncId && classification) {
          if (map.has(hgncId)) {
            const existing = map.get(hgncId)
            if (CLASSIFICATION_RANKING.indexOf(classification) < CLASSIFICATION_RANKING.indexOf(existing)) {
              map.set(hgncId, classification)
            }
          } else {
            map.set(hgncId, classification)
          }
        }
      }

      console.log(`[PubMatcher] Loaded ${map.size} gene validity entries from ClinGen`)
      validityMap = map
      return map
    } catch (error) {
      console.warn(`[PubMatcher] Warning: Failed to load gene validity: ${error.message}`)
      validityMap = new Map()
      return validityMap
    } finally {
      validityLoadPromise = null
    }
  })()

  return validityLoadPromise
}

function parseXML(xml) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
  })
}

/**
 * Validates a gene symbol against HGNC and enriches with ClinGen validity data.
 * Now downloads ClinGen data live instead of reading from a local CSV.
 */
async function fetchGeneCARD(gene) {
  const cached = cacheGet(`gene:${gene}`)
  if (cached !== undefined) return cached

  try {
    const response = await axios.get(`https://rest.genenames.org/fetch/symbol/${gene}`, {
      headers: { Accept: 'application/xml' },
      timeout: 10000,
    })
    let xmlData = response.data.replace(/^\uFEFF/, '')

    if (response.status === 200) {
      const parsedData = await parseXML(xmlData)
      const numFound = parseInt(parsedData.response.result?.[0]?.$?.numFound, 10)

      if (numFound > 0) {
        const doc = parsedData.response.result[0].doc[0]
        const getStr = (name) => doc.str?.find((item) => item.$.name === name)?._ || null
        const getArr = (name) => doc.arr?.find((item) => item.$.name === name)?.str || null
        const getInt = (name) => doc.int?.find((item) => item.$.name === name)?._ || null
        const getDate = (name) => doc.date?.find((item) => item.$.name === name)?._ || null

        const hgncId = getStr('hgnc_id')
        const vMap = await loadGeneValidity()
        const validityMarker = vMap.get(hgncId) || 'No Known'

        const validatedGene = new Gene(
          getStr('name'),
          getArr('alias_name')?.[0] || null,
          getStr('location'),
          getArr('mane_select') || null,
          getArr('mgd_id')?.[0] || null,
          getArr('enzyme_id')?.[0] || null,
          getArr('uniprot_ids')?.[0] || null,
          hgncId,
          getArr('rgd_id')?.[0] || null,
          getStr('ensembl_gene_id'),
          getInt('orphanet'),
          getDate('date_modified'),
          getDate('date_approved_reserved'),
          validityMarker,
          getArr('omim_id')?.[0] || null,
        )

        cacheSet(`gene:${gene}`, validatedGene)
        return validatedGene
      } else {
        return false
      }
    } else {
      return null
    }
  } catch (error) {
    console.error(`HGNC lookup failed for ${gene}: ${error.message}`)
    return null
  }
}

module.exports = fetchGeneCARD
