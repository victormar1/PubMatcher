// services/dataService.js
const fetchGeneCard = require('../utils/fetchGeneCard.js')
const getPubMedData = require('../utils/getPubMedData.js')
const getUniProtFunction = require('../utils/getUniProtFunction.js')
const getMouseKO = require('../utils/getMouseKO.js')
const getGeneConstraints = require('../utils/getGeneConstraints.js')
const getPanelApps = require('../utils/getPanelApps.js')
const getClinVarData = require('../utils/getClinVarData.js')
const fetchOmimData = require('../utils/fetchOMIM.js')
const axios = require('axios')

async function getData(req) {
  const genes = req.body.genes || []
  const phenotypes = req.body.phenotypes || []

  const results = await Promise.all(
    genes.map(async (gene) => {
      try {
        // * VALIDATE GENE
        const validatedGene = await fetchGeneCard(gene)
        if (!validatedGene) {
          return null
        }

        // * BUILDING RESULT DATA
        let resultData = {
          ...(await getPubMedData(gene, phenotypes)), // * PubMed data
          ...(await getUniProtFunction(validatedGene.uniprotIds)), // * UniProt data
          ...(await getMouseKO(validatedGene.mgdId)), // * Mouse KO data
          ...(await getGeneConstraints(gene)), // * Gene constraint data
          ...(await getPanelApps(gene)), // * PanelApp data
          ...(await getClinVarData(gene)), // * ClinVar data
          ...(await fetchOmimData(validatedGene.ensemblGeneId)), // * OMIM data
          // * ADDITIONNAL
          geneLink: validatedGene.hgncId ? `https://search.thegencc.org/genes/${validatedGene.hgncId}` : '', // HGNC link
          geneValidity: validatedGene.validityMarker || 'No validity found',
          hgncId: validatedGene.hgncId || 'No HGNC ID',
          omimId: validatedGene.omimId || 'No OMIM ID'
        }
        return resultData
      } catch (error) {
        return null
      }
    })
  )

  // ? Filter out null results useless ?
  const validResults = results.filter((result) => result !== null)
  return validResults
}

module.exports = getData
