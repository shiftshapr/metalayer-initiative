# Orchestration Plan: TypeScript Migration Fixes
## Canopi Project - Fix Implementation Plan

**Date**: 2025-01-24  
**Orchestrator**: Orch Agent  
**Project**: canopi (metalayer-initiative)  
**Status**: INITIALIZED

---

## Problem Summary

**Problem ID**: TS-MIGRATION-001  
**Status**: identified  
**Severity**: CRITICAL (RED-LINE violations)

**Issues Identified**:
1. 30 duplicate `.js`/`.ts` files in `presence/src/` (violates source-only policy)
2. Duplicate snake_case/camelCase fields in type definitions (violates RED-LINE)
3. Inconsistent TypeScript strict mode configurations
4. Missing strict flags in TypeScript configs

---

## Workflow Execution Plan

### Phase 1: PM (Project Manager)
**Status**: ✅ COMPLETE

**Actions Taken**:
- ✅ Searched JAUmemory for existing problem memories
- ✅ Created problem memory entry (status=identified)
- ✅ Documented context, impact, tags, links
- ✅ Created evaluation report

**Memory ID**: `9828bb27-af56-41b5-895d-f4441509a9af`

---

### Phase 2: SD (Software Developer) - Diagnostic Scripts
**Status**: 🔄 IN PROGRESS

**Required Diagnostic Scripts**:

1. **Duplicate File Detector** (`scripts/diagnose-duplicate-ts-files.ts`)
   - Find all `.js`/`.ts` pairs in `presence/src/`
   - Verify no `.js` imports in TypeScript files
   - Report files that should be deleted

2. **Type Definition Validator** (`scripts/diagnose-type-definitions.ts`)
   - Detect snake_case fields in type definitions
   - Detect duplicate field names (camelCase + snake_case)
   - Verify camelCase-only policy compliance

3. **TypeScript Config Validator** (`scripts/diagnose-tsconfig.ts`)
   - Check strict mode consistency
   - Verify required strict flags are enabled
   - Report configuration discrepancies

4. **Build Artifact Verifier** (`scripts/diagnose-build-artifacts.ts`)
   - Verify no build artifacts in `src/`
   - Verify build output structure
   - Check for `.js` files that shouldn't be in source

**Script Location**: `presence/src/scripts/`  
**Execution**: Run before and after implementation

---

### Phase 3: Implementation Tasks

#### Task 3.1: Delete Duplicate JavaScript Files
**Priority**: 🔴 CRITICAL  
**Estimated Effort**: Medium  
**Files Affected**: 30 `.js` files

**Steps**:
1. Run diagnostic script to verify duplicates
2. Backup `.js` files to archive (if needed)
3. Delete all 30 `.js` files from `presence/src/`
4. Verify build still works: `npm run build:presence`
5. Check for any broken imports
6. Fix any imports that reference `.js` files

**Files to Delete**:
```
presence/src/utils/AvatarUtils.js
presence/src/utils/Logger.js
presence/src/utils/Fallbacks.js
presence/src/ui/diagnostics.js
presence/src/ui/autoResize.js
presence/src/ui/tabNavigation.js
presence/src/types/provenance.js
presence/src/types/index.js
presence/src/types/notifications.js
presence/src/types/anchors.js
presence/src/types/events.js
presence/src/types/api.js
presence/src/types/subscriptions.js
presence/src/features/visibility/integration/buildGraphAdapter.js
presence/src/features/visibility/utils/pageIdResolver.js
presence/src/features/visibility/utils/visibilityHelpers.js
presence/src/features/visibility/index.js
presence/src/features/visibility/ui/VisibilityModal.js
presence/src/features/visibility/ui/VisibilityUIEvents.js
presence/src/features/visibility/ui/VisibilitySettings.js
presence/src/features/visibility/ui/VisibilityTab.js
presence/src/features/visibility/core/VisibilityTypes.js
presence/src/features/visibility/core/VisibilityManager.js
presence/src/features/visibility/core/VisibilityState.js
presence/src/features/visibility/services/VisibilityStorage.js
presence/src/features/visibility/services/VisibilityRealtime.js
presence/src/features/UIManager.js
presence/src/features/PeopleModule.js
presence/src/features/AuthManager.js
presence/src/sidepanel/types.js
presence/src/sidepanel/buildGraph.js
presence/src/core/UserModule.js
presence/src/core/ConfigModule.js
presence/src/core/StateManager.js
presence/src/services/SupabaseService.js
presence/src/services/MessageLoadingService.js
```

