const { NcbiRateLimiter } = require('../utils/rateLimiter')

describe('NcbiRateLimiter', () => {
  test('serializes concurrent requests with minimum spacing', async () => {
    const limiter = new NcbiRateLimiter(50) // 50ms for fast tests
    const timestamps = []
    const mockAxios = {
      get: jest.fn(async () => {
        timestamps.push(Date.now())
        return { data: 'ok' }
      }),
    }

    // Fire 3 requests concurrently
    await Promise.all([
      limiter.get(mockAxios, 'http://a'),
      limiter.get(mockAxios, 'http://b'),
      limiter.get(mockAxios, 'http://c'),
    ])

    expect(timestamps).toHaveLength(3)
    // Each subsequent request should be at least ~50ms after the previous
    expect(timestamps[1] - timestamps[0]).toBeGreaterThanOrEqual(40)
    expect(timestamps[2] - timestamps[1]).toBeGreaterThanOrEqual(40)
  })

  test('retries on 429 with backoff', async () => {
    const limiter = new NcbiRateLimiter(10)
    const mockAxios = {
      get: jest
        .fn()
        .mockRejectedValueOnce({ response: { status: 429 }, message: '429' })
        .mockResolvedValueOnce({ data: 'success' }),
    }

    const result = await limiter.get(mockAxios, 'http://test')
    expect(result.data).toBe('success')
    expect(mockAxios.get).toHaveBeenCalledTimes(2)
  })

  test('retries on 500 server error', async () => {
    const limiter = new NcbiRateLimiter(10)
    const mockAxios = {
      get: jest
        .fn()
        .mockRejectedValueOnce({ response: { status: 500 }, message: '500' })
        .mockResolvedValueOnce({ data: 'recovered' }),
    }

    const result = await limiter.get(mockAxios, 'http://test')
    expect(result.data).toBe('recovered')
  })

  test('retries on network error (no response)', async () => {
    const limiter = new NcbiRateLimiter(10)
    const mockAxios = {
      get: jest
        .fn()
        .mockRejectedValueOnce(new Error('ECONNRESET'))
        .mockResolvedValueOnce({ data: 'ok' }),
    }

    const result = await limiter.get(mockAxios, 'http://test')
    expect(result.data).toBe('ok')
  })

  test('gives up after max retries', async () => {
    const limiter = new NcbiRateLimiter(10)
    const mockAxios = {
      get: jest.fn().mockRejectedValue({ response: { status: 429 }, message: '429' }),
    }

    await expect(limiter.get(mockAxios, 'http://test')).rejects.toMatchObject({
      message: '429',
    })
    // Initial + 2 retries = 3 total
    expect(mockAxios.get).toHaveBeenCalledTimes(3)
  }, 15000)

  test('does not retry on 4xx client errors (except 429)', async () => {
    const limiter = new NcbiRateLimiter(10)
    const mockAxios = {
      get: jest.fn().mockRejectedValue({ response: { status: 400 }, message: 'Bad Request' }),
    }

    await expect(limiter.get(mockAxios, 'http://test')).rejects.toMatchObject({
      message: 'Bad Request',
    })
    expect(mockAxios.get).toHaveBeenCalledTimes(1) // No retry
  })
})
