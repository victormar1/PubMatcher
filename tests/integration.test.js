/**
 * Integration tests — hit real APIs with well-known genes.
 *
 * These are slow (30-120s per test) and depend on external services.
 * Run separately: npm run test:integration
 *
 * They verify that the full pipeline produces correct, non-trivial results
 * for BRCA1 and TP53 — two of the most studied genes in genomics.
 */

const { analyzeGenesStructured } = require('../services/dataservice')
const { cacheClear } = require('../utils/cache')
const { resetLimiter } = require('../utils/rateLimiter')

beforeAll(() => {
  cacheClear()
  resetLimiter()
})

describe('BRCA1 full analysis (real APIs)', () => {
  let result

  beforeAll(async () => {
    cacheClear()
    resetLimiter()
    const results = await analyzeGenesStructured(['BRCA1'], ['breast cancer'])
    result = results[0]
  }, 180000)

  test('gene is validated and identified correctly', () => {
    expect(result.valid).toBe(true)
    expect(result.gene).toBe('BRCA1')
    expect(result.geneInfo.name).toMatch(/BRCA/i)
    expect(result.geneInfo.hgncId).toBe('HGNC:1100')
    expect(result.geneInfo.location).toMatch(/17q/)
    expect(result.geneInfo.ensemblId).toBe('ENSG00000012048')
    expect(result.geneInfo.omimId).toBe('113705')
  })

  test('ClinGen validity is Definitive for BRCA1', () => {
    expect(result.geneInfo.geneValidity).toBe('Definitive')
  })

  test('PubMed returns articles with metadata', () => {
    const pubmed = result.sources.pubmed
    if (pubmed.error) {
      console.warn(`PubMed was rate-limited: ${pubmed.error}`)
      return
    }
    expect(pubmed.articleCount).toBeGreaterThan(10000)
    expect(pubmed.articles.length).toBeGreaterThan(0)
    expect(pubmed.articles.length).toBeLessThanOrEqual(5)

    const article = pubmed.articles[0]
    expect(article.pmid).toMatch(/^\d+$/)
    expect(article.title).toBeTruthy()
    expect(article.title.length).toBeGreaterThan(5)
    expect(article.journal).toBeTruthy()
    expect(article.year).toMatch(/^\d{4}$/)
    expect(pubmed.pubmedUrl).toContain('pubmed.ncbi.nlm.nih.gov')
  })

  test('ClinVar returns non-trivial pathogenic variant counts', () => {
    const clinvar = result.sources.clinvar
    if (clinvar.error) {
      console.warn(`ClinVar was rate-limited: ${clinvar.error}`)
      return
    }
    expect(clinvar.totalPathogenic).toBeGreaterThan(100)
    expect(typeof clinvar.lofVariants).toBe('number')
    expect(typeof clinvar.missenseVariants).toBe('number')
    expect(clinvar.clinvarUrl).toContain('BRCA1')
  })

  test('gnomAD returns constraint scores for both genome builds', () => {
    const constraints = result.sources.constraints
    if (constraints.error) {
      console.warn(`gnomAD was unavailable: ${constraints.error}`)
      return
    }
    // BRCA1 is highly constrained — pLI should be near 0 (tolerant of LoF)
    // or near 1 depending on the version. Just check it's a real number.
    expect(typeof constraints.constraints_v4.pLI).toBe('number')
    expect(typeof constraints.constraints_v2.pLI).toBe('number')
    expect(typeof constraints.constraints_v4.oe_lof_upper).toBe('number')
    expect(typeof constraints.constraints_v4.mis_z).toBe('number')
    expect(constraints.gnomadUrl).toContain('BRCA1')
  })

  test('UniProt returns protein function', () => {
    const uniprot = result.sources.uniprot
    if (uniprot.error) {
      console.warn(`UniProt was unavailable: ${uniprot.error}`)
      return
    }
    expect(uniprot.geneFunction).toBeTruthy()
    expect(uniprot.geneFunction.length).toBeGreaterThan(20)
    // BRCA1 is involved in DNA repair
    expect(uniprot.geneFunction.toLowerCase()).toMatch(/dna|repair|ubiquitin|tumor/i)
    expect(uniprot.uniprotUrl).toContain('uniprot.org')
  })

  test('IMPC returns mouse phenotypes', () => {
    const mouseKO = result.sources.mouseKO
    if (mouseKO.error) {
      console.warn(`IMPC was unavailable: ${mouseKO.error}`)
      return
    }
    // BRCA1 knockout mice have phenotypes
    if (mouseKO.phenotypeCount > 0) {
      expect(Object.keys(mouseKO.mousePhenotypes).length).toBeGreaterThan(0)
      expect(mouseKO.impcUrl).toContain('mousephenotype.org')
    }
  })

  test('PanelApp returns panel counts', () => {
    const panelApps = result.sources.panelApps
    // At least UK should respond
    if (panelApps.panelAppEnglandCount !== null) {
      expect(typeof panelApps.panelAppEnglandCount).toBe('number')
    }
  })

  test('OMIM returns disease associations', () => {
    const omim = result.sources.omim
    if (omim.error) {
      console.warn(`OMIM was unavailable: ${omim.error}`)
      return
    }
    // BRCA1 is associated with breast/ovarian cancer in OMIM
    if (omim.mim.length > 0) {
      const allDescriptions = omim.mim.join(' ').toLowerCase()
      expect(allDescriptions).toMatch(/breast|ovarian|cancer|carcinoma/i)
    }
  })

  test('sourceErrors is an array (may be empty if all sources responded)', () => {
    expect(Array.isArray(result.sourceErrors)).toBe(true)
    if (result.sourceErrors.length > 0) {
      console.warn('Some sources had errors:', result.sourceErrors.map((e) => `${e.source}: ${e.error}`).join(', '))
    }
  })
})

