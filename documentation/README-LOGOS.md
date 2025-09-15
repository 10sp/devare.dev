# HackerTab Logo Update

This folder contains the new logo assets for HackerTab.

## Logo Files

1. `devare-logo.svg` - Main logo for the application
2. `favicon.svg` - Simplified logo for favicon use
3. `logoVector-new.svg` - The original text-based logo you provided

## Updating Logos

To update the logos in the application:

1. **Install dependencies** (if not already installed):

   ```bash
   npm install puppeteer
   ```

2. **Generate PNG logos**:

   ```bash
   npm run generate-logos
   ```

   This will generate all required PNG sizes:

   - 16x16 (logo16.png)
   - 32x32 (logo32.png)
   - 48x48 (logo48.png)
   - 64x64 (logo64.png)
   - 128x128 (logo128.png)
   - 192x192 (logo192.png)
   - 512x512 (logo512.png)

3. **Replace existing PNG files** in the `public/logos/` directory with the newly generated ones.

## Manual Conversion

If you prefer to convert the SVG to PNG manually:

1. Use an online converter like https://svgtopng.com/
2. Or use graphic design software like Figma, Adobe Illustrator, or Inkscape
3. Export the SVG as PNG in the required sizes

## Testing

After updating the logos:

1. Build the extension:

   ```bash
   npm run build:ext:powershell
   ```

2. Load the extension in your browser and verify the icons display correctly
3. Test the web app to ensure favicons and manifest icons work properly

## Logo Design

The new logo is a simplified "HT" monogram:

- "H" formed with three rectangles (two vertical bars and one horizontal bar)
- "T" formed with two rectangles (one horizontal bar and one vertical bar)
- Black background with white foreground for contrast
- Rounded corners for a modern look
- Designed to be recognizable even at small sizes (16x16)

## Troubleshooting

If you encounter issues running the logo generation script:

1. Make sure you have installed puppeteer:

   ```bash
   npm install puppeteer
   ```

2. If you get permissions errors, try running with elevated privileges

3. If the script fails to launch Chrome, you may need to install Chrome or Chromium

4. For alternative solutions, use online SVG to PNG converters as described in the manual conversion section
