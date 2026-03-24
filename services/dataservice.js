const fetchGeneCard = require('../utils/fetchGeneCard.js')
const getPubMedData = require('../utils/getPubMedData.js')
const getUniProtFunction = require('../utils/getUniProtFunction.js')
const getMouseKO = require('../utils/getMouseKO.js')
const getGeneConstraints = require('../utils/getGeneConstraints.js')
const getPanelApps = require('../utils/getPanelApps.js')
const getClinVarData = require('../utils/getClinVarData.js')
const fetchOmimData = require('../utils/fetchOMIM.js')

/**
 * Core gene analysis logic — queries all data sources in parallel per gene.
 * Used by both the Express web app (via getData) and the MCP server.
 *
 * @param {string[]} genes - Gene symbols to analyze
 * @param {string[]} phenotypes - Phenotype terms for PubMed refinement
 * @returns {Promise<Object[]>} - Array of result objects (null entries filtered out)
 */
async function analyzeGenes(genes, phenotypes = []) {
  const results = await Promise.all(
    genes.map(async (gene) => {
      try {
        const validatedGene = await fetchGeneCard(gene)
        if (!validatedGene) {
          return null
        }

        // Run all data sources in parallel — one failure won't block the rest
        const [pubmed, uniprot, mouseKO, constraints, panelApps, clinvar, omim] = await Promise.allSettled([
          getPubMedData(gene, phenotypes),
          getUniProtFunction(validatedGene.uniprotIds),
          getMouseKO(validatedGene.mgdId),
          getGeneConstraints(gene),
          getPanelApps(gene),
          getClinVarData(gene),
          fetchOmimData(validatedGene.ensemblGeneId),
        ])

        const unwrap = (result, fallback) =>
          result.status === 'fulfilled' ? result.value : { ...fallback, error: result.reason?.message }

        const resultData = {
          ...unwrap(pubmed, { gene, url: '', firstArticleTitle: 'No articles found', firstArticleUrl: null, complArticles: [], count: 0 }),
          ...unwrap(uniprot, { geneFunction: null, bioProcessKeywordsOnly: [], urlAccession: null }),
          ...unwrap(mouseKO, { mousePhenotypes: {}, impcUrl: null }),
          ...unwrap(constraints, { constraints_v2: {}, constraints_v4: {}, constraintsDelta: false }),
          ...unwrap(panelApps, { panelAppEnglandCount: null, panelAppAustraliaCount: null }),
          ...unwrap(clinvar, { lofVariants: 0, missenseVariants: 0, lofUnknown: 0, missenseUnknown: 0 }),
          ...unwrap(omim, { mim: [] }),
          geneLink: validatedGene.hgncId ? `https://search.thegencc.org/genes/${validatedGene.hgncId}` : '',
          geneValidity: validatedGene.validityMarker || 'No validity found',
          hgncId: validatedGene.hgncId || 'No HGNC ID',
          omimId: validatedGene.omimId || 'No OMIM ID',
        }
        return resultData
      } catch (error) {
        console.error(`Error analyzing gene ${gene}: ${error.message}`)
        return null
      }
    }),
  )

  return results.filter((result) => result !== null)
}

/**
 * Express route handler — extracts genes/phenotypes from req.body and calls analyzeGenes.
 */
async function getData(req) {
  const genes = req.body.genes || []
  const phenotypes = req.body.phenotypes || []
  return analyzeGenes(genes, phenotypes)
}

module.exports = getData
module.exports.analyzeGenes = analyzeGenes
