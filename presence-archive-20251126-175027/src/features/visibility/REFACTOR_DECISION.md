# Refactor Decision: Visibility System

## Current State Assessment

### Problems Identified
1. **Diagnostic script cannot get baseline** - Cannot access graph
2. **Visibility system not working** - Profiles not showing on same page
3. **Multiple failed fix attempts** - UUID changes, initialization fixes, filtering fixes all failed
4. **Complex initialization flow** - Multiple initialization points causing race conditions
5. **Unclear data flow** - Database → Realtime → Manager → State → UI pipeline is broken

### Root Cause Analysis

**Primary Issue**: The visibility system has accumulated too many workarounds and patches. The architecture is fundamentally broken.

**Evidence**:
- Diagnostic script can't even access the graph (timing/initialization issue)
- Multiple initialization paths (BootController, buildGraph, createVisibilityRefresher)
- UUID vs email confusion throughout
- Filtering logic not working
- Data fetching inconsistencies

## Decision: YES, REFACTOR REQUIRED

### Why Refactor vs Fix?

**Fix Approach (Current)**: Patch individual issues
- ❌ Has failed multiple times
- ❌ Creates more complexity
- ❌ Doesn't address root architectural issues
- ❌ Diagnostic script can't even run

**Refactor Approach**: Rebuild with clean architecture
- ✅ Addresses root causes
- ✅ Simplifies architecture
- ✅ Makes system testable
- ✅ Enables proper diagnostics

### Refactor Scope

**Phase 1: Foundation (Critical)**
1. Single initialization point
2. Clear data flow pipeline
3. UUID-only throughout
4. Proper error handling

**Phase 2: Architecture (High Priority)**
1. Simplify VisibilityManager
2. Clear separation of concerns
3. Testable components
4. Proper state management

**Phase 3: Testing & Validation**
1. Diagnostic scripts that work
2. Manual testing
3. Integration testing

## Recommendation

**PROCEED WITH REFACTOR**

The current system is too broken to patch. A clean refactor will:
- Fix root causes, not symptoms
- Make the system maintainable
- Enable proper diagnostics
- Prevent future issues

## Next Steps

1. Create refactor plan with clear architecture
2. Implement Phase 1 (Foundation)
3. Test incrementally
4. Complete Phase 2 & 3

