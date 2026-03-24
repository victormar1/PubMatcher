const axios = require('axios')
const fetchOmimData = require('../utils/fetchOMIM')
const { cacheClear } = require('../utils/cache')

jest.mock('axios')

describe('fetchOmimData', () => {
  beforeEach(() => {
    cacheClear()
    jest.clearAllMocks()
  })

  test('extracts MIM morbid descriptions with deduplication', async () => {
    axios.get.mockResolvedValue({
      data: [
        { source: 'MIM morbid', description: 'Breast cancer, familial' },
        { source: 'MIM morbid', description: 'Ovarian cancer, familial' },
        { source: 'MIM morbid', description: 'Breast cancer, familial' }, // duplicate
        { source: 'ClinVar', description: 'Something else' }, // wrong source
      ],
    })

    const result = await fetchOmimData('ENSG00000012048')
    expect(result.mim).toEqual(['Breast cancer, familial', 'Ovarian cancer, familial'])
  })

  test('returns empty when no ensemblId', async () => {
    const result = await fetchOmimData(null)
    expect(result.mim).toEqual([])
    expect(axios.get).not.toHaveBeenCalled()
  })

  test('uses "No description" fallback when description is missing', async () => {
    axios.get.mockResolvedValue({
      data: [
        { source: 'MIM morbid' }, // no description field
      ],
    })
    const result = await fetchOmimData('ENSG00000012048')
    expect(result.mim).toEqual(['No description'])
  })

  test('returns empty on API error', async () => {
    axios.get.mockRejectedValue(new Error('Ensembl timeout'))

    const result = await fetchOmimData('ENSG00000012048')
    expect(result.mim).toEqual([])
    expect(result.error).toBe('Ensembl timeout')
  })

  test('caches results', async () => {
    axios.get.mockResolvedValue({ data: [{ source: 'MIM morbid', description: 'Test' }] })

    await fetchOmimData('ENSG00000012048')
    await fetchOmimData('ENSG00000012048')
    expect(axios.get).toHaveBeenCalledTimes(1)
  })
})
