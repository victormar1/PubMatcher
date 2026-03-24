const { formatGeneAnalysis, formatValidation, formatLiterature, formatSourceErrors } = require('../utils/formatters')

describe('formatSourceErrors', () => {
  test('returns empty string when no errors', () => {
    expect(formatSourceErrors([])).toBe('')
    expect(formatSourceErrors(null)).toBe('')
  })

  test('formats error list with source names', () => {
    const result = formatSourceErrors([
      { source: 'ClinVar', error: 'Request failed with status code 429' },
      { source: 'OMIM', error: 'timeout of 30000ms exceeded' },
    ])
    expect(result).toContain('Data Source Warnings')
    expect(result).toContain('**ClinVar**: unavailable')
    expect(result).toContain('**OMIM**: unavailable')
  })
})

describe('formatGeneAnalysis', () => {
  test('returns fallback for empty results', () => {
    expect(formatGeneAnalysis([])).toBe('No results returned.')
    expect(formatGeneAnalysis(null)).toBe('No results returned.')
  })

  test('formats invalid gene with error', () => {
    const result = formatGeneAnalysis([{ gene: 'FAKE', valid: false, error: 'Not found in HGNC' }])
    expect(result).toContain('## FAKE')
    expect(result).toContain('Not found in HGNC')
  })

  test('formats full gene analysis with all sources', () => {
    const result = formatGeneAnalysis([{
      gene: 'BRCA1',
      valid: true,
      geneInfo: {
        name: 'BRCA DNA repair', hgncId: 'HGNC:1100', location: '17q21', alias: 'BRCC1',
        omimId: '113705', ensemblId: 'ENSG00000012048', geneValidity: 'Definitive',
        geneLink: 'https://search.thegencc.org/genes/HGNC:1100',
      },
      sources: {
        uniprot: { geneFunction: 'E3 ubiquitin-protein ligase', bioProcessKeywords: ['Apoptosis'], uniprotUrl: 'https://uniprot.org/P38398' },
        constraints: { constraints_v4: { pLI: 0.0, oe_lof_upper: 0.15, oe_mis_upper: 0.92, mis_z: 2.5 }, constraints_v2: { pLI: 0.0, oe_lof_upper: 0.12, oe_mis_upper: 0.90, mis_z: 2.3 }, constraintsDelta: false, gnomadUrl: 'https://gnomad.broadinstitute.org/gene/BRCA1' },
        clinvar: { lofVariants: 15, missenseVariants: 230, lofUnknown: 5, missenseUnknown: 890, totalPathogenic: 450, totalLikelyPathogenic: 120, clinvarUrl: 'https://clinvar/BRCA1' },
        pubmed: { articleCount: 42567, articles: [{ title: 'BRCA2 gene mutation', authors: ['Smith JA'], journal: 'Cancer Res', year: '2022', pmid: '36397405', doi: '10.1234/test' }], pubmedUrl: 'https://pubmed/BRCA1' },
        panelApps: { panelAppEnglandCount: 5, panelAppAustraliaCount: 2 },
        mouseKO: { phenotypeCount: 3, categoryCount: 2, mousePhenotypes: { growth: { names: ['Increased body weight'] }, behavior: { names: ['Decreased grip strength'] } }, impcUrl: 'https://impc/MGI:104537' },
        omim: { mim: ['Breast cancer, familial'] },
      },
      sourceErrors: [],
    }])

    expect(result).toContain('## BRCA1 — BRCA DNA repair')
    expect(result).toContain('HGNC:1100')
    expect(result).toContain('Definitive')
    expect(result).toContain('E3 ubiquitin-protein ligase')
    expect(result).toContain('Apoptosis')
    expect(result).toContain('pLI=0')
    expect(result).toContain('Pathogenic LoF variants')
    expect(result).toContain('42567')
    expect(result).toContain('BRCA2 gene mutation')
    expect(result).toContain('Smith JA')
    expect(result).toContain('Genomics England')
    expect(result).toContain('Increased body weight')
    expect(result).toContain('Breast cancer, familial')
    expect(result).not.toContain('Data Source Warnings')
  })

  test('includes source warnings when sources failed', () => {
    const result = formatGeneAnalysis([{
      gene: 'TP53', valid: true,
      geneInfo: { name: 'TP53', hgncId: 'HGNC:11998', geneValidity: 'Definitive' },
      sources: {
        uniprot: { error: 'timeout' },
        constraints: { constraints_v4: { pLI: 'N/A' }, constraints_v2: { pLI: 'N/A' }, constraintsDelta: false },
        clinvar: { error: '429 rate limited' },
        pubmed: { articleCount: 100, articles: [], pubmedUrl: 'https://pubmed/TP53' },
        panelApps: { panelAppEnglandCount: 3, panelAppAustraliaCount: 1 },
        mouseKO: { phenotypeCount: 0, mousePhenotypes: {} },
        omim: { mim: [] },
      },
      sourceErrors: [
        { source: 'UniProt', error: 'timeout' },
        { source: 'ClinVar', error: '429 rate limited' },
      ],
    }])

    expect(result).toContain('Data Source Warnings')
    expect(result).toContain('**UniProt**: unavailable')
    expect(result).toContain('**ClinVar**: unavailable')
    expect(result).not.toContain('### UniProt Function')
    expect(result).not.toContain('### ClinVar Variants')
    expect(result).toContain('### PubMed Literature')
  })

  test('handles gnomAD N/A data', () => {
    const result = formatGeneAnalysis([{
      gene: 'X', valid: true,
      geneInfo: { name: 'X', geneValidity: 'No Known' },
      sources: {
        uniprot: { geneFunction: null }, constraints: { constraints_v4: { pLI: 'N/A' }, constraints_v2: { pLI: 'N/A' }, constraintsDelta: false },
        clinvar: { lofVariants: 0, missenseVariants: 0, lofUnknown: 0, missenseUnknown: 0, totalPathogenic: 0, totalLikelyPathogenic: 0 },
        pubmed: { articleCount: 0, articles: [] }, panelApps: { panelAppEnglandCount: 0 },
        mouseKO: { phenotypeCount: 0, mousePhenotypes: {} }, omim: { mim: [] },
      },
      sourceErrors: [],
    }])

    expect(result).toContain('No data available')
  })

  test('separates multiple genes with ---', () => {
    const result = formatGeneAnalysis([
      { gene: 'A', valid: true, geneInfo: { name: 'Gene A', geneValidity: 'X' }, sources: { uniprot: {}, constraints: { constraints_v4: { pLI: 'N/A' }, constraints_v2: { pLI: 'N/A' } }, clinvar: { lofVariants: 0, missenseVariants: 0, lofUnknown: 0, missenseUnknown: 0, totalPathogenic: 0, totalLikelyPathogenic: 0 }, pubmed: { articleCount: 0, articles: [] }, panelApps: {}, mouseKO: { phenotypeCount: 0, mousePhenotypes: {} }, omim: { mim: [] } }, sourceErrors: [] },
      { gene: 'B', valid: true, geneInfo: { name: 'Gene B', geneValidity: 'Y' }, sources: { uniprot: {}, constraints: { constraints_v4: { pLI: 'N/A' }, constraints_v2: { pLI: 'N/A' } }, clinvar: { lofVariants: 0, missenseVariants: 0, lofUnknown: 0, missenseUnknown: 0, totalPathogenic: 0, totalLikelyPathogenic: 0 }, pubmed: { articleCount: 0, articles: [] }, panelApps: {}, mouseKO: { phenotypeCount: 0, mousePhenotypes: {} }, omim: { mim: [] } }, sourceErrors: [] },
    ])
    expect(result).toContain('---')
    expect(result).toContain('## A — Gene A')
    expect(result).toContain('## B — Gene B')
  })
})