#### Task 3.2: Fix Type Definitions
**Priority**: 🔴 CRITICAL  
**Estimated Effort**: Medium  
**Files Affected**: `presence/src/types/index.ts` and related type files

**Steps**:
1. Run diagnostic script to identify duplicate fields
2. Remove all snake_case fields from `User` interface:
   - Remove `user_id` (keep `userId`)
   - Remove `display_name` (keep `displayName`)
   - Remove `aura_color` (keep `auraColor`)
3. Check other interfaces for duplicate fields
4. Update API boundary code to convert snake_case → camelCase
5. Verify all code uses camelCase exclusively

**Changes Required**:
```typescript
// BEFORE (❌ WRONG)
export interface User {
  userId?: string;
  user_id?: string;        // ❌ Remove
  displayName?: string;
  display_name?: string;     // ❌ Remove
  auraColor?: string;
  aura_color?: string;      // ❌ Remove
}

// AFTER (✅ CORRECT)
export interface User {
  userId?: string;
  displayName?: string;
  auraColor?: string;
  // snake_case converted at API boundary
}
```

#### Task 3.3: Align TypeScript Configurations
**Priority**: 🟡 HIGH  
**Estimated Effort**: Low  
**Files Affected**: `tsconfig.json`, `presence/tsconfig.json`

**Steps**:
1. Update root `tsconfig.json`:
   - Set `strict: true`
   - Set `noImplicitAny: true`
   - Set `useUnknownInCatchVariables: true`
   - Add missing strict flags

2. Update `presence/tsconfig.json`:
   - Add missing strict flags:
     - `noUnusedLocals: true`
     - `noUnusedParameters: true`
     - `noImplicitReturns: true`
     - `noFallthroughCasesInSwitch: true`
     - `noUncheckedIndexedAccess: true`

3. Verify compilation still works
4. Fix any new type errors introduced

---

### Phase 4: TEST (Test Engineer)
**Status**: ⏳ PENDING

**Test Requirements**:
1. Run diagnostic scripts before implementation
2. Run diagnostic scripts after implementation
3. Verify build process: `npm run build:presence`
4. Verify no broken imports
5. Verify type checking passes: `tsc --noEmit`
6. Verify runtime functionality (manual testing)
7. Verify no regressions

**Test Scripts**:
- `scripts/diagnose-duplicate-ts-files.ts` (before/after)
- `scripts/diagnose-type-definitions.ts` (before/after)
- `scripts/diagnose-tsconfig.ts` (before/after)
- `scripts/diagnose-build-artifacts.ts` (before/after)

---

### Phase 5: RED (Red Team - Security Audit)
**Status**: ⏳ PENDING

**Security Checks**:
1. Verify no security implications from file deletions
2. Verify type definitions don't expose sensitive data
3. Verify build process security
4. Check for any security-related type safety issues

---

### Phase 6: WHITE (White Team - Code Review)
**Status**: ⏳ PENDING

**Review Checklist**:
- [ ] All duplicate files removed
- [ ] Type definitions comply with RED-LINE policy
- [ ] TypeScript configs aligned
- [ ] No broken imports
- [ ] Build process verified
- [ ] Code follows best practices

---

### Phase 7: PURPLE (Purple Team - Integration Testing)
**Status**: ⏳ PENDING

**Integration Tests**:
1. Verify extension loads correctly
2. Verify all modules import correctly
3. Verify no runtime errors
4. Verify type safety at runtime

---

### Phase 8: BLINDSPOT (Blindspot Audit)
**Status**: ⏳ PENDING

**Blindspot Checks**:
1. Check for missed duplicate files
2. Check for missed type definition issues
3. Check for configuration inconsistencies
4. Check for edge cases in file deletion
5. Check for import path issues

---

### Phase 9: BLUE (Blue Team - Final Approval)
**Status**: ⏳ PENDING

**Approval Criteria**:
- [ ] All diagnostic scripts pass
- [ ] All fixes implemented
- [ ] All tests pass
- [ ] All reviews complete
- [ ] No regressions
- [ ] Documentation updated
- [ ] JAUmemory updated

