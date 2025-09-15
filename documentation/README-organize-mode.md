# Card Organize Mode

This feature adds an organize mode to the Hackertab application that allows users to easily reorder their cards in a grid layout.

## Features

- Double-click on the drag handle in any card header to enter organize mode
- Cards are displayed in a responsive grid layout
- Drag and drop cards to reorder them
- Press ESC or click the "Exit Organize Mode" button to return to normal view

## Implementation Details

The organize mode is implemented by:

1. Adding a global state variable `isOrganizeMode` to the preferences store
2. Modifying the Card component to handle double-click events on the drag handle
3. Updating the DesktopCards component to display cards in a grid layout when in organize mode
4. Adding CSS styles for the organize mode layout
5. Implementing keyboard shortcuts (ESC) to exit organize mode

## How to Test

1. Start the application with `npm start`
2. Navigate to http://localhost:5174
3. Double-click on the drag handle (three dots icon) in any card header
4. Verify that the cards are displayed in a grid layout
5. Drag and drop cards to reorder them
6. Press ESC or click "Exit Organize Mode" to return to normal view

## Files Modified

- `src/components/Elements/Card/Card.tsx`
- `src/components/Layout/DesktopCards.tsx`
- `src/stores/preferences.ts`
- `src/assets/App.css`
- `src/components/Layout/DNDLayout/DNDLayout.css`
- `src/components/Layout/CardsLayout.tsx`
- `src/App.tsx`

## Future Improvements

- Add visual feedback during drag operations
- Implement touch support for mobile devices
- Add animations for entering/exiting organize mode
- Save the card order to localStorage
