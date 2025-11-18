# Window References Audit - TypeScript Code

## Summary

**Status**: ⚠️ **PARTIAL - Window references still exist but minimized**

While we've made progress removing window variable dependencies, some window references remain necessary for:
1. **Browser APIs** (legitimate): `window.getComputedStyle`, `document`, etc.
2. **Backward compatibility**: Exports to window for legacy JavaScript code
3. **Chrome Extension context**: Shared state between modules loaded as ES6 modules

## Current State

### ✅ Improvements Made

1. **StateManager Access**: Changed from `window.getState()` (legacy) to `window.stateManager.getState()` (instance)
2. **VisibilityManager**: Changed to use static methods instead of instance methods
3. **Removed**: Dependency on `window.getState` function from sidepanel.js

### ⚠️ Remaining Window References

**Legitimate Uses** (Browser APIs):
- `window.getComputedStyle()` - Browser API
- `document.querySelector()` - Browser API
- `window.location` - Browser API

**Backward Compatibility** (Necessary for migration):
- `window.currentUser` - Shared state, accessed by legacy code
- `window.currentChatData` - Shared state
- `window.currentVisibilityData` - Shared state
- `window.activeCommunities` - Shared state
- `window.stateManager` - StateManager instance (proper way to access)
- `window.AvatarUtils` - Exported for legacy code
- `window.UnifiedMessageRenderer` - Exported for legacy code
- `window.api` - API service instance
- `window.supabase` - Supabase client instance

**Exports to Window** (For legacy code):
- All modules export to window for backward compatibility during migration
- This is intentional and documented

## Recommendations

### Short Term (Current Migration)
- ✅ Use `window.stateManager` instead of `window.getState()`
- ✅ Use static methods where possible
- ✅ Minimize window access in business logic
- ⚠️ Accept that some window access is necessary for shared state in Chrome extension

### Long Term (After Full Migration)
- Create a proper service locator pattern
- Use dependency injection for shared services
- Remove window exports once all code is TypeScript
- Use proper module imports for all dependencies

## Files with Window References

1. **CanopiModule.ts**: ~29 window references
   - Most are for accessing shared state (`window.currentUser`, `window.currentChatData`)
   - Some for backward compatibility (`window.UnifiedMessageRenderer`, `window.api`)

2. **VisibilityManager.ts**: ~28 window references
   - Most are for accessing shared state (`window.currentUser`, `window.currentVisibilityData`)
   - Some for backward compatibility (`window.AvatarUtils`)

3. **Other modules**: Various window references for exports and browser APIs

## Conclusion

**Current Approach**: ✅ **ACCEPTABLE FOR MIGRATION PHASE**

- Window references are minimized where possible
- Proper TypeScript patterns used where feasible
- Window exports maintained for backward compatibility
- Static methods used instead of instance methods where appropriate

**Next Steps**: Continue migration, then refactor to remove window dependencies once all code is TypeScript.

---

**Report Generated**: 2025-11-15
**Status**: ⚠️ **PARTIAL - Acceptable for migration phase**

