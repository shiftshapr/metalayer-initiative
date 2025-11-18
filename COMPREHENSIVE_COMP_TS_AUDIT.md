# Comprehensive COMP vs TypeScript Audit

## Status
- ✅ COMP files still exist: `presence/features/CanopiModule.js` and `presence/features/VisibilityManager.js`
- ⚠️ These are the COMPILED TypeScript files (not original COMP)
- 🔍 Need to use git history to access original COMP

## Issues Reported

### 1. Messages Flash Up Then Disappear
**Symptom**: Messages appear briefly then disappear
**Logs Show**: 
- `✅ loadChatHistory: Successfully rendered 6 messages`
- `✅ CHAT_PATCH: Made 48 messages visible`
- `✅ CHAT_PATCH: Made 0 messages visible`

**Root Cause**: Need to check CHAT_PATCH logic that might be clearing messages

### 2. Replies Showing in Default Mode
**Symptom**: Replies are visible when they shouldn't be (except in specific circumstances)
**TypeScript Code**: Always sets `isFocusMode: false`
**COMP Behavior**: Replies should be collapsed by default, only shown when:
- Thread is expanded
- In focus mode
- User explicitly expands thread

**Discrepancy**: TypeScript doesn't check thread expansion state or focus mode

### 3. Visibility Tab Shows "Inactive"
**Symptom**: Shows "Inactive" under profile name (not in spec)
**TypeScript Code**: 
```typescript
userStatusEl.textContent = isActive ? 'Active' : 'Inactive';
```
**COMP Behavior**: Need to check what COMP actually shows

## Next Steps

1. Extract original COMP from git history
2. Compare focus mode logic
3. Compare visibility status display
4. Check CHAT_PATCH clearing logic
5. Fix all discrepancies

---

**Date**: 2025-11-15
**Status**: 🔴 **AUDIT IN PROGRESS**

