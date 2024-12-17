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

  // * CHECK IF RESPONSE HAS SPELLCHECK WARNING
  const spellCheckWarningSelector = '#spell-check-warning'
  const spellCheckOnly = 'Showing results for'
  const warningText = $(spellCheckWarningSelector).text().trim()
  const isAutocorrected = warningText.includes(spellCheckOnly)

  // * DEFAULT VALUES
  let firstArticleTitle = 'No articles found'
  let firstArticleUrl = null
  const complArticles = []

  if (!isAutocorrected) {
    const articles = $('#search-results > section > div.search-results-chunks > div > article')

    // * ITERATE THROUGH ARTICLES
    articles.each((index, article) => {
      const titleElement = $(article).find('.docsum-wrap > .docsum-content > a')
      const title = titleElement.text().trim()
      const href = titleElement.attr('href')

      if (title && href) {
        const match = href.match(/\/(\d+)\//)
        const articleId = match ? match[1] : null
        const articleUrl = articleId ? `https://pubmed.ncbi.nlm.nih.gov/${articleId}/` : null

        if (index === 0) {
          // First article
          firstArticleTitle = title
          firstArticleUrl = articleUrl
        } else if (index >= 1 && index <= 3) {
          // Second, third, and fourth articles
          complArticles.push({ title, url: articleUrl })
        }

        if (index >= 3) return false // Stop after the fourth article
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
    complArticles, // Array of second, third, and fourth articles
    count
  }
}

module.exports = getPubMedData
