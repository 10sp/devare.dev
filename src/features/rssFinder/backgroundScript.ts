/**
 * Background script for the RSS feed finder browser extension
 * Handles communication between content scripts and the main extension
 */

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'ADD_RSS_FEEDS') {
    // Handle adding RSS feeds to Devare
    handleAddRssFeeds(request.feeds, request.sourceUrl, request.sourceTitle)
    sendResponse({ success: true })
  }
  return true
})

// Function to handle adding RSS feeds
const handleAddRssFeeds = async (
  feeds: Array<{ url: string; title: string; type: string }>,
  sourceUrl: string,
  sourceTitle: string
) => {
  try {
    // Store the feeds in chrome storage for the Devare extension to pick up
    const storageKey = 'rss_feeds_to_add'

    // Get existing feeds to add
    const result = await chrome.storage.local.get(storageKey)
    const existingFeeds = result[storageKey] || []

    // Add new feeds
    const updatedFeeds = [...existingFeeds, ...feeds]

    // Save to storage
    await chrome.storage.local.set({ [storageKey]: updatedFeeds })

    // Optionally, send a message to the Devare extension to refresh
    // This would require the Devare extension to listen for this message
    chrome.runtime
      .sendMessage({
        type: 'REFRESH_HACKERTAB_RSS_FEEDS',
        feeds: feeds,
      })
      .catch(() => {
        // Ignore errors if Devare is not listening
      })

    console.log('RSS feeds saved for addition to Devare')
  } catch (error) {
    console.error('Error handling RSS feeds:', error)
  }
}

// Optional: Tab update listener to detect when user navigates to a new page
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only proceed if the page has finished loading
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if this is a web page (not a chrome:// or extension page)
    if (tab.url.startsWith('http') || tab.url.startsWith('https')) {
      // Inject content script to check for RSS feeds
      chrome.scripting
        .executeScript({
          target: { tabId: tabId },
          files: ['src/features/rssFinder/contentScript.js'],
        })
        .catch((error) => {
          console.error('Error injecting RSS detection script:', error)
        })
    }
  }
})

// Optional: Context menu integration
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu item
  chrome.contextMenus.create({
    id: 'check-rss-feeds',
    title: 'Check for RSS feeds on this page',
    contexts: ['page'],
  })
})

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'check-rss-feeds' && tab?.id) {
    // Send message to content script to check for RSS feeds
    chrome.tabs.sendMessage(tab.id, { type: 'CHECK_RSS_FEEDS' }).catch((error) => {
      console.error('Error sending message to content script:', error)
    })
  }
})

// Listen for when Devare wants to get the feeds to add
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_RSS_FEEDS_TO_ADD') {
    chrome.storage.local.get('rss_feeds_to_add').then((result) => {
      const feeds = result['rss_feeds_to_add'] || []
      sendResponse({ feeds: feeds })

      // Clear the storage after sending
      if (feeds.length > 0) {
        chrome.storage.local.remove('rss_feeds_to_add')
      }
    })
    return true // Keep the message channel open for async response
  }
})
