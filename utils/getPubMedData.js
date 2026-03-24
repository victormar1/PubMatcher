const axios = require('axios')
const xml2js = require('xml2js')
const { cacheGet, cacheSet } = require('./cache')
const { rateLimitedGet } = require('./rateLimiter')

const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'

/**
 * Fetches PubMed data for a gene using the official NCBI E-utilities API.
 * Replaces the previous cheerio-based web scraping approach.
 *
 * Returns both legacy keys (gene, url, firstArticleTitle, firstArticleUrl, complArticles, count)
 * for backward compatibility with the web app, and enhanced keys (articles, articleCount, pubmedUrl)
 * with full article metadata (abstracts, DOIs, authors, journals) for the MCP server.
 */
async function getPubMedData(gene, phenotypes) {
  let query
  if (phenotypes.length > 0) {
    const parts = phenotypes.map((p) => `(${gene} AND ${p})`)
    query = parts.join(' OR ')
  } else {
    query = gene
  }

  const cacheKey = `pubmed:${query}`
  const cached = cacheGet(cacheKey)
  if (cached !== undefined) return cached

  const pubmedUrl = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(query)}`

  try {
    // Step 1: E-search to get PMIDs + count
    const searchUrl = `${EUTILS_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=5&sort=relevance&retmode=json`
    const searchRes = await rateLimitedGet(axios, searchUrl)
    const searchData = searchRes.data.esearchresult
    const count = parseInt(searchData.count, 10) || 0
    const pmids = searchData.idlist || []

    if (count === 0 || pmids.length === 0) {
      const result = {
        gene,
        url: pubmedUrl,
        firstArticleTitle: 'No articles found',
        firstArticleUrl: null,
        complArticles: [],
        count: 0,
        articles: [],
        articleCount: 0,
        pubmedUrl,
      }
      cacheSet(cacheKey, result)
      return result
    }

    // Step 2: E-fetch to get article details (XML)
    const fetchUrl = `${EUTILS_BASE}/efetch.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=xml`
    const fetchRes = await rateLimitedGet(axios, fetchUrl)
    const parsed = await xml2js.parseStringPromise(fetchRes.data, { explicitArray: false })

    let articleSet = parsed.PubmedArticleSet?.PubmedArticle
    if (!articleSet) articleSet = []
    if (!Array.isArray(articleSet)) articleSet = [articleSet]

    const articles = articleSet.slice(0, 5).map((entry) => {
      const article = entry.MedlineCitation?.Article || {}
      const pmid = entry.MedlineCitation?.PMID?._ || entry.MedlineCitation?.PMID || ''

      // Title
      let title = article.ArticleTitle || ''
      if (typeof title === 'object') title = title._ || JSON.stringify(title)

      // Abstract
      let abstract = ''
      const abstractText = article.Abstract?.AbstractText
      if (typeof abstractText === 'string') {
        abstract = abstractText
      } else if (Array.isArray(abstractText)) {
        abstract = abstractText.map((t) => (typeof t === 'string' ? t : t._ || '')).join(' ')
      } else if (abstractText && typeof abstractText === 'object') {
        abstract = abstractText._ || ''
      }

      // Authors
      let authors = []
      const authorList = article.AuthorList?.Author
      if (Array.isArray(authorList)) {
        authors = authorList.slice(0, 5).map((a) => {
          const last = a.LastName || ''
          const initials = a.Initials || ''
          return `${last} ${initials}`.trim()
        })
        if (authorList.length > 5) authors.push('et al.')
      }

      // Journal + Year
      const journal = article.Journal?.Title || ''
      const year = article.Journal?.JournalIssue?.PubDate?.Year || ''

      // DOI
      let doi = ''
      const idList = entry.PubmedData?.ArticleIdList?.ArticleId
      if (Array.isArray(idList)) {
        const doiEntry = idList.find((id) => id.$?.IdType === 'doi')
        doi = doiEntry?._ || doiEntry || ''
      }

      return { pmid, title, authors, journal, year, doi, abstract: abstract.substring(0, 400) }
    })

    // Build backward-compatible keys for the web app
    const firstArticle = articles[0] || null
    const firstArticleTitle = firstArticle ? firstArticle.title : 'No articles found'
    const firstArticleUrl = firstArticle ? `https://pubmed.ncbi.nlm.nih.gov/${firstArticle.pmid}/` : null
    const complArticles = articles.slice(1, 4).map((a) => ({
      title: a.title,
      url: `https://pubmed.ncbi.nlm.nih.gov/${a.pmid}/`,
    }))

    const result = {
      // Legacy keys (web app backward compat)
      gene,
      url: pubmedUrl,
      firstArticleTitle,
      firstArticleUrl,
      complArticles,
      count,
      // Enhanced keys (MCP server + future use)
      articles,
      articleCount: count,
      pubmedUrl,
    }
    cacheSet(cacheKey, result)
    return result
  } catch (error) {
    console.error(`PubMed fetch failed for ${gene}: ${error.message}`)
    return {
      gene,
      url: pubmedUrl,
      firstArticleTitle: 'No articles found',
      firstArticleUrl: null,
      complArticles: [],
      count: 0,
      articles: [],
      articleCount: 0,
      pubmedUrl,
      error: error.message,
    }
  }
}

module.exports = getPubMedData
