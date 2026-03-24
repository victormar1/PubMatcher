const { cacheClear } = require('../utils/cache')

// Cannot use top-level jest.mock('axios') because we need jest.resetModules()
// to reset the ClinGen validity map singleton between tests.
// Instead, we mock axios in each test via jest.resetModules().

const HGNC_XML = `<?xml version="1.0"?>
<response>
  <result name="response" numFound="1">
    <doc>
      <str name="name">BRCA DNA repair associated</str>
      <str name="location">17q21.31</str>
      <str name="hgnc_id">HGNC:1100</str>
      <str name="ensembl_gene_id">ENSG00000012048</str>
      <arr name="alias_name"><str>BRCC1</str></arr>
      <arr name="mane_select"><str>NM_007294.4</str></arr>
      <arr name="mgd_id"><str>MGI:104537</str></arr>
      <arr name="uniprot_ids"><str>P38398</str></arr>
      <arr name="omim_id"><str>113705</str></arr>
    </doc>
  </result>
</response>`

const CLINGEN_CSV = `"GENE SYMBOL","GENE ID (HGNC)","DISEASE LABEL","CLASSIFICATION","GCEP"
"BRCA1","HGNC:1100","Breast cancer","Definitive","Some GCEP"`

const CLINGEN_CSV_MULTI = `"GENE SYMBOL","GENE ID (HGNC)","DISEASE LABEL","CLASSIFICATION","GCEP"
"GENE1","HGNC:1100","Disease A","Limited","GCEP1"
"GENE1","HGNC:1100","Disease B","Definitive","GCEP2"`

function loadFresh(axiosMockSetup) {
  jest.resetModules()
  const axios = require('axios')
  jest.spyOn(axios, 'get').mockImplementation(axiosMockSetup)
  const fetchGeneCard = require('../utils/fetchGeneCard')
  const cache = require('../utils/cache')
  cache.cacheClear()
  return { fetchGeneCard, axios, cache }
}

describe('fetchGeneCard', () => {
  test('parses HGNC XML and returns Gene object with ClinGen validity', async () => {
    const { fetchGeneCard } = loadFresh((url) => {
      if (url.includes('clinicalgenome.org')) return Promise.resolve({ data: CLINGEN_CSV })
      if (url.includes('rest.genenames.org')) return Promise.resolve({ status: 200, data: HGNC_XML })
      return Promise.reject(new Error(`Unmocked: ${url}`))
    })

    const gene = await fetchGeneCard('BRCA1')
    expect(gene).toBeTruthy()
    expect(gene.geneName).toBe('BRCA DNA repair associated')
    expect(gene.location).toBe('17q21.31')
    expect(gene.hgncId).toBe('HGNC:1100')
    expect(gene.ensemblGeneId).toBe('ENSG00000012048')
    expect(gene.uniprotIds).toBe('P38398')
    expect(gene.omimId).toBe('113705')
    expect(gene.validityMarker).toBe('Definitive')
  })

  test('returns false when gene not found (numFound=0)', async () => {
    const { fetchGeneCard } = loadFresh((url) => {
      if (url.includes('clinicalgenome.org')) return Promise.resolve({ data: CLINGEN_CSV })
      if (url.includes('rest.genenames.org')) return Promise.resolve({ status: 200, data: '<response><result name="response" numFound="0"></result></response>' })
      return Promise.reject(new Error(`Unmocked: ${url}`))
    })

    expect(await fetchGeneCard('XYZFAKE')).toBe(false)
  })

  test('returns null when HGNC responds with non-200 status', async () => {
    const { fetchGeneCard } = loadFresh((url) => {
      if (url.includes('clinicalgenome.org')) return Promise.resolve({ data: CLINGEN_CSV })
      if (url.includes('rest.genenames.org')) return Promise.resolve({ status: 503, data: '' })
      return Promise.reject(new Error(`Unmocked: ${url}`))
    })

    expect(await fetchGeneCard('BRCA1')).toBeNull()
  })

  test('returns null on API error', async () => {
    const { fetchGeneCard } = loadFresh((url) => {
      if (url.includes('clinicalgenome.org')) return Promise.resolve({ data: CLINGEN_CSV })
      if (url.includes('rest.genenames.org')) return Promise.reject(new Error('timeout'))
      return Promise.reject(new Error(`Unmocked: ${url}`))
    })

    expect(await fetchGeneCard('BRCA1')).toBeNull()
  })

  test('handles ClinGen CSV with no matching header', async () => {
    const { fetchGeneCard } = loadFresh((url) => {
      if (url.includes('clinicalgenome.org')) return Promise.resolve({ data: 'random,csv,data\n1,2,3' })
      if (url.includes('rest.genenames.org')) return Promise.resolve({ status: 200, data: HGNC_XML })
      return Promise.reject(new Error(`Unmocked: ${url}`))
    })

    const gene = await fetchGeneCard('BRCA1')
    expect(gene).toBeTruthy()
    expect(gene.validityMarker).toBe('No Known')
  })

  test('handles ClinGen download failure gracefully', async () => {
    const { fetchGeneCard } = loadFresh((url) => {
      if (url.includes('clinicalgenome.org')) return Promise.reject(new Error('ClinGen down'))
      if (url.includes('rest.genenames.org')) return Promise.resolve({ status: 200, data: HGNC_XML })
      return Promise.reject(new Error(`Unmocked: ${url}`))
    })

    const gene = await fetchGeneCard('BRCA1')
    expect(gene).toBeTruthy()
    expect(gene.validityMarker).toBe('No Known')
  })

  test('ClinGen keeps highest classification for duplicate HGNC IDs', async () => {
    const { fetchGeneCard } = loadFresh((url) => {
      if (url.includes('clinicalgenome.org')) return Promise.resolve({ data: CLINGEN_CSV_MULTI })
      if (url.includes('rest.genenames.org')) return Promise.resolve({ status: 200, data: HGNC_XML })
      return Promise.reject(new Error(`Unmocked: ${url}`))
    })

    const gene = await fetchGeneCard('BRCA1')
    expect(gene.validityMarker).toBe('Definitive')
  })

  test('caches gene results', async () => {
    const { fetchGeneCard, axios } = loadFresh((url) => {
      if (url.includes('clinicalgenome.org')) return Promise.resolve({ data: CLINGEN_CSV })
      if (url.includes('rest.genenames.org')) return Promise.resolve({ status: 200, data: HGNC_XML })
      return Promise.reject(new Error(`Unmocked: ${url}`))
    })

    const result1 = await fetchGeneCard('BRCA1')
    const result2 = await fetchGeneCard('BRCA1')
    expect(result2).toEqual(result1)
    const hgncCalls = axios.get.mock.calls.filter((c) => c[0].includes('rest.genenames.org'))
    expect(hgncCalls).toHaveLength(1)
  })
})
