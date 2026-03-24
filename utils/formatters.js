/**
 * MCP output formatters — convert structured analysis results into
 * markdown text for LLM consumption. Extracted from mcp/server.js
 * so they can be unit-tested without the MCP SDK.
 */

function formatSourceErrors(sourceErrors) {
  if (!sourceErrors || sourceErrors.length === 0) return ''
  const lines = ['\n### Data Source Warnings']
  for (const { source, error } of sourceErrors) {
    lines.push(`- **${source}**: unavailable (${error})`)
  }
  lines.push('')
  return lines.join('\n')
}

function formatGeneAnalysis(results) {
  if (!results || results.length === 0) return 'No results returned.'

  const sections = results.map((r) => {
    if (!r.valid) {
      return `## ${r.gene}\n**Error**: ${r.error}`
    }

    const { geneInfo, sources, sourceErrors } = r
    const lines = [`## ${r.gene} — ${geneInfo.name || 'Unknown'}`]

    if (sourceErrors.length > 0) {
      lines.push(formatSourceErrors(sourceErrors))
    }

    lines.push('### Gene Information')
    lines.push(`- **HGNC ID**: ${geneInfo.hgncId || 'N/A'}`)
    lines.push(`- **Location**: ${geneInfo.location || 'N/A'}`)
    lines.push(`- **Alias**: ${geneInfo.alias || 'N/A'}`)
    lines.push(`- **OMIM ID**: ${geneInfo.omimId || 'N/A'}`)
    lines.push(`- **Ensembl**: ${geneInfo.ensemblId || 'N/A'}`)
    lines.push(`- **Gene Validity (ClinGen)**: ${geneInfo.geneValidity}`)
    if (geneInfo.geneLink) lines.push(`- **GenCC**: ${geneInfo.geneLink}`)

    const uniprot = sources.uniprot
    if (uniprot && !uniprot.error) {
      lines.push('### UniProt Function')
      lines.push(uniprot.geneFunction || 'No function data available.')
      if (uniprot.bioProcessKeywords?.length > 0) {
        lines.push(`**Biological processes**: ${uniprot.bioProcessKeywords.join(', ')}`)
      }
      if (uniprot.uniprotUrl) lines.push(`**UniProt entry**: ${uniprot.uniprotUrl}`)
    }

    const constraints = sources.constraints
    if (constraints && !constraints.error) {
      lines.push('### gnomAD Constraint Scores')
      const fmtC = (label, c) => {
        if (!c || c.pLI === 'N/A') return `**${label}**: No data available`
        return `**${label}**: pLI=${c.pLI}, o/e LoF upper=${c.oe_lof_upper}, o/e mis upper=${c.oe_mis_upper}, mis_z=${c.mis_z}`
      }
      lines.push(fmtC('gnomAD v4 (GRCh38)', constraints.constraints_v4))
      lines.push(fmtC('gnomAD v2 (GRCh37)', constraints.constraints_v2))
      if (constraints.constraintsDelta) {
        lines.push('**Note**: Significant difference between v2 and v4 constraint scores.')
      }
      if (constraints.gnomadUrl) lines.push(`**gnomAD page**: ${constraints.gnomadUrl}`)
    }

    const clinvar = sources.clinvar
    if (clinvar && !clinvar.error) {
      lines.push('### ClinVar Variants')
      lines.push(`- **Pathogenic LoF variants**: ${clinvar.lofVariants}`)
      lines.push(`- **Pathogenic missense variants**: ${clinvar.missenseVariants}`)
      lines.push(`- **VUS LoF**: ${clinvar.lofUnknown}`)
      lines.push(`- **VUS missense**: ${clinvar.missenseUnknown}`)
      lines.push(`- **Total pathogenic**: ${clinvar.totalPathogenic}`)
      lines.push(`- **Total likely pathogenic**: ${clinvar.totalLikelyPathogenic}`)
      if (clinvar.clinvarUrl) lines.push(`**ClinVar page**: ${clinvar.clinvarUrl}`)
    }

    const pubmed = sources.pubmed
    if (pubmed && !pubmed.error) {
      lines.push('### PubMed Literature')
      lines.push(`**Total articles**: ${pubmed.articleCount}`)
      if (pubmed.articles?.length > 0) {
        lines.push('**Top articles**:')
        for (const a of pubmed.articles) {
          const authors = a.authors?.join(', ') || ''
          const citation = [a.journal, a.year].filter(Boolean).join(', ')
          lines.push(`- ${a.title}${authors ? ` — ${authors}` : ''}${citation ? ` (${citation})` : ''} [PMID: ${a.pmid}]`)
        }
      }
      if (pubmed.pubmedUrl) lines.push(`**PubMed search**: ${pubmed.pubmedUrl}`)
    }

    const panelApps = sources.panelApps
    if (panelApps && !panelApps.error) {
      lines.push('### PanelApp Gene Panels')
      lines.push(`- **Genomics England (UK)**: ${panelApps.panelAppEnglandCount ?? panelApps.panelAppEnglandError ?? 'N/A'} panels`)
      lines.push(`- **PanelApp Australia**: ${panelApps.panelAppAustraliaCount ?? panelApps.panelAppAustraliaError ?? 'N/A'} panels`)
    }

    const mouseKO = sources.mouseKO
    if (mouseKO && !mouseKO.error && mouseKO.phenotypeCount > 0) {
      lines.push('### IMPC Mouse Phenotypes')
      lines.push(`**${mouseKO.phenotypeCount} phenotypes** across ${mouseKO.categoryCount} categories:`)
      for (const [category, data] of Object.entries(mouseKO.mousePhenotypes)) {
        const label = category.replace(/_/g, ' ')
        const names = Array.isArray(data) ? data : data.names || []
        lines.push(`- **${label}**: ${names.join(', ')}`)
      }
      if (mouseKO.impcUrl) lines.push(`**IMPC page**: ${mouseKO.impcUrl}`)
    }

    const omim = sources.omim
    if (omim && !omim.error && omim.mim?.length > 0) {
      lines.push('### OMIM Diseases')
      for (const desc of omim.mim) {
        lines.push(`- ${desc}`)
      }
    }

    return lines.join('\n')
  })

  return sections.join('\n\n---\n\n')
}