describe('formatValidation', () => {
  test('formats invalid gene', () => {
    const result = formatValidation({ valid: false, gene: 'FAKE', message: 'Not found in HGNC' })
    expect(result).toContain('**FAKE**')
    expect(result).toContain('Not found in HGNC')
  })

  test('formats valid gene with all fields', () => {
    const result = formatValidation({
      valid: true, gene: 'BRCA1', name: 'BRCA DNA repair', alias: 'BRCC1',
      location: '17q21', hgncId: 'HGNC:1100', omimId: '113705',
      ensemblId: 'ENSG00000012048', geneValidity: 'Definitive',
      maneSelect: ['NM_007294.4'], geneLink: 'https://gencc/HGNC:1100',
    })
    expect(result).toContain('## BRCA1 — Validated')
    expect(result).toContain('BRCA DNA repair')
    expect(result).toContain('HGNC:1100')
    expect(result).toContain('Definitive')
    expect(result).toContain('NM_007294.4')
    expect(result).toContain('GenCC')
  })

  test('handles missing optional fields', () => {
    const result = formatValidation({
      valid: true, gene: 'X', name: null, alias: null,
      location: null, hgncId: null, omimId: null,
      ensemblId: null, geneValidity: null, maneSelect: null, geneLink: null,
    })
    expect(result).toContain('N/A')
    expect(result).toContain('No Known')
    expect(result).not.toContain('MANE Select')
    expect(result).not.toContain('GenCC')
  })
})

