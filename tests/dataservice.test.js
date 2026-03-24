const axios = require('axios')
const { analyzeGenes } = require('../services/dataservice')
const { cacheClear } = require('../utils/cache')

jest.mock('axios')

// Minimal HGNC XML for fetchGeneCard
const HGNC_XML = `<?xml version="1.0"?>
<response>
  <result name="response" numFound="1">
    <doc>
      <str name="name">BRCA DNA repair associated</str>
      <str name="location">17q21.31</str>
      <str name="hgnc_id">HGNC:1100</str>
      <str name="ensembl_gene_id">ENSG00000012048</str>
      <arr name="alias_name"><str>BRCA1/BRCA2-containing complex subunit 1</str></arr>
      <arr name="mane_select"><str>NM_007294.4</str></arr>
      <arr name="mgd_id"><str>MGI:104537</str></arr>
      <arr name="uniprot_ids"><str>P38398</str></arr>
      <arr name="omim_id"><str>113705</str></arr>
    </doc>
  </result>
</response>`

// ClinGen validity CSV mock
const CLINGEN_CSV = `"GENE SYMBOL","GENE ID (HGNC)","DISEASE","CLASSIFICATION"
"BRCA1","HGNC:1100","Breast cancer","Definitive"`

function setupMocks() {
  axios.get.mockImplementation((url) => {
    // HGNC
    if (url.includes('rest.genenames.org')) {
      return Promise.resolve({ status: 200, data: HGNC_XML })
    }
    // ClinGen
    if (url.includes('clinicalgenome.org')) {
      return Promise.resolve({ data: CLINGEN_CSV })
    }
    // PubMed esearch
    if (url.includes('esearch') && url.includes('pubmed')) {
      return Promise.resolve({
        data: { esearchresult: { count: '100', idlist: ['12345'] } },
      })
    }
    // PubMed efetch
    if (url.includes('efetch')) {
      return Promise.resolve({
        data: `<PubmedArticleSet><PubmedArticle>
          <MedlineCitation><PMID>12345</PMID>
            <Article><ArticleTitle>Test article</ArticleTitle>
              <Journal><Title>Test Journal</Title><JournalIssue><PubDate><Year>2024</Year></PubDate></JournalIssue></Journal>
            </Article>
          </MedlineCitation>
          <PubmedData><ArticleIdList><ArticleId IdType="pubmed">12345</ArticleId></ArticleIdList></PubmedData>
        </PubmedArticle></PubmedArticleSet>`,
      })
    }
    // ClinVar esearch
    if (url.includes('esearch') && url.includes('clinvar')) {
      return Promise.resolve({
        data: { esearchresult: { count: '42' } },
      })
    }
    // UniProt protein
    if (url.includes('ebi.ac.uk/proteins')) {
      return Promise.resolve({
        data: {
          comments: [{ type: 'FUNCTION', text: [{ value: 'E3 ubiquitin-protein ligase' }] }],
          keywords: [],
        },
      })
    }
    // UniProt keywords
    if (url.includes('ftp.uniprot.org')) {
      return Promise.resolve({ data: '' })
    }
    // IMPC mouse KO
    if (url.includes('ebi.ac.uk/mi/impc')) {
      return Promise.resolve({
        data: {
          response: {
            docs: [
              { mp_term_name: 'increased body weight', top_level_mp_term_name: ['growth/size/body region'] },
            ],
          },
        },
      })
    }
    // PanelApp UK
    if (url.includes('panelapp.genomicsengland')) {
      return Promise.resolve({ data: { count: 5 } })
    }
    // PanelApp Australia
    if (url.includes('panelapp-aus')) {
      return Promise.resolve({ data: { count: 2 } })
    }
    // Ensembl OMIM
    if (url.includes('rest.ensembl.org')) {
      return Promise.resolve({
        data: [
          { source: 'MIM morbid', description: 'Breast cancer, familial' },
          { source: 'MIM morbid', description: 'Ovarian cancer, familial' },
        ],
      })
    }
    return Promise.reject(new Error(`Unmocked URL: ${url}`))
  })

  // gnomAD GraphQL
  axios.post.mockResolvedValue({
    data: {
      data: {
        gene: {
          gene_id: 'ENSG00000012048',
          symbol: 'BRCA1',
          gnomad_constraint: {
            pLI: 0.0, oe_mis: 0.85, oe_mis_lower: 0.80, oe_mis_upper: 0.92,
            oe_lof: 0.1, oe_lof_lower: 0.05, oe_lof_upper: 0.15, mis_z: 2.5, lof_z: 4.5,
          },
        },
      },
    },
  })
}

