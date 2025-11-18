# Comprehensive Diagnostic Guide

## Quick Start

Open the browser console and run:
```javascript
runComprehensiveDiagnostic()
```

This will run a full diagnostic and display a comprehensive report in the console.

## What It Checks

### 1. URL Normalization
- Verifies `window.normalizeUrl()` is working
- Checks `window.normalizeCurrentUrl()` function
- Validates `window.currentUrlData` is set correctly
- Tests normalization of current page URL

### 2. Message Loading
- Checks if `loadChatHistory` function is available
- Verifies active communities are loaded
- Tests API connectivity and `getChatHistory` call
- Checks Supabase client availability
- Counts message elements in DOM

### 3. Visibility Tab
- Verifies visibility tab DOM element exists
- Checks if tab is active/visible
- Tests `updateVisibleTab` function availability
- Validates VisibilityModalHandler initialization
- Checks visibility modal display and z-index
- Tests `getPageUsers` function

### 4. API Connectivity
- Verifies API module is loaded
- Tests API health endpoint
- Checks API base URL configuration

### 5. Database Queries
- Tests direct Supabase messages query
- Tests direct Supabase presence query
- Validates pageId format matches database

## Root Cause Analysis

The diagnostic automatically identifies:
- ❌ Critical issues (blocking functionality)
- ⚠️ Warnings (potential issues)
- ✅ Working components

## Common Issues and Fixes

### Messages Not Loading

**Issue**: `No conversations found for any active community`

**Check**:
1. Are active communities loaded? (Check `activeCommunitiesCount`)
2. Is the API call succeeding? (Check `testApiCall.success`)
3. Is the pageId correct? (Compare `urlNormalization.pageId` with database)
4. Are there messages in the database for this pageId?

**Debug Steps**:
```javascript
// Check what pageId is being used
const urlData = await window.normalizeCurrentUrl();
console.log('Page ID:', urlData.pageId);

// Check what's in the database
const { data } = await window.supabase
  .from('messages')
  .select('page_id, community_id')
  .limit(10);
console.log('Sample messages:', data);
```

### Visibility Tab Not Working

**Issue**: `Visibility tab is non-functional`

**Check**:
1. Is the visibility tab element in DOM? (`visibilityTabElement`)
2. Is `updateVisibleTab` available? (`updateVisibleTabAvailable`)
3. Is VisibilityModalHandler initialized? (`visibilityModalHandlerInitialized`)
4. Is the modal hidden? (`visibilityModalDisplay === 'none'`)
5. Are users being filtered out incorrectly?

**Debug Steps**:
```javascript
// Check visibility tab
const tab = document.getElementById('visibility-tab');
console.log('Tab exists:', !!tab);
console.log('Tab display:', window.getComputedStyle(tab).display);
console.log('Tab active:', tab?.classList.contains('active'));

// Check visibility modal
const modal = document.getElementById('visibility-access-modal');
console.log('Modal exists:', !!modal);
console.log('Modal display:', window.getComputedStyle(modal).display);
console.log('Modal z-index:', window.getComputedStyle(modal).zIndex);

// Test updateVisibleTab
if (window.updateVisibleTab) {
  const testUsers = [{ id: 'test', name: 'Test User' }];
  await window.updateVisibleTab(testUsers);
}
```

## Full Diagnostic Results

After running the diagnostic, full results are stored in:
```javascript
window.comprehensiveDiagnosticResults
```

Access specific sections:
```javascript
// URL normalization results
window.comprehensiveDiagnosticResults.urlNormalization

// Message loading results
window.comprehensiveDiagnosticResults.messageLoading

// Visibility tab results
window.comprehensiveDiagnosticResults.visibilityTab

// API connectivity results
window.comprehensiveDiagnosticResults.apiConnectivity

// Database query results
window.comprehensiveDiagnosticResults.databaseQueries
```

## Manual Testing

### Test Message Loading
```javascript
// Get current URL data
const urlData = await window.normalizeCurrentUrl();
console.log('URL Data:', urlData);

// Get active communities
const activeCommunities = await window.stateManager.get('ui.activeCommunities');
console.log('Active Communities:', activeCommunities);

// Test API call
if (activeCommunities.length > 0) {
  const response = await window.api.getChatHistory(
    activeCommunities[0],
    null,
    urlData.rawUrl
  );
  console.log('API Response:', response);
}
```

### Test Visibility Tab
```javascript
// Check if tab exists and is visible
const tab = document.getElementById('visibility-tab');
console.log('Tab:', {
  exists: !!tab,
  display: tab ? window.getComputedStyle(tab).display : 'N/A',
  active: tab?.classList.contains('active')
});

// Test updateVisibleTab
if (window.updateVisibleTab) {
  await window.updateVisibleTab([]);
  console.log('updateVisibleTab called successfully');
}

// Test getPageUsers
if (window.supabaseRealtimeClient?.getPageUsers) {
  const urlData = await window.normalizeCurrentUrl();
  const users = await window.supabaseRealtimeClient.getPageUsers(urlData.pageId);
  console.log('Page Users:', users);
}
```

## Next Steps After Diagnostic

1. **Review the console report** - Look for ❌ and ⚠️ markers
2. **Check root cause analysis** - The diagnostic identifies specific issues
3. **Verify database** - Ensure messages exist for the pageId being queried
4. **Test API directly** - Use the manual testing snippets above
5. **Check URL normalization** - Ensure pageId format matches database format

