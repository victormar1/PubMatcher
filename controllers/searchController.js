const getData = require('../services/dataservice.js')
const crypto = require('crypto')
const pool = require('../models/db.js')
const getPubMedData = require('../utils/getPubMedData.js')
const getClinVarData = require('../utils/getClinVarData.js')

/**
 * Controller to handle search requests (GET and POST)
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
exports.search = async (req, res) => {
  try {
    const genes = req.method === 'POST' ? req.body.genes : req.query.genes
    const phenotypes = req.method === 'POST' ? req.body.phenotypes : req.query.phenotypes
    const userId = req.body.userId

    let query = null
    const queryHash = crypto
      .createHash('sha256')
      .update(`${genes.join(',')}:${phenotypes.join(',')}`)
      .digest('hex')

    // DB operations (optional - continue if DB unavailable)
    try {
      const queryInsert = await pool.query(
        `
            INSERT INTO researched_queries (query_hash, genes, phenotypes)
            VALUES ($1, $2, $3)
            ON CONFLICT (query_hash)
            DO UPDATE SET last_used_at = CURRENT_TIMESTAMP
            RETURNING *;
            `,
        [queryHash, genes.join(','), phenotypes.join(',')]
      )
      query = queryInsert.rows[0]

      if (userId && query) {
        await pool.query(
          'INSERT INTO search_history (user_id, query_id, timestamp) VALUES ($1, $2, CURRENT_TIMESTAMP)',
          [userId, query.id]
        )
      }
    } catch (dbError) {
      console.warn('DB unavailable, search continues without history/cache:', dbError.message)
    }

    // Fetch data from external APIs (core functionality)
    const queryParams = { body: { genes, phenotypes } }
    const apiResults = await getData(queryParams)

    // Save results in DB if available — but skip caching if any result has a fetch error
    // (otherwise users keep seeing the error/false-zero for the cache TTL)
    const hasErrors = Array.isArray(apiResults) && apiResults.some((r) => r && r.error)
    if (query && !hasErrors) {
      try {
        await pool.query('INSERT INTO query_results (query_id, result_data, expires_at) VALUES ($1, $2::jsonb, $3)', [query.id, JSON.stringify(apiResults), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)])
      } catch (dbError) {
        console.warn('Could not cache results:', dbError.message)
      }
    } else if (hasErrors) {
      console.warn('Skipping cache write: at least one result has a fetch error')
    }

    res.json({ cached: false, results: apiResults })
  } catch (error) {
    console.error('Error during search:', error)
    res.status(500).send('Internal Server Error')
  }
}
