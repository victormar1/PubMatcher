const axios = require('axios')
const getPanelApps = require('../utils/getPanelApps')
const { cacheClear } = require('../utils/cache')

jest.mock('axios')

describe('getPanelApps', () => {
  beforeEach(() => {
    cacheClear()
    jest.clearAllMocks()
  })

  test('fetches counts from UK and Australia', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { count: 5 } })  // UK
      .mockResolvedValueOnce({ data: { count: 2 } })  // Australia

    const result = await getPanelApps('BRCA1')
    expect(result.panelAppEnglandCount).toBe(5)
    expect(result.panelAppAustraliaCount).toBe(2)
    expect(result.panelAppEnglandError).toBeNull()
    expect(result.panelAppAustraliaError).toBeNull()
  })

  test('falls back to staging URL for Australia', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { count: 5 } })  // UK OK
      .mockRejectedValueOnce(new Error('Australia down')) // Australia main fails
      .mockResolvedValueOnce({ data: { count: 3 } })  // Australia staging OK

    const result = await getPanelApps('TP53')
    expect(result.panelAppEnglandCount).toBe(5)
    expect(result.panelAppAustraliaCount).toBe(3)
  })

  test('reports errors per source independently', async () => {
    axios.get
      .mockRejectedValueOnce(new Error('UK down'))     // UK fails
      .mockResolvedValueOnce({ data: { count: 2 } })   // Australia OK

    const result = await getPanelApps('BRCA1')
    expect(result.panelAppEnglandCount).toBeNull()
    expect(result.panelAppEnglandError).toBe('PanelApp UK is currently unavailable')
    expect(result.panelAppAustraliaCount).toBe(2)
    expect(result.panelAppAustraliaError).toBeNull()
  })

  test('caches results', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { count: 5 } })
      .mockResolvedValueOnce({ data: { count: 2 } })

    await getPanelApps('BRCA1')
    await getPanelApps('BRCA1')
    expect(axios.get).toHaveBeenCalledTimes(2) // Only first call
  })
})
