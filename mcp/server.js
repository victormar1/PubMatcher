import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { createRequire } from 'node:module';

// Bridge to import CJS utils from the parent project
const require = createRequire(import.meta.url);
const fetchGeneCard = require('../utils/fetchGeneCard.js');
const getPubMedData = require('../utils/getPubMedData.js');
const getUniProtFunction = require('../utils/getUniProtFunction.js');
const getMouseKO = require('../utils/getMouseKO.js');
const getGeneConstraints = require('../utils/getGeneConstraints.js');
const getPanelApps = require('../utils/getPanelApps.js');
const getClinVarData = require('../utils/getClinVarData.js');
const fetchOmimData = require('../utils/fetchOMIM.js');

const server = new McpServer({
    name: 'pubmatcher-mcp',
    version: '1.0.0',
});

// --- Core Data Functions ---

async function analyzeGenes(genes, phenotypes = []) {
    return Promise.all(
        genes.map(async (gene) => {
            try {
                const validatedGene = await fetchGeneCard(gene);
                if (!validatedGene) {
                    return { gene, error: `Gene symbol "${gene}" not found in HGNC` };
                }

                const [pubmed, uniprot, mouseKO, constraints, panelApps, clinvar, omim] = await Promise.allSettled([
                    getPubMedData(gene, phenotypes),
                    getUniProtFunction(validatedGene.uniprotIds),
                    getMouseKO(validatedGene.mgdId),
                    getGeneConstraints(gene),
                    getPanelApps(gene),
                    getClinVarData(gene),
                    fetchOmimData(validatedGene.ensemblGeneId),
                ]);

                const unwrap = (result, fallback) =>
                    result.status === 'fulfilled' ? result.value : { ...fallback, error: result.reason?.message };

                return {
                    gene,
                    geneInfo: {
                        name: validatedGene.geneName,
                        alias: validatedGene.aliasName,
                        location: validatedGene.location,
                        hgncId: validatedGene.hgncId,
                        omimId: validatedGene.omimId,
                        ensemblId: validatedGene.ensemblGeneId,
                        geneValidity: validatedGene.validityMarker || 'No Known',
                        geneLink: validatedGene.hgncId
                            ? `https://search.thegencc.org/genes/${validatedGene.hgncId}`
                            : null,
                    },
                    pubmed: unwrap(pubmed, { articles: [], articleCount: 0 }),
                    uniprot: unwrap(uniprot, { geneFunction: null, bioProcessKeywords: [] }),
                    mouseKO: unwrap(mouseKO, { mousePhenotypes: {}, phenotypeCount: 0 }),
                    constraints: unwrap(constraints, { constraints_v2: {}, constraints_v4: {} }),
                    panelApps: unwrap(panelApps, { panelAppEnglandCount: null, panelAppAustraliaCount: null }),
                    clinvar: unwrap(clinvar, { lofVariants: 0, missenseVariants: 0 }),
                    omim: unwrap(omim, { mim: [] }),
                };
            } catch (error) {
                return { gene, error: error.message };
            }
        }),
    );
}

async function validateGene(gene) {
    const validatedGene = await fetchGeneCard(gene);
    if (!validatedGene) {
        return { valid: false, gene, message: `Gene symbol "${gene}" not found in HGNC` };
    }
    return {
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
        geneLink: validatedGene.hgncId
            ? `https://search.thegencc.org/genes/${validatedGene.hgncId}`
            : null,
    };
}

async function searchLiterature(gene, phenotypes = []) {
    return getPubMedData(gene, phenotypes);
}

// --- Output Formatters ---

function formatGeneAnalysis(results) {
    if (!results || results.length === 0) return 'No results returned.';

    const sections = results.map((r) => {
        if (r.error && !r.geneInfo) {
            return `## ${r.gene}\n**Error**: ${r.error}`;
        }

        const lines = [`## ${r.gene} — ${r.geneInfo.name || 'Unknown'}`];

        lines.push('### Gene Information');
        lines.push(`- **HGNC ID**: ${r.geneInfo.hgncId || 'N/A'}`);
        lines.push(`- **Location**: ${r.geneInfo.location || 'N/A'}`);
        lines.push(`- **Alias**: ${r.geneInfo.alias || 'N/A'}`);
        lines.push(`- **OMIM ID**: ${r.geneInfo.omimId || 'N/A'}`);
        lines.push(`- **Ensembl**: ${r.geneInfo.ensemblId || 'N/A'}`);
        lines.push(`- **Gene Validity (ClinGen)**: ${r.geneInfo.geneValidity}`);
        if (r.geneInfo.geneLink) lines.push(`- **GenCC**: ${r.geneInfo.geneLink}`);

        if (r.uniprot) {
            lines.push('### UniProt Function');
            lines.push(r.uniprot.geneFunction || 'No function data available.');
            if (r.uniprot.bioProcessKeywords?.length > 0) {
                lines.push(`**Biological processes**: ${r.uniprot.bioProcessKeywords.join(', ')}`);
            }
            if (r.uniprot.uniprotUrl) lines.push(`**UniProt entry**: ${r.uniprot.uniprotUrl}`);
        }

        if (r.constraints) {
            lines.push('### gnomAD Constraint Scores');
            const fmtC = (label, c) => {
                if (!c || c.pLI === 'N/A') return `**${label}**: No data available`;
                return `**${label}**: pLI=${c.pLI}, o/e LoF upper=${c.oe_lof_upper}, o/e mis upper=${c.oe_mis_upper}, mis_z=${c.mis_z}`;
            };
            lines.push(fmtC('gnomAD v4 (GRCh38)', r.constraints.constraints_v4));
            lines.push(fmtC('gnomAD v2 (GRCh37)', r.constraints.constraints_v2));
            if (r.constraints.constraintsDelta) {
                lines.push('**Note**: Significant difference between v2 and v4 constraint scores.');
            }
            if (r.constraints.gnomadUrl) lines.push(`**gnomAD page**: ${r.constraints.gnomadUrl}`);
        }

        if (r.clinvar) {
            lines.push('### ClinVar Variants');
            lines.push(`- **Pathogenic LoF variants**: ${r.clinvar.lofVariants}`);
            lines.push(`- **Pathogenic missense variants**: ${r.clinvar.missenseVariants}`);
            lines.push(`- **VUS LoF**: ${r.clinvar.lofUnknown}`);
            lines.push(`- **VUS missense**: ${r.clinvar.missenseUnknown}`);
            lines.push(`- **Total pathogenic**: ${r.clinvar.totalPathogenic}`);
            lines.push(`- **Total likely pathogenic**: ${r.clinvar.totalLikelyPathogenic}`);
            if (r.clinvar.clinvarUrl) lines.push(`**ClinVar page**: ${r.clinvar.clinvarUrl}`);
        }

        if (r.pubmed) {
            lines.push('### PubMed Literature');
            lines.push(`**Total articles**: ${r.pubmed.articleCount}`);
            if (r.pubmed.articles?.length > 0) {
                lines.push('**Top articles**:');
                for (const a of r.pubmed.articles) {
                    const authors = a.authors?.join(', ') || '';
                    const citation = [a.journal, a.year].filter(Boolean).join(', ');
                    lines.push(`- ${a.title}${authors ? ` — ${authors}` : ''}${citation ? ` (${citation})` : ''} [PMID: ${a.pmid}]`);
                }
            }
            if (r.pubmed.pubmedUrl) lines.push(`**PubMed search**: ${r.pubmed.pubmedUrl}`);
        }

        if (r.panelApps) {
            lines.push('### PanelApp Gene Panels');
            lines.push(`- **Genomics England (UK)**: ${r.panelApps.panelAppEnglandCount ?? r.panelApps.panelAppEnglandError ?? 'N/A'} panels`);
            lines.push(`- **PanelApp Australia**: ${r.panelApps.panelAppAustraliaCount ?? r.panelApps.panelAppAustraliaError ?? 'N/A'} panels`);
        }

        if (r.mouseKO && r.mouseKO.phenotypeCount > 0) {
            lines.push('### IMPC Mouse Phenotypes');
            lines.push(`**${r.mouseKO.phenotypeCount} phenotypes** across ${r.mouseKO.categoryCount} categories:`);
            for (const [category, data] of Object.entries(r.mouseKO.mousePhenotypes)) {
                const label = category.replace(/_/g, ' ');
                const names = Array.isArray(data) ? data : data.names || [];
                lines.push(`- **${label}**: ${names.join(', ')}`);
            }
            if (r.mouseKO.impcUrl) lines.push(`**IMPC page**: ${r.mouseKO.impcUrl}`);
        }

        if (r.omim?.mim?.length > 0) {
            lines.push('### OMIM Diseases');
            for (const desc of r.omim.mim) {
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
        const results = await analyzeGenes(genes, phenotypes || []);
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
        const result = await validateGene(gene);
        return { content: [{ type: 'text', text: formatValidation(result) }] };
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
        const result = await searchLiterature(gene, phenotypes || []);
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
