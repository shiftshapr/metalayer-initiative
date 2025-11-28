# Complete MessagesModule Refactoring

## Status: IN PROGRESS

**Goal**: Move ALL functions from CanopiModule to MessagesModule, remove all backward compatibility, ensure no stubs.

**File Size**: 2630 lines, 121,800 characters, 37 functions

## Approach

Given the massive size, I'll:
1. Create complete MessagesModule with ALL functions from CanopiModule
2. Remove visibility helper functions (use VisibilityModule instead)
3. Remove all backward compatibility code
4. Make CanopiModule just re-export from MessagesModule
5. Update all imports to use MessagesModule directly
6. Delete CanopiModule

## Functions to Move (37 total)

All functions from CanopiModule need to be moved to MessagesModule with full implementations (no stubs).

## Next Steps

1. Create complete MessagesModule.js with all functions
2. Remove backward compatibility from CanopiModule
3. Update all imports
4. Test
5. Delete CanopiModule

