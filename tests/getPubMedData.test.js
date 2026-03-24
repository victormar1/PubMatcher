const getPubMedData = require('../utils/getPubMedData')
const { cacheClear } = require('../utils/cache')

describe('getPubMedData', () => {
  beforeEach(() => {
    cacheClear()
  })

  test('returns correct shape for a known gene', async () => {
    const result = await getPubMedData('BRCA1', [])
    expect(result).toBeDefined()
    expect(result.gene).toBe('BRCA1')
    expect(typeof result.count).toBe('number')
    expect(result.pubmedUrl).toContain('pubmed.ncbi.nlm.nih.gov')
    expect(Array.isArray(result.articles)).toBe(true)
    // Legacy keys always present
    expect(result).toHaveProperty('firstArticleTitle')
    expect(result).toHaveProperty('firstArticleUrl')
    expect(Array.isArray(result.complArticles)).toBe(true)

    // If API responded (no rate limit), should have articles
    if (!result.error) {
      expect(result.count).toBeGreaterThan(0)
      expect(result.articles.length).toBeGreaterThan(0)
      expect(result.articles[0]).toHaveProperty('pmid')
      expect(result.articles[0]).toHaveProperty('title')
      expect(result.articles[0]).toHaveProperty('authors')
      expect(result.articles[0]).toHaveProperty('doi')
      expect(result.firstArticleTitle).not.toBe('No articles found')
      expect(result.firstArticleUrl).toContain('pubmed.ncbi.nlm.nih.gov')
    }
  }, 30000)

  test('returns articles with phenotype refinement', async () => {
    const result = await getPubMedData('TP53', ['cancer'])
    expect(result).toBeDefined()
    expect(result.gene).toBe('TP53')
    if (!result.error) {
      expect(result.count).toBeGreaterThan(0)
      expect(result.articles.length).toBeGreaterThan(0)
    }
  }, 30000)

  test('returns zero results for nonsense gene', async () => {
    const result = await getPubMedData('XYZNOTAREALGENE123', [])
    // Even on rate limit, shape is correct
    expect(typeof result.count).toBe('number')
    expect(Array.isArray(result.articles)).toBe(true)
    if (!result.error) {
      expect(result.count).toBe(0)
      expect(result.articles).toEqual([])
      expect(result.firstArticleTitle).toBe('No articles found')
    }
  }, 30000)

  test('caches successful results', async () => {
    const result1 = await getPubMedData('BRCA2', [])
    // Only test caching if first call succeeded (not rate-limited)
    if (!result1.error) {
      const start = Date.now()
      const result2 = await getPubMedData('BRCA2', [])
      const elapsed = Date.now() - start
      expect(result2).toEqual(result1)
      expect(elapsed).toBeLessThan(50) // Cache hit should be near-instant
    }
  }, 30000)
})
