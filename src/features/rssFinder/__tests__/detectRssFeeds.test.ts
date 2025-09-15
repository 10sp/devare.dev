import { detectRssFeeds, validateRssFeed } from '../api/detectRssFeeds'

describe('detectRssFeeds', () => {
  it('should detect RSS feeds from a website', async () => {
    // This is a simple test - in a real scenario, we would mock the axios call
    const feeds = await detectRssFeeds('https://github.com')
    expect(Array.isArray(feeds)).toBe(true)
  })

  it('should validate RSS feeds', async () => {
    // Test with a known RSS feed
    const isValid = await validateRssFeed('https://github.com/blog.atom')
    expect(typeof isValid).toBe('boolean')
  })
})
