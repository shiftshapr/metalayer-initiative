# Chrome Tab ID API - Getting Current Tab ID

## Overview

Chrome assigns each browser tab a unique **integer ID** when it's created. This ID persists for the lifetime of the tab and can be used to identify and reference specific tabs.

## Getting the Current Tab ID

### Method 1: Query Active Tab (Most Common)

```javascript
// Get the active tab in the current window
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs && tabs.length > 0) {
    const currentTabId = tabs[0].id;
    console.log('Current tab ID:', currentTabId);
    // Use currentTabId (e.g., store in database)
  }
});
```

### Method 2: Using Async/Await (Modern Approach)

```javascript
// In an async function
async function getCurrentTabId() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs && tabs.length > 0) {
      return tabs[0].id; // Returns integer like 123456789
    }
    return null;
  } catch (error) {
    console.error('Error getting tab ID:', error);
    return null;
  }
}

// Usage
const tabId = await getCurrentTabId();
console.log('Tab ID:', tabId);
```

### Method 3: Get Current Tab Info (Background Script)

```javascript
// In background script or with proper permissions
chrome.tabs.getCurrent((tab) => {
  if (tab) {
    const tabId = tab.id;
    console.log('Current tab ID:', tabId);
  }
});
```

**Note:** `chrome.tabs.getCurrent()` only works in background scripts, not in content scripts or side panels.

## Tab ID Properties

- **Type:** Integer (e.g., `123456789`, `987654321`)
- **Unique:** Each tab has a unique ID within the browser instance
- **Persistent:** ID remains the same for the tab's lifetime
- **Reusable:** Closed tabs' IDs are not reused immediately

## Usage in MetaCommunity Context

For the `tabId` field in `MetaCommunityMembership`, you have two options:

### Option 1: Use Chrome Tab ID (Integer as String)
```javascript
// Get Chrome tab ID (already an integer)
const tabId = await getCurrentTabId(); // Returns integer or null

// Store in membership
await prisma.metaCommunityMembership.create({
  data: {
    userId: user.id,
    metaCommunityId: community.id,
    isActive: true,
    isPrimary: true,
    tabId: tabId // e.g., 123456789 (integer)
  }
});
```

### Option 2: Use Custom Identifier
```javascript
// Note: If you need composite identifiers in the future, you could:
// 1. Add a separate field like `tabIdentifier String?` for custom IDs
// 2. Or keep tabId as Int for Chrome IDs and use a different field for custom IDs
```

## Important Notes

1. **Permissions Required:** Your `manifest.json` must include `"tabs"` permission (✅ already present)

2. **Context Matters:**
   - **Background Script:** Can use `chrome.tabs.getCurrent()` or `chrome.tabs.query()`
   - **Side Panel:** Must use `chrome.tabs.query()` (what you're currently doing)
   - **Content Script:** Limited access, typically uses messaging

3. **Tab ID Lifecycle:**
   - Tab ID is created when tab opens
   - Tab ID persists until tab closes
   - Tab ID is unique per browser instance
   - Tab IDs are not reused immediately after closing

4. **Current Implementation:**
   Your code already uses this pattern:
   ```javascript
   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
     const tabId = tabs[0].id; // This is the Chrome tab ID
   });
   ```

## Recommended Implementation

For MetaCommunity membership tracking, I recommend:

```javascript
// Utility function to get current tab ID
async function getCurrentChromeTabId() {
  try {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      const tabs = await new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, resolve);
      });
      
      if (tabs && tabs.length > 0 && tabs[0].id) {
        return String(tabs[0].id); // Convert to string for database
      }
    }
    return null; // No tab or extension context
  } catch (error) {
    console.error('Error getting Chrome tab ID:', error);
    return null;
  }
}

// Use when creating/updating membership
const tabId = await getCurrentChromeTabId(); // Already an integer!
// Store directly in database (no conversion needed)
```

## Example: Integration with Communities

```javascript
// In CommunitiesModule.js or CanopiModule.js
async function selectCommunity(communityId) {
  const user = await getCurrentUser();
  const tabId = await getCurrentChromeTabId(); // Get Chrome tab ID
  
  // Update membership with tab ID
  await api.selectCommunity({
    userId: user.id,
    communityId: communityId,
    tabId: tabId // Store Chrome tab ID
  });
}
```

## Database Schema Compatibility

Your schema uses:
```prisma
tabId Int? @db.Integer // Chrome tab ID (integer) - null for default/current tab
```

This is the correct type since Chrome tab IDs are integers. Benefits:
- Type safety - ensures only integers are stored
- Better performance - integer comparison is faster
- No conversion needed - direct storage of Chrome's tab ID
- Proper indexing - integers index more efficiently

## Multi-Tab Support

When implementing multi-tab support:
```javascript
// Track active community per tab
const tabCommunityMap = {}; // { tabId: communityId }

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tabId = activeInfo.tabId; // Already an integer
  const communityId = tabCommunityMap[tabId] || defaultCommunityId;
  // Update membership for this tab
});
```

