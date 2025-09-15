# RSS Content Editor

The RSS Content Editor is a new feature that allows users to create custom cards based on selected content from RSS feeds. This feature enhances the flexibility of the RSS feed integration by enabling users to handpick specific articles they want to display in their custom cards.

## How It Works

1. **Find RSS Feeds**: Use the existing RSS Finder to discover RSS feeds on websites.
2. **Open Content Editor**: After finding a valid RSS feed, click the "Edit Content" button next to the feed.
3. **Select Articles**: The Content Editor will fetch articles from the RSS feed and display them. Select the articles you want to include in your custom card.
4. **Create Custom Card**: Click "Create Custom Card" to generate a new card containing only the selected articles.

## Features

- **Article Selection**: Choose specific articles from an RSS feed to include in your custom card
- **Preview**: See article details including title, description, author, and tags
- **Custom Card Creation**: Generate a new card type that displays only your selected content
- **Integration**: Custom cards integrate seamlessly with the existing card system

## Technical Implementation

The RSS Content Editor is implemented as a modal component that:

1. Fetches RSS feed content using the rss2json API
2. Displays articles in a selectable list
3. Creates custom cards with the `CustomContentRssCard` component
4. Stores custom content in the user preferences

### Key Components

- `RssContentEditor.tsx`: The main modal interface for selecting articles
- `CustomContentRssCard.tsx`: The card component that displays custom content
- `RssFinderModal.tsx`: Modified to include the "Edit Content" button

### Data Flow

1. User clicks "Edit Content" on a validated RSS feed
2. RssContentEditor modal opens and fetches articles from the feed
3. User selects desired articles
4. Custom card is created with selected articles stored in `customContent` property
5. Custom card is added to user preferences and displayed in the card layout

## Usage

To use the RSS Content Editor:

1. Navigate to the RSS Finder (typically through the settings or add sources interface)
2. Enter a website URL and click "Find Feeds"
3. Once feeds are found and validated, click "Edit Content" next to a feed
4. Select the articles you want to include in your custom card
5. Click "Create Custom Card"
6. Your new custom card will appear in your card layout

## API Integration

The RSS Content Editor uses the rss2json API to fetch and parse RSS feed content:

```
https://api.rss2json.com/v1/api.json?rss_url=[ENCODED_FEED_URL]
```

This service converts RSS feed XML into JSON format for easier processing.

## Custom Card Structure

Custom cards created with the RSS Content Editor have the following structure:

```typescript
{
  feedUrl: string,
  label: string,
  value: string,
  analyticsTag: string,
  link: string,
  type: 'rss',
  icon: string,
  customContent: Article[],
  component: CustomContentRssCard
}
```

The `customContent` property contains the selected articles, and the `component` property specifies that the `CustomContentRssCard` should be used to render the card.
