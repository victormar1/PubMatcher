const getClinVarData = require('../utils/getClinVarData')
const { cacheClear } = require('../utils/cache')

describe('getClinVarData', () => {
  beforeEach(() => {
    cacheClear()
  })

  test('returns correct shape for a known gene', async () => {
    const result = await getClinVarData('BRCA1')
    expect(result).toBeDefined()
    // Always returns these keys (even on rate limit / error)
    expect(typeof result.lofVariants).toBe('number')
    expect(typeof result.missenseVariants).toBe('number')
    expect(typeof result.lofUnknown).toBe('number')
    expect(typeof result.missenseUnknown).toBe('number')
    expect(typeof result.totalPathogenic).toBe('number')
    expect(typeof result.totalLikelyPathogenic).toBe('number')
    expect(result.clinvarUrl).toContain('clinvar')
    expect(result.clinvarUrl).toContain('BRCA1')

    // If API responded (no rate limit), values should be positive
    if (!result.error) {
      expect(result.totalPathogenic).toBeGreaterThan(0)
    }
  }, 60000)

  test('returns zeros for unknown gene', async () => {
    const result = await getClinVarData('XYZNOTAREALGENE123')
    expect(result.lofVariants).toBe(0)
    expect(result.missenseVariants).toBe(0)
    expect(result.totalPathogenic).toBe(0)
  }, 60000)

  test('caches successful results', async () => {
    const result1 = await getClinVarData('TP53')
    // Only test caching if first call succeeded (not rate-limited)
    if (!result1.error) {
      const start = Date.now()
      const result2 = await getClinVarData('TP53')
      const elapsed = Date.now() - start
      expect(result2).toEqual(result1)
      expect(elapsed).toBeLessThan(50)
    }
  }, 60000)
})
