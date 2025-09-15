# Prompt Engines Management Feature

This document explains the enhanced prompt engines management feature that allows users to add and remove both built-in and custom AI prompt engines.

## Features

### 1. Remove Built-in Prompt Engines

Users can now remove built-in prompt engines (like ChatGPT, Claude, etc.) from their selection:

- Click the 'x' button on any prompt engine chip in the AI Prompt Engines settings
- Confirm the removal in the confirmation dialog
- The engine will be removed from the selection but can be added back anytime

### 2. Remove Custom Prompt Engines

Users can delete custom prompt engines they've added:

- Click the 'x' button on any custom prompt engine chip
- Confirm the deletion in the confirmation dialog
- The engine will be completely removed from the application

### 3. Add Custom Prompt Engines

Users can add new AI prompt engines:

- Enter a valid AI prompt engine URL in the "Add new AI prompt Engine" section
- Click "Add" to include the engine in their selection

## Implementation Details

### Changes Made

1. **SearchEngineSettings.tsx**:

   - Modified to allow removal of all prompt engines, not just custom ones
   - Enhanced confirmation dialog to differentiate between removing and deleting engines
   - Updated logic to handle removal of built-in engines differently from custom engines

2. **SearchEngines.ts**:

   - Added `default: true` property to all built-in AI prompt engines
   - This allows the application to distinguish between built-in and custom engines

3. **AddSearchEngine.tsx**:
   - No changes needed as it already properly adds custom engines with `default: false`

## How It Works

1. **Removing Built-in Engines**:

   - When a user removes a built-in engine, it's simply removed from their selected engines
   - The engine remains available in the application and can be added back anytime
   - No data is deleted, only the user's selection is modified

2. **Deleting Custom Engines**:

   - When a user deletes a custom prompt engine, it's completely removed from their profile
   - The engine data is deleted from local storage
   - The engine cannot be recovered unless the URL is added again

3. **Adding Engines**:
   - Users can add new prompt engines by providing a valid URL
   - The URL is validated and added to the user's custom engines
   - The engine is automatically selected

## User Experience

The feature maintains a consistent user experience:

- All engines that can be removed show a remove button
- Confirmation dialogs explain the action (remove vs delete)
- Visual feedback is provided when actions are completed
- Users can easily undo removals by re-adding engines

## Technical Notes

- The implementation maintains backward compatibility
- No existing functionality is broken
- Performance impact is minimal
- All changes are persisted in local storage

## Default Engines

The following built-in prompt engines are available by default:

- ChatGPT (https://chatgpt.com/?q=)
- Claude (https://claude.ai/new?q=)
- Mistral (https://chat.mistral.ai/chat?q)
- Perplexity (https://www.perplexity.ai/search?q=)
- Grok (https://grok.com/?q=)

All of these can now be removed and re-added as needed.
