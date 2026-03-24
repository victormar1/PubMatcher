const fetchGeneCard = require('../utils/fetchGeneCard.js')
const getPubMedData = require('../utils/getPubMedData.js')
const getUniProtFunction = require('../utils/getUniProtFunction.js')
const getMouseKO = require('../utils/getMouseKO.js')
const getGeneConstraints = require('../utils/getGeneConstraints.js')
const getPanelApps = require('../utils/getPanelApps.js')
const getClinVarData = require('../utils/getClinVarData.js')
const fetchOmimData = require('../utils/fetchOMIM.js')

const SOURCE_NAMES = {
  pubmed: 'PubMed',
  uniprot: 'UniProt',
  mouseKO: 'IMPC Mouse Phenotypes',
  constraints: 'gnomAD Constraints',
  panelApps: 'PanelApp',
  clinvar: 'ClinVar',
  omim: 'OMIM',
}

const SOURCE_FALLBACKS = {
  pubmed: { gene: '', url: '', firstArticleTitle: 'No articles found', firstArticleUrl: null, complArticles: [], count: 0, articles: [], articleCount: 0, pubmedUrl: '' },
  uniprot: { geneFunction: null, bioProcessKeywordsOnly: [], urlAccession: null, bioProcessKeywords: [], uniprotUrl: null },
  mouseKO: { mousePhenotypes: {}, phenotypeCount: 0, categoryCount: 0, impcUrl: null },
  constraints: { constraints_v2: { pLI: 'N/A', oe_mis_upper: 'N/A', oe_lof_upper: 'N/A', mis_z: 'N/A' }, constraints_v4: { pLI: 'N/A', oe_mis_upper: 'N/A', oe_lof_upper: 'N/A', mis_z: 'N/A' }, constraintsDelta: false },
  panelApps: { panelAppEnglandCount: null, panelAppAustraliaCount: null },
  clinvar: { lofVariants: 0, missenseVariants: 0, lofUnknown: 0, missenseUnknown: 0, totalPathogenic: 0, totalLikelyPathogenic: 0 },
  omim: { mim: [] },
}

/**
 * Unwraps a Promise.allSettled result. Returns the value on success,
 * or the fallback + error info on failure. Also detects source-level
 * errors (e.g. ClinVar returned zeros because of a 429).
 */
function unwrapSource(settled, key) {
  if (settled.status === 'rejected') {
    return {
      data: { ...SOURCE_FALLBACKS[key] },
      error: settled.reason?.message || 'Unknown error',
    }
  }
  const data = settled.value
  // Source resolved but may carry an internal error (e.g. rate limited, timeout).
  // Some sources (PanelApp) use named error fields instead of a generic 'error' key.
  const error = data?.error || data?.panelAppEnglandError || data?.panelAppAustraliaError || null
  return { data, error }
}

/**
 * Core gene analysis — queries all data sources in parallel per gene.
 * Returns structured results with per-source data and explicit error tracking.
 *
 * Used by both the web app (via getData, which flattens) and the MCP server
 * (which uses the structured format directly).
 */
async function analyzeGenesStructured(genes, phenotypes = []) {
  return Promise.all(
    genes.map(async (gene) => {
      try {
        const validatedGene = await fetchGeneCard(gene)
        if (!validatedGene) {
          return { gene, valid: false, error: `Gene symbol "${gene}" not found in HGNC` }
        }

        const settled = await Promise.allSettled([
          getPubMedData(gene, phenotypes),
          getUniProtFunction(validatedGene.uniprotIds),
          getMouseKO(validatedGene.mgdId),
          getGeneConstraints(gene),
          getPanelApps(gene),
          getClinVarData(gene),
          fetchOmimData(validatedGene.ensemblGeneId),
        ])

        const keys = ['pubmed', 'uniprot', 'mouseKO', 'constraints', 'panelApps', 'clinvar', 'omim']
        const sources = {}
        const sourceErrors = []

        keys.forEach((key, i) => {
          const { data, error } = unwrapSource(settled[i], key)
          sources[key] = data
          if (error) {
            sourceErrors.push({ source: SOURCE_NAMES[key], error })
          }
        })

        return {
          gene,
          valid: true,
          geneInfo: {
            name: validatedGene.geneName,
            alias: validatedGene.aliasName,
            location: validatedGene.location,
            hgncId: validatedGene.hgncId,
            omimId: validatedGene.omimId,
            ensemblId: validatedGene.ensemblGeneId,
            geneValidity: validatedGene.validityMarker || 'No Known',
            geneLink: validatedGene.hgncId
              ? `https://search.thegencc.org/genes/${validatedGene.hgncId}`
              : null,
          },
          sources,
          sourceErrors,
        }
      } catch (error) {
        return { gene, valid: false, error: error.message }
      }
    }),
  )
}

/**
 * Flattened version for the web app — spreads all source data into a single object.
 * Backward-compatible with the original dataservice return shape.
 */
async function analyzeGenes(genes, phenotypes = []) {
  const structured = await analyzeGenesStructured(genes, phenotypes)

  return structured
    .filter((r) => r.valid)
    .map((r) => ({
      ...r.sources.pubmed,
      ...r.sources.uniprot,
      ...r.sources.mouseKO,
      ...r.sources.constraints,
      ...r.sources.panelApps,
      ...r.sources.clinvar,
      ...r.sources.omim,
      geneLink: r.geneInfo.geneLink || '',
      geneValidity: r.geneInfo.geneValidity || 'No validity found',
      hgncId: r.geneInfo.hgncId || 'No HGNC ID',
      omimId: r.geneInfo.omimId || 'No OMIM ID',
    }))
}

/**
 * Express route handler — extracts genes/phenotypes from req.body.
 */
async function getData(req) {
  const genes = req.body.genes || []
  const phenotypes = req.body.phenotypes || []
  return analyzeGenes(genes, phenotypes)
}

/**
 * Validate a single gene symbol against HGNC + ClinGen.
 */
async function validateGene(gene) {
  const validatedGene = await fetchGeneCard(gene)
  if (!validatedGene) {
    return { valid: false, gene, message: `Gene symbol "${gene}" not found in HGNC` }
  }
  return {
    valid: true,
    gene,
    name: validatedGene.geneName,
    alias: validatedGene.aliasName,
    location: validatedGene.location,
    hgncId: validatedGene.hgncId,
    omimId: validatedGene.omimId,
    ensemblId: validatedGene.ensemblGeneId,
    geneValidity: validatedGene.validityMarker,
    maneSelect: validatedGene.maneSelect,
    geneLink: validatedGene.hgncId
      ? `https://search.thegencc.org/genes/${validatedGene.hgncId}`
      : null,
  }
}

/**
 * Search PubMed literature for a gene, optionally refined by phenotypes.
 */
async function searchLiterature(gene, phenotypes = []) {
  return getPubMedData(gene, phenotypes)
}

module.exports = getData
module.exports.analyzeGenes = analyzeGenes
module.exports.analyzeGenesStructured = analyzeGenesStructured
module.exports.validateGene = validateGene
module.exports.searchLiterature = searchLiterature