describe('formatLiterature', () => {
  test('formats articles with full metadata', () => {
    const result = formatLiterature({
      gene: 'BRCA1', articleCount: 42567, pubmedUrl: 'https://pubmed/BRCA1',
      articles: [{
        title: 'Test article', authors: ['Smith JA', 'Doe B'], journal: 'Nature',
        year: '2024', pmid: '12345', doi: '10.1234/test', abstract: 'This is the abstract.',
      }],
    })
    expect(result).toContain('## PubMed results for BRCA1')
    expect(result).toContain('42567')
    expect(result).toContain('### Test article')
    expect(result).toContain('Smith JA, Doe B')
    expect(result).toContain('Nature, 2024')
    expect(result).toContain('10.1234/test')
    expect(result).toContain('12345')
    expect(result).toContain('This is the abstract')
    expect(result).toContain('Full PubMed search')
  })

  test('includes warning when error is present', () => {
    const result = formatLiterature({
      gene: 'X', articleCount: 0, articles: [], error: '429 rate limited',
    })
    expect(result).toContain('**Warning**')
    expect(result).toContain('429 rate limited')
  })

  test('handles empty articles', () => {
    const result = formatLiterature({ gene: 'X', articleCount: 0, articles: [] })
    expect(result).toContain('0')
    expect(result).not.toContain('###')
  })

  test('handles article with no authors, no DOI, no abstract, no citation', () => {
    const result = formatLiterature({
      gene: 'X', articleCount: 1, articles: [{
        title: 'Bare', authors: [], journal: '', year: '', pmid: '999', doi: '', abstract: '',
      }],
    })
    expect(result).toContain('### Bare')
    expect(result).toContain('999')
    expect(result).not.toContain('**Authors**')
    expect(result).not.toContain('**Published in**')
    expect(result).not.toContain('**DOI**')
  })

  test('handles article with null pubmedUrl', () => {
    const result = formatLiterature({ gene: 'X', articleCount: 0, articles: [], pubmedUrl: null })
    expect(result).not.toContain('Full PubMed search')
  })
})

