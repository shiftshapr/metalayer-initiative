# COMP (Original JS) vs TypeScript Comparison Plan

## Objective
Compare the original working JavaScript implementation (COMP) to the TypeScript version to identify missing functionality.

## Key Files to Compare

1. **CanopiModule.js (COMP)** - Commit `8d4bf64` (before TypeScript migration)
2. **CanopiModule.ts** - Current TypeScript implementation

## Functions to Compare

### 1. `loadChatHistory`
- **COMP**: Full implementation with post-render data loading
- **TS**: Missing initial data loading after rendering

### 2. `updateVisibleTab` (in VisibilityManager)
- **COMP**: Creates full UI with header, search, count, Go Invisible button
- **TS**: Only renders avatars

### 3. Message rendering
- **COMP**: Loads reactions, reply counts, permissions after rendering
- **TS**: Renders with hardcoded zeros, no post-render loading

## Next Steps

1. Extract full `loadChatHistory` from COMP
2. Extract full `updateVisibleTab` from COMP
3. Compare line-by-line with TypeScript
4. Document all discrepancies
5. Fix TypeScript to match COMP functionality

---

**Date**: 2025-11-15
**Status**: 🔴 **IN PROGRESS - EXTRACTING COMP CODE**

