const axios = require('axios')
const getGeneConstraints = require('../utils/getGeneConstraints')
const { cacheClear } = require('../utils/cache')

jest.mock('axios')

function mockGnomadResponse(pLI, oe_mis_upper, oe_lof_upper, mis_z) {
  return {
    data: {
      data: {
        gene: {
          gene_id: 'ENSG00000012048',
          symbol: 'BRCA1',
          gnomad_constraint: {
            pLI, oe_mis: 0.85, oe_mis_lower: 0.80, oe_mis_upper, oe_lof: 0.1,
            oe_lof_lower: 0.05, oe_lof_upper, mis_z, lof_z: 4.5,
          },
        },
      },
    },
  }
}

describe('getGeneConstraints', () => {
  beforeEach(() => {
    cacheClear()
    jest.clearAllMocks()
  })

  test('queries gnomAD GraphQL API for v2 and v4', async () => {
    axios.post
      .mockResolvedValueOnce(mockGnomadResponse(0.99, 0.92, 0.15, 2.5))
      .mockResolvedValueOnce(mockGnomadResponse(0.98, 0.90, 0.12, 2.3))

    const result = await getGeneConstraints('BRCA1')

    expect(result.constraints_v4.pLI).toBe(0.99)
    expect(result.constraints_v2.pLI).toBe(0.98)
    expect(result.gnomadUrl).toContain('BRCA1')
    expect(axios.post).toHaveBeenCalledTimes(2)
  })

  test('detects significant delta (pLI ratio > 1.5x)', async () => {
    axios.post
      .mockResolvedValueOnce(mockGnomadResponse(0.99, 0.92, 0.15, 2.5)) // v4 high
      .mockResolvedValueOnce(mockGnomadResponse(0.30, 0.90, 0.12, 2.3)) // v2 low

    const result = await getGeneConstraints('GENE1')
    expect(result.constraintsDelta).toBe(true)
  })

  test('no delta when scores are similar', async () => {
    axios.post
      .mockResolvedValueOnce(mockGnomadResponse(0.95, 0.92, 0.15, 2.5))
      .mockResolvedValueOnce(mockGnomadResponse(0.90, 0.90, 0.12, 2.3))

    const result = await getGeneConstraints('GENE2')
    expect(result.constraintsDelta).toBe(false)
  })

  test('detects delta when one pLI is zero and the other is not', async () => {
    axios.post
      .mockResolvedValueOnce(mockGnomadResponse(0.0, 0.92, 0.15, 2.5))  // v4 pLI=0
      .mockResolvedValueOnce(mockGnomadResponse(0.98, 0.90, 0.12, 2.3)) // v2 pLI=0.98

    const result = await getGeneConstraints('GENE3')
    expect(result.constraintsDelta).toBe(true) // 0 vs 0.98 = different
  })

  test('delta when one is N/A and the other is not', async () => {
    axios.post
      .mockResolvedValueOnce(mockGnomadResponse(0.99, 0.92, 0.15, 2.5)) // v4 has data
      .mockResolvedValueOnce({ data: { data: { gene: null } } })          // v2 N/A

    const result = await getGeneConstraints('GENE4')
    expect(result.constraintsDelta).toBe(true) // N/A vs 0.99 = different
  })

  test('returns N/A when gene not found in gnomAD', async () => {
    axios.post
      .mockResolvedValueOnce({ data: { data: { gene: null } } })
      .mockResolvedValueOnce({ data: { data: { gene: null } } })

    const result = await getGeneConstraints('FAKEGENE')
    expect(result.constraints_v2.pLI).toBe('N/A')
    expect(result.constraints_v4.pLI).toBe('N/A')
    expect(result.constraintsDelta).toBe(false) // Both N/A = no delta
  })

  test('returns fallback on API error', async () => {
    axios.post.mockRejectedValueOnce(new Error('timeout'))
    const result = await getGeneConstraints('BRCA1')
    expect(result.constraints_v2.pLI).toBe('N/A')
    expect(result.error).toBe('timeout')
  })

  test('extractConstraints returns all fields when data is present', async () => {
    axios.post
      .mockResolvedValueOnce(mockGnomadResponse(0.99, 0.92, 0.15, 2.5))
      .mockResolvedValueOnce(mockGnomadResponse(0.98, 0.90, 0.12, 2.3))

    const result = await getGeneConstraints('FULL')
    // Verify all extracted fields
    const v4 = result.constraints_v4
    expect(v4.pLI).toBe(0.99)
    expect(v4.oe_mis_upper).toBe(0.92)
    expect(v4.oe_lof_upper).toBe(0.15)
    expect(v4.mis_z).toBe(2.5)
    expect(v4.oe_mis).toBe(0.85)
    expect(v4.oe_lof).toBe(0.1)
    expect(v4.lof_z).toBe(4.5)
  })

  test('extractConstraints handles null fields gracefully', async () => {
    axios.post
      .mockResolvedValueOnce({
        data: { data: { gene: { gnomad_constraint: { pLI: 0.5, oe_mis: null, oe_mis_lower: null, oe_mis_upper: null, oe_lof: null, oe_lof_lower: null, oe_lof_upper: null, mis_z: null, lof_z: null } } } },
      })
      .mockResolvedValueOnce({ data: { data: { gene: null } } })

    const result = await getGeneConstraints('PARTIAL')
    expect(result.constraints_v4.pLI).toBe(0.5)
    expect(result.constraints_v4.oe_mis_upper).toBe('N/A')
    expect(result.constraints_v4.oe_lof).toBe('N/A')
    expect(result.constraints_v4.lof_z).toBe('N/A')
  })

  test('caches results', async () => {
    axios.post
      .mockResolvedValueOnce(mockGnomadResponse(0.99, 0.92, 0.15, 2.5))
      .mockResolvedValueOnce(mockGnomadResponse(0.98, 0.90, 0.12, 2.3))

    const result1 = await getGeneConstraints('TP53')
    const result2 = await getGeneConstraints('TP53')
    expect(result2).toEqual(result1)
    expect(axios.post).toHaveBeenCalledTimes(2)
  })
})
