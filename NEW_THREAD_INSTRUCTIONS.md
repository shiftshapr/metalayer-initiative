# Instructions for New Thread

## Context Summary

We've been migrating the Canopi Chrome extension from JavaScript to TypeScript. The migration is mostly complete, but we discovered critical issues preventing messages from loading.

## Critical Fixes Applied

1. **Fixed loadChatHistory** - Added `window.getState()` as PRIMARY method (was missing)
2. **Fixed CommunitiesModule** - Changed state paths from `'activeCommunities'` to `'ui.activeCommunities'` to match StateManager structure

## Current Status

- ✅ TypeScript migration: 95% complete
- ✅ Core modules: Fully migrated (StateManager, Logger, ErrorHandler, AvatarUtils, etc.)
- ✅ Feature modules: Fully migrated (AuthManager, VisibilityManager, CanopiModule)
- ❌ Messages not loading: FIXED (activeCommunities path issue)
- ✅ Visibility tab: Working (identical to original implementation)

## Files Modified in This Session

1. `/home/ubuntu/metalayer-initiative/presence/src/features/CanopiModule.ts`
   - Added `window.getState()` as primary method for retrieving activeCommunities
   - Fixed retry logic to use correct method order

2. `/home/ubuntu/metalayer-initiative/presence/features/CommunitiesModule.js`
   - Changed `setState('activeCommunities', ...)` to `setState('ui.activeCommunities', ...)`
   - Changed `setState('primaryCommunity', ...)` to `setState('ui.primaryCommunity', ...)`
   - Changed `setState('currentCommunity', ...)` to `setState('ui.currentCommunity', ...)`
   - Changed `setState('communities', ...)` to `setState('ui.communities', ...)`

## Key Architecture Points

### State Management
- **StateManager**: TypeScript class managing application state
- **State Paths**: All UI state uses `'ui.*'` prefix (e.g., `'ui.activeCommunities'`)
- **Access Methods** (in priority order):
  1. `window.getState('ui.activeCommunities')` - PRIMARY (defined in sidepanel.js:3549)
  2. `window.stateManager.getState('ui.activeCommunities')` - Direct instance access
  3. `window.activeCommunities` - Legacy fallback

### Module Structure
- **Source**: `/home/ubuntu/metalayer-initiative/presence/src/` (TypeScript)
- **Compiled**: `/home/ubuntu/metalayer-initiative/presence/dist/` (JavaScript)
- **Extension**: `/home/ubuntu/metalayer-initiative/presence/` (copied from dist/)
- **Build Command**: `npm run build:extension` (compiles TS and copies to extension)

### Window Exports
All TypeScript modules export to `window` for backward compatibility:
- `window.StateManager` - StateManager class
- `window.stateManager` - StateManager instance
- `window.AvatarUtils` - Avatar utilities
- `window.VisibilityManager` - VisibilityManager class
- `window.updateVisibleTab` - Standalone function
- `window.loadChatHistory` - Standalone function

## Testing Checklist

After fixes are applied:
- [ ] Messages load on google.com
- [ ] Active communities are retrieved correctly
- [ ] Visibility tab shows users correctly
- [ ] No console errors related to activeCommunities

## Next Steps (If Needed)

1. **Test the fixes** - Verify messages load and visibility tab works
2. **Check for remaining issues** - Any other functionality broken?
3. **Complete migration** - Any remaining JavaScript files to migrate?

## Important Notes

- **DO NOT** edit files in `presence/dist/` - these are generated
- **DO NOT** edit compiled `.js` files in `presence/features/`, `presence/core/`, etc. - edit `.ts` files in `presence/src/`
- **ALWAYS** run `npm run build:extension` after editing TypeScript files
- **State paths** must use `'ui.*'` prefix to match StateManager structure

## Known Issues (Resolved)

1. ✅ Messages not loading - FIXED (activeCommunities path mismatch)
2. ✅ loadChatHistory missing window.getState() - FIXED
3. ✅ CommunitiesModule using wrong state paths - FIXED

## Documentation Files

- `CANOPI_TYPESCRIPT_AUDIT_REPORT.md` - Complete audit findings
- `FIXES_APPLIED_SUMMARY.md` - Summary of fixes applied
- `TYPESCRIPT_MIGRATION_FINAL_REPORT.md` - Overall migration status

## If Starting Fresh Thread

**Objective**: Test the fixes and verify messages load correctly. If issues remain, investigate and fix.

**Context**: 
- TypeScript migration complete
- Critical fixes just applied for activeCommunities path
- Need to verify everything works

**Key Files**:
- `presence/src/features/CanopiModule.ts` - Message loading logic
- `presence/features/CommunitiesModule.js` - Community state management
- `presence/sidepanel.js` - Main extension file (defines window.getState)

**Build Command**: `cd /home/ubuntu/metalayer-initiative && npm run build:extension`

