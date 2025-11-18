# COMP vs TypeScript Audit Findings

## Critical Discrepancies Found

### 1. ✅ FIXED: Replies Showing in Default Mode

**Issue**: Replies were always visible, not respecting thread expansion state or focus mode.

**COMP Behavior**:
- Checks if thread toggle exists and is expanded (`threadToggle.dataset.expanded === 'true'`)
- Checks if in focus mode (`window.focusedMessage`)
- Otherwise, replies are collapsed (no 'visible' class)

**TypeScript Before**: Always rendered all messages without checking expansion state.

**TypeScript After**: Now matches COMP - checks thread expansion and focus mode before adding 'visible' class.

**Fix Applied**: Added COMP METHOD check in `loadChatHistory` before setting messageDiv.innerHTML.

### 2. ✅ FIXED: Visibility Tab Shows "Inactive" Status

**Issue**: Shows "Inactive" under profile name (not in spec).

**COMP Behavior**: COMP also shows "Active"/"Inactive" but user says it's not in spec.

**TypeScript Before**: 
```typescript
userStatusEl.textContent = isActive ? 'Active' : 'Inactive';
```

**TypeScript After**: Removed status text display - status is indicated by avatar aura/ring, not text.

**Fix Applied**: Removed user-status element creation in `updateVisibleTab`.

### 3. ⚠️ INVESTIGATING: Messages Flash Up Then Disappear

**Issue**: Messages appear briefly then disappear.

**Logs Show**:
- `✅ loadChatHistory: Successfully rendered 6 messages`
- `✅ CHAT_PATCH: Made 48 messages visible`
- `✅ CHAT_PATCH: Made 0 messages visible`

**Possible Causes**:
1. CHAT_PATCH is clearing messages after rendering
2. Multiple `loadChatHistory` calls clearing previous messages
3. CSS visibility issues

**Next Steps**: Need to check if CHAT_PATCH is interfering with message display.

## COMP Files Status

✅ **COMP files still exist**: 
- `presence/features/CanopiModule.js` (37245 bytes, Nov 15 20:39)
- `presence/features/VisibilityManager.js` (23801 bytes, Nov 15 20:39)

⚠️ **Note**: These are the COMPILED TypeScript files, not the original COMP JavaScript.
- Original COMP is in git history (commit `8d4bf64`)
- Current files are compiled from TypeScript source

## Files to Reference

- **Original COMP**: `git show 8d4bf64:presence/features/CanopiModule.js`
- **Original COMP Visibility**: `git show 8d4bf64:presence/features/VisibilityManager.js`
- **TypeScript Source**: `presence/src/features/CanopiModule.ts`
- **TypeScript Visibility**: `presence/src/features/VisibilityManager.ts`

## Remaining Issues

1. **Message Flashing**: Need to investigate CHAT_PATCH interaction
2. **Focus Mode Logic**: Need to verify focus mode detection works correctly
3. **Thread Toggle State**: Need to ensure thread expansion state is properly tracked

---

**Date**: 2025-11-15
**Status**: 🔴 **AUDIT IN PROGRESS - 2 FIXES APPLIED, 1 INVESTIGATING**

