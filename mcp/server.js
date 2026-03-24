import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { analyzeGenesStructured, validateGene, searchLiterature } = require('../services/dataservice.js');
const { formatGeneAnalysis, formatValidation, formatLiterature } = require('../utils/formatters.js');

const server = new McpServer({
    name: 'pubmatcher-mcp',
    version: '1.0.0',
});

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

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    process.stderr.write('[PubMatcher] PubMatcher Genomics MCP server started\n');
}

main().catch((error) => {
    process.stderr.write(`[PubMatcher] Fatal error: ${error.message}\n`);
    process.exit(1);
});
