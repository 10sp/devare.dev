# Editing RSS Cards

This feature allows you to edit the content of existing custom RSS cards by selecting specific articles from the RSS feed.

## How to Edit an RSS Card

1. Navigate to the **Settings** page
2. Go to the **Sources** tab
3. Find your custom RSS card in the list of sources
4. Click the **"Edit Content"** button next to the card
5. The RSS Content Editor will open, showing articles from the RSS feed
6. Select the articles you want to include in your card
7. Click **"Update Card"** to save your changes

## Features

- **Article Selection**: Choose specific articles from an RSS feed to include in your custom card
- **Preview**: See article details including title, description, author, and tags
- **Flexible Updates**: Update your custom cards anytime with new content selections
- **Seamless Integration**: Edited cards integrate seamlessly with the existing card system

## Technical Implementation

The editing feature works by:

1. Opening the RSS Content Editor with the existing card data
2. Fetching fresh articles from the RSS feed
3. Allowing users to select which articles to include
4. Updating the `customContent` property of the existing card
5. Saving the updated card to user preferences

## Data Flow

1. User clicks "Edit Content" on a custom RSS card
2. RSS Content Editor opens with the existing card data
3. Editor fetches articles from the RSS feed
4. User selects desired articles
5. Card is updated with selected articles stored in `customContent` property
6. Updated card is saved to user preferences and displayed in the card layout

## Usage

To edit an existing RSS card:

1. Go to Settings > Sources
2. Find your custom RSS card
3. Click "Edit Content"
4. Select the articles you want to include
5. Click "Update Card"
6. Your card will now display only the selected articles
