const axios = require('axios')
const { analyzeGenes, analyzeGenesStructured } = require('../services/dataservice')
const { cacheClear } = require('../utils/cache')
const { resetLimiter } = require('../utils/rateLimiter')

jest.mock('axios')

const HGNC_XML = `<?xml version="1.0"?>
<response>
  <result name="response" numFound="1">
    <doc>
      <str name="name">BRCA DNA repair associated</str>
      <str name="location">17q21.31</str>
      <str name="hgnc_id">HGNC:1100</str>
      <str name="ensembl_gene_id">ENSG00000012048</str>
      <arr name="alias_name"><str>BRCC1</str></arr>
      <arr name="mane_select"><str>NM_007294.4</str></arr>
      <arr name="mgd_id"><str>MGI:104537</str></arr>
      <arr name="uniprot_ids"><str>P38398</str></arr>
      <arr name="omim_id"><str>113705</str></arr>
    </doc>
  </result>
</response>`

const CLINGEN_CSV = `"GENE SYMBOL","GENE ID (HGNC)","DISEASE","CLASSIFICATION"
"BRCA1","HGNC:1100","Breast cancer","Definitive"`

function setupMocks() {
  axios.get.mockImplementation((url) => {
    if (url.includes('rest.genenames.org')) return Promise.resolve({ status: 200, data: HGNC_XML })
    if (url.includes('clinicalgenome.org')) return Promise.resolve({ data: CLINGEN_CSV })
    if (url.includes('esearch') && url.includes('pubmed')) return Promise.resolve({ data: { esearchresult: { count: '100', idlist: ['12345'] } } })
    if (url.includes('efetch')) return Promise.resolve({ data: '<PubmedArticleSet><PubmedArticle><MedlineCitation><PMID>12345</PMID><Article><ArticleTitle>Test article</ArticleTitle><Journal><Title>J</Title><JournalIssue><PubDate><Year>2024</Year></PubDate></JournalIssue></Journal></Article></MedlineCitation><PubmedData><ArticleIdList><ArticleId IdType="pubmed">12345</ArticleId></ArticleIdList></PubmedData></PubmedArticle></PubmedArticleSet>' })
    if (url.includes('esearch') && url.includes('clinvar')) return Promise.resolve({ data: { esearchresult: { count: '42' } } })
    if (url.includes('ebi.ac.uk/proteins')) return Promise.resolve({ data: { comments: [{ type: 'FUNCTION', text: [{ value: 'E3 ubiquitin-protein ligase' }] }], keywords: [] } })
    if (url.includes('ftp.uniprot.org')) return Promise.resolve({ data: '' })
    if (url.includes('ebi.ac.uk/mi/impc')) return Promise.resolve({ data: { response: { docs: [{ mp_term_name: 'increased body weight', top_level_mp_term_name: ['growth/size/body region'] }] } } })
    if (url.includes('panelapp.genomicsengland')) return Promise.resolve({ data: { count: 5 } })
    if (url.includes('panelapp-aus')) return Promise.resolve({ data: { count: 2 } })
    if (url.includes('rest.ensembl.org')) return Promise.resolve({ data: [{ source: 'MIM morbid', description: 'Breast cancer, familial' }] })
    return Promise.reject(new Error(`Unmocked URL: ${url}`))
  })

  axios.post.mockResolvedValue({
    data: { data: { gene: { gene_id: 'ENSG00000012048', symbol: 'BRCA1', gnomad_constraint: { pLI: 0.0, oe_mis: 0.85, oe_mis_lower: 0.80, oe_mis_upper: 0.92, oe_lof: 0.1, oe_lof_lower: 0.05, oe_lof_upper: 0.15, mis_z: 2.5, lof_z: 4.5 } } } },
  })
}

describe('analyzeGenesStructured', () => {
  beforeEach(() => {
    cacheClear()
    resetLimiter()
    jest.clearAllMocks()
    setupMocks()
  })

  test('returns structured result with per-source data', async () => {
    const results = await analyzeGenesStructured(['BRCA1'], [])
    expect(results).toHaveLength(1)

    const r = results[0]
    expect(r.valid).toBe(true)
    expect(r.gene).toBe('BRCA1')
    expect(r.geneInfo.hgncId).toBe('HGNC:1100')
    expect(r.geneInfo.geneValidity).toBe('Definitive')

    // Per-source data
    expect(r.sources.pubmed.articleCount).toBe(100)
    expect(r.sources.clinvar.lofVariants).toBe(42)
    expect(r.sources.constraints.constraints_v4.pLI).toBe(0)
    expect(r.sources.uniprot.geneFunction).toContain('ubiquitin')
    expect(r.sources.panelApps.panelAppEnglandCount).toBe(5)
    expect(r.sources.omim.mim).toContain('Breast cancer, familial')

    // No errors
    expect(r.sourceErrors).toEqual([])
  })

  test('tracks source errors without crashing', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('rest.genenames.org')) return Promise.resolve({ status: 200, data: HGNC_XML })
      if (url.includes('clinicalgenome.org')) return Promise.resolve({ data: CLINGEN_CSV })
      if (url.includes('panelapp')) return Promise.reject(new Error('PanelApp down'))
      if (url.includes('esearch') && url.includes('pubmed')) return Promise.resolve({ data: { esearchresult: { count: '10', idlist: ['111'] } } })
      if (url.includes('efetch')) return Promise.resolve({ data: '<PubmedArticleSet><PubmedArticle><MedlineCitation><PMID>111</PMID><Article><ArticleTitle>Test</ArticleTitle><Journal><Title>J</Title><JournalIssue><PubDate><Year>2024</Year></PubDate></JournalIssue></Journal></Article></MedlineCitation><PubmedData><ArticleIdList><ArticleId IdType="pubmed">111</ArticleId></ArticleIdList></PubmedData></PubmedArticle></PubmedArticleSet>' })
      if (url.includes('esearch') && url.includes('clinvar')) return Promise.resolve({ data: { esearchresult: { count: '5' } } })
      if (url.includes('ebi.ac.uk/proteins')) return Promise.resolve({ data: { comments: [], keywords: [] } })
      if (url.includes('ftp.uniprot.org')) return Promise.resolve({ data: '' })
      if (url.includes('ebi.ac.uk/mi/impc')) return Promise.resolve({ data: { response: { docs: [] } } })
      if (url.includes('rest.ensembl.org')) return Promise.resolve({ data: [] })
      return Promise.reject(new Error(`Unmocked: ${url}`))
    })

    const results = await analyzeGenesStructured(['BRCA1'], [])
    const r = results[0]

    // Other sources still work
    expect(r.sources.pubmed.articleCount).toBe(10)
    expect(r.sources.clinvar.lofVariants).toBe(5)

    // PanelApp error tracked
    expect(r.sourceErrors).toHaveLength(1)
    expect(r.sourceErrors[0].source).toBe('PanelApp')
    expect(r.sourceErrors[0].error).toContain('unavailable')
  })

  test('returns valid=false for unknown genes', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('clinicalgenome.org')) return Promise.resolve({ data: CLINGEN_CSV })
      if (url.includes('rest.genenames.org')) return Promise.resolve({ status: 200, data: '<response><result name="response" numFound="0"></result></response>' })
      return Promise.resolve({ data: {} })
    })

    const results = await analyzeGenesStructured(['XYZFAKE'], [])
    expect(results).toHaveLength(1)
    expect(results[0].valid).toBe(false)
    expect(results[0].error).toContain('not found')
  })
})

describe('analyzeGenes (flat)', () => {
  beforeEach(() => {
    cacheClear()
    resetLimiter()
    jest.clearAllMocks()
    setupMocks()
  })

  test('returns flat result for web app backward compat', async () => {
    const results = await analyzeGenes(['BRCA1'], [])
    expect(results).toHaveLength(1)

    const r = results[0]
    // Flat keys (no .sources nesting)
    expect(r.count).toBe(100)
    expect(r.lofVariants).toBe(42)
    expect(r.hgncId).toBe('HGNC:1100')
    expect(r.geneValidity).toBe('Definitive')
    expect(r.mim).toContain('Breast cancer, familial')
  })

  test('filters out invalid genes', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('clinicalgenome.org')) return Promise.resolve({ data: CLINGEN_CSV })
      if (url.includes('rest.genenames.org')) return Promise.resolve({ status: 200, data: '<response><result name="response" numFound="0"></result></response>' })
      return Promise.resolve({ data: {} })
    })

    const results = await analyzeGenes(['XYZFAKE'], [])
    expect(results).toHaveLength(0)
  })
})

describe('getData (Express handler)', () => {
  beforeEach(() => {
    cacheClear()
    resetLimiter()
    jest.clearAllMocks()
    setupMocks()
  })

  test('extracts genes/phenotypes from req.body and returns results', async () => {
    const getData = require('../services/dataservice')
    const req = { body: { genes: ['BRCA1'], phenotypes: ['cancer'] } }
    const results = await getData(req)
    expect(results).toHaveLength(1)
    expect(results[0].hgncId).toBe('HGNC:1100')
  })

  test('handles empty req.body gracefully', async () => {
    const getData = require('../services/dataservice')
    const results = await getData({ body: {} })
    expect(results).toEqual([])
  })
})

describe('analyzeGenesStructured — rejected source and crash paths', () => {
  test('unwrapSource handles rejected promises from data sources', async () => {
    // Use jest.resetModules to mock a specific util to reject
    jest.resetModules()
    const freshDataservice = require('../services/dataservice')
    const freshCache = require('../utils/cache')
    freshCache.cacheClear()

    // Mock fetchGeneCard to return a valid gene
    jest.mock('../utils/fetchGeneCard.js', () => {
      return jest.fn().mockResolvedValue({
        geneName: 'Test', aliasName: null, location: '1p', maneSelect: null,
        mgdId: null, enzymeId: null, uniprotIds: null, hgncId: 'HGNC:999',
        rgdId: null, ensemblGeneId: null, orphanet: null, dateModified: null,
        dateApprovedReserved: null, validityMarker: 'No Known', omimId: null,
      })
    })
    // Mock PubMed to REJECT (triggers the rejected path in unwrapSource)
    jest.mock('../utils/getPubMedData.js', () => jest.fn().mockRejectedValue(new Error('PubMed exploded')))
    // Mock everything else to resolve normally
    jest.mock('../utils/getUniProtFunction.js', () => jest.fn().mockResolvedValue({ geneFunction: null, bioProcessKeywordsOnly: [], urlAccession: null, bioProcessKeywords: [], uniprotUrl: null }))
    jest.mock('../utils/getMouseKO.js', () => jest.fn().mockResolvedValue({ mousePhenotypes: {}, phenotypeCount: 0, categoryCount: 0, impcUrl: null }))
    jest.mock('../utils/getGeneConstraints.js', () => jest.fn().mockResolvedValue({ constraints_v2: {}, constraints_v4: {}, constraintsDelta: false }))
    jest.mock('../utils/getPanelApps.js', () => jest.fn().mockResolvedValue({ panelAppEnglandCount: 0, panelAppAustraliaCount: 0, panelAppEnglandError: null, panelAppAustraliaError: null }))
    jest.mock('../utils/getClinVarData.js', () => jest.fn().mockResolvedValue({ lofVariants: 0, missenseVariants: 0, lofUnknown: 0, missenseUnknown: 0, totalPathogenic: 0, totalLikelyPathogenic: 0 }))
    jest.mock('../utils/fetchOMIM.js', () => jest.fn().mockResolvedValue({ mim: [] }))

    // Re-require to pick up mocks
    jest.resetModules()
    const { analyzeGenesStructured: freshAnalyze } = require('../services/dataservice')

    const results = await freshAnalyze(['TEST'], [])
    expect(results).toHaveLength(1)
    expect(results[0].valid).toBe(true)
    // PubMed should be in sourceErrors
    const pubmedError = results[0].sourceErrors.find((e) => e.source === 'PubMed')
    expect(pubmedError).toBeDefined()
    expect(pubmedError.error).toContain('PubMed exploded')
  })
})

// validateGene and searchLiterature tests are in dataservice-extra.test.js
// (separate file to avoid jest.mock pollution from the rejected promise tests)
