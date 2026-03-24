const axios = require('axios')
const getMouseKO = require('../utils/getMouseKO')
const { cacheClear } = require('../utils/cache')

jest.mock('axios')

describe('getMouseKO', () => {
  beforeEach(() => {
    cacheClear()
    jest.clearAllMocks()
  })

  test('groups phenotypes by category with capitalization', async () => {
    axios.get.mockResolvedValue({
      data: {
        response: {
          docs: [
            { mp_term_name: 'increased body weight', top_level_mp_term_name: ['growth/size/body region'] },
            { mp_term_name: 'decreased grip strength', top_level_mp_term_name: ['behavior/neurological'] },
            { mp_term_name: 'abnormal coat color', top_level_mp_term_name: ['pigmentation'] },
            { mp_term_name: 'increased body weight', top_level_mp_term_name: ['growth/size/body region'] }, // duplicate
          ],
        },
      },
    })

    const result = await getMouseKO('MGI:104537')

    expect(result.phenotypeCount).toBe(3) // Deduped
    expect(result.categoryCount).toBe(3)
    expect(result.mousePhenotypes.growth_size_body_region.names).toContain('Increased body weight')
    expect(result.mousePhenotypes.behavior_neurological.names).toContain('Decreased grip strength')
    expect(result.impcUrl).toBe('https://www.mousephenotype.org/data/genes/MGI:104537')
  })

  test('returns empty when no mgdId', async () => {
    const result = await getMouseKO(null)
    expect(result.mousePhenotypes).toEqual({})
    expect(result.impcUrl).toBeNull()
    expect(axios.get).not.toHaveBeenCalled()
  })

  test('returns fallback on API error', async () => {
    axios.get.mockRejectedValue(new Error('IMPC down'))

    const result = await getMouseKO('MGI:104537')
    expect(result.phenotypeCount).toBe(0)
    expect(result.error).toBe('IMPC down')
    expect(result.impcUrl).toContain('MGI:104537')
  })

  test('caches results', async () => {
    axios.get.mockResolvedValue({ data: { response: { docs: [] } } })

    await getMouseKO('MGI:999')
    await getMouseKO('MGI:999')
    expect(axios.get).toHaveBeenCalledTimes(1)
  })
})
