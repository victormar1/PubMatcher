// controllers/exportPdfController.js
require('dotenv').config()
const axios = require('axios')

const INSTANCE = 'mastodon.social'
const TOKEN = process.env.MASTODON_TOKEN
const ACCOUNT_ID = '114393723893979236'

if (!TOKEN) {
  throw new Error('MASTODON_TOKEN is missing in .env')
}

const masto = axios.create({
  baseURL: `https://${INSTANCE}/api/v1/`,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'User-Agent': 'PubMatcher/1.0 (+https://www.pubmatcher.fr)'
  },
  timeout: 10_000
})

exports.getTimeline = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 40)
    const excludeReplies = req.query.excludeReplies === 'true'
    const excludeReblogs = req.query.excludeReblogs === 'true'

    const { data } = await masto.get(`accounts/${ACCOUNT_ID}/statuses`, {
      params: {
        limit,
        exclude_replies: excludeReplies,
        exclude_reblogs: excludeReblogs
      }
    })

    res.json(data)
  } catch (err) {
    console.error('Error fetching Mastodon timeline:', err.response?.status, err.message)
    const code = err.response?.status || 500
    res.status(code).json({ error: 'Unable to fetch Mastodon timeline' })
  }
}
