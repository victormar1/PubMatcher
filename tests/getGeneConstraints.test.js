const getGeneConstraints = require('../utils/getGeneConstraints')
const { cacheClear } = require('../utils/cache')

describe('getGeneConstraints', () => {
  beforeEach(() => {
    cacheClear()
  })

  test('returns constraint scores for a known gene', async () => {
    const result = await getGeneConstraints('BRCA1')
    expect(result).toBeDefined()
    expect(result.constraints_v2).toBeDefined()
    expect(result.constraints_v4).toBeDefined()
    expect(typeof result.constraintsDelta).toBe('boolean')
    // Check v4 has real data
    expect(result.constraints_v4.pLI).not.toBe('N/A')
    expect(typeof result.constraints_v4.pLI).toBe('number')
    // New field
    expect(result.gnomadUrl).toContain('gnomad.broadinstitute.org')
  }, 30000)

  test('returns N/A for unknown gene', async () => {
    const result = await getGeneConstraints('XYZNOTAREALGENE123')
    expect(result.constraints_v2.pLI).toBe('N/A')
    expect(result.constraints_v4.pLI).toBe('N/A')
    expect(result.constraintsDelta).toBe(false)
  }, 30000)

  test('caches results', async () => {
    const result1 = await getGeneConstraints('TP53')
    const start = Date.now()
    const result2 = await getGeneConstraints('TP53')
    const elapsed = Date.now() - start
    expect(result2).toEqual(result1)
    expect(elapsed).toBeLessThan(50)
  }, 30000)
})