describe('dataservice.analyzeGenes', () => {
  beforeEach(() => {
    cacheClear()
    jest.clearAllMocks()
    setupMocks()
  })

  test('returns all data sources for a valid gene', async () => {
    const results = await analyzeGenes(['BRCA1'], [])

    expect(results).toHaveLength(1)
    const r = results[0]

    // Gene info
    expect(r.hgncId).toBe('HGNC:1100')
    expect(r.geneValidity).toBeDefined()

    // PubMed
    expect(r.count).toBe(100)
    expect(r.firstArticleTitle).toBe('Test article')

    // ClinVar
    expect(r.lofVariants).toBe(42)
    expect(r.clinvarUrl).toContain('BRCA1')

    // gnomAD
    expect(r.constraints_v4).toBeDefined()
    expect(r.constraints_v4.pLI).toBe(0)
    expect(r.gnomadUrl).toContain('BRCA1')

    // UniProt
    expect(r.geneFunction).toContain('ubiquitin')

    // PanelApp
    expect(r.panelAppEnglandCount).toBe(5)
    expect(r.panelAppAustraliaCount).toBe(2)

    // Mouse KO
    expect(r.mousePhenotypes).toBeDefined()

    // OMIM
    expect(r.mim).toContain('Breast cancer, familial')
    expect(r.mim).toContain('Ovarian cancer, familial')
  })

  test('filters out invalid genes (returns empty)', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('rest.genenames.org')) {
        return Promise.resolve({
          status: 200,
          data: '<response><result name="response" numFound="0"></result></response>',
        })
      }
      return Promise.resolve({ data: {} })
    })

    const results = await analyzeGenes(['XYZFAKE'], [])
    expect(results).toHaveLength(0)
  })

  test('runs data sources in parallel (Promise.allSettled)', async () => {
    // Make PanelApp fail — other sources should still return data
    axios.get.mockImplementation((url) => {
      if (url.includes('panelapp')) {
        return Promise.reject(new Error('PanelApp down'))
      }
      // Default mocks for everything else
      if (url.includes('rest.genenames.org')) return Promise.resolve({ status: 200, data: HGNC_XML })
      if (url.includes('clinicalgenome.org')) return Promise.resolve({ data: CLINGEN_CSV })
      if (url.includes('esearch') && url.includes('pubmed')) return Promise.resolve({ data: { esearchresult: { count: '10', idlist: ['111'] } } })
      if (url.includes('efetch')) return Promise.resolve({ data: '<PubmedArticleSet><PubmedArticle><MedlineCitation><PMID>111</PMID><Article><ArticleTitle>Test</ArticleTitle><Journal><Title>J</Title><JournalIssue><PubDate><Year>2024</Year></PubDate></JournalIssue></Journal></Article></MedlineCitation><PubmedData><ArticleIdList><ArticleId IdType="pubmed">111</ArticleId></ArticleIdList></PubmedData></PubmedArticle></PubmedArticleSet>' })
      if (url.includes('esearch') && url.includes('clinvar')) return Promise.resolve({ data: { esearchresult: { count: '5' } } })
      if (url.includes('ebi.ac.uk/proteins')) return Promise.resolve({ data: { comments: [], keywords: [] } })
      if (url.includes('ftp.uniprot.org')) return Promise.resolve({ data: '' })
      if (url.includes('ebi.ac.uk/mi/impc')) return Promise.resolve({ data: { response: { docs: [] } } })
      if (url.includes('rest.ensembl.org')) return Promise.resolve({ data: [] })
      return Promise.reject(new Error(`Unmocked: ${url}`))
    })

    const results = await analyzeGenes(['BRCA1'], [])
    expect(results).toHaveLength(1)

    // PubMed still works
    expect(results[0].count).toBe(10)
    // ClinVar still works
    expect(results[0].lofVariants).toBe(5)
    // PanelApp failed gracefully
    expect(results[0].panelAppEnglandCount).toBeNull()
  })
})
