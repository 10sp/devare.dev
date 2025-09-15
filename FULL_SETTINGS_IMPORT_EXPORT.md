# Full Settings Import/Export Feature

## Overview

The Full Settings Import/Export feature allows you to backup and restore your complete HackerTab configuration. This includes all your preferences, sources, customizations, and personal settings in a single operation.

## How to Use

### Exporting All Settings

1. Navigate to the Settings page
2. Go to the General Settings tab
3. Scroll down to the "Import/Export All Settings" section
4. Click the "Export Settings" button
5. Save the downloaded JSON file to your device

### Importing All Settings

1. Navigate to the Settings page
2. Go to the General Settings tab
3. Scroll down to the "Import/Export All Settings" section
4. Click the "Import Settings" button
5. Select a previously exported JSON file
6. Confirm the import action

## What's Included

The full settings export includes:

### General Preferences

- Layout mode (cards/grid)
- Theme (light/dark)
- Link opening behavior
- Listing mode (normal/compact)
- Maximum visible cards
- Do Not Disturb settings
- Organize mode state

### Sources Configuration

- Selected news sources
- Custom RSS feeds
- Source order and settings

### Topics/Tags

- Your selected programming languages and topics
- Tag preferences

### Search Engines

- AI prompt engines
- Custom search engine configurations

### Card Settings

- Individual card configurations
- Language and date range preferences per card

### Onboarding Data

- Onboarding completion status
- Initial setup preferences
- Account creation date

## File Format

The exported file is a JSON document with the following structure:

```json
{
  "layout": "cards",
  "theme": "dark",
  "openLinksNewTab": true,
  "listingMode": "normal",
  "maxVisibleCards": 4,
  "DNDDuration": "never",
  "isOrganizeMode": false,
  "cards": [...],
  "userCustomCards": [...],
  "userSelectedTags": [...],
  "promptEngine": "chatgpt",
  "promptEngines": [...],
  "cardsSettings": {...},
  "onboardingCompleted": true,
  "onboardingResult": {...},
  "firstSeenDate": 1700000000000
}
```

## Use Cases

- Complete backup of your HackerTab configuration
- Transfer all settings to another device
- Share your complete setup with friends or colleagues
- Restore your configuration after a browser reset
- Migrate between different HackerTab installations

## Notes

- Importing settings will replace your current configuration
- Make sure to export your current settings before importing if you want to keep a backup
- Only valid JSON files exported by HackerTab will work with the import feature
- Some settings may require a page refresh to take effect
