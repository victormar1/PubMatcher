const getPubMedData = require('../utils/getPubMedData')
const { cacheClear } = require('../utils/cache')
const { rateLimitedGet } = require('../utils/rateLimiter')

// Mock rateLimitedGet — rate limiter is tested in rateLimiter.test.js
jest.mock('../utils/rateLimiter', () => ({
  rateLimitedGet: jest.fn(),
  resetLimiter: jest.fn(),
}))

const MOCK_ESEARCH_RESPONSE = {
  data: {
    esearchresult: {
      count: '42567',
      idlist: ['36397405', '35950988', '33834176'],
    },
  },
}

const MOCK_EFETCH_XML = `<?xml version="1.0"?>
<PubmedArticleSet>
  <PubmedArticle>
    <MedlineCitation>
      <PMID>36397405</PMID>
      <Article>
        <ArticleTitle>BRCA2 gene mutation in cancer.</ArticleTitle>
        <Abstract><AbstractText>BRCA2 is associated with hereditary breast cancers and other tumors.</AbstractText></Abstract>
        <AuthorList>
          <Author><LastName>Smith</LastName><Initials>JA</Initials></Author>
          <Author><LastName>Doe</LastName><Initials>B</Initials></Author>
        </AuthorList>
        <Journal>
          <Title>Cancer Research</Title>
          <JournalIssue><PubDate><Year>2022</Year></PubDate></JournalIssue>
        </Journal>
      </Article>
    </MedlineCitation>
    <PubmedData>
      <ArticleIdList>
        <ArticleId IdType="doi">10.1234/test.2022</ArticleId>
        <ArticleId IdType="pubmed">36397405</ArticleId>
      </ArticleIdList>
    </PubmedData>
  </PubmedArticle>
  <PubmedArticle>
    <MedlineCitation>
      <PMID>35950988</PMID>
      <Article>
        <ArticleTitle>Second article about BRCA.</ArticleTitle>
        <Journal><Title>Nature</Title><JournalIssue><PubDate><Year>2023</Year></PubDate></JournalIssue></Journal>
      </Article>
    </MedlineCitation>
    <PubmedData><ArticleIdList><ArticleId IdType="pubmed">35950988</ArticleId></ArticleIdList></PubmedData>
  </PubmedArticle>
  <PubmedArticle>
    <MedlineCitation>
      <PMID>33834176</PMID>
      <Article>
        <ArticleTitle>Third BRCA article.</ArticleTitle>
        <Journal><Title>Cell</Title><JournalIssue><PubDate><Year>2021</Year></PubDate></JournalIssue></Journal>
      </Article>
    </MedlineCitation>
    <PubmedData><ArticleIdList><ArticleId IdType="pubmed">33834176</ArticleId></ArticleIdList></PubmedData>
  </PubmedArticle>
</PubmedArticleSet>`

describe('getPubMedData', () => {
  beforeEach(() => {
    cacheClear()
    jest.clearAllMocks()
  })

  test('parses E-utilities response into articles with full metadata', async () => {
    rateLimitedGet
      .mockResolvedValueOnce(MOCK_ESEARCH_RESPONSE) // esearch
      .mockResolvedValueOnce({ data: MOCK_EFETCH_XML }) // efetch

    const result = await getPubMedData('BRCA1', [])

    expect(result.gene).toBe('BRCA1')
    expect(result.count).toBe(42567)
    expect(result.articleCount).toBe(42567)
    expect(result.pubmedUrl).toBe('https://pubmed.ncbi.nlm.nih.gov/?term=BRCA1')

    expect(result.articles).toHaveLength(3)
    expect(result.articles[0].pmid).toBe('36397405')
    expect(result.articles[0].title).toBe('BRCA2 gene mutation in cancer.')
    expect(result.articles[0].authors).toEqual(['Smith JA', 'Doe B'])
    expect(result.articles[0].journal).toBe('Cancer Research')
    expect(result.articles[0].year).toBe('2022')
    expect(result.articles[0].doi).toBe('10.1234/test.2022')
    expect(result.articles[0].abstract).toContain('BRCA2 is associated')

    // Legacy keys
    expect(result.firstArticleTitle).toBe('BRCA2 gene mutation in cancer.')
    expect(result.firstArticleUrl).toBe('https://pubmed.ncbi.nlm.nih.gov/36397405/')
    expect(result.complArticles).toHaveLength(2)
  })

  test('builds correct query with phenotypes', async () => {
    rateLimitedGet.mockResolvedValueOnce({
      data: { esearchresult: { count: '0', idlist: [] } },
    })

    await getPubMedData('TP53', ['cancer', 'Li-Fraumeni'])

    const calledUrl = rateLimitedGet.mock.calls[0][1]
    expect(calledUrl).toContain('(TP53%20AND%20cancer)%20OR%20(TP53%20AND%20Li-Fraumeni)')
  })

  test('returns empty results when no articles found', async () => {
    rateLimitedGet.mockResolvedValueOnce({
      data: { esearchresult: { count: '0', idlist: [] } },
    })

    const result = await getPubMedData('XYZFAKE', [])

    expect(result.count).toBe(0)
    expect(result.articles).toEqual([])
    expect(result.firstArticleTitle).toBe('No articles found')
    expect(result.firstArticleUrl).toBeNull()
  })

  test('returns fallback on API error', async () => {
    rateLimitedGet.mockRejectedValue(new Error('Network error'))

    const result = await getPubMedData('BRCA1', [])

    expect(result.count).toBe(0)
    expect(result.articles).toEqual([])
    expect(result.error).toBe('Network error')
    expect(result.gene).toBe('BRCA1')
  })

  test('caches results on second call', async () => {
    rateLimitedGet
      .mockResolvedValueOnce(MOCK_ESEARCH_RESPONSE)
      .mockResolvedValueOnce({ data: MOCK_EFETCH_XML })

    const result1 = await getPubMedData('BRCA2', [])
    const result2 = await getPubMedData('BRCA2', [])

    expect(result2).toEqual(result1)
    expect(rateLimitedGet).toHaveBeenCalledTimes(2) // esearch + efetch, once only
  })
})
