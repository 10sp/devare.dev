# Remove Ads from Hackertab

This document describes the changes made to remove all advertisements from the Hackertab application.

## Changes Made

### 1. Removed Ad Module

- Deleted the entire `src/features/adv` folder and all its contents
- Removed all ad-related components, utilities, and types

### 2. Updated Card Component

- Removed the `AdvBanner` import and usage
- Removed the ad loading logic and useEffect hook
- Simplified the component by removing ad-related state

### 3. Updated Preferences Store

- Removed `advStatus` property from `UserPreferencesState`
- Removed `setAdvStatus` action from `UserPreferencesStoreActions`
- Removed ad verification logic from the App component

### 4. Updated App Component

- Removed ad verification utilities and related imports
- Removed `setAdvStatus` and `verifyAdvStatus` calls
- Simplified the useEffect hook

### 5. Updated Remote Config Store

- Set `adsConfig.enabled` to `false` by default

### 6. Updated Marketing Banner Component

- Removed `advStatus` from user attributes

### 7. Removed Ad Feed Item

- Deleted `AdvFeedItem.tsx` component
- Updated `FeedItem.tsx` to remove ad type handling

### 8. Updated Types

- Removed `AdFeedItemData` type
- Removed `ad` type from `FeedItemData` union type
- Removed `withAds` property from `CardPropsType`

### 9. Updated Card Components

- Removed `withAds` parameter from all card components:
  - AICard
  - GithubCard
  - MediumCard
  - And all other card components

### 10. Updated Layout Components

- Removed `withAds` parameter from `DesktopCards` and `MobileCards` components
- Removed ad positioning logic

## Verification

The application has been tested and verified to work correctly without any ad-related functionality. All components load properly and there are no console errors related to missing ad modules.

## Benefits

- Cleaner user interface without advertisements
- Improved performance by removing ad loading logic
- Reduced bundle size by removing ad-related code
- Enhanced user experience with fewer distractions
