const axios = require('axios')
const { cacheGet, cacheSet } = require('./cache')

const GNOMAD_API = 'https://gnomad.broadinstitute.org/api'

const CONSTRAINT_QUERY = `
query GeneConstraint($geneSymbol: String!) {
  gene(gene_symbol: $geneSymbol, reference_genome: GRCh38) {
    gene_id
    symbol
    gnomad_constraint {
      pLI
      oe_mis
      oe_mis_lower
      oe_mis_upper
      oe_lof
      oe_lof_lower
      oe_lof_upper
      mis_z
      lof_z
    }
  }
}
`

const CONSTRAINT_QUERY_V2 = `
query GeneConstraintV2($geneSymbol: String!) {
  gene(gene_symbol: $geneSymbol, reference_genome: GRCh37) {
    gene_id
    symbol
    gnomad_constraint {
      pLI
      oe_mis
      oe_mis_lower
      oe_mis_upper
      oe_lof
      oe_lof_lower
      oe_lof_upper
      mis_z
      lof_z
    }
  }
}
`

function extractConstraints(geneData) {
  const c = geneData?.gnomad_constraint
  if (!c) return { pLI: 'N/A', oe_mis_upper: 'N/A', oe_lof_upper: 'N/A', mis_z: 'N/A' }
  return {
    pLI: c.pLI != null ? Number(c.pLI.toFixed(4)) : 'N/A',
    oe_mis_upper: c.oe_mis_upper != null ? Number(c.oe_mis_upper.toFixed(4)) : 'N/A',
    oe_lof_upper: c.oe_lof_upper != null ? Number(c.oe_lof_upper.toFixed(4)) : 'N/A',
    mis_z: c.mis_z != null ? Number(c.mis_z.toFixed(4)) : 'N/A',
    oe_mis: c.oe_mis != null ? Number(c.oe_mis.toFixed(4)) : 'N/A',
    oe_lof: c.oe_lof != null ? Number(c.oe_lof.toFixed(4)) : 'N/A',
    lof_z: c.lof_z != null ? Number(c.lof_z.toFixed(4)) : 'N/A',
  }
}

function computeDelta(v2, v4) {
  const emptyConstraints = { pLI: 'N/A', oe_mis_upper: 'N/A', oe_lof_upper: 'N/A', mis_z: 'N/A' }
  if (
    JSON.stringify(v2) === JSON.stringify(emptyConstraints) &&
    JSON.stringify(v4) === JSON.stringify(emptyConstraints)
  ) {
    return false
  }
  if (v2.pLI !== 'N/A' && v4.pLI !== 'N/A') {
    const threshold = 1.5
    if (v2.pLI === 0 || v4.pLI === 0) return v2.pLI !== v4.pLI
    return v4.pLI >= v2.pLI * threshold || v4.pLI <= v2.pLI / threshold
  }
  return v2.pLI !== v4.pLI
}

/**
 * Fetches gene constraint scores from the gnomAD GraphQL API (v2 + v4).
 * Replaces the previous static CSV file approach (BDD/constraints_v2.csv, constraints_v4.csv).
 *
 * Returns the same keys as before (constraints_v2, constraints_v4, constraintsDelta)
 * plus gnomadUrl and additional constraint fields (oe_mis, oe_lof, lof_z).
 */
async function getGeneConstraints(gene) {
  const cacheKey = `constraints:${gene}`
  const cached = cacheGet(cacheKey)
  if (cached !== undefined) return cached

  try {
    const [v4Res, v2Res] = await Promise.all([
      axios.post(GNOMAD_API, { query: CONSTRAINT_QUERY, variables: { geneSymbol: gene } }, { timeout: 15000 }),
      axios.post(GNOMAD_API, { query: CONSTRAINT_QUERY_V2, variables: { geneSymbol: gene } }, { timeout: 15000 }),
    ])

    const constraintsV4 = extractConstraints(v4Res.data?.data?.gene)
    const constraintsV2 = extractConstraints(v2Res.data?.data?.gene)
    const constraintsDelta = computeDelta(constraintsV2, constraintsV4)

    const result = {
      constraints_v2: constraintsV2,
      constraints_v4: constraintsV4,
      constraintsDelta,
      gnomadUrl: `https://gnomad.broadinstitute.org/gene/${gene}?dataset=gnomad_r4`,
    }
    cacheSet(cacheKey, result)
    return result
  } catch (error) {
    console.error(`gnomAD fetch failed for ${gene}: ${error.message}`)
    const empty = { pLI: 'N/A', oe_mis_upper: 'N/A', oe_lof_upper: 'N/A', mis_z: 'N/A' }
    return {
      constraints_v2: empty,
      constraints_v4: empty,
      constraintsDelta: false,
      gnomadUrl: `https://gnomad.broadinstitute.org/gene/${gene}?dataset=gnomad_r4`,
      error: error.message,
    }
  }
}

module.exports = getGeneConstraints
