# Tab Detection Fix - Messages Not Loading

## Problem
Messages were not loading on google.com because:
1. `loadChatHistory` was incorrectly detecting visibility tab as active
2. Tab detection logic was using direct DOM checks instead of the utility function
3. `getActiveSidepanelTab` wasn't available in window for consistent detection
4. No default tab was set, causing null/undefined tab state

## Root Cause
The `loadChatHistory` function in `MessagesModule.ts` was using direct DOM checks:
```typescript
const visibilityTab = document.getElementById('visibility-tab');
const discussTab = document.getElementById('discuss-tab');
if (visibilityTab && visibilityTab.classList.contains('active') && (!discussTab || !discussTab.classList.contains('active'))) {
    // Skip loading
}
```

This check was too strict and could incorrectly detect the visibility tab as active, especially during initialization when tab state might not be fully set.

## Solution

### 1. Fixed Tab Detection in loadChatHistory
- Replaced direct DOM checks with `getActiveSidepanelTab()` utility
- Only skip if `activeTab === 'visibility-tab'` (explicit check)
- Allow loading on `discuss-tab` or `null` (initial load)

### 2. Injected getActiveSidepanelTab into Window
- Added injection in `windowInjections.ts`
- Ensures consistent tab detection across the codebase
- Available for all functions that need to check active tab

### 3. Set discuss-tab as Default
- Modified `TabManager.initialize()` to set `discuss-tab` as default if no tab is active
- Prevents null/undefined tab state from blocking message loading
- Ensures messages can load on initial page load

## Files Modified

1. **`src/features/MessagesModule.ts`**
   - Replaced direct DOM tab checks with `getActiveSidepanelTab()` utility
   - More robust tab detection logic

2. **`src/sidepanel/windowInjections.ts`**
   - Injected `getActiveSidepanelTab` into window
   - Makes utility available globally

3. **`src/features/TabManager/TabManager.ts`**
   - Set `discuss-tab` as default if no tab is active
   - Prevents null tab state

## Expected Behavior

After fix:
1. TabManager initializes with `discuss-tab` as default
2. `loadChatHistory` uses `getActiveSidepanelTab()` for consistent detection
3. Messages load automatically on google.com navigation
4. No false positives from visibility tab detection

## Testing

To verify the fix:
1. Navigate to google.com
2. Open sidepanel
3. Check that discuss-tab is active by default
4. Messages should load automatically
5. Run diagnostic script - should show messages loaded

## Notes

- The active communities issue (`activeCommunities: []`) is separate and will be handled by the fallback mechanism in `resolveActiveCommunitiesWithRetry`
- The tab detection fix ensures messages can load even if communities aren't ready yet
- The fallback to Public Square UUID will still work if communities aren't initialized

