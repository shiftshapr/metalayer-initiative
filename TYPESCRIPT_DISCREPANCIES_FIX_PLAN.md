# TypeScript Discrepancies - Fix Plan

## Summary

The TypeScript implementation is missing critical functionality that should exist based on CSS and expected behavior. The issues are:

1. **Messages missing context** - Not loading reactions, reply counts, permissions
2. **Replies showing incorrectly** - Always using default mode instead of checking focus mode
3. **Visibility tab missing UI** - Missing search, count, Go Invisible button

## Root Cause

The TypeScript migration copied the function logic but didn't include:
1. **Post-render enrichment** - Loading reactions, calculating reply counts
2. **UI structure creation** - Creating search, count, Go Invisible elements
3. **Focus mode logic** - Determining when to use focus mode

## Fixes Required

### Fix 1: Enrich Messages with Real Data

**Location**: `presence/src/features/CanopiModule.ts` - `loadChatHistory` function

**Changes**:
1. Calculate reply counts from message array
2. Load reactions for each message after rendering
3. Check user permissions (canEdit, canDelete)
4. Check user interactions (hasUserReplied, isBookmarked)

**Code to add** (after rendering messages):
```typescript
// Calculate reply counts
const replyCounts: { [messageId: string]: number } = {};
allMessages.forEach(msg => {
  if (!msg.parentId) {
    // This is a thread starter - count replies
    const replies = allMessages.filter(m => m.parentId === msg.id);
    replyCounts[msg.id] = replies.length;
  }
});

// After rendering, load reactions and update UI
for (const message of allMessages) {
  // Load reactions
  if (window.loadMessageReactions) {
    await window.loadMessageReactions(message.id);
  }
  
  // Update reply count in UI
  const messageDiv = document.querySelector(`[data-message-id="${message.id}"]`);
  if (messageDiv) {
    const replyCount = replyCounts[message.id] || 0;
    const replyButton = messageDiv.querySelector('.inline-reply-btn');
    if (replyButton && replyCount > 0) {
      const countEl = replyButton.querySelector('.icon-count');
      if (countEl) {
        countEl.textContent = replyCount.toString();
        countEl.style.display = 'inline-block';
      }
    }
  }
  
  // TODO: Check permissions and user interactions
  // - canEdit: message.authorId === window.currentUser?.id
  // - canDelete: message.authorId === window.currentUser?.id
  // - isBookmarked: Check user's bookmarks
  // - hasUserReplied: Check if user has replied to this message
}
```

### Fix 2: Add Visibility Tab UI Elements

**Location**: `presence/src/features/VisibilityManager.ts` - `updateVisibleTab` function

**Changes**:
1. Create header with visible count
2. Create search input
3. Create "Go Invisible" button
4. Structure matches CSS expectations

**Code to add** (at start of `updateVisibleTab`):
```typescript
// Clear existing content
visibilityTab.innerHTML = '';

// Create header with count
const header = document.createElement('div');
header.className = 'visible-header';
header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid var(--border-color);';

const countDisplay = document.createElement('div');
countDisplay.className = 'visible-count';
countDisplay.textContent = `${avatars.length} user${avatars.length !== 1 ? 's' : ''} visible`;
countDisplay.style.cssText = 'font-weight: bold; color: var(--text-primary);';

// Create search input
const searchContainer = document.createElement('div');
searchContainer.style.cssText = 'position: relative; flex: 1; margin: 0 12px;';

const searchInput = document.createElement('input');
searchInput.id = 'visible-search';
searchInput.type = 'search';
searchInput.placeholder = 'Search users...';
searchInput.style.cssText = 'width: 100%; padding: 6px 12px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-secondary); color: var(--text-primary);';

// Add search functionality
let searchTimeout: NodeJS.Timeout;
searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  const query = (e.target as HTMLInputElement).value.toLowerCase();
  
  searchTimeout = setTimeout(() => {
    // Filter avatars based on search
    const avatarItems = visibilityTab.querySelectorAll('.visibility-avatar-item');
    avatarItems.forEach((item: Element) => {
      const userName = item.textContent?.toLowerCase() || '';
      const parent = item.closest('.visibility-avatar-wrapper');
      if (parent) {
        (parent as HTMLElement).style.display = userName.includes(query) ? 'flex' : 'none';
      }
    });
  }, 300);
});

searchContainer.appendChild(searchInput);

// Create Go Invisible button
const goInvisibleBtn = document.createElement('button');
goInvisibleBtn.id = 'go-invisible-btn';
goInvisibleBtn.textContent = 'Go Invisible';
goInvisibleBtn.style.cssText = 'padding: 6px 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-primary); cursor: pointer;';

goInvisibleBtn.addEventListener('click', async () => {
  // Set visibility to false
  if (window.userPreferencesManager) {
    await window.userPreferencesManager.setPreference('isVisible', false);
  } else if (window.unifiedSettingsStorage) {
    await window.unifiedSettingsStorage.setSetting('visibilityEnabled', false, { apiKey: 'isVisible' });
  } else {
    await chrome.storage.local.set({ visibilityEnabled: false });
  }
  
  // Update UI
  if (window.refreshVisibilityAvatars) {
    await window.refreshVisibilityAvatars();
  }
});

header.appendChild(countDisplay);
header.appendChild(searchContainer);
header.appendChild(goInvisibleBtn);
visibilityTab.appendChild(header);
```

### Fix 3: Determine Focus Mode Correctly

**Location**: `presence/src/features/CanopiModule.ts` - `loadChatHistory` function

**Changes**:
1. Check user preferences for focus mode
2. Check thread state
3. Determine if replies should be visible

**Code to add** (before rendering):
```typescript
// Determine focus mode
let isFocusMode = false;
if (window.userPreferencesManager) {
  const focusModePref = await window.userPreferencesManager.getPreference('focusMode');
  isFocusMode = focusModePref === true;
} else {
  // Check chat messages container
  const chatMessages = document.querySelector('.chat-messages');
  isFocusMode = chatMessages?.classList.contains('focus-mode') || false;
}

// In focus mode, only show thread starters initially
// Replies are shown when thread is expanded
```

## Implementation Order

1. ✅ **Fix 2** - Visibility tab UI (easiest, most visible)
2. ✅ **Fix 1** - Message enrichment (medium complexity)
3. ✅ **Fix 3** - Focus mode logic (requires understanding thread state)

## Testing

After each fix:
1. Reload extension
2. Test visibility tab - should show count, search, Go Invisible
3. Test messages - should show reactions, reply counts
4. Test focus mode - replies should hide/show correctly

---

**Date**: 2025-11-15
**Status**: 🔴 **FIXES REQUIRED**

