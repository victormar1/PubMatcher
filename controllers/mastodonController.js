// controllers/exportPdfController.js

const axios = require('axios')

exports.getTimeline = async (req, res) => {
  try {
    const accountId = '114393723893979236'
    const instance = 'mastodon.social'
    const limit = req.query.limit || 20

    const response = await axios.get(`https://${instance}/api/v1/accounts/${accountId}/statuses`, {
      params: {
        limit: limit,
        exclude_replies: req.query.excludeReplies === 'true',
        exclude_reblogs: req.query.excludeReblogs === 'true'
      }
    })

    res.json(response.data)
  } catch (error) {
    console.error('Error fetching timeline:', error)
    res.status(500).send('Error fetching timeline')
  }
}
