# Sources Import/Export Feature

## Overview

The Sources Import/Export feature allows you to backup your current source configuration or share it with others. You can export your selected sources and custom RSS feeds, then import them on another device or share them with other HackerTab users.

## How to Use

### Exporting Sources

1. Navigate to the Settings page
2. Go to the Sources tab
3. Click the "Export Sources" button
4. Save the downloaded JSON file to your device

### Importing Sources

1. Navigate to the Settings page
2. Go to the Sources tab
3. Click the "Import Sources" button
4. Select a previously exported JSON file
5. Confirm the import action

## File Format

The exported file is a JSON document with the following structure:

```json
{
  "cards": [
    {
      "id": 0,
      "name": "github",
      "type": "supported"
    }
  ],
  "userCustomCards": [
    {
      "feedUrl": "https://example.com/rss",
      "label": "Example RSS Feed",
      "value": "example-rss-feed",
      "analyticsTag": "example-rss-feed",
      "link": "https://example.com",
      "type": "rss",
      "icon": "icon-url"
    }
  ],
  "exportDate": "2025-01-01T00:00:00.000Z",
  "version": "1.0"
}
```

## Use Cases

- Backup your source configuration
- Transfer your sources to another device
- Share your favorite sources with friends
- Create different source profiles for different contexts

## Notes

- Importing sources will replace your current source configuration
- Make sure to export your current sources before importing if you want to keep a backup
- Only valid JSON files exported by HackerTab will work with the import feature
