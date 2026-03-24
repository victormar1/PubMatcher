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
            pLI: pLI,
            oe_mis: 0.85,
            oe_mis_lower: 0.80,
            oe_mis_upper: oe_mis_upper,
            oe_lof: 0.1,
            oe_lof_lower: 0.05,
            oe_lof_upper: oe_lof_upper,
            mis_z: mis_z,
            lof_z: 4.5,
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
      .mockResolvedValueOnce(mockGnomadResponse(0.99, 0.92, 0.15, 2.5)) // v4
      .mockResolvedValueOnce(mockGnomadResponse(0.98, 0.90, 0.12, 2.3)) // v2

    const result = await getGeneConstraints('BRCA1')

    expect(result.constraints_v4.pLI).toBe(0.99)
    expect(result.constraints_v4.oe_mis_upper).toBe(0.92)
    expect(result.constraints_v4.oe_lof_upper).toBe(0.15)
    expect(result.constraints_v4.mis_z).toBe(2.5)

    expect(result.constraints_v2.pLI).toBe(0.98)
    expect(result.constraints_v2.oe_lof_upper).toBe(0.12)

    expect(result.gnomadUrl).toBe('https://gnomad.broadinstitute.org/gene/BRCA1?dataset=gnomad_r4')

    // Both queries sent in parallel
    expect(axios.post).toHaveBeenCalledTimes(2)
    expect(axios.post.mock.calls[0][0]).toBe('https://gnomad.broadinstitute.org/api')
  })

  test('detects significant delta between v2 and v4', async () => {
    axios.post
      .mockResolvedValueOnce(mockGnomadResponse(0.99, 0.92, 0.15, 2.5)) // v4 high pLI
      .mockResolvedValueOnce(mockGnomadResponse(0.30, 0.90, 0.12, 2.3)) // v2 low pLI (>1.5x diff)

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

  test('returns N/A when gene not found in gnomAD', async () => {
    axios.post
      .mockResolvedValueOnce({ data: { data: { gene: null } } })
      .mockResolvedValueOnce({ data: { data: { gene: null } } })

    const result = await getGeneConstraints('FAKEGENE')
    expect(result.constraints_v2.pLI).toBe('N/A')
    expect(result.constraints_v4.pLI).toBe('N/A')
    expect(result.constraintsDelta).toBe(false)
  })

  test('returns fallback on API error', async () => {
    axios.post.mockRejectedValueOnce(new Error('timeout'))

    const result = await getGeneConstraints('BRCA1')
    expect(result.constraints_v2.pLI).toBe('N/A')
    expect(result.error).toBe('timeout')
    expect(result.gnomadUrl).toContain('BRCA1')
  })

  test('caches results', async () => {
    axios.post
      .mockResolvedValueOnce(mockGnomadResponse(0.99, 0.92, 0.15, 2.5))
      .mockResolvedValueOnce(mockGnomadResponse(0.98, 0.90, 0.12, 2.3))

    const result1 = await getGeneConstraints('TP53')
    const result2 = await getGeneConstraints('TP53')

    expect(result2).toEqual(result1)
    expect(axios.post).toHaveBeenCalledTimes(2) // Only first call
  })
})
