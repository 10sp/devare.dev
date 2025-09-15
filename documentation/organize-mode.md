# Organize Mode

The organize mode allows users to easily reorder their cards in a grid layout.

## How to Use

1. Double-click on the drag handle (the three dots icon) in any card header to enter organize mode
2. Cards will be displayed in a grid layout with only their headers visible
3. Drag and drop cards to reorder them
4. Press ESC or click the "Exit Organize Mode" button to return to normal view

## Features

- Grid layout for better overview of all cards
- Drag and drop reordering
- Keyboard shortcut (ESC) to exit
- Visual indicator for draggable items
- Responsive design that works on different screen sizes

## Technical Implementation

The organize mode is implemented using:

- Zustand for global state management
- CSS Grid for the layout
- DnD Kit for drag and drop functionality
- Keyboard event listeners for ESC key handling

## Files Modified

- `src/components/Elements/Card/Card.tsx` - Added double-click handler and organize mode styling
- `src/components/Layout/DesktopCards.tsx` - Implemented grid layout and organize mode UI
- `src/stores/preferences.ts` - Added organize mode state to the global store
- `src/assets/App.css` - Added CSS styles for organize mode
- `src/components/Layout/DNDLayout/DNDLayout.css` - Added additional styling for organize mode
