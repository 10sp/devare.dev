# Build Chrome Extension Script
Write-Host "Building Chrome Extension..."

# Remove previous build artifacts
if (Test-Path "chrome_extension_fixed.zip") {
    Remove-Item -Path "chrome_extension_fixed.zip" -Force
    Write-Host "Removed previous chrome_extension_fixed.zip"
}

# Ensure directories exist
if (!(Test-Path "dist")) {
    New-Item -ItemType Directory -Path "dist" | Out-Null
}

if (!(Test-Path "chrome_extension")) {
    New-Item -ItemType Directory -Path "chrome_extension" | Out-Null
}

# Create RSS Finder directory structure
if (!(Test-Path "dist\src\features\rssFinder")) {
    New-Item -ItemType Directory -Path "dist\src\features\rssFinder" -Force | Out-Null
}

if (!(Test-Path "chrome_extension\src\features\rssFinder")) {
    New-Item -ItemType Directory -Path "chrome_extension\src\features\rssFinder" -Force | Out-Null
}

# Create or update RSS Finder content script
Write-Host "Creating/updating RSS Finder content script..."
$contentScript = @'
/**
 * Content script that runs on web pages to detect RSS feeds
 * This script is injected into web pages by the browser extension
 */

// Function to detect RSS feeds in the current page
const detectRssFeedsInPage = () => {
  const feeds = [];

  // Look for RSS feed links in the document head
  const linkElements = document.querySelectorAll('link[rel="alternate"][type*="xml"]');

  linkElements.forEach((link) => {
    const href = link.getAttribute('href');
    const type = link.getAttribute('type') || 'application/rss+xml';
    const title = link.getAttribute('title') || document.title;

    if (href) {
      try {
        // Resolve relative URLs
        const absoluteUrl = new URL(href, window.location.href).href;
        feeds.push({
          url: absoluteUrl,
          title: title,
          type: type,
        });
      } catch (e) {
        // Ignore invalid URLs
        console.warn('Invalid RSS feed URL:', href);
      }
    }
  });

  // Also check for common RSS feed locations
  const commonPaths = ['/rss', '/rss.xml', '/feed', '/feed.xml', '/atom.xml'];

  commonPaths.forEach((path) => {
    try {
      const feedUrl = new URL(path, window.location.href).href;
      // Check if this URL is already in our feeds list
      if (!feeds.some((feed) => feed.url === feedUrl)) {
        feeds.push({
          url: feedUrl,
          title: `${document.title} RSS Feed`,
          type: 'application/rss+xml',
        });
      }
    } catch (e) {
      // Ignore errors for common paths
    }
  });

  return feeds;
};

// Function to show notification to user
const showRssNotification = (feeds) => {
  // Check if notification already exists
  if (document.getElementById('devare-rss-notification')) {
    return;
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'devare-rss-notification';
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
  `;

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
  `;

  document.body.appendChild(notification);

  // Add event listeners
  document.getElementById('rss-close-btn')?.addEventListener('click', () => {
    document.body.removeChild(notification);
  });

  document.getElementById('rss-ignore-btn')?.addEventListener('click', () => {
    document.body.removeChild(notification);
  });

  document.getElementById('rss-add-btn')?.addEventListener('click', () => {
    // Send message to background script to add feeds
    chrome.runtime.sendMessage({
      type: 'ADD_RSS_FEEDS',
      feeds: feeds,
      sourceUrl: window.location.href,
      sourceTitle: document.title,
    });

    // Show confirmation
    const addBtn = document.getElementById('rss-add-btn');
    if (addBtn) {
      addBtn.textContent = 'Added!';
      addBtn.style.background = '#10b981';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 1000);
    }
  });
};

// Main function to run when page loads
const initRssDetection = () => {
  // Wait for document to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runDetection);
  } else {
    runDetection();
  }

  function runDetection() {
    const feeds = detectRssFeedsInPage();

    // If feeds are found, show notification
    if (feeds.length > 0) {
      // Add small delay to ensure page is fully loaded
      setTimeout(() => {
        showRssNotification(feeds);
      }, 1000);
    }
  }
};

// Run the detection
initRssDetection();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CHECK_RSS_FEEDS') {
    const feeds = detectRssFeedsInPage();
    sendResponse({ feeds: feeds });
  }
  return true;
});
'@

