# PubMatcher MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that exposes PubMatcher's multi-database genomic analysis to any MCP-compatible AI client (Claude Desktop, VS Code Copilot, Cursor, etc.).

The MCP server is a **thin layer** on top of the shared `utils/` — it imports the same data-fetching modules used by the web app, so improvements benefit both.

## Tools

| Tool | Description | Timeout |
|------|-------------|---------|
| `analyze_genes` | Full 8-database analysis for 1-10 genes | 120s |
| `validate_gene` | Quick HGNC + ClinGen check | 10s |
| `search_literature` | PubMed search with phenotype refinement | 15s |

## Setup

```bash
cd mcp
npm install
```

## Usage with Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "pubmatcher": {
      "command": "node",
      "args": ["/path/to/PubMatcher/mcp/server.js"]
    }
  }
}
```

## Usage with VS Code

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "pubmatcher": {
      "command": "node",
      "args": ["${workspaceFolder}/mcp/server.js"]
    }
  }
}
```
