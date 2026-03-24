import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { analyzeGenesStructured } = require('../services/dataservice.js');
const fetchGeneCard = require('../utils/fetchGeneCard.js');
const getPubMedData = require('../utils/getPubMedData.js');

const server = new McpServer({
    name: 'pubmatcher-mcp',
    version: '1.0.0',
});

// --- Output Formatters ---

function formatSourceErrors(sourceErrors) {
    if (!sourceErrors || sourceErrors.length === 0) return '';
    const lines = ['\n### Data Source Warnings'];
    for (const { source, error } of sourceErrors) {
        lines.push(`- **${source}**: unavailable (${error})`);
    }
    lines.push('');
    return lines.join('\n');
}

function formatGeneAnalysis(results) {
    if (!results || results.length === 0) return 'No results returned.';

    const sections = results.map((r) => {
        if (!r.valid) {
            return `## ${r.gene}\n**Error**: ${r.error}`;
        }

        const { geneInfo, sources, sourceErrors } = r;
        const lines = [`## ${r.gene} — ${geneInfo.name || 'Unknown'}`];

        // Source warnings at the top so the LLM sees them immediately
        if (sourceErrors.length > 0) {
            lines.push(formatSourceErrors(sourceErrors));
        }

        // Gene Info
        lines.push('### Gene Information');
        lines.push(`- **HGNC ID**: ${geneInfo.hgncId || 'N/A'}`);
        lines.push(`- **Location**: ${geneInfo.location || 'N/A'}`);
        lines.push(`- **Alias**: ${geneInfo.alias || 'N/A'}`);
        lines.push(`- **OMIM ID**: ${geneInfo.omimId || 'N/A'}`);
        lines.push(`- **Ensembl**: ${geneInfo.ensemblId || 'N/A'}`);
        lines.push(`- **Gene Validity (ClinGen)**: ${geneInfo.geneValidity}`);
        if (geneInfo.geneLink) lines.push(`- **GenCC**: ${geneInfo.geneLink}`);

        // UniProt
        const uniprot = sources.uniprot;
        if (uniprot && !uniprot.error) {
            lines.push('### UniProt Function');
            lines.push(uniprot.geneFunction || 'No function data available.');
            if (uniprot.bioProcessKeywords?.length > 0) {
                lines.push(`**Biological processes**: ${uniprot.bioProcessKeywords.join(', ')}`);
            }
            if (uniprot.uniprotUrl) lines.push(`**UniProt entry**: ${uniprot.uniprotUrl}`);
        }

        // Constraints
        const constraints = sources.constraints;
        if (constraints && !constraints.error) {
            lines.push('### gnomAD Constraint Scores');
            const fmtC = (label, c) => {
                if (!c || c.pLI === 'N/A') return `**${label}**: No data available`;
                return `**${label}**: pLI=${c.pLI}, o/e LoF upper=${c.oe_lof_upper}, o/e mis upper=${c.oe_mis_upper}, mis_z=${c.mis_z}`;
            };
            lines.push(fmtC('gnomAD v4 (GRCh38)', constraints.constraints_v4));
            lines.push(fmtC('gnomAD v2 (GRCh37)', constraints.constraints_v2));
            if (constraints.constraintsDelta) {
                lines.push('**Note**: Significant difference between v2 and v4 constraint scores.');
            }
            if (constraints.gnomadUrl) lines.push(`**gnomAD page**: ${constraints.gnomadUrl}`);
        }

        // ClinVar
        const clinvar = sources.clinvar;
        if (clinvar && !clinvar.error) {
            lines.push('### ClinVar Variants');
            lines.push(`- **Pathogenic LoF variants**: ${clinvar.lofVariants}`);
            lines.push(`- **Pathogenic missense variants**: ${clinvar.missenseVariants}`);
            lines.push(`- **VUS LoF**: ${clinvar.lofUnknown}`);
            lines.push(`- **VUS missense**: ${clinvar.missenseUnknown}`);
            lines.push(`- **Total pathogenic**: ${clinvar.totalPathogenic}`);
            lines.push(`- **Total likely pathogenic**: ${clinvar.totalLikelyPathogenic}`);
            if (clinvar.clinvarUrl) lines.push(`**ClinVar page**: ${clinvar.clinvarUrl}`);
        }

        // PubMed
        const pubmed = sources.pubmed;
        if (pubmed && !pubmed.error) {
            lines.push('### PubMed Literature');
            lines.push(`**Total articles**: ${pubmed.articleCount}`);
            if (pubmed.articles?.length > 0) {
                lines.push('**Top articles**:');
                for (const a of pubmed.articles) {
                    const authors = a.authors?.join(', ') || '';
                    const citation = [a.journal, a.year].filter(Boolean).join(', ');
                    lines.push(`- ${a.title}${authors ? ` — ${authors}` : ''}${citation ? ` (${citation})` : ''} [PMID: ${a.pmid}]`);
                }
            }
            if (pubmed.pubmedUrl) lines.push(`**PubMed search**: ${pubmed.pubmedUrl}`);
        }

        // PanelApp
        const panelApps = sources.panelApps;
        if (panelApps && !panelApps.error) {
            lines.push('### PanelApp Gene Panels');
            lines.push(`- **Genomics England (UK)**: ${panelApps.panelAppEnglandCount ?? panelApps.panelAppEnglandError ?? 'N/A'} panels`);
            lines.push(`- **PanelApp Australia**: ${panelApps.panelAppAustraliaCount ?? panelApps.panelAppAustraliaError ?? 'N/A'} panels`);
        }

        // Mouse KO
        const mouseKO = sources.mouseKO;
        if (mouseKO && !mouseKO.error && mouseKO.phenotypeCount > 0) {
            lines.push('### IMPC Mouse Phenotypes');
            lines.push(`**${mouseKO.phenotypeCount} phenotypes** across ${mouseKO.categoryCount} categories:`);
            for (const [category, data] of Object.entries(mouseKO.mousePhenotypes)) {
                const label = category.replace(/_/g, ' ');
                const names = Array.isArray(data) ? data : data.names || [];
                lines.push(`- **${label}**: ${names.join(', ')}`);
            }
            if (mouseKO.impcUrl) lines.push(`**IMPC page**: ${mouseKO.impcUrl}`);
        }

        // OMIM
        const omim = sources.omim;
        if (omim && !omim.error && omim.mim?.length > 0) {
            lines.push('### OMIM Diseases');
            for (const desc of omim.mim) {
                lines.push(`- ${desc}`);
            }
        }

        return lines.join('\n');
    });

    return sections.join('\n\n---\n\n');
}

