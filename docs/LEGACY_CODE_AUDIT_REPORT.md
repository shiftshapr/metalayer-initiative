# Legacy Code Audit Report

## Summary
Search for "legacy" occurrences in non-comment code across the `presence/src` directory.

## Total Occurrences
**16 occurrences** across **7 files**

## Files with "legacy" References

### By File (sorted by count)

1. **presence/src/features/CanopiModule.ts** - 8 occurrences
2. **presence/src/utils/ComprehensiveDiagnostic.ts** - 2 occurrences
3. **presence/src/features/VisibilityManager.ts** - 2 occurrences
4. **presence/src/utils/Logger.ts** - 1 occurrence
5. **presence/src/utils/AvatarUtils.ts** - 1 occurrence
6. **presence/src/ui/messagingBridge.ts** - 1 occurrence
7. **presence/src/core/StateManager.ts** - 1 occurrence

## Detailed Occurrences

### presence/src/features/CanopiModule.ts (8 occurrences)

1. **Line 418**: `// Reply visibility logic matches legacy implementation`
   - Context: Comment in message rendering logic

2. **Line 1528**: `// ROOT CAUSE FIX: Store messages in cache (convert to legacy format for compatibility with existing code)`
   - Context: Comment in `loadChatHistory` function
   - Function: `loadChatHistory`

3. **Line 1727**: `// Check if this is a UUID (Supabase) or legacy post ID (backend API)`
   - Context: Comment in `handleDeleteMessage` function
   - Function: `handleDeleteMessage`

4. **Line 1744**: `// Use API for legacy post IDs - check if deleteMessage method exists`
   - Context: Comment in `handleDeleteMessage` function
   - Function: `handleDeleteMessage`

5. **Line 1833**: `// Use robust integration if available, fallback to legacy`
   - Context: Comment in `sendMessageViaSupabase` function
   - Function: `sendMessageViaSupabase`

6. **Line 1838**: `// Fallback to legacy system`
   - Context: Comment in `sendMessageViaSupabase` function
   - Function: `sendMessageViaSupabase`

7. **Line 1935**: `// Fallback to legacy system`
   - Context: Comment in `sendMessageViaSupabase` function
   - Function: `sendMessageViaSupabase`

8. **Line 1936**: `console.log('📡 SUPABASE_MESSAGE: Using legacy system...');`
   - Context: Console log in `sendMessageViaSupabase` function
   - Function: `sendMessageViaSupabase`

### presence/src/utils/ComprehensiveDiagnostic.ts (2 occurrences)

1. **Line 273**: `// Check VisibilityManager registration via legacy update hook`
   - Context: Comment in diagnostic function

2. **Line 275**: `console.log('🔍 DIAGNOSTIC: VisibilityManager legacy hook available:', section.visibilityManagerAvailable);`
   - Context: Console log in diagnostic function

### presence/src/features/VisibilityManager.ts (2 occurrences)

1. **Line 574**: `// Provide legacy update hook without exporting the entire class`
   - Context: Comment before function definition

2. **Line 578**: `console.log('✅ VisibilityManager legacy updateVisibleTab registered');`
   - Context: Console log in function
   - Function: `updateVisibleTab` (legacy hook registration)

### presence/src/utils/Logger.ts (1 occurrence)

1. **Line 221**: `// CRITICAL FIX: Export Logger to window for legacy code compatibility`
   - Context: Comment before window export

### presence/src/utils/AvatarUtils.ts (1 occurrence)

1. **Line 215**: `// CRITICAL FIX: Export AvatarUtils to window and globalThis for legacy code compatibility`
   - Context: Comment before window export

### presence/src/ui/messagingBridge.ts (1 occurrence)

1. **Line 2**: `* Messaging bridge for legacy compatibility`
   - Context: File header comment

### presence/src/core/StateManager.ts (1 occurrence)

1. **Line 334**: `// ROOT CAUSE FIX: Export stateManagerInstance to window for diagnostic scripts and legacy compatibility`
   - Context: Comment before window export

## Analysis

### Categories of "Legacy" References

1. **Window Exports for Compatibility** (4 occurrences)
   - AvatarUtils, Logger, StateManager exports
   - Purpose: Allow legacy code to access new modules

2. **Fallback Logic** (4 occurrences)
   - CanopiModule.ts sendMessageViaSupabase function
   - Purpose: Fallback to old system if new system unavailable

3. **Data Format Conversion** (2 occurrences)
   - CanopiModule.ts message format conversion
   - Purpose: Convert new format to old format for compatibility

4. **Legacy Hook Registration** (2 occurrences)
   - VisibilityManager.ts updateVisibleTab hook
   - Purpose: Provide backward-compatible update mechanism

5. **ID Format Detection** (2 occurrences)
   - CanopiModule.ts UUID vs legacy post ID detection
   - Purpose: Handle both old and new ID formats

6. **Comments/Logs** (2 occurrences)
   - Diagnostic and console logs mentioning legacy

## Recommendations

1. **Window Exports**: Keep for now - needed for backward compatibility
2. **Fallback Logic**: Consider removing once new system is fully stable
3. **Data Format Conversion**: Remove once all code uses new format
4. **Legacy Hooks**: Remove once all consumers use new API
5. **ID Format Detection**: Keep until all IDs are migrated to UUIDs
6. **Comments/Logs**: Update to remove "legacy" terminology

## Functions Mentioning "Legacy"

- `loadChatHistory` (CanopiModule.ts)
- `handleDeleteMessage` (CanopiModule.ts)
- `sendMessageViaSupabase` (CanopiModule.ts)
- `updateVisibleTab` (VisibilityManager.ts)

