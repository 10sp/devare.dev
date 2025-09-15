/**
 * Content script that runs on web pages to detect RSS feeds
 * This script is injected into web pages by the browser extension
 */

// Function to detect RSS feeds in the current page
const detectRssFeedsInPage = (): Array<{ url: string; title: string; type: string }> => {
  const feeds: Array<{ url: string; title: string; type: string }> = []

  // Look for RSS feed links in the document head
  const linkElements = document.querySelectorAll('link[rel="alternate"][type*="xml"]')

  linkElements.forEach((link) => {
    const href = link.getAttribute('href')
    const type = link.getAttribute('type') || 'application/rss+xml'
    const title = link.getAttribute('title') || document.title

    if (href) {
      try {
        // Resolve relative URLs
        const absoluteUrl = new URL(href, window.location.href).href
        feeds.push({
          url: absoluteUrl,
          title: title,
          type: type,
        })
      } catch (e) {
        // Ignore invalid URLs
        console.warn('Invalid RSS feed URL:', href)
      }
    }
  })

  // Also check for common RSS feed locations
  const commonPaths = ['/rss', '/rss.xml', '/feed', '/feed.xml', '/atom.xml']

  commonPaths.forEach((path) => {
    try {
      const feedUrl = new URL(path, window.location.href).href
      // Check if this URL is already in our feeds list
      if (!feeds.some((feed) => feed.url === feedUrl)) {
        feeds.push({
          url: feedUrl,
          title: `${document.title} RSS Feed`,
          type: 'application/rss+xml',
        })
      }
    } catch (e) {
      // Ignore errors for common paths
    }
  })

  return feeds
}

// Function to show notification to user
const showRssNotification = (feeds: Array<{ url: string; title: string; type: string }>) => {
  // Check if notification already exists
  if (document.getElementById('devare-rss-notification')) {
    return
  }

  // Create notification element
  const notification = document.createElement('div')
  notification.id = 'devare-rss-notification'
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    background: #333;
    color: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    font-family: Arial, sans-serif;
    max-width: 350px;
    border-left: 4px solid #4f46e5;
  `

  notification.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
      <strong>RSS Feeds Found</strong>
      <button id="rss-close-btn" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px;">×</button>
    </div>
    <p>${feeds.length} RSS feed(s) detected on this page.</p>
    <div style="display: flex; gap: 10px; margin-top: 15px;">
      <button id="rss-add-btn" style="flex: 1; background: #4f46e5; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">
        Add to Devare
      </button>
      <button id="rss-ignore-btn" style="flex: 1; background: #555; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">
        Ignore
      </button>
    </div>
  `

  document.body.appendChild(notification)

  // Add event listeners
  document.getElementById('rss-close-btn')?.addEventListener('click', () => {
    document.body.removeChild(notification)
  })

  document.getElementById('rss-ignore-btn')?.addEventListener('click', () => {
    document.body.removeChild(notification)
  })

  document.getElementById('rss-add-btn')?.addEventListener('click', () => {
    // Send message to background script to add feeds
    chrome.runtime.sendMessage({
      type: 'ADD_RSS_FEEDS',
      feeds: feeds,
      sourceUrl: window.location.href,
      sourceTitle: document.title,
    })

    // Show confirmation
    const addBtn = document.getElementById('rss-add-btn')
    if (addBtn) {
      addBtn.textContent = 'Added!'
      addBtn.style.background = '#10b981'
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 1000)
    }
  })
}

// Main function to run when page loads
const initRssDetection = () => {
  // Wait for document to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runDetection)
  } else {
    runDetection()
  }

  function runDetection() {
    const feeds = detectRssFeedsInPage()

    // If feeds are found, show notification
    if (feeds.length > 0) {
      // Add small delay to ensure page is fully loaded
      setTimeout(() => {
        showRssNotification(feeds)
      }, 1000)
    }
  }
}

// Run the detection
initRssDetection()

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CHECK_RSS_FEEDS') {
    const feeds = detectRssFeedsInPage()
    sendResponse({ feeds: feeds })
  }
  return true
})
