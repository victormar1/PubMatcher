const axios = require('axios')
const cheerio = require('cheerio')

const MAX_ATTEMPTS = 3
const RETRY_DELAY_MS = 600
const REQUEST_TIMEOUT_MS = 10000

const TRANSIENT_ERROR_CODES = ['ECONNRESET', 'ECONNABORTED', 'ETIMEDOUT', 'ENETUNREACH', 'EAI_AGAIN']

function isTransientError(err) {
  if (TRANSIENT_ERROR_CODES.includes(err.code)) return true
  const status = err.response && err.response.status
  if (status && (status >= 500 || status === 429)) return true
  return false
}

function looksLikeSilentFalseZero(parsed) {
  return parsed.count === 0 && !parsed.hasZeroResultsBanner && !parsed.isAutocorrected && !parsed.isSingleArticleRedirect && parsed.complArticles.length === 0
}

function parseScrape(html, response, combinedQuery) {
  const $ = cheerio.load(html)

  const countSelector = '#search-results > div.top-wrapper > div.results-amount-container > div.results-amount > h3 > span'
  const countText = $(countSelector).text().trim().replace(',', '')
  let count = parseInt(countText, 10) || 0

  const spellCheckWarningSelector = '#spell-check-warning'
  const warningText = $(spellCheckWarningSelector).text().trim()
  const isAutocorrected = warningText.includes('Showing results for')

  const zeroResultsBannerSelector = '.solr-message.query-error-message.usa-alert.usa-alert-slim.usa-alert-warning .usa-alert-body .usa-alert-text'
  const zeroResultsBannerText = $(zeroResultsBannerSelector).text().trim()
  const hasZeroResultsBanner = zeroResultsBannerText.includes('Your search was processed without automatic term mapping because it retrieved zero results.')

  const requestPath = response.request.path || ''
  const isSingleArticleRedirect = !requestPath.includes('term')

  let firstArticleTitle = 'No articles found'
  let firstArticleUrl = null
  const complArticles = []

  if (isSingleArticleRedirect) {
    firstArticleTitle = $('#full-view-heading > h1.heading-title').text().trim() || 'No articles found'
    count = 1
    return { count, firstArticleTitle, firstArticleUrl, complArticles, isAutocorrected, hasZeroResultsBanner, isSingleArticleRedirect }
  }

  if (hasZeroResultsBanner) {
    return { count: 0, firstArticleTitle: 'No articles found', firstArticleUrl: null, complArticles: [], isAutocorrected, hasZeroResultsBanner, isSingleArticleRedirect }
  }

  if (!isAutocorrected) {
    const articles = $('#search-results > section > div.search-results-chunks > div > article')
    articles.each((index, article) => {
      const titleElement = $(article).find('.docsum-wrap > .docsum-content > a')
      const title = titleElement.text().trim()
      const href = titleElement.attr('href')

      if (title && href) {
        const match = href.match(/\/(\d+)\//)
        const articleId = match ? match[1] : null
        const articleUrl = articleId ? `https://pubmed.ncbi.nlm.nih.gov/${articleId}/` : null

        if (index === 0) {
          firstArticleTitle = title
          firstArticleUrl = articleUrl
        } else if (index >= 1 && index <= 3) {
          complArticles.push({ title, url: articleUrl })
        }
        if (index >= 3) return false
      }
    })
  } else {
    firstArticleUrl = `https://pubmed.ncbi.nlm.nih.gov/${combinedQuery}/`
  }

  return { count, firstArticleTitle, firstArticleUrl, complArticles, isAutocorrected, hasZeroResultsBanner, isSingleArticleRedirect }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function getPubMedData(gene, phenotypes) {
  let combinedQuery = ''
  if (phenotypes.length > 0) {
    const queries = phenotypes.map((phenotype) => `(${gene} AND ${phenotype})`)
    combinedQuery = queries.join(' OR ')
  } else {
    combinedQuery = `${gene}`
  }

  const url = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(combinedQuery)}`

  let lastError = null
  let sawSilentFalseZero = false

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await axios.get(url, { timeout: REQUEST_TIMEOUT_MS })
      const parsed = parseScrape(response.data, response, combinedQuery)

      if (looksLikeSilentFalseZero(parsed)) {
        sawSilentFalseZero = true
        if (attempt < MAX_ATTEMPTS) {
          const jitter = Math.floor(Math.random() * 400)
          await sleep(RETRY_DELAY_MS * attempt + jitter)
          continue
        }
        break
      }

      return {
        gene,
        url,
        firstArticleTitle: parsed.firstArticleTitle,
        firstArticleUrl: parsed.firstArticleUrl,
        complArticles: parsed.complArticles,
        count: parsed.count
      }
    } catch (err) {
      lastError = err
      if (!isTransientError(err) || attempt === MAX_ATTEMPTS) break
      const jitter = Math.floor(Math.random() * 400)
      await sleep(RETRY_DELAY_MS * attempt + jitter)
    }
  }

  let errorMsg
  if (lastError) {
    errorMsg = `PubMed unreachable: ${lastError.code || lastError.message}`
  } else if (sawSilentFalseZero) {
    errorMsg = 'PubMed returned no usable data after retries (likely throttled/CAPTCHA)'
  } else {
    errorMsg = 'PubMed returned no usable data after retries'
  }

  return {
    gene,
    url,
    firstArticleTitle: 'Error',
    firstArticleUrl: null,
    complArticles: [],
    count: null,
    error: errorMsg
  }
}

module.exports = getPubMedData
