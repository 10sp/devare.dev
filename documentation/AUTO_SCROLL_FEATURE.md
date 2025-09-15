.\script\build-chrome.bat
PS C:\Users\shivg\wkspace\web-experiments\hackertab.dev> .\script\build-chrome.bat
building extension for Chrome...
Generate Chrome manifest
Remove previous zipped extension
Install dependencies
yarn run v1.22.22
$ VITE_BUILD_TARGET=extension ./script/build.sh
'VITE_BUILD_TARGET' is not recognized as an internal or external command,
operable program or batch file.
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
# Auto-Scrolling Feature for Card Dragging

This document explains the implementation of the auto-scrolling feature when dragging cards in the Hackertab.dev application.

## Feature Overview

When users drag cards horizontally in the desktop layout, the application now automatically scrolls the container when the dragged card approaches the edges of the viewport. This provides a better user experience when rearranging cards that are not currently visible.

## Implementation Details

### Changes Made

1. **DesktopCards.tsx**:

   - Enabled auto-scrolling by setting `autoScroll={true}` in the DndContext component
   - Added a custom `handleDragMove` function that implements edge-based scrolling
   - The function calculates scroll intensity based on the distance from the container edges

2. **App.css**:
   - Added `scroll-behavior: smooth` to the `.Cards` class for smoother scrolling transitions

### How It Works

1. **Edge Detection**:

   - The feature detects when the mouse cursor is near the left or right edges of the card container
   - A threshold of 10% of the container width is used to define the scroll zones

2. **Scroll Intensity**:

   - The scrolling speed is proportional to how close the cursor is to the edge
   - The closer to the edge, the faster the scrolling

3. **Directional Scrolling**:
   - When the cursor is near the left edge, the container scrolls left
   - When the cursor is near the right edge, the container scrolls right
   - No scrolling occurs when the cursor is in the middle area

### Technical Implementation

The custom `handleDragMove` function:

```typescript
const handleDragMove = (event: any) => {
  if (!cardsWrapperRef.current) return

  const container = cardsWrapperRef.current
  const { clientX } = event
  const { left, right, width } = container.getBoundingClientRect()

  // Calculate edge thresholds (10% of container width)
  const threshold = width * 0.1
  const leftEdge = left + threshold
  const rightEdge = right - threshold

  // Scroll speed based on distance from edge
  const scrollSpeed = 10

  if (clientX < leftEdge) {
    // Scroll left
    const intensity = (leftEdge - clientX) / threshold
    container.scrollBy({ left: -scrollSpeed * intensity, behavior: 'smooth' })
  } else if (clientX > rightEdge) {
    // Scroll right
    const intensity = (clientX - rightEdge) / threshold
    container.scrollBy({ left: scrollSpeed * intensity, behavior: 'smooth' })
  }
}
```

### User Experience

1. **Seamless Interaction**:

   - Users can drag cards to any position without manually scrolling
   - Smooth scrolling provides a polished experience
   - Visual feedback through the dragged card's appearance

2. **Intuitive Behavior**:
   - Scrolling speed increases as the cursor gets closer to the edge
   - Natural feel similar to other drag-and-drop interfaces
   - No interference with normal dragging when not near edges

## Benefits

- Improved usability when managing many cards
- Eliminates the need to manually scroll while dragging
- Provides a professional, polished user experience
- Works consistently across different screen sizes
- Maintains all existing drag-and-drop functionality

## Technical Notes

- The implementation uses the existing @dnd-kit library
- No additional dependencies were required
- Performance impact is minimal
- The feature is only active during drag operations
- Compatible with all existing card types and layouts
