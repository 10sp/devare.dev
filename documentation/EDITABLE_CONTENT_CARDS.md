# Editable Content Cards

The Editable Content Cards feature allows users to create and manage custom content directly within cards. This feature is useful for creating personal notes, bookmarks, or any other custom content that doesn't come from an external feed.

## How It Works

1. **Add an Editable Content Card**: Select "Editable Content" from the sources list in the settings
2. **Edit Mode**: Click the "Edit" button in the card header to enter edit mode
3. **Add Content**: Use the "+ Add Content" button to create new content items
4. **Edit Content**: Modify the title, description, and URL of each content item
5. **Save Changes**: Click "Save" to persist your changes

## Features

- **Create Custom Content**: Add your own notes, links, and information
- **Edit Existing Content**: Modify content items after they've been created
- **Delete Content**: Remove content items you no longer need
- **Rich Display**: Content is displayed with proper formatting in the card

## Technical Implementation

The Editable Content Card is implemented as a React component that manages its own state for content editing.

### Key Components

- `EditableContentCard.tsx`: The main card component that handles editing functionality
- `EditableContentItem`: A sub-component that renders individual content items

### Data Structure

Editable content is stored using the following structure:

```typescript
type EditableContent = {
  id: string
  title: string
  description: string
  url?: string
  tags?: string[]
  published_at?: number
}
```

### Integration with Existing System

The editable content feature integrates with the existing card system through the `SupportedCardType` interface, which now includes an `editableContent` property:

```typescript
export type SupportedCardType = {
  value: string
  analyticsTag: string
  label: string
  link?: string
  type: 'rss' | 'supported'
  component?: React.FunctionComponent<CardPropsType>
  feedUrl?: string
  icon?: React.ReactNode | string
  badge?: string
  customContent?: Article[]
  editableContent?: EditableContent[]
}
```

## Usage

To use the Editable Content Card:

1. Navigate to the Sources settings page
2. Find "Editable Content" in the list of available sources
3. Click the chip to add it to your selected sources
4. The card will appear on your dashboard
5. Click "Edit" in the card header to start editing
6. Add, modify, or delete content as needed
7. Click "Save" to persist your changes

## Future Enhancements

Possible future enhancements for this feature include:

- Rich text editing for content descriptions
- Image support for content items
- Tagging system for better organization
- Search functionality within editable content
- Sync capabilities to save content across devices
