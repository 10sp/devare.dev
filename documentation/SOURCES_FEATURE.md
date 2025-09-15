# Sources Management Feature

This document explains the enhanced sources management feature that allows users to add and remove both built-in and custom sources.

## Features

### 1. Remove Built-in Sources

Users can now remove built-in sources (like GitHub, Hacker News, etc.) from their feed:

- Click the 'x' button on any source chip in the Sources settings
- Confirm the removal in the confirmation dialog
- The source will be removed from the feed but can be added back anytime

### 2. Remove Custom RSS Sources

Users can delete custom RSS sources they've added:

- Click the 'x' button on any custom RSS source chip
- Confirm the deletion in the confirmation dialog
- The source will be completely removed from the application

### 3. Add Custom RSS Sources

Users can add new sources via RSS feeds:

- Enter a valid RSS feed URL in the "Add new Source" section
- Click "Add" to include the source in their feed

## Implementation Details

### Changes Made

1. **SourceSettings.tsx**:

   - Modified to allow removal of all sources, not just custom RSS sources
   - Enhanced confirmation dialog to differentiate between removing and deleting sources
   - Updated logic to handle removal of built-in sources differently from custom sources

2. **types/index.ts**:

   - Added `isCustom` property to the `Option` type to distinguish between built-in and custom sources

3. **ChipsSet Component**:
   - Updated to show remove buttons for all sources that have `removeable: true`

## How It Works

1. **Removing Built-in Sources**:

   - When a user removes a built-in source, it's simply removed from their selected cards
   - The source remains available in the application and can be added back anytime
   - No data is deleted, only the user's selection is modified

2. **Deleting Custom Sources**:

   - When a user deletes a custom RSS source, it's completely removed from their profile
   - The source data is deleted from local storage
   - The source cannot be recovered unless the RSS feed is added again

3. **Adding Sources**:
   - Users can add new RSS sources through the "Add new Source" section
   - The RSS feed is validated and added to the user's custom sources
   - The source is automatically selected and added to the feed

## User Experience

The feature maintains a consistent user experience:

- All sources that can be removed show a remove button
- Confirmation dialogs explain the action (remove vs delete)
- Visual feedback is provided when actions are completed
- Users can easily undo removals by re-adding sources

## Technical Notes

- The implementation maintains backward compatibility
- No existing functionality is broken
- Performance impact is minimal
- All changes are persisted in local storage