describe('formatGeneAnalysis — edge cases', () => {
  test('skips UniProt section when geneFunction is null', () => {
    const result = formatGeneAnalysis([{
      gene: 'X', valid: true,
      geneInfo: { name: 'X', geneValidity: 'No Known' },
      sources: {
        uniprot: { geneFunction: null, bioProcessKeywords: [] },
        constraints: { constraints_v4: { pLI: 'N/A' }, constraints_v2: { pLI: 'N/A' } },
        clinvar: { lofVariants: 0, missenseVariants: 0, lofUnknown: 0, missenseUnknown: 0, totalPathogenic: 0, totalLikelyPathogenic: 0 },
        pubmed: { articleCount: 0, articles: [] },
        panelApps: { panelAppEnglandCount: null, panelAppAustraliaCount: null },
        mouseKO: { phenotypeCount: 0, mousePhenotypes: {} },
        omim: { mim: [] },
      },
      sourceErrors: [],
    }])
    // UniProt still renders because geneFunction is null but no error
    expect(result).toContain('No function data available')
  })

  test('renders gene with no geneLink', () => {
    const result = formatGeneAnalysis([{
      gene: 'X', valid: true,
      geneInfo: { name: 'X', hgncId: null, geneValidity: 'No Known', geneLink: null },
      sources: {
        uniprot: {}, constraints: { constraints_v4: { pLI: 'N/A' }, constraints_v2: { pLI: 'N/A' } },
        clinvar: { lofVariants: 0, missenseVariants: 0, lofUnknown: 0, missenseUnknown: 0, totalPathogenic: 0, totalLikelyPathogenic: 0 },
        pubmed: { articleCount: 0, articles: [] }, panelApps: {}, mouseKO: { phenotypeCount: 0, mousePhenotypes: {} }, omim: { mim: [] },
      },
      sourceErrors: [],
    }])
    expect(result).not.toContain('GenCC')
  })

  test('renders PubMed article with no authors and partial citation', () => {
    const result = formatGeneAnalysis([{
      gene: 'X', valid: true,
      geneInfo: { name: 'X', geneValidity: 'No Known' },
      sources: {
        uniprot: {}, constraints: { constraints_v4: { pLI: 'N/A' }, constraints_v2: { pLI: 'N/A' } },
        clinvar: { lofVariants: 0, missenseVariants: 0, lofUnknown: 0, missenseUnknown: 0, totalPathogenic: 0, totalLikelyPathogenic: 0 },
        pubmed: { articleCount: 1, articles: [{ title: 'Solo', authors: [], journal: 'Nature', year: '', pmid: '1', doi: '' }], pubmedUrl: 'http://x' },
        panelApps: {}, mouseKO: { phenotypeCount: 0, mousePhenotypes: {} }, omim: { mim: [] },
      },
      sourceErrors: [],
    }])
    expect(result).toContain('Solo')
    expect(result).toContain('Nature')
  })

  test('renders PanelApp with error strings instead of counts', () => {
    const result = formatGeneAnalysis([{
      gene: 'X', valid: true,
      geneInfo: { name: 'X', geneValidity: 'No Known' },
      sources: {
        uniprot: {}, constraints: { constraints_v4: { pLI: 'N/A' }, constraints_v2: { pLI: 'N/A' } },
        clinvar: { lofVariants: 0, missenseVariants: 0, lofUnknown: 0, missenseUnknown: 0, totalPathogenic: 0, totalLikelyPathogenic: 0 },
        pubmed: { articleCount: 0, articles: [] },
        panelApps: { panelAppEnglandCount: null, panelAppEnglandError: 'UK unavailable', panelAppAustraliaCount: null, panelAppAustraliaError: 'AUS unavailable' },
        mouseKO: { phenotypeCount: 0, mousePhenotypes: {} }, omim: { mim: [] },
      },
      sourceErrors: [],
    }])
    expect(result).toContain('UK unavailable')
    expect(result).toContain('AUS unavailable')
  })

  test('renders mouse phenotypes with flat array format', () => {
    const result = formatGeneAnalysis([{
      gene: 'X', valid: true,
      geneInfo: { name: 'X', geneValidity: 'No Known' },
      sources: {
        uniprot: {}, constraints: { constraints_v4: { pLI: 'N/A' }, constraints_v2: { pLI: 'N/A' } },
        clinvar: { lofVariants: 0, missenseVariants: 0, lofUnknown: 0, missenseUnknown: 0, totalPathogenic: 0, totalLikelyPathogenic: 0 },
        pubmed: { articleCount: 0, articles: [] }, panelApps: {},
        mouseKO: { phenotypeCount: 2, categoryCount: 1, mousePhenotypes: { growth: ['Weight gain', 'Size increase'] }, impcUrl: 'http://impc' },
        omim: { mim: [] },
      },
      sourceErrors: [],
    }])
    expect(result).toContain('Weight gain, Size increase')
  })

  test('renders constraintsDelta note', () => {
    const result = formatGeneAnalysis([{
      gene: 'X', valid: true,
      geneInfo: { name: 'X', geneValidity: 'No Known' },
      sources: {
        uniprot: {}, constraints: { constraints_v4: { pLI: 0.99, oe_lof_upper: 0.1, oe_mis_upper: 0.9, mis_z: 3.0 }, constraints_v2: { pLI: 0.2, oe_lof_upper: 0.5, oe_mis_upper: 0.8, mis_z: 1.0 }, constraintsDelta: true, gnomadUrl: 'http://gnomad' },
        clinvar: { lofVariants: 0, missenseVariants: 0, lofUnknown: 0, missenseUnknown: 0, totalPathogenic: 0, totalLikelyPathogenic: 0 },
        pubmed: { articleCount: 0, articles: [] }, panelApps: {}, mouseKO: { phenotypeCount: 0, mousePhenotypes: {} }, omim: { mim: [] },
      },
      sourceErrors: [],
    }])
    expect(result).toContain('Significant difference')
  })
})