# Write content script using a more reliable method
$contentScript | Out-File -FilePath "dist\src\features\rssFinder\contentScript.js" -Encoding UTF8 -Force

# Create or update RSS Finder background script
Write-Host "Creating/updating RSS Finder background script..."
$backgroundScript = @'
/**
 * Background script for the RSS feed finder browser extension
 * Handles communication between content scripts and the main extension
 */

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'ADD_RSS_FEEDS') {
    // Handle adding RSS feeds to HackerTab
    handleAddRssFeeds(request.feeds, request.sourceUrl, request.sourceTitle);
    sendResponse({ success: true });
  }
  return true;
});

// Function to handle adding RSS feeds
const handleAddRssFeeds = async (feeds, sourceUrl, sourceTitle) => {
  try {
    // Store the feeds in chrome storage for the HackerTab extension to pick up
    const storageKey = 'rss_feeds_to_add';

    // Get existing feeds to add
    const result = await chrome.storage.local.get(storageKey);
    const existingFeeds = result[storageKey] || [];

    // Add new feeds
    const updatedFeeds = [...existingFeeds, ...feeds];

    // Save to storage
    await chrome.storage.local.set({ [storageKey]: updatedFeeds });

    // Optionally, send a message to the HackerTab extension to refresh
    // This would require the HackerTab extension to listen for this message
    chrome.runtime
      .sendMessage({
        type: 'REFRESH_HACKERTAB_RSS_FEEDS',
        feeds: feeds,
      })
      .catch(() => {
        // Ignore errors if HackerTab is not listening
      });

    console.log('RSS feeds saved for addition to HackerTab');
  } catch (error) {
    console.error('Error handling RSS feeds:', error);
  }
};

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
          console.error('Error injecting RSS detection script:', error);
        });
    }
  }
});

// Optional: Context menu integration
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu item
  chrome.contextMenus.create({
    id: 'check-rss-feeds',
    title: 'Check for RSS feeds on this page',
    contexts: ['page'],
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'check-rss-feeds' && tab?.id) {
    // Send message to content script to check for RSS feeds
    chrome.tabs.sendMessage(tab.id, { type: 'CHECK_RSS_FEEDS' }).catch((error) => {
      console.error('Error sending message to content script:', error);
    });
  }
});

// Listen for when HackerTab wants to get the feeds to add
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_RSS_FEEDS_TO_ADD') {
    chrome.storage.local.get('rss_feeds_to_add').then((result) => {
      const feeds = result['rss_feeds_to_add'] || [];
      sendResponse({ feeds: feeds });

      // Clear the storage after sending
      if (feeds.length > 0) {
        chrome.storage.local.remove('rss_feeds_to_add');
      }
    });
    return true; // Keep the message channel open for async response
  }
});
'@

# Write background script using a more reliable method
$backgroundScript | Out-File -FilePath "dist\src\features\rssFinder\backgroundScript.js" -Encoding UTF8 -Force

# Copy the files to chrome_extension directory
Write-Host "Copying files to chrome_extension directory..."

# Copy RSS Finder scripts
Copy-Item -Path "dist\src\features\rssFinder\contentScript.js" -Destination "chrome_extension\src\features\rssFinder\contentScript.js" -Force
Copy-Item -Path "dist\src\features\rssFinder\backgroundScript.js" -Destination "chrome_extension\src\features\rssFinder\backgroundScript.js" -Force

# Copy manifest and other necessary files
Copy-Item -Path "public\manifest.json" -Destination "chrome_extension\manifest.json" -Force
Copy-Item -Path "public\content.js" -Destination "chrome_extension\content.js" -Force

# Copy asset directories if they exist
if (Test-Path "public\logos") {
    if (Test-Path "chrome_extension\logos") {
        Remove-Item -Path "chrome_extension\logos" -Recurse -Force
    }
    Copy-Item -Path "public\logos" -Destination "chrome_extension\logos" -Recurse -Force
}

Write-Host "Chrome extension build completed successfully!"
Write-Host "Extension folder: chrome_extension"
Write-Host "To create a zip file, run: Compress-Archive -Path chrome_extension\* -DestinationPath chrome_extension_fixed.zip -Force"