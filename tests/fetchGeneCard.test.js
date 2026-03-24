const axios = require('axios')
const fetchGeneCard = require('../utils/fetchGeneCard')
const { cacheClear } = require('../utils/cache')

jest.mock('axios')

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

describe('fetchGeneCard', () => {
  beforeEach(() => {
    cacheClear()
    jest.clearAllMocks()
  })

  test('parses HGNC XML and returns Gene object with ClinGen validity', async () => {
    axios.get.mockImplementation((url) => {
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

  test('returns false when gene not found', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('clinicalgenome.org')) return Promise.resolve({ data: CLINGEN_CSV })
      if (url.includes('rest.genenames.org')) {
        return Promise.resolve({
          status: 200,
          data: '<response><result name="response" numFound="0"></result></response>',
        })
      }
      return Promise.reject(new Error(`Unmocked: ${url}`))
    })

    const result = await fetchGeneCard('XYZFAKE')
    expect(result).toBe(false)
  })

  test('returns null on API error', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('clinicalgenome.org')) return Promise.resolve({ data: CLINGEN_CSV })
      if (url.includes('rest.genenames.org')) return Promise.reject(new Error('timeout'))
      return Promise.reject(new Error(`Unmocked: ${url}`))
    })

    const result = await fetchGeneCard('BRCA1')
    expect(result).toBeNull()
  })

  test('caches gene results', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('clinicalgenome.org')) return Promise.resolve({ data: CLINGEN_CSV })
      if (url.includes('rest.genenames.org')) return Promise.resolve({ status: 200, data: HGNC_XML })
      return Promise.reject(new Error(`Unmocked: ${url}`))
    })

    const result1 = await fetchGeneCard('BRCA1')
    const result2 = await fetchGeneCard('BRCA1')
    expect(result2).toEqual(result1)
    // HGNC should only be called once (ClinGen download may be called once too)
    const hgncCalls = axios.get.mock.calls.filter((c) => c[0].includes('rest.genenames.org'))
    expect(hgncCalls).toHaveLength(1)
  })
})
