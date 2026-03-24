const DEFAULT_TTL_MS = 60 * 60 * 1000 // 1 hour

const store = new Map()

function cacheGet(key) {
  const entry = store.get(key)
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return undefined
  }
  return entry.data
}

function cacheSet(key, data, ttlMs = DEFAULT_TTL_MS) {
  store.set(key, { data, expiresAt: Date.now() + ttlMs })
}

function cacheClear() {
  store.clear()
}

module.exports = { cacheGet, cacheSet, cacheClear }
