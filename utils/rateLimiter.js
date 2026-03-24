const RATE_DELAY_MS = 350 // Stay under 3 req/s without NCBI API key
const MAX_RETRIES = 2
const BASE_BACKOFF_MS = 1000

/**
 * Queue-based rate limiter with retry logic.
 *
 * Uses a mutex (promise chain) to serialize concurrent requests,
 * preventing race conditions on the timing check. All callers
 * can fire requests concurrently — the queue ensures proper spacing.
 *
 * Retries on 429 (rate limited) and 5xx (server errors) with
 * exponential backoff: 1s, 2s.
 */
class NcbiRateLimiter {
  constructor(minDelayMs = RATE_DELAY_MS) {
    this.minDelayMs = minDelayMs
    this.lastRequestTime = 0
    this.mutex = Promise.resolve()
  }

  get(axios, url, options = {}) {
    return new Promise((resolve, reject) => {
      this.mutex = this.mutex.then(async () => {
        try {
          const result = await this._executeWithRetry(axios, url, options)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  async _executeWithRetry(axios, url, options) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        await this._waitForSlot()
        this.lastRequestTime = Date.now()
        return await axios.get(url, { timeout: 15000, ...options })
      } catch (error) {
        const isLastAttempt = attempt === MAX_RETRIES
        if (isLastAttempt || !this._isRetryable(error)) {
          throw error
        }
        const backoffMs = BASE_BACKOFF_MS * Math.pow(2, attempt)
        await new Promise((r) => setTimeout(r, backoffMs))
      }
    }
  }

  async _waitForSlot() {
    const now = Date.now()
    const elapsed = now - this.lastRequestTime
    if (elapsed < this.minDelayMs) {
      await new Promise((r) => setTimeout(r, this.minDelayMs - elapsed))
    }
  }

  _isRetryable(error) {
    if (!error.response) return true // Network errors
    const status = error.response.status
    return status === 429 || status >= 500
  }
}

// Shared singleton — all NCBI calls (PubMed, ClinVar) go through this
let ncbiLimiter = new NcbiRateLimiter()

function rateLimitedGet(axios, url, options = {}) {
  return ncbiLimiter.get(axios, url, options)
}

function resetLimiter() {
  ncbiLimiter = new NcbiRateLimiter()
}

module.exports = { rateLimitedGet, NcbiRateLimiter, resetLimiter }
