# CanopiModule Refactoring Status

## Current State
- ✅ UserResolutionService created
- ✅ VisibilityModule created (with all visibility functions)
- ⚠️ MessagesModule created but has stubs (needs all functions)
- ⚠️ CanopiModule still has backward compatibility code

## Required Actions

1. **Move ALL 37 functions from CanopiModule to MessagesModule** (no stubs)
2. **Remove all backward compatibility code from CanopiModule**
3. **Update CanopiModule to just re-export from MessagesModule**
4. **Update all imports to use MessagesModule directly**
5. **Delete CanopiModule** (or keep as thin re-export wrapper)

## Functions That Need Full Implementation in MessagesModule

All 37 functions from CanopiModule need to be moved with complete implementations.

## Next Step

Create complete MessagesModule.js with ALL functions from CanopiModule, then remove backward compatibility.