---

### Phase 10: LEARNING (Learning Phase)
**Status**: ⏳ PENDING

**Learning Tasks**:
1. **Pattern Identification**:
   - Search codebase/JAUmemory for similar issues
   - Document patterns that led to duplicates
   - Document patterns that led to type definition issues

2. **Prevention**:
   - Document how to prevent duplicate files
   - Document type definition best practices
   - Create guidelines for future migrations

3. **Auto-Detection**:
   - Register diagnostic patterns in JAUmemory
   - Create automated checks for duplicates
   - Create automated checks for type definitions

4. **Consolidation**:
   - Update collections in JAUmemory
   - Link related memories
   - Update agent memories

---

### Phase 11: META (Meta-Learning Phase)
**Status**: ⏳ PENDING

**Meta-Learning Tasks**:
1. Evaluate learning effectiveness
2. Identify gaps in process
3. Propose improvements
4. Intervene if learning ineffective
5. Update workflow based on learnings

---

### Phase 12: DEVOPS (DevOps Phase)
**Status**: ⏳ PENDING

**DevOps Tasks**:
1. Verify build pipeline
2. Update CI/CD if needed
3. Add pre-commit hooks to prevent duplicates
4. Add CI checks for type definition compliance
5. Document deployment process

---

### Phase 13: ETHICS (Ethics Review)
**Status**: ⏳ PENDING

**Ethics Checks**:
1. Verify no ethical concerns with changes
2. Verify accessibility maintained
3. Verify user experience not degraded
4. Verify no data loss risks

---

## Parallelization Assessment

**Task Complexity**: Medium  
**Time-Consuming**: Yes (30 files to delete, type fixes, config updates)  
**Sliceable**: Yes (can be split by module/feature)

**Parallelization Recommendation**: 
- **Task 3.1** (Delete duplicates): Can be split by directory (utils, features, core, services, types, ui, sidepanel, visibility)
- **Task 3.2** (Fix types): Single file, but can be done in parallel with 3.1
- **Task 3.3** (Fix configs): Quick, can be done in parallel

**Proposed Split**: 8-10 parallel sessions
- Session 1: Delete utils/ duplicates (3 files)
- Session 2: Delete ui/ duplicates (3 files)
- Session 3: Delete types/ duplicates (7 files)
- Session 4: Delete features/ core duplicates (5 files)
- Session 5: Delete features/visibility/ duplicates (11 files)
- Session 6: Delete services/ duplicates (2 files)
- Session 7: Delete sidepanel/ duplicates (2 files)
- Session 8: Fix type definitions (Task 3.2)
- Session 9: Fix TypeScript configs (Task 3.3)
- Session 10: Verification and testing

**User Approval Required**: Yes (ask user for 8-10 parallel sessions)

---

## Risk Assessment

### High Risk
- **File Deletion**: Risk of breaking imports if not careful
- **Type Definition Changes**: Risk of breaking code that uses snake_case
- **Build Process**: Risk of breaking build if configs misconfigured

### Mitigation
- Run diagnostic scripts before/after
- Verify build after each change
- Test imports after deletions
- Update API boundary code to handle conversions

---

## Success Criteria

- [ ] Zero duplicate `.js`/`.ts` files in `presence/src/`
- [ ] Zero snake_case fields in type definitions
- [ ] TypeScript configs aligned with `strict: true`
- [ ] All strict flags enabled
- [ ] Build process works correctly
- [ ] No broken imports
- [ ] All diagnostic scripts pass
- [ ] All tests pass
- [ ] All reviews complete
- [ ] JAUmemory updated
- [ ] Documentation updated

---

## Next Steps

1. **Await User Approval** for parallelization (if applicable)
2. **SD Phase**: Create diagnostic scripts
3. **Implementation**: Execute fixes
4. **Test Phase**: Verify fixes
5. **Continue Workflow**: Red → White → Purple → Blindspot → Blue → Learn → Meta → DevOps → Ethics

---

**Status**: ✅ **ORCHESTRATION INITIALIZED**  
**Next Phase**: SD (Diagnostic Scripts)  
**Awaiting**: User approval for parallelization (if applicable)




