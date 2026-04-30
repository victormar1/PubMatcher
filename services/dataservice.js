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

        // * BUILDING RESULT DATA — fetch all sources in parallel (independent calls)
        const [pubmed, uniprot, mouseko, constraints, panelapps, clinvar, omim] = await Promise.all([
          getPubMedData(gene, phenotypes),
          getUniProtFunction(validatedGene.uniprotIds),
          getMouseKO(validatedGene.mgdId),
          getGeneConstraints(gene),
          getPanelApps(gene),
          getClinVarData(gene),
          fetchOmimData(validatedGene.ensemblGeneId)
        ])

        let resultData = {
          ...pubmed,
          ...uniprot,
          ...mouseko,
          ...constraints,
          ...panelapps,
          ...clinvar,
          ...omim,
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
