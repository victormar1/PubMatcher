const axios = require('axios')
const cheerio = require('cheerio')

async function getPubMedData(gene, phenotypes) {
  // * BUILD THE QUERY
  let combinedQuery = ''
  if (phenotypes.length > 0) {
    const queries = phenotypes.map((phenotype) => `(${gene} AND ${phenotype})`)
    combinedQuery = queries.join(' OR ')
  } else {
    combinedQuery = `${gene}`
  }

  // * FETCH DATA
  const url = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(combinedQuery)}`
  const response = await axios.get(url)
  const $ = cheerio.load(response.data)

  // * GET ARTICLE COUNT
  const countSelector = '#search-results > div.top-wrapper > div.results-amount-container > div.results-amount > h3 > span'
  const countText = $(countSelector).text().trim().replace(',', '')
  let count = parseInt(countText, 10) || 0

  // * DEFAULT VALUES
  let firstArticleTitle = 'No articles found'
  let firstArticleUrl = null

  // * CHECK IF RESPONSE HAS SPELLCHECK WARNING
  const spellCheckWarningSelector = '#spell-check-warning'
  const spellCheckOnly = 'Showing results for'
  const warningText = $(spellCheckWarningSelector).text().trim()
  const isAutocorrected = warningText.includes(spellCheckOnly)

  if (!isAutocorrected) {
    const articles = $('#search-results > section > div.search-results-chunks > div > article')
    articles.each((_, article) => {
      const titleElement = $(article).find('.docsum-wrap > .docsum-content > a')
      const title = titleElement.text().trim()
      const href = titleElement.attr('href')

      if (title && href) {
        firstArticleTitle = title
        const match = href.match(/\/(\d+)\//)
        if (match) {
          const firstArticleId = match[1]
          firstArticleUrl = `https://pubmed.ncbi.nlm.nih.gov/${firstArticleId}/`
        }
        return false
      }
    })
  } else {
    firstArticleUrl = `https://pubmed.ncbi.nlm.nih.gov/${combinedQuery}/`
  }

  const requestPath = response.request.path
  if (!requestPath.includes('term')) {
    firstArticleTitle = $('#full-view-heading > h1.heading-title').text().trim()
    count = 1
  } else {
    firstArticleTitle = firstArticleTitle || 'No PubMed Articles'
    count = isNaN(count) ? 0 : count
  }

  // * RETURN THE RESULT
  return {
    gene,
    url,
    firstArticleTitle,
    firstArticleUrl,
    count
  }
}

module.exports = getPubMedData
