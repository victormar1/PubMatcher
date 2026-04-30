const axios = require('axios')

const ESEARCH_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi'
const ESUMMARY_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi'
const PUBMED_SEARCH_URL = 'https://pubmed.ncbi.nlm.nih.gov/?term='
const PUBMED_ARTICLE_URL = 'https://pubmed.ncbi.nlm.nih.gov/'

const MAX_ATTEMPTS = 3
const RETRY_DELAY_MS = 600
const REQUEST_TIMEOUT_MS = 12000
const TOP_N = 4

const TRANSIENT_ERROR_CODES = ['ECONNRESET', 'ECONNABORTED', 'ETIMEDOUT', 'ENETUNREACH', 'EAI_AGAIN']

// NCBI E-utilities limits:
//   - without API key: 3 req/s per IP
//   - with API key:   10 req/s per key
// Stay slightly under each ceiling to absorb clock drift and other processes.
const NCBI_API_KEY = process.env.NCBI_API_KEY || null
const RATE_LIMIT_PER_SEC = NCBI_API_KEY ? 8 : 2.5
const MIN_GAP_MS = Math.ceil(1000 / RATE_LIMIT_PER_SEC)
let nextSlotAt = 0

function reserveSlot() {
  const now = Date.now()
  const slotStart = Math.max(now, nextSlotAt)
  nextSlotAt = slotStart + MIN_GAP_MS
  return slotStart - now
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function throttledGet(url, params) {
  const delay = reserveSlot()
  if (delay > 0) await sleep(delay)
  return axios.get(url, { params, timeout: REQUEST_TIMEOUT_MS })
}

function isTransientError(err) {
  if (TRANSIENT_ERROR_CODES.includes(err.code)) return true
  const status = err.response && err.response.status
  if (status && (status >= 500 || status === 429)) return true
  return false
}

async function eutilsFetch(combinedQuery) {
  const authParams = NCBI_API_KEY ? { api_key: NCBI_API_KEY } : {}

  const searchResp = await throttledGet(ESEARCH_URL, {
    ...authParams,
    db: 'pubmed',
    term: combinedQuery,
    retmode: 'json',
    retmax: TOP_N,
    sort: 'relevance'
  })

  const esr = searchResp.data && searchResp.data.esearchresult
  if (!esr) {
    const err = new Error('esearch malformed response')
    err.code = 'EPARSE'
    throw err
  }
  if (esr.ERROR) {
    const err = new Error(`esearch error: ${esr.ERROR}`)
    err.code = 'EAPI'
    throw err
  }

  const count = parseInt(esr.count, 10) || 0
  const ids = Array.isArray(esr.idlist) ? esr.idlist : []

  if (count === 0 || ids.length === 0) {
    return { count, articles: [] }
  }

  const summaryResp = await throttledGet(ESUMMARY_URL, {
    ...authParams,
    db: 'pubmed',
    id: ids.join(','),
    retmode: 'json'
  })

  const result = summaryResp.data && summaryResp.data.result
  if (!result) {
    const err = new Error('esummary malformed response')
    err.code = 'EPARSE'
    throw err
  }

  const articles = ids
    .map((id) => {
      const item = result[id]
      if (!item || item.error) return null
      const rawTitle = item.title || ''
      const title = String(rawTitle).replace(/<[^>]+>/g, '').trim()
      return title ? { id, title, url: `${PUBMED_ARTICLE_URL}${id}/` } : null
    })
    .filter(Boolean)

  return { count, articles }
}

async function getPubMedData(gene, phenotypes) {
  let combinedQuery
  if (phenotypes && phenotypes.length > 0) {
    combinedQuery = phenotypes.map((p) => `(${gene} AND ${p})`).join(' OR ')
  } else {
    combinedQuery = gene
  }

  const url = `${PUBMED_SEARCH_URL}${encodeURIComponent(combinedQuery)}`

  let lastError = null

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { count, articles } = await eutilsFetch(combinedQuery)
      const first = articles[0]
      const complArticles = articles.slice(1, 4).map((a) => ({ title: a.title, url: a.url }))

      return {
        gene,
        url,
        firstArticleTitle: first ? first.title : 'No articles found',
        firstArticleUrl: first ? first.url : null,
        complArticles,
        count
      }
    } catch (err) {
      lastError = err
      if (!isTransientError(err) || attempt === MAX_ATTEMPTS) break
      const jitter = Math.floor(Math.random() * 400)
      await sleep(RETRY_DELAY_MS * attempt + jitter)
    }
  }

  return {
    gene,
    url,
    firstArticleTitle: 'Error',
    firstArticleUrl: null,
    complArticles: [],
    count: null,
    error: lastError ? `PubMed E-utilities unreachable: ${lastError.code || lastError.message}` : 'PubMed unreachable'
  }
}

module.exports = getPubMedData