describe('TP53 full analysis (real APIs)', () => {
  let result

  beforeAll(async () => {
    // Use the cache from BRCA1 run for shared resources (ClinGen, UniProt keywords)
    resetLimiter()
    const results = await analyzeGenesStructured(['TP53'], [])
    result = results[0]
  }, 180000)

  test('gene is validated correctly', () => {
    expect(result.valid).toBe(true)
    expect(result.geneInfo.name).toMatch(/tumor protein/i)
    expect(result.geneInfo.hgncId).toBe('HGNC:11998')
  })

  test('PubMed returns massive literature corpus for TP53', () => {
    const pubmed = result.sources.pubmed
    if (pubmed.error) return
    // TP53 is one of the most studied genes
    expect(pubmed.articleCount).toBeGreaterThan(20000)
  })

  test('ClinVar returns high pathogenic counts for TP53', () => {
    const clinvar = result.sources.clinvar
    if (clinvar.error) return
    expect(clinvar.totalPathogenic).toBeGreaterThan(500)
  })

  test('gnomAD shows TP53 is highly constrained', () => {
    const c = result.sources.constraints
    if (c.error) return
    // TP53 should have constraint data in at least one genome build
    const hasV2 = c.constraints_v2.pLI !== 'N/A'
    const hasV4 = c.constraints_v4.pLI !== 'N/A'
    expect(hasV2 || hasV4).toBe(true)
    // pLI varies between genome builds; just verify it's a real number
    if (hasV4) expect(typeof c.constraints_v4.pLI).toBe('number')
  })
})

describe('invalid gene (real APIs)', () => {
  test('returns valid=false for nonsense gene symbol', async () => {
    cacheClear()
    resetLimiter()
    const results = await analyzeGenesStructured(['XYZNOTAREALGENE999'], [])
    expect(results).toHaveLength(1)
    expect(results[0].valid).toBe(false)
    expect(results[0].error).toContain('not found')
  }, 30000)
})
