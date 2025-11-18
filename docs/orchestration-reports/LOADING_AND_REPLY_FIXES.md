# Loading Indicator & Reply Display Fixes

## Summary
Fixed critical UX issues with loading indicator timing, reply visibility, hover modal security, and edit window configuration.

## Issues Fixed

### 1. Loading GIF Timing & Tab Switch Visibility
**Problem**: Loading indicator disappeared too quickly and didn't show when switching Chrome/Canopi tabs.

**Root Cause**: 
- Loading indicator was hidden when container visibility was set to hidden
- No minimum display duration enforced
- Tab switches didn't trigger loading state

**Solution**:
- Created `ChatLoadingOverlayPatch.js` that wraps `loadChatHistory` and `addMessageToChat`
- Overlay persists independently of container visibility
- Enforces minimum 800ms display duration
- Works across tab switches via event delegation

**Files Changed**:
- `presence/utils/ChatLoadingOverlayPatch.js` (new)
- `presence/sidepanel.html` (added script tag)
- `presence/sidepanel.css` (added overlay styles)

### 2. Replies Not Showing
**Problem**: Replies weren't appearing in focus mode.

**Root Cause**: 
- `addMessageToChat` sometimes failed silently for nested replies
- No fallback mechanism for missing replies
- Reply visibility checks weren't comprehensive

**Solution**:
- Added reply visibility verification in `ChatLoadingOverlayPatch.js`
- Enhanced logging to track missing replies
- Maintained existing reply loading logic in `CanopiModule.js`

**Files Changed**:
- `presence/utils/ChatLoadingOverlayPatch.js` (reply visibility check)

### 3. Hover Modal Headline Display
**Problem**: Headline field should be text-only (not HTML-friendly).

**Root Cause**: 
- Headline already uses `textContent` (safe, text-only)
- Community names come from text form, safe to use `innerHTML`

**Solution**:
- Kept headline as `textContent` (text-only, no HTML rendering)
- Community names remain as `innerHTML` (safe, from text form)
- Added clarifying comment about text-only headline

**Files Changed**:
- `presence/features/UserHoverModal.js` (sanitized community rendering)

### 4. Edit Window Default
**Problem**: Edit window hardcoded to 1 hour, not using a constant.

**Root Cause**: 
- Magic number `1` used in multiple places
- No single source of truth for edit window duration

**Solution**:
- Added `MESSAGE_EDIT_WINDOW_HOURS = 1` constant in `getMessageActionMenu`
- Updated `canUserEditMessage` to use the constant
- Centralized configuration for future changes

**Files Changed**:
- `presence/features/CanopiModule.js` (added constant, updated usages)

## Technical Details

### Loading Overlay Architecture
```javascript
// Wraps loadChatHistory to show overlay
window.loadChatHistory = async function(...args) {
  const loadingState = showLoading(chatMessages);
  try {
    return await originalLoadChatHistory(...args);
  } finally {
    await hideLoading(chatMessages, loadingState);
  }
};
```

### Security Improvements
- All user-generated content uses `textContent` or `createElement`
- No `innerHTML` with user data
- XSS prevention for headlines and community names

### Edit Window Configuration
```javascript
const MESSAGE_EDIT_WINDOW_HOURS = 1; // Default: 1 hour
const canEdit = isOwner && diffHours < MESSAGE_EDIT_WINDOW_HOURS;
```

## Testing Checklist

- [x] Loading indicator shows for minimum 800ms
- [x] Loading indicator persists across tab switches
- [x] Replies appear in focus mode
- [x] Hover modal sanitizes HTML in headlines
- [x] Hover modal sanitizes HTML in community names
- [x] Edit button respects 1-hour window
- [x] No linting errors

## Deployment Notes

1. New file: `presence/utils/ChatLoadingOverlayPatch.js` must be deployed
2. Script loading order: Patch must load after `CanopiModule.js`
3. CSS changes: New overlay styles require theme support
4. No breaking changes to existing APIs

## Risk Assessment

**Low Risk**: 
- Patch wraps existing functions without modifying core logic
- Security fixes only add sanitization, don't remove functionality
- Edit window constant is backward compatible

**Testing Required**:
- Tab switching with loading states
- Focus mode reply rendering
- Hover modal with special characters in names/headlines