function formatValidation(result) {
    if (!result.valid) {
        return `**${result.gene}**: Not found in HGNC. ${result.message}`;
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
    ];
    if (result.maneSelect?.length > 0) {
        lines.push(`- **MANE Select**: ${result.maneSelect.join(', ')}`);
    }
    if (result.geneLink) lines.push(`- **GenCC**: ${result.geneLink}`);
    return lines.join('\n');
}

function formatLiterature(result) {
    const lines = [`## PubMed results for ${result.gene}`];
    lines.push(`**Total articles found**: ${result.articleCount}`);
    if (result.error) {
        lines.push(`\n**Warning**: PubMed query failed (${result.error}). Results may be incomplete.`);
    }
    if (result.articles?.length > 0) {
        lines.push('');
        for (const a of result.articles) {
            const authors = a.authors?.join(', ') || '';
            const citation = [a.journal, a.year].filter(Boolean).join(', ');
            lines.push(`### ${a.title}`);
            if (authors) lines.push(`**Authors**: ${authors}`);
            if (citation) lines.push(`**Published in**: ${citation}`);
            if (a.doi) lines.push(`**DOI**: ${a.doi}`);
            lines.push(`**PMID**: ${a.pmid}`);
            if (a.abstract) lines.push(`\n> ${a.abstract}`);
            lines.push('');
        }
    }
    if (result.pubmedUrl) lines.push(`**Full PubMed search**: ${result.pubmedUrl}`);
    return lines.join('\n');
}

// --- Tool Definitions ---

server.tool(
    'analyze_genes',
    'Perform comprehensive multi-database genomic analysis. Queries 8 databases in parallel for each gene: HGNC validation, PubMed literature, ClinVar variants, gnomAD constraints, UniProt function, IMPC mouse phenotypes, PanelApp panels, and OMIM diseases.',
    {
        genes: z.array(z.string()).min(1).max(10).describe('Gene symbols to analyze (e.g. ["BRCA1", "TP53"]). Maximum 10 genes per request.'),
        phenotypes: z.array(z.string()).optional().describe('Phenotype terms to refine PubMed literature search (e.g. ["breast cancer", "ovarian cancer"])'),
    },
    async ({ genes, phenotypes }) => {
        process.stderr.write(`[PubMatcher] analyze_genes: ${genes.join(', ')}${phenotypes?.length ? ` | phenotypes: ${phenotypes.join(', ')}` : ''}\n`);
        const results = await analyzeGenesStructured(genes, phenotypes || []);
        return { content: [{ type: 'text', text: formatGeneAnalysis(results) }] };
    },
);

server.tool(
    'validate_gene',
    'Validate a gene symbol against HGNC and check ClinGen gene-disease validity classification. Quick lightweight check before committing to a full analysis.',
    {
        gene: z.string().describe('Gene symbol to validate (e.g. "BRCA1")'),
    },
    async ({ gene }) => {
        process.stderr.write(`[PubMatcher] validate_gene: ${gene}\n`);
        const validatedGene = await fetchGeneCard(gene);
        if (!validatedGene) {
            return { content: [{ type: 'text', text: formatValidation({ valid: false, gene, message: `Gene symbol "${gene}" not found in HGNC` }) }] };
        }
        return {
            content: [{
                type: 'text',
                text: formatValidation({
                    valid: true,
                    gene,
                    name: validatedGene.geneName,
                    alias: validatedGene.aliasName,
                    location: validatedGene.location,
                    hgncId: validatedGene.hgncId,
                    omimId: validatedGene.omimId,
                    ensemblId: validatedGene.ensemblGeneId,
                    geneValidity: validatedGene.validityMarker,
                    maneSelect: validatedGene.maneSelect,
                    geneLink: validatedGene.hgncId ? `https://search.thegencc.org/genes/${validatedGene.hgncId}` : null,
                }),
            }],
        };
    },
);

server.tool(
    'search_literature',
    'Search PubMed for literature about a gene, optionally refined by phenotype terms. Returns article count, top 5 articles with titles, authors, abstracts, and DOIs.',
    {
        gene: z.string().describe('Gene symbol to search (e.g. "TP53")'),
        phenotypes: z.array(z.string()).optional().describe('Phenotype terms to refine the search (e.g. ["cancer", "Li-Fraumeni syndrome"])'),
    },
    async ({ gene, phenotypes }) => {
        process.stderr.write(`[PubMatcher] search_literature: ${gene}${phenotypes?.length ? ` | phenotypes: ${phenotypes.join(', ')}` : ''}\n`);
        const result = await getPubMedData(gene, phenotypes || []);
        return { content: [{ type: 'text', text: formatLiterature(result) }] };
    },
);

// --- Start Server ---

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    process.stderr.write('[PubMatcher] PubMatcher Genomics MCP server started\n');
}

main().catch((error) => {
    process.stderr.write(`[PubMatcher] Fatal error: ${error.message}\n`);
    process.exit(1);
});
