# RSS Feed Finder Feature

The RSS Feed Finder is a browser extension feature that automatically detects RSS feeds on websites you visit and prompts you to add them to your HackerTab feed.

## How It Works

1. **Automatic Detection**: When you visit any webpage, the extension automatically scans for RSS feeds by:

   - Looking for `<link>` tags in the HTML head with RSS/Atom feed types
   - Checking common RSS feed locations like `/rss`, `/feed.xml`, etc.

2. **Notification**: If RSS feeds are found, a notification appears in the top-right corner of the page:

   - Shows the number of feeds detected
   - Provides options to "Add to HackerTab" or "Ignore"

3. **Adding Feeds**: When you choose to add feeds:
   - The feeds are stored in the browser's local storage
   - HackerTab retrieves these feeds and adds them to your custom sources
   - The feeds are immediately available in your HackerTab feed

## Manual RSS Finder

You can also manually search for RSS feeds:

1. Go to Settings > Sources
2. Click the "Find RSS Feeds" button
3. Enter a website URL to scan for RSS feeds
4. Select which feeds you want to add
5. Click "Add Selected Feed(s)"

## Technical Implementation

### Components

- **Content Script**: Runs on web pages to detect RSS feeds
- **Background Script**: Handles communication between content scripts and the main extension
- **API Utilities**: Functions to detect and validate RSS feeds
- **UI Components**: Modal for manual RSS feed search

### Files

- `src/features/rssFinder/contentScript.ts` - Detects RSS feeds on web pages
- `src/features/rssFinder/backgroundScript.ts` - Handles extension communication
- `src/features/rssFinder/api/detectRssFeeds.ts` - API utilities for feed detection
- `src/features/rssFinder/components/RssFinderModal.tsx` - UI for manual feed search
- `src/features/rssFinder/components/rssFinderModal.css` - Styling for the modal

### Permissions

The extension requires the following permissions:

- `storage` - To store detected feeds
- `scripting` - To inject content scripts
- `tabs` - To access web pages
- `contextMenus` - For right-click menu integration

## Troubleshooting

If the RSS finder is not working:

1. Ensure the extension has all required permissions
2. Check that the website actually has RSS feeds
3. Try manually searching for feeds using the "Find RSS Feeds" button in Settings
4. Check the browser console for any error messages
