const axios = require('axios')
const { validateGene, searchLiterature } = require('../services/dataservice')
const { cacheClear } = require('../utils/cache')
const { resetLimiter } = require('../utils/rateLimiter')

jest.mock('axios')
jest.mock('../utils/rateLimiter', () => ({
  rateLimitedGet: jest.fn(),
  resetLimiter: jest.fn(),
}))

const { rateLimitedGet } = require('../utils/rateLimiter')

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

describe('validateGene', () => {
  beforeEach(() => {
    cacheClear()
    jest.clearAllMocks()
  })

  test('returns valid gene data', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('clinicalgenome.org')) return Promise.resolve({ data: CLINGEN_CSV })
      if (url.includes('rest.genenames.org')) return Promise.resolve({ status: 200, data: HGNC_XML })
      return Promise.resolve({ data: {} })
    })

    const result = await validateGene('BRCA1')
    expect(result.valid).toBe(true)
    expect(result.hgncId).toBe('HGNC:1100')
    expect(result.name).toContain('BRCA')
    expect(result.geneValidity).toBe('Definitive')
    expect(result.geneLink).toContain('HGNC:1100')
    expect(result.ensemblId).toBe('ENSG00000012048')
    expect(result.maneSelect).toContain('NM_007294.4')
  })

  test('returns invalid for unknown gene', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('clinicalgenome.org')) return Promise.resolve({ data: CLINGEN_CSV })
      if (url.includes('rest.genenames.org')) return Promise.resolve({ status: 200, data: '<response><result name="response" numFound="0"></result></response>' })
      return Promise.resolve({ data: {} })
    })

    const result = await validateGene('XYZFAKE')
    expect(result.valid).toBe(false)
    expect(result.message).toContain('not found')
  })
})

describe('searchLiterature', () => {
  beforeEach(() => {
    cacheClear()
    jest.clearAllMocks()
  })

  test('returns PubMed results', async () => {
    rateLimitedGet
      .mockResolvedValueOnce({ data: { esearchresult: { count: '100', idlist: ['12345'] } } })
      .mockResolvedValueOnce({ data: '<PubmedArticleSet><PubmedArticle><MedlineCitation><PMID>12345</PMID><Article><ArticleTitle>Test article</ArticleTitle><Journal><Title>J</Title><JournalIssue><PubDate><Year>2024</Year></PubDate></JournalIssue></Journal></Article></MedlineCitation><PubmedData><ArticleIdList><ArticleId IdType="pubmed">12345</ArticleId></ArticleIdList></PubmedData></PubmedArticle></PubmedArticleSet>' })

    const result = await searchLiterature('BRCA1', ['cancer'])
    expect(result.articleCount).toBe(100)
    expect(result.articles.length).toBe(1)
    expect(result.articles[0].title).toBe('Test article')
  })
})
