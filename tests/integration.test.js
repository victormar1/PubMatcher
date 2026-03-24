/**
 * Integration tests — hit real APIs with well-known genes.
 * Run separately: npm run test:integration
 *
 * These MUST pass unconditionally. No skipping on error.
 * If a source returns an error, the test fails — that means
 * our retry logic or timeouts need fixing, not the test.
 */

const { analyzeGenesStructured, validateGene, searchLiterature } = require('../services/dataservice')
const { cacheClear } = require('../utils/cache')
const { resetLimiter } = require('../utils/rateLimiter')

beforeAll(() => {
  cacheClear()
  resetLimiter()
})

describe('BRCA1 full analysis', () => {
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

  test('ClinGen validity is Definitive', () => {
    expect(result.geneInfo.geneValidity).toBe('Definitive')
  })

  test('PubMed returns articles with metadata', () => {
    const pubmed = result.sources.pubmed
    expect(pubmed.error).toBeUndefined()
    expect(pubmed.articleCount).toBeGreaterThan(10000)
    expect(pubmed.articles.length).toBeGreaterThan(0)
    expect(pubmed.articles.length).toBeLessThanOrEqual(5)

    const article = pubmed.articles[0]
    expect(article.pmid).toMatch(/^\d+$/)
    expect(article.title.length).toBeGreaterThan(5)
    expect(article.journal).toBeTruthy()
    expect(article.year).toMatch(/^\d{4}$/)
  })

  test('ClinVar returns pathogenic variant counts', () => {
    const clinvar = result.sources.clinvar
    expect(clinvar.error).toBeUndefined()
    expect(clinvar.totalPathogenic).toBeGreaterThan(100)
    expect(typeof clinvar.lofVariants).toBe('number')
    expect(typeof clinvar.missenseVariants).toBe('number')
    expect(clinvar.clinvarUrl).toContain('BRCA1')
  })

  test('gnomAD returns constraint scores', () => {
    const constraints = result.sources.constraints
    expect(constraints.error).toBeUndefined()
    expect(typeof constraints.constraints_v4.pLI).toBe('number')
    expect(typeof constraints.constraints_v2.pLI).toBe('number')
    expect(typeof constraints.constraints_v4.oe_lof_upper).toBe('number')
    expect(constraints.gnomadUrl).toContain('BRCA1')
  })

  test('UniProt returns protein function related to DNA repair', () => {
    const uniprot = result.sources.uniprot
    expect(uniprot.error).toBeUndefined()
    expect(uniprot.geneFunction).toBeTruthy()
    expect(uniprot.geneFunction.length).toBeGreaterThan(20)
    expect(uniprot.geneFunction.toLowerCase()).toMatch(/dna|repair|ubiquitin|tumor/i)
    expect(uniprot.uniprotUrl).toContain('uniprot.org')
  })

  test('PanelApp returns panel counts', () => {
    const panelApps = result.sources.panelApps
    expect(panelApps.panelAppEnglandError).toBeNull()
    expect(typeof panelApps.panelAppEnglandCount).toBe('number')
  })

  test('OMIM returns breast/ovarian cancer associations', () => {
    const omim = result.sources.omim
    expect(omim.error).toBeUndefined()
    expect(omim.mim.length).toBeGreaterThan(0)
    const allDescriptions = omim.mim.join(' ').toLowerCase()
    expect(allDescriptions).toMatch(/breast|ovarian|cancer|carcinoma/i)
  })

  test('no source errors', () => {
    expect(result.sourceErrors).toEqual([])
  })
})

describe('TP53 full analysis', () => {
  let result

  beforeAll(async () => {
    resetLimiter()
    const results = await analyzeGenesStructured(['TP53'], [])
    result = results[0]
  }, 180000)

  test('gene is validated correctly', () => {
    expect(result.valid).toBe(true)
    expect(result.geneInfo.name).toMatch(/tumor protein/i)
    expect(result.geneInfo.hgncId).toBe('HGNC:11998')
  })

  test('PubMed returns massive literature corpus', () => {
    expect(result.sources.pubmed.error).toBeUndefined()
    expect(result.sources.pubmed.articleCount).toBeGreaterThan(20000)
  })

  test('ClinVar returns high pathogenic counts', () => {
    expect(result.sources.clinvar.error).toBeUndefined()
    expect(result.sources.clinvar.totalPathogenic).toBeGreaterThan(500)
  })

  test('gnomAD returns constraint data', () => {
    const c = result.sources.constraints
    expect(c.error).toBeUndefined()
    const hasV2 = c.constraints_v2.pLI !== 'N/A'
    const hasV4 = c.constraints_v4.pLI !== 'N/A'
    expect(hasV2 || hasV4).toBe(true)
  })

  test('no source errors', () => {
    expect(result.sourceErrors).toEqual([])
  })
})

describe('validateGene', () => {
  test('validates known gene', async () => {
    const result = await validateGene('BRCA1')
    expect(result.valid).toBe(true)
    expect(result.hgncId).toBe('HGNC:1100')
    expect(result.geneValidity).toBe('Definitive')
  }, 30000)

  test('rejects unknown gene', async () => {
    resetLimiter()
    const result = await validateGene('XYZNOTAREALGENE999')
    expect(result.valid).toBe(false)
    expect(result.message).toContain('not found')
  }, 30000)
})

describe('searchLiterature', () => {
  test('returns articles for known gene', async () => {
    const result = await searchLiterature('TP53', ['cancer'])
    expect(result.error).toBeUndefined()
    expect(result.articleCount).toBeGreaterThan(0)
    expect(result.articles.length).toBeGreaterThan(0)
    expect(result.articles[0].pmid).toMatch(/^\d+$/)
  }, 30000)
})
