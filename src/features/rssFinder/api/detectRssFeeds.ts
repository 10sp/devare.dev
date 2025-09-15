import axios from 'axios'

export type RssFeed = {
  url: string
  title: string
  type: string
}

/**
 * Detect RSS feeds on a given webpage
 * @param url - The URL of the webpage to check for RSS feeds
 * @returns Promise resolving to an array of detected RSS feeds
 */
export const detectRssFeeds = async (url: string): Promise<RssFeed[]> => {
  try {
    // For browser extension, we'll use the background script to avoid CORS issues
    // For web version, we might need a proxy

    // First, let's try to get the page content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RSS Feed Detector/1.0)',
      },
    })

    const html = response.data
    const feeds: RssFeed[] = []

    // Look for RSS feed links in the HTML
    const linkRegex =
      /<link[^>]*rel=["'](alternate|feed)["'][^>]*href=["']([^"']+)["'][^>]*type=["'](application\/rss\+xml|application\/atom\+xml|application\/rdf\+xml|application\/xml\+rss|text\/xml)[^>]*>/gi
    let match

    while ((match = linkRegex.exec(html)) !== null) {
      const [, , href, type] = match
      if (href) {
        // Resolve relative URLs
        const feedUrl = new URL(href, url).href
        // Try to extract title from the link tag or use a default
        const titleMatch = match[0].match(/title=["']([^"']+)["']/i)
        const title = titleMatch ? titleMatch[1] : `RSS Feed (${type})`

        feeds.push({
          url: feedUrl,
          title,
          type,
        })
      }
    }

    // Also look for common RSS feed locations
    const commonPaths = [
      '/rss',
      '/rss.xml',
      '/feed',
      '/feed.xml',
      '/atom.xml',
      '/rssfeed',
      '/rss/feed.xml',
    ]

    for (const path of commonPaths) {
      try {
        const feedUrl = new URL(path, url).href
        // Check if this URL is already in our feeds list
        if (!feeds.some((feed) => feed.url === feedUrl)) {
          // We could do a HEAD request to check if the feed exists
          // But for now, we'll just add it as a potential feed
          feeds.push({
            url: feedUrl,
            title: `RSS Feed (${path})`,
            type: 'application/rss+xml',
          })
        }
      } catch (e) {
        // Ignore errors for common paths
      }
    }

    return feeds
  } catch (error) {
    console.error('Error detecting RSS feeds:', error)
    return []
  }
}

/**
 * Validate an RSS feed by fetching and parsing it
 * @param feedUrl - The URL of the RSS feed to validate
 * @returns Promise resolving to true if the feed is valid
 */
export const validateRssFeed = async (feedUrl: string): Promise<boolean> => {
  try {
    const response = await axios.get(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RSS Feed Validator/1.0)',
      },
    })

    const xml = response.data

    // Simple check for RSS/Atom indicators
    return (
      xml.includes('<rss') ||
      xml.includes('<feed') ||
      xml.includes('<rdf:RDF') ||
      xml.includes('<?xml')
    )
  } catch (error) {
    console.error('Error validating RSS feed:', error)
    return false
  }
}
