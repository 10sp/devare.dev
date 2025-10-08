# Notion-inspired Todo List Cards

The Notion-inspired Todo List Cards feature allows users to create and manage todo lists directly within cards. This feature provides a Notion-like experience for task management within the Hackertab dashboard.

## How It Works

1. **Add a Todo List Card**: Select "Todo List" from the sources list in the settings
2. **Add Todos**: Use the input field at the top of the card to create new todo items
3. **Manage Todos**: Check/uncheck todos to mark them as complete/incomplete
4. **Edit Todo Text**: Click on a todo text to edit it inline
5. **Delete Todos**: Remove todo items you no longer need

## Features

- **Direct Todo Creation**: Add new todos directly without needing to enter an edit mode
- **Multi-line Todos**: Use Ctrl+Enter (or Cmd+Enter on Mac) to add line breaks within a todo
- **Todo Completion**: Check/uncheck todos to mark completion status
- **Inline Editing**: Click on todo text to edit it directly
- **Keyboard Shortcuts**:
  - Press Enter in the add todo input to quickly add new todos
  - Press Ctrl+Enter (or Cmd+Enter on Mac) to add line breaks within a todo
  - Press Enter when editing a todo to save changes
  - Press Escape when editing a todo to cancel changes
- **Visual Feedback**: Completed todos are shown with strikethrough styling
- **Clean UI**: Notion-inspired design for a familiar experience
- **Auto-save**: Todos are automatically saved as you add or modify them

## Technical Implementation

The Todo List Card is implemented as a React component that manages its own state for todo editing.

### Key Components

- `EditableContentCard.tsx`: The main card component that handles todo list functionality
- `EditableContentItem`: A sub-component that renders individual todo items

### Data Structure

Todo items are stored using the following structure:

```typescript
type EditableContent = {
  id: string
  title: string
  description: string
  url?: string
  tags?: string[]
  published_at?: number
  completed?: boolean
}
```

### Integration with Existing System

The todo list feature integrates with the existing card system through the `SupportedCardType` interface, which now includes an `editableContent` property:

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

To use the Todo List Card:

1. Navigate to the Sources settings page
2. Find "Todo List" in the list of available sources
3. Click the chip to add it to your selected sources
4. The card will appear on your dashboard
5. Add, complete, edit, or delete todos as needed using the input field and controls

## Keyboard Shortcuts

- **Enter**: Add a new todo when typing in the input field
- **Ctrl+Enter** (or **Cmd+Enter** on Mac): Add a line break within a todo
- **Enter**: Save changes when editing a todo title
- **Escape**: Cancel editing when editing a todo title

## Multi-line Todo Support

The todo list now supports multi-line todos, which is especially useful for:

- Writing detailed task descriptions
- Creating checklists within a single todo
- Adding notes or context to tasks

To create a multi-line todo:

1. Type your todo in the input field
2. Press Ctrl+Enter (or Cmd+Enter on Mac) to add a line break
3. Continue typing on the new line
4. Press Enter to save the multi-line todo

When editing an existing todo:

1. Click on the todo to enter edit mode
2. If it's a single-line todo, it will start as an input field
3. Press Ctrl+Enter (or Cmd+Enter on Mac) to convert it to a textarea for multi-line editing
4. Add your line breaks as needed
5. Press Enter to save the changes

## Future Enhancements

Possible future enhancements for this feature include:

- Due dates for todos
- Priority levels for todos
- Sub-tasks support
- Tagging system for better organization
- Search functionality within todo lists
- Sync capabilities to save todos across devices
