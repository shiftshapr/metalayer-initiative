# Safe Refactoring Plan - CanopiModule to MessagesModule

## Safest Approach: Incremental Copy & Adapt

**Principle**: Keep original intact, create new complete module, test, then switch.

## Step-by-Step Plan

### Phase 1: Create Complete MessagesModule (Keep Original Intact)
1. Copy entire CanopiModule.js to MessagesModule_complete.js
2. Remove visibility helper functions (use VisibilityModule instead)
3. Remove backward compatibility code
4. Remove CanopiModule class wrapper
5. Export all functions directly
6. Test that MessagesModule_complete works

### Phase 2: Update CanopiModule to Re-export
1. Make CanopiModule.js just re-export from MessagesModule_complete
2. Test backward compatibility
3. Verify all existing code still works

### Phase 3: Update Imports
1. Update all imports to use MessagesModule directly
2. Test each import update
3. Verify functionality

### Phase 4: Cleanup
1. Rename MessagesModule_complete.js to MessagesModule.js
2. Delete old CanopiModule.js (or keep as thin wrapper)
3. Final testing

## Why This Is Safest

1. **Original Intact**: CanopiModule.js stays unchanged until new module is proven
2. **Incremental Testing**: Test at each phase
3. **Easy Rollback**: Can revert at any point
4. **No Stubs**: Complete implementation from start
5. **Functional Parity**: All 37 functions moved with full implementations

## Risk Mitigation

- Keep CanopiModule.js as backup
- Test after each phase
- Can revert if issues found
- Maintain git commits at each phase

