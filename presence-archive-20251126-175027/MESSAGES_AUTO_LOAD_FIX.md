# Messages Auto-Load Fix

## Problem
Messages were not loading automatically when navigating to google.com, even though:
- 18 messages exist in database for `page_id = "google_com_"`
- Messages load successfully when `loadChatHistory` is manually called
- `pageId` and `currentUrlData` are correctly set

## Root Cause
**Race Condition**: `TabController` was processing URLs and calling `loadChatHistory` before `BootController` had finished initializing communities. This caused:
- `activeCommunities` to be empty `[]` initially
- `loadChatHistory` to return early (though it has a fallback to Public Square UUID)
- Messages not loading automatically on page navigation

## Solution

### 1. Added `ensureCommunitiesReady()` method to TabController
- Waits for communities module to initialize
- Polls state for `ui.activeCommunities` with retry logic (10 attempts, 100ms delay)
- Allows processing to continue even if communities aren't ready (fallback will be used)

### 2. Added delay in TabController.initialize()
- Small 500ms delay before capturing active tab
- Gives BootController time to initialize communities first
- Prevents race condition during initial load

### 3. Updated diagnostic script
- Added final check after waiting 2 seconds for automatic load
- Removes false positives when messages load asynchronously
- Better timing for async operations

## Files Modified

1. **`src/sidepanel/controllers/TabController.ts`**
   - Added `ensureCommunitiesReady()` method
   - Modified `processUrl()` to wait for communities before loading messages
   - Added delay in `initialize()` to prevent race condition

2. **`src/scripts/diagnose-google-messages.js`**
   - Added final check after waiting for automatic load
   - Better handling of async message loading

## Expected Behavior

After fix:
1. User navigates to google.com
2. `TabController` captures active tab URL
3. `ensureCommunitiesReady()` waits for communities (or times out gracefully)
4. `loadChatHistory` is called with proper URL
5. Messages load automatically (10 messages shown in logs, 80 elements in DOM)

## Testing

To verify the fix:
1. Navigate to google.com
2. Open sidepanel
3. Messages should load automatically without manual intervention
4. Run diagnostic script - should show messages loaded automatically

## Notes

- The fallback mechanism (`resolveActiveCommunitiesWithRetry`) already handles missing communities by using Public Square UUID
- The fix ensures communities are ready when possible, but doesn't block if they're not
- The delay in `initialize()` is a temporary measure - a better solution would be event-based signaling

