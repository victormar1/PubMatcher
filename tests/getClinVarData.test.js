const axios = require('axios')
const getClinVarData = require('../utils/getClinVarData')
const { cacheClear } = require('../utils/cache')

jest.mock('axios')

function mockClinVarCount(count) {
  return { data: { esearchresult: { count: String(count) } } }
}

describe('getClinVarData', () => {
  beforeEach(() => {
    cacheClear()
    jest.clearAllMocks()
  })

  test('queries ClinVar API for all variant categories', async () => {
    axios.get
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

    // Verify correct API calls
    expect(axios.get).toHaveBeenCalledTimes(6)
    const calls = axios.get.mock.calls.map((c) => c[0])
    expect(calls[0]).toContain('pathogenic')
    expect(calls[0]).toContain('loss of function')
    expect(calls[1]).toContain('pathogenic')
    expect(calls[1]).toContain('missense')
    expect(calls[4]).toContain('pathogenic')
    expect(calls[4]).not.toContain('molecular_consequence')
  })

  test('returns zeros on API error', async () => {
    axios.get.mockRejectedValueOnce(new Error('429 Too Many Requests'))

    const result = await getClinVarData('BRCA1')

    expect(result.lofVariants).toBe(0)
    expect(result.missenseVariants).toBe(0)
    expect(result.totalPathogenic).toBe(0)
    expect(result.error).toBe('429 Too Many Requests')
    expect(result.clinvarUrl).toContain('BRCA1')
  })

  test('caches results', async () => {
    axios.get
      .mockResolvedValueOnce(mockClinVarCount(10))
      .mockResolvedValueOnce(mockClinVarCount(20))
      .mockResolvedValueOnce(mockClinVarCount(1))
      .mockResolvedValueOnce(mockClinVarCount(50))
      .mockResolvedValueOnce(mockClinVarCount(100))
      .mockResolvedValueOnce(mockClinVarCount(30))

    const result1 = await getClinVarData('TP53')
    const result2 = await getClinVarData('TP53')

    expect(result2).toEqual(result1)
    expect(axios.get).toHaveBeenCalledTimes(6) // Only first call hits API
  })
})
