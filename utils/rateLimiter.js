const RATE_DELAY_MS = 350 // Stay under 3 req/s without NCBI API key

let lastRequestTime = 0

async function rateLimitedGet(axios, url, options = {}) {
  const now = Date.now()
  const elapsed = now - lastRequestTime
  if (elapsed < RATE_DELAY_MS) {
    await new Promise((r) => setTimeout(r, RATE_DELAY_MS - elapsed))
  }
  lastRequestTime = Date.now()
  return axios.get(url, { timeout: 15000, ...options })
}

module.exports = { rateLimitedGet }
