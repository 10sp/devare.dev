# Logo Update Guide

This document explains how to update the logos for the HackerTab project.

## New Logo Files

We've created new SVG logo files:

1. `public/logos/hackertab-logo.svg` - Main logo for use in the app
2. `public/favicon.svg` - Simplified logo for favicon use
3. `public/logos/logoVector-new.svg` - The original text-based logo you provided

## Updating PNG Logos

To update the PNG logo files, you'll need to convert the SVG files to PNG format in various sizes:

### Required Sizes

- 16x16 (logo16.png)
- 32x32 (logo32.png)
- 48x48 (logo48.png)
- 64x64 (logo64.png)
- 128x128 (logo128.png)
- 192x192 (logo192.png)
- 512x512 (logo512.png)

### Methods to Generate PNGs

1. **Online Converters**:

   - Use websites like https://svgtopng.com/ or https://cloudconvert.com/svg-to-png
   - Upload the SVG file and convert to the required sizes

2. **Command Line Tools**:

   - Install ImageMagick: `npm install -g imagemagick`
   - Convert with: `convert -background none -resize 128x128 public/logos/hackertab-logo.svg public/logos/logo128.png`

3. **Graphic Design Software**:
   - Use tools like Adobe Illustrator, Inkscape, or Figma
   - Export the SVG as PNG in the required sizes

## Files That Reference Logos

1. `public/base.manifest.json` - References PNG logos for browser extension
2. `public/web_manifest.json` - References SVG and PNG logos for web app
3. `index.html` - References favicon
4. `public/firefox.manifest.json` - Inherits from base manifest
5. `public/chrome.manifest.json` - Inherits from base manifest

## Implementation Steps

1. Generate all required PNG sizes from the new SVG logo
2. Replace the existing PNG files in `public/logos/` with the new ones
3. Update `public/web_manifest.json` to reference the new SVG logo:
   ```json
   {
     "src": "/logos/hackertab-logo.svg",
     "type": "image/svg+xml",
     "sizes": "128x128"
   }
   ```
4. Update `index.html` to reference the new favicon:
   ```html
   <link rel="icon" href="/favicon.svg" />
   ```
5. Test the extension and web app to ensure logos display correctly

## Logo Design Notes

The new `hackertab-logo.svg` features a simplified "HT" monogram:

- "H" formed with three rectangles (two vertical bars and one horizontal bar)
- "T" formed with two rectangles (one horizontal bar and one vertical bar)
- Black background with white foreground for contrast
- Rounded corners for a modern look
- Designed to be recognizable even at small sizes

The `favicon.svg` is an even more simplified version optimized for 32x32 display.
