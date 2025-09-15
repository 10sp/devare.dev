# RSS Content Reordering Feature

## Overview

This feature allows users to restructure and organize the content within RSS cards using drag and drop functionality. Instead of editing the content itself, users can reorder the articles/feed items within a custom RSS card to better organize their feed.

## How It Works

1. **Create Custom RSS Cards**: Users can create custom RSS cards using the existing RSS Content Editor functionality
2. **Enter Organize Mode**: Users can enter the organize mode to enable drag and drop functionality
3. **Reorder Articles**: Within a custom RSS card, users can drag and drop articles to reorder them
4. **Save Order**: The new order is automatically saved to user preferences

## Technical Implementation

### Components

1. **CustomContentRssCard**: Modified to support drag and drop reordering of articles
2. **SortableArticleItem**: Wrapper component that makes individual articles sortable
3. **Preferences Store**: Updated to save the reordered article content

### Key Features

- Uses @dnd-kit library for drag and drop functionality
- Only active when in organize mode
- Preserves all existing functionality of custom RSS cards
- Automatically saves the new order to user preferences

### Data Flow

1. Custom RSS card loads articles from `customContent` property
2. Articles are wrapped in `SortableArticleItem` components
3. When in organize mode, drag handles appear for each article
4. User can drag and drop articles to reorder them
5. On drop, the new order is saved to user preferences

## Usage

To use the RSS content reordering feature:

1. Create a custom RSS card using the RSS Content Editor
2. Enter organize mode by clicking the organize button
3. Drag and drop articles within the card to reorder them
4. Exit organize mode when finished

## API Integration

The feature uses the existing user preferences store to save the reordered content:

```typescript
updateUserCustomCards(
  userCustomCards.map((card) =>
    card.value === meta.value ? { ...card, customContent: newArticles } : card
  )
)
```

## Future Improvements

- Add visual feedback during drag operations
- Implement keyboard navigation for accessibility
- Add undo/redo functionality
- Support for grouping articles within cards
