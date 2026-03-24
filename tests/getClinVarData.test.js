const getClinVarData = require('../utils/getClinVarData')
const { cacheClear } = require('../utils/cache')
const { rateLimitedGet } = require('../utils/rateLimiter')

// Mock rateLimitedGet (not axios) — rate limiter behavior is tested in rateLimiter.test.js
jest.mock('../utils/rateLimiter', () => ({
  rateLimitedGet: jest.fn(),
  resetLimiter: jest.fn(),
}))

function mockClinVarCount(count) {
  return { data: { esearchresult: { count: String(count) } } }
}

describe('getClinVarData', () => {
  beforeEach(() => {
    cacheClear()
    jest.clearAllMocks()
  })

  test('queries ClinVar API for all variant categories via Promise.all', async () => {
    rateLimitedGet
      .mockResolvedValueOnce(mockClinVarCount(15))  // pathogenic LoF
      .mockResolvedValueOnce(mockClinVarCount(230))  // pathogenic missense
      .mockResolvedValueOnce(mockClinVarCount(5))    // VUS LoF
      .mockResolvedValueOnce(mockClinVarCount(890))  // VUS missense
      .mockResolvedValueOnce(mockClinVarCount(450))  // total pathogenic
      .mockResolvedValueOnce(mockClinVarCount(120))  // total likely pathogenic

    const result = await getClinVarData('BRCA1')

    expect(result.lofVariants).toBe(15)
    expect(result.missenseVariants).toBe(230)
    expect(result.lofUnknown).toBe(5)
    expect(result.missenseUnknown).toBe(890)
    expect(result.totalPathogenic).toBe(450)
    expect(result.totalLikelyPathogenic).toBe(120)
    expect(result.clinvarUrl).toBe('https://www.ncbi.nlm.nih.gov/clinvar/?term=BRCA1[gene]')

    // 6 queries fired via Promise.all
    expect(rateLimitedGet).toHaveBeenCalledTimes(6)
    const urls = rateLimitedGet.mock.calls.map((c) => c[1])
    expect(urls[0]).toContain('pathogenic')
    expect(urls[0]).toContain('loss of function')
    expect(urls[1]).toContain('missense')
    expect(urls[4]).not.toContain('molecular_consequence')
  })

  test('returns zeros on API error', async () => {
    rateLimitedGet.mockRejectedValue(new Error('429 Too Many Requests'))

    const result = await getClinVarData('BRCA1')

    expect(result.lofVariants).toBe(0)
    expect(result.missenseVariants).toBe(0)
    expect(result.totalPathogenic).toBe(0)
    expect(result.error).toBeTruthy()
    expect(result.clinvarUrl).toContain('BRCA1')
  })

  test('handles undefined/null count from API response', async () => {
    rateLimitedGet.mockResolvedValue({ data: { esearchresult: {} } })

    const result = await getClinVarData('NOCOUNTS')
    expect(result.lofVariants).toBe(0)
    expect(result.totalPathogenic).toBe(0)
  })

  test('caches results on second call', async () => {
    rateLimitedGet
      .mockResolvedValueOnce(mockClinVarCount(10))
      .mockResolvedValueOnce(mockClinVarCount(20))
      .mockResolvedValueOnce(mockClinVarCount(1))
      .mockResolvedValueOnce(mockClinVarCount(50))
      .mockResolvedValueOnce(mockClinVarCount(100))
      .mockResolvedValueOnce(mockClinVarCount(30))

    const result1 = await getClinVarData('TP53')
    const result2 = await getClinVarData('TP53')

    expect(result2).toEqual(result1)
    expect(rateLimitedGet).toHaveBeenCalledTimes(6)
  })
})
