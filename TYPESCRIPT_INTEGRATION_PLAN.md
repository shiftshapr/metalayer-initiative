# TypeScript Integration Plan

## Current State

**TypeScript Files**: Compiled to `presence/dist/`
**HTML Files**: Load from `presence/` directly
**Build Script**: `build:extension` copies dist files to presence/

## Integration Strategy

### Option 1: Use build:extension (Recommended)
- TypeScript compiles to `presence/dist/`
- Build script copies to `presence/` maintaining directory structure
- HTML files can load from `presence/core/`, `presence/utils/`, etc.
- **Pros**: Simple, maintains structure, backward compatible
- **Cons**: Requires build step before testing

### Option 2: Load directly from dist/
- Update HTML to load from `dist/core/`, `dist/utils/`, etc.
- **Pros**: No copy step needed
- **Cons**: Requires HTML changes, different path structure

### Option 3: Hybrid Approach
- Keep critical modules in `presence/` (legacy JS)
- Load new TypeScript modules from `dist/`
- Gradually migrate

## Recommended Approach: Option 1

1. **Run build:extension** to copy compiled files
2. **Update HTML** to load TypeScript modules with `type="module"`
3. **Test incrementally** - start with one module
4. **Verify** backward compatibility

## Files to Update

### Priority 1: Core Modules
- `presence/core/ConfigModule.js` → Load as module
- `presence/core/StateManager.js` → Load as module
- `presence/core/EventBus.js` → Load as module

### Priority 2: Utilities
- `presence/utils/ErrorHandler.js` → Load as module
- `presence/utils/Logger.js` → Load as module
- `presence/utils/AvatarUtils.js` → Load as module

### Priority 3: Services
- `presence/services/SupabaseService.js` → Load as module
- `presence/services/APIService.js` → Load as module

### Priority 4: Features
- `presence/features/AuthManager.js` → Load as module
- `presence/features/VisibilityManager.js` → Load as module
- `presence/features/CanopiModule.js` → Load as module

## Implementation Steps

1. ✅ Run `npm run build:extension` to copy files
2. ⏳ Update `sidepanel.html` to load modules with `type="module"`
3. ⏳ Test one module at a time
4. ⏳ Verify all functionality works
5. ⏳ Remove legacy JavaScript files (when ready)

## Notes

- All TypeScript modules export to `window` for backward compatibility
- Can load as ES6 modules while maintaining window exports
- Test incrementally to catch issues early
- Keep legacy files until migration is verified