function formatValidation(result) {
  if (!result.valid) {
    return `**${result.gene}**: Not found in HGNC. ${result.message}`
  }
  const lines = [
    `## ${result.gene} — Validated`,
    `- **Full name**: ${result.name || 'N/A'}`,
    `- **Alias**: ${result.alias || 'N/A'}`,
    `- **Location**: ${result.location || 'N/A'}`,
    `- **HGNC ID**: ${result.hgncId || 'N/A'}`,
    `- **OMIM ID**: ${result.omimId || 'N/A'}`,
    `- **Ensembl ID**: ${result.ensemblId || 'N/A'}`,
    `- **Gene Validity (ClinGen)**: ${result.geneValidity || 'No Known'}`,
  ]
  if (result.maneSelect?.length > 0) {
    lines.push(`- **MANE Select**: ${result.maneSelect.join(', ')}`)
  }
  if (result.geneLink) lines.push(`- **GenCC**: ${result.geneLink}`)
  return lines.join('\n')
}

function formatLiterature(result) {
  const lines = [`## PubMed results for ${result.gene}`]
  lines.push(`**Total articles found**: ${result.articleCount}`)
  if (result.error) {
    lines.push(`\n**Warning**: PubMed query failed (${result.error}). Results may be incomplete.`)
  }
  if (result.articles?.length > 0) {
    lines.push('')
    for (const a of result.articles) {
      const authors = a.authors?.join(', ') || ''
      const citation = [a.journal, a.year].filter(Boolean).join(', ')
      lines.push(`### ${a.title}`)
      if (authors) lines.push(`**Authors**: ${authors}`)
      if (citation) lines.push(`**Published in**: ${citation}`)
      if (a.doi) lines.push(`**DOI**: ${a.doi}`)
      lines.push(`**PMID**: ${a.pmid}`)
      if (a.abstract) lines.push(`\n> ${a.abstract}`)
      lines.push('')
    }
  }
  if (result.pubmedUrl) lines.push(`**Full PubMed search**: ${result.pubmedUrl}`)
  return lines.join('\n')
}

module.exports = { formatGeneAnalysis, formatValidation, formatLiterature, formatSourceErrors }
