const axios = require('axios')
const getUniProtFunction = require('../utils/getUniProtFunction')
const { cacheClear } = require('../utils/cache')

jest.mock('axios')

const KEYWORDS_TXT = `ID   Apoptosis
AC   KW-0053
DE   Protein involved in apoptosis.
CA   Biological process.
//
ID   Kinase
AC   KW-0418
DE   Enzyme that catalyzes phosphorylation.
CA   Molecular function.
//`

describe('getUniProtFunction', () => {
  beforeEach(() => {
    cacheClear()
    jest.clearAllMocks()
  })

  test('parses protein function and filters biological process keywords', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('ebi.ac.uk/proteins')) {
        return Promise.resolve({
          data: {
            comments: [{ type: 'FUNCTION', text: [{ value: 'E3 ubiquitin-protein ligase involved in DNA repair.' }] }],
            keywords: [{ value: 'Apoptosis' }, { value: 'Kinase' }],
          },
        })
      }
      if (url.includes('ftp.uniprot.org')) return Promise.resolve({ data: KEYWORDS_TXT })
      return Promise.reject(new Error(`Unmocked: ${url}`))
    })

    const result = await getUniProtFunction('P38398')

    expect(result.geneFunction).toBe('E3 ubiquitin-protein ligase involved in DNA repair.')
    expect(result.bioProcessKeywords).toEqual(['Apoptosis']) // Kinase is molecular function, filtered out
    expect(result.bioProcessKeywordsOnly).toEqual(['Apoptosis']) // Legacy key
    expect(result.uniprotUrl).toBe('https://www.uniprot.org/uniprotkb/P38398/entry')
    expect(result.urlAccession).toBe(result.uniprotUrl) // Legacy key
  })

  test('truncates long function text at 500 chars', async () => {
    const longText = 'A'.repeat(600)
    axios.get.mockImplementation((url) => {
      if (url.includes('ebi.ac.uk/proteins')) {
        return Promise.resolve({
          data: {
            comments: [{ type: 'FUNCTION', text: [{ value: longText }] }],
            keywords: [],
          },
        })
      }
      if (url.includes('ftp.uniprot.org')) return Promise.resolve({ data: '' })
      return Promise.reject(new Error(`Unmocked: ${url}`))
    })

    const result = await getUniProtFunction('P38398')
    expect(result.geneFunction.length).toBe(503) // 500 + '...'
  })

  test('returns null fields when no uniprotId provided', async () => {
    const result = await getUniProtFunction(null)
    expect(result.geneFunction).toBeNull()
    expect(result.bioProcessKeywords).toEqual([])
    expect(axios.get).not.toHaveBeenCalled()
  })

  test('returns fallback on API error', async () => {
    axios.get.mockRejectedValue(new Error('timeout'))

    const result = await getUniProtFunction('P38398')
    expect(result.geneFunction).toBeNull()
    expect(result.error).toBe('timeout')
    expect(result.uniprotUrl).toContain('P38398')
  })

  test('caches results', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('ebi.ac.uk/proteins')) {
        return Promise.resolve({ data: { comments: [], keywords: [] } })
      }
      if (url.includes('ftp.uniprot.org')) return Promise.resolve({ data: '' })
      return Promise.reject(new Error(`Unmocked: ${url}`))
    })

    await getUniProtFunction('Q12345')
    await getUniProtFunction('Q12345')
    const proteinCalls = axios.get.mock.calls.filter((c) => c[0].includes('ebi.ac.uk/proteins'))
    expect(proteinCalls).toHaveLength(1)
  })
})
