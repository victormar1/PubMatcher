const getPubMedData = require('../utils/getPubMedData')
const { cacheClear } = require('../utils/cache')
const { rateLimitedGet } = require('../utils/rateLimiter')

jest.mock('../utils/rateLimiter', () => ({
  rateLimitedGet: jest.fn(),
  resetLimiter: jest.fn(),
}))

function efetchXml(articles) {
  const items = articles.map((a) => `
    <PubmedArticle>
      <MedlineCitation>
        <PMID>${a.pmid}</PMID>
        <Article>
          <ArticleTitle>${a.title}</ArticleTitle>
          ${a.abstract !== undefined ? `<Abstract><AbstractText>${typeof a.abstract === 'string' ? a.abstract : JSON.stringify(a.abstract)}</AbstractText></Abstract>` : ''}
          ${a.authors ? `<AuthorList>${a.authors.map((au) => `<Author><LastName>${au.last}</LastName><Initials>${au.init}</Initials></Author>`).join('')}</AuthorList>` : ''}
          <Journal><Title>${a.journal || ''}</Title><JournalIssue><PubDate><Year>${a.year || ''}</Year></PubDate></JournalIssue></Journal>
        </Article>
      </MedlineCitation>
      <PubmedData><ArticleIdList>
        ${a.doi ? `<ArticleId IdType="doi">${a.doi}</ArticleId>` : ''}
        <ArticleId IdType="pubmed">${a.pmid}</ArticleId>
      </ArticleIdList></PubmedData>
    </PubmedArticle>`)
  return `<PubmedArticleSet>${items.join('')}</PubmedArticleSet>`
}

describe('getPubMedData', () => {
  beforeEach(() => {
    cacheClear()
    jest.clearAllMocks()
  })

  test('parses E-utilities response into articles with full metadata', async () => {
    rateLimitedGet
      .mockResolvedValueOnce({ data: { esearchresult: { count: '42567', idlist: ['111', '222', '333'] } } })
      .mockResolvedValueOnce({
        data: efetchXml([
          { pmid: '111', title: 'BRCA2 gene mutation in cancer.', abstract: 'BRCA2 is associated with hereditary breast cancers.', authors: [{ last: 'Smith', init: 'JA' }, { last: 'Doe', init: 'B' }], journal: 'Cancer Research', year: '2022', doi: '10.1234/test' },
          { pmid: '222', title: 'Second article.', journal: 'Nature', year: '2023' },
          { pmid: '333', title: 'Third article.', journal: 'Cell', year: '2021' },
        ]),
      })

    const result = await getPubMedData('BRCA1', [])

    expect(result.gene).toBe('BRCA1')
    expect(result.count).toBe(42567)
    expect(result.articles).toHaveLength(3)
    expect(result.articles[0].pmid).toBe('111')
    expect(result.articles[0].title).toBe('BRCA2 gene mutation in cancer.')
    expect(result.articles[0].authors).toEqual(['Smith JA', 'Doe B'])
    expect(result.articles[0].doi).toBe('10.1234/test')
    expect(result.articles[0].abstract).toContain('BRCA2 is associated')
    // Legacy keys
    expect(result.firstArticleTitle).toBe('BRCA2 gene mutation in cancer.')
    expect(result.firstArticleUrl).toBe('https://pubmed.ncbi.nlm.nih.gov/111/')
    expect(result.complArticles).toHaveLength(2)
  })

  test('handles abstract as structured XML object (not string)', async () => {
    // Some PubMed articles return AbstractText as an object with _
    const xml = `<PubmedArticleSet><PubmedArticle>
      <MedlineCitation><PMID>999</PMID>
        <Article><ArticleTitle>Test</ArticleTitle>
          <Abstract><AbstractText Label="BACKGROUND">Background text here.</AbstractText></Abstract>
          <Journal><Title>J</Title><JournalIssue><PubDate><Year>2024</Year></PubDate></JournalIssue></Journal>
        </Article>
      </MedlineCitation>
      <PubmedData><ArticleIdList><ArticleId IdType="pubmed">999</ArticleId></ArticleIdList></PubmedData>
    </PubmedArticle></PubmedArticleSet>`

    rateLimitedGet
      .mockResolvedValueOnce({ data: { esearchresult: { count: '1', idlist: ['999'] } } })
      .mockResolvedValueOnce({ data: xml })

    const result = await getPubMedData('TEST', [])
    expect(result.articles[0].abstract).toContain('Background text here')
  })

  test('handles abstract as array of sections', async () => {
    const xml = `<PubmedArticleSet><PubmedArticle>
      <MedlineCitation><PMID>888</PMID>
        <Article><ArticleTitle>Multi-section abstract</ArticleTitle>
          <Abstract>
            <AbstractText Label="BACKGROUND">Part one.</AbstractText>
            <AbstractText Label="METHODS">Part two.</AbstractText>
          </Abstract>
          <Journal><Title>J</Title><JournalIssue><PubDate><Year>2024</Year></PubDate></JournalIssue></Journal>
        </Article>
      </MedlineCitation>
      <PubmedData><ArticleIdList><ArticleId IdType="pubmed">888</ArticleId></ArticleIdList></PubmedData>
    </PubmedArticle></PubmedArticleSet>`

    rateLimitedGet
      .mockResolvedValueOnce({ data: { esearchresult: { count: '1', idlist: ['888'] } } })
      .mockResolvedValueOnce({ data: xml })

    const result = await getPubMedData('TEST2', [])
    expect(result.articles[0].abstract).toContain('Part one')
    expect(result.articles[0].abstract).toContain('Part two')
  })

  test('handles article title as object (XML with attributes)', async () => {
    const xml = `<PubmedArticleSet><PubmedArticle>
      <MedlineCitation><PMID>777</PMID>
        <Article><ArticleTitle><i>Italic</i> title here.</ArticleTitle>
          <Journal><Title>J</Title><JournalIssue><PubDate><Year>2024</Year></PubDate></JournalIssue></Journal>
        </Article>
      </MedlineCitation>
      <PubmedData><ArticleIdList><ArticleId IdType="pubmed">777</ArticleId></ArticleIdList></PubmedData>
    </PubmedArticle></PubmedArticleSet>`

    rateLimitedGet
      .mockResolvedValueOnce({ data: { esearchresult: { count: '1', idlist: ['777'] } } })
      .mockResolvedValueOnce({ data: xml })

    const result = await getPubMedData('TEST3', [])
    expect(result.articles[0].title).toBeTruthy() // Should not crash on object title
  })

  test('handles more than 5 authors (truncates with et al.)', async () => {
    const authors = Array.from({ length: 8 }, (_, i) => ({ last: `Author${i}`, init: 'X' }))
    rateLimitedGet
      .mockResolvedValueOnce({ data: { esearchresult: { count: '1', idlist: ['666'] } } })
      .mockResolvedValueOnce({ data: efetchXml([{ pmid: '666', title: 'Many authors', authors, journal: 'J', year: '2024' }]) })

    const result = await getPubMedData('TEST4', [])
    expect(result.articles[0].authors).toHaveLength(6) // 5 + 'et al.'
    expect(result.articles[0].authors[5]).toBe('et al.')
  })

  test('builds correct query with phenotypes', async () => {
    rateLimitedGet.mockResolvedValueOnce({ data: { esearchresult: { count: '0', idlist: [] } } })
    await getPubMedData('TP53', ['cancer', 'Li-Fraumeni'])
    const calledUrl = rateLimitedGet.mock.calls[0][1]
    expect(calledUrl).toContain('(TP53%20AND%20cancer)%20OR%20(TP53%20AND%20Li-Fraumeni)')
  })

  test('returns empty results when no articles found', async () => {
    rateLimitedGet.mockResolvedValueOnce({ data: { esearchresult: { count: '0', idlist: [] } } })
    const result = await getPubMedData('XYZFAKE', [])
    expect(result.count).toBe(0)
    expect(result.articles).toEqual([])
    expect(result.firstArticleTitle).toBe('No articles found')
  })

  test('returns fallback on API error', async () => {
    rateLimitedGet.mockRejectedValue(new Error('Network error'))
    const result = await getPubMedData('BRCA1', [])
    expect(result.count).toBe(0)
    expect(result.articles).toEqual([])
    expect(result.error).toBe('Network error')
  })

  test('caches results on second call', async () => {
    rateLimitedGet
      .mockResolvedValueOnce({ data: { esearchresult: { count: '10', idlist: ['111'] } } })
      .mockResolvedValueOnce({ data: efetchXml([{ pmid: '111', title: 'Test', journal: 'J', year: '2024' }]) })

    const result1 = await getPubMedData('BRCA2', [])
    const result2 = await getPubMedData('BRCA2', [])
    expect(result2).toEqual(result1)
    expect(rateLimitedGet).toHaveBeenCalledTimes(2)
  })
})
