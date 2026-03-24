const { cacheGet, cacheSet, cacheClear } = require('../utils/cache')

describe('cache', () => {
  beforeEach(() => {
    cacheClear()
  })

  test('returns undefined for missing keys', () => {
    expect(cacheGet('nonexistent')).toBeUndefined()
  })

  test('stores and retrieves values', () => {
    cacheSet('key1', { data: 'test' })
    expect(cacheGet('key1')).toEqual({ data: 'test' })
  })

  test('returns undefined for expired entries', () => {
    cacheSet('expired', 'value', 1) // 1ms TTL
    // Wait for expiry
    return new Promise((resolve) => {
      setTimeout(() => {
        expect(cacheGet('expired')).toBeUndefined()
        resolve()
      }, 10)
    })
  })

  test('cacheClear removes all entries', () => {
    cacheSet('a', 1)
    cacheSet('b', 2)
    cacheClear()
    expect(cacheGet('a')).toBeUndefined()
    expect(cacheGet('b')).toBeUndefined()
  })
})
