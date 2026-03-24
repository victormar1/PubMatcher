const { analyzeGenes } = require('../services/dataservice')
const { cacheClear } = require('../utils/cache')

describe('dataservice.analyzeGenes', () => {
  beforeEach(() => {
    cacheClear()
  })

  test('analyzes a single gene with all data sources', async () => {
    const results = await analyzeGenes(['BRCA1'], [])
    expect(results.length).toBe(1)
    const result = results[0]

    // Gene info
    expect(result.hgncId).toBeTruthy()
    expect(result.geneValidity).toBeTruthy()

    // PubMed (legacy keys)
    expect(typeof result.count).toBe('number')
    expect(result.count).toBeGreaterThan(0)

    // ClinVar
    expect(typeof result.lofVariants).toBe('number')
    expect(typeof result.totalPathogenic).toBe('number')

    // gnomAD
    expect(result.constraints_v2).toBeDefined()
    expect(result.constraints_v4).toBeDefined()
    expect(typeof result.constraintsDelta).toBe('boolean')

    // PanelApp
    expect(result.panelAppEnglandCount !== undefined || result.panelAppEnglandError !== undefined).toBe(true)

    // OMIM
    expect(result.mim).toBeDefined()
  }, 120000)

  test('filters out invalid genes', async () => {
    const results = await analyzeGenes(['XYZNOTAREALGENE123'], [])
    expect(results.length).toBe(0) // Null results are filtered
  }, 30000)

  test('handles multiple genes in parallel', async () => {
    const results = await analyzeGenes(['BRCA1', 'TP53'], [])
    expect(results.length).toBe(2)
    // Both should have data
    for (const result of results) {
      expect(result.hgncId).toBeTruthy()
      expect(typeof result.count).toBe('number')
    }
  }, 120000)
})
