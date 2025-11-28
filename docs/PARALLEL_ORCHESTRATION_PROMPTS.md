# Parallel Orchestration Prompts - TypeScript Migration Fixes
## 8 Balanced Sub-Prompts for Parallel Execution

**Project**: canopi (metalayer-initiative)  
**Task**: TypeScript Migration Best Practices Fixes  
**Date**: 2025-01-24

---

## Shared Context (All Sessions)

**Problem Memory ID**: `2d03d15b-d1db-46ff-96ec-090bacbb54ec`  
**Evaluation Report**: `docs/TYPESCRIPT_MIGRATION_EVALUATION_REPORT.md`  
**Orchestration Plan**: `docs/ORCHESTRATION_PLAN_TYPESCRIPT_FIXES.md`

**Critical Rules**:
- NEVER edit `extension/`, `dist/`, `build/`. Edit `src/` only.
- Build required: `npm run build:presence` after changes
- TypeScript ES6 modules only. No CommonJS.
- No pre-launch backward-compat. Remove duplicates.
- Document in JAUmemory. No markdown in dist.
- Commit on resolution.

**Workflow**: pm → sd → test → red → white → purple → blindspot → blue → [learn] → [meta] → devops → ethics

**Before Starting**: Search JAUmemory for existing problem memories. Create/update if missing (status=identified).

---

## PROMPT SLICE 1: Delete Utils/ Duplicates

**Scope**: Delete 3 duplicate JavaScript files in `presence/src/utils/`

**Files to Delete**:
- `presence/src/utils/AvatarUtils.js`
- `presence/src/utils/Logger.js`
- `presence/src/utils/Fallbacks.js`

**Tasks**:
1. Verify corresponding `.ts` files exist and are complete
2. Check for any imports referencing these `.js` files
3. Delete the 3 `.js` files
4. Run `npm run build:presence` to verify build still works
5. Check for any broken imports
6. Update JAUmemory with status: `utils-duplicates-removed`
7. Document any issues found

**Verification**:
- No `.js` files remain in `presence/src/utils/` (except diagnostic scripts)
- Build succeeds
- No import errors

**Success Criteria**: All 3 files deleted, build passes, no regressions

---

## PROMPT SLICE 2: Delete UI/ Duplicates

**Scope**: Delete 3 duplicate JavaScript files in `presence/src/ui/`

**Files to Delete**:
- `presence/src/ui/diagnostics.js`
- `presence/src/ui/autoResize.js`
- `presence/src/ui/tabNavigation.js`

**Tasks**:
1. Verify corresponding `.ts` files exist and are complete
2. Check for any imports referencing these `.js` files
3. Delete the 3 `.js` files
4. Run `npm run build:presence` to verify build still works
5. Check for any broken imports
6. Update JAUmemory with status: `ui-duplicates-removed`
7. Document any issues found

**Verification**:
- No `.js` files remain in `presence/src/ui/` (except diagnostic scripts)
- Build succeeds
- No import errors

**Success Criteria**: All 3 files deleted, build passes, no regressions

---

## PROMPT SLICE 3: Delete Types/ Duplicates

**Scope**: Delete 7 duplicate JavaScript files in `presence/src/types/`

**Files to Delete**:
- `presence/src/types/provenance.js`
- `presence/src/types/index.js`
- `presence/src/types/notifications.js`
- `presence/src/types/anchors.js`
- `presence/src/types/events.js`
- `presence/src/types/api.js`
- `presence/src/types/subscriptions.js`

**Tasks**:
1. Verify corresponding `.ts` files exist and are complete
2. Check for any imports referencing these `.js` files (especially `index.js`)
3. Delete the 7 `.js` files
4. Run `npm run build:presence` to verify build still works
5. Check for any broken imports (types are heavily imported)
6. Update JAUmemory with status: `types-duplicates-removed`
7. Document any issues found

**Verification**:
- No `.js` files remain in `presence/src/types/`
- Build succeeds
- No import errors (types are critical)

**Success Criteria**: All 7 files deleted, build passes, no regressions

---

## PROMPT SLICE 4: Delete Core/ and Features/ Core Duplicates

**Scope**: Delete 5 duplicate JavaScript files in `presence/src/core/` and `presence/src/features/`

**Files to Delete**:
- `presence/src/core/UserModule.js`
- `presence/src/core/ConfigModule.js`
- `presence/src/core/StateManager.js`
- `presence/src/features/UIManager.js`
- `presence/src/features/PeopleModule.js`
- `presence/src/features/AuthManager.js`

**Tasks**:
1. Verify corresponding `.ts` files exist and are complete
2. Check for any imports referencing these `.js` files
3. Delete the 6 `.js` files (note: 6 files, not 5 - corrected)
4. Run `npm run build:presence` to verify build still works
5. Check for any broken imports (core modules are critical)
6. Update JAUmemory with status: `core-features-duplicates-removed`
7. Document any issues found

**Verification**:
- No `.js` files remain in `presence/src/core/` or `presence/src/features/` (except visibility/ and diagnostic scripts)
- Build succeeds
- No import errors

**Success Criteria**: All 6 files deleted, build passes, no regressions

---

## PROMPT SLICE 5: Delete Features/Visibility/ Duplicates

**Scope**: Delete 11 duplicate JavaScript files in `presence/src/features/visibility/`

**Files to Delete**:
- `presence/src/features/visibility/integration/buildGraphAdapter.js`
- `presence/src/features/visibility/utils/pageIdResolver.js`
- `presence/src/features/visibility/utils/visibilityHelpers.js`
- `presence/src/features/visibility/index.js`
- `presence/src/features/visibility/ui/VisibilityModal.js`
- `presence/src/features/visibility/ui/VisibilityUIEvents.js`
- `presence/src/features/visibility/ui/VisibilitySettings.js`
- `presence/src/features/visibility/ui/VisibilityTab.js`
- `presence/src/features/visibility/core/VisibilityTypes.js`
- `presence/src/features/visibility/core/VisibilityManager.js`
- `presence/src/features/visibility/core/VisibilityState.js`
- `presence/src/features/visibility/services/VisibilityStorage.js`
- `presence/src/features/visibility/services/VisibilityRealtime.js`

**Tasks**:
1. Verify corresponding `.ts` files exist and are complete
2. Check for any imports referencing these `.js` files
3. Delete the 13 `.js` files (note: 13 files total in visibility module)
4. Run `npm run build:presence` to verify build still works
5. Check for any broken imports
6. Update JAUmemory with status: `visibility-duplicates-removed`
7. Document any issues found

**Verification**:
- No `.js` files remain in `presence/src/features/visibility/`
- Build succeeds
- No import errors

**Success Criteria**: All 13 files deleted, build passes, no regressions

---

## PROMPT SLICE 6: Delete Services/ and Sidepanel/ Duplicates

**Scope**: Delete 4 duplicate JavaScript files in `presence/src/services/` and `presence/src/sidepanel/`

**Files to Delete**:
- `presence/src/services/SupabaseService.js`
- `presence/src/services/MessageLoadingService.js`
- `presence/src/sidepanel/types.js`
- `presence/src/sidepanel/buildGraph.js`

**Tasks**:
1. Verify corresponding `.ts` files exist and are complete
2. Check for any imports referencing these `.js` files
3. Delete the 4 `.js` files
4. Run `npm run build:presence` to verify build still works
5. Check for any broken imports (services are critical)
6. Update JAUmemory with status: `services-sidepanel-duplicates-removed`
7. Document any issues found

**Verification**:
- No `.js` files remain in `presence/src/services/` or `presence/src/sidepanel/` (except diagnostic scripts)
- Build succeeds
- No import errors

**Success Criteria**: All 4 files deleted, build passes, no regressions

---

## PROMPT SLICE 7: Fix Type Definitions (Remove snake_case Fields)

**Scope**: Remove duplicate snake_case fields from type definitions (RED-LINE violation)

**Files to Fix**:
- `presence/src/types/index.ts` (primary - User interface)
- Check other type files for similar issues

**Tasks**:
1. Search for all snake_case fields in type definitions
2. Remove duplicate snake_case fields from `User` interface:
   - Remove `user_id` (keep `userId`)
   - Remove `display_name` (keep `displayName`)
   - Remove `aura_color` (keep `auraColor`)
3. Check other interfaces for duplicate fields
4. Verify API boundary code converts snake_case → camelCase
5. Search codebase for any code using snake_case fields
6. Update code to use camelCase exclusively
7. Run `npm run build:presence` to verify
8. Update JAUmemory with status: `type-definitions-fixed`
9. Document changes made

**Verification**:
- No snake_case fields in type definitions
- All code uses camelCase
- Build succeeds
- No type errors

**Success Criteria**: All snake_case fields removed, camelCase-only policy enforced, build passes

---

## PROMPT SLICE 8: Fix TypeScript Configurations

**Scope**: Align TypeScript configs and enable strict flags

**Files to Fix**:
- `tsconfig.json` (root)
- `presence/tsconfig.json`

**Tasks**:
1. Update root `tsconfig.json`:
   - Set `strict: true`
   - Set `noImplicitAny: true`
   - Set `useUnknownInCatchVariables: true`
2. Update `presence/tsconfig.json`:
   - Add `noUnusedLocals: true`
   - Add `noUnusedParameters: true`
   - Add `noImplicitReturns: true`
   - Add `noFallthroughCasesInSwitch: true`
   - Add `noUncheckedIndexedAccess: true`
3. Run `tsc --noEmit` to check for type errors
4. Fix any new type errors introduced by strict mode
5. Run `npm run build:presence` to verify build still works
6. Update JAUmemory with status: `tsconfig-aligned`
7. Document configuration changes

**Verification**:
- Both configs have `strict: true`
- All strict flags enabled
- Build succeeds
- No new type errors (or errors are intentional and documented)

**Success Criteria**: Configs aligned, strict flags enabled, build passes, type errors resolved

---

## Execution Instructions

**For Each Prompt Slice**:

1. **Before Starting**:
   - Search JAUmemory for existing memories related to your slice
   - Create/update problem memory if missing (status=identified)
   - Read shared context documents

2. **During Execution**:
   - Follow workflow: pm → sd → test → red → white → purple → blindspot → blue
   - Create diagnostic script if needed (SD phase)
   - Execute fixes
   - Run tests
   - Update JAUmemory with progress

3. **After Completion**:
   - Update JAUmemory with status: `completed`
   - Document findings, issues, solutions
   - Link related memories
   - Report status: PASSED/FAILED/WARNINGS

4. **Coordination**:
   - Check JAUmemory for other slices' progress
   - Avoid conflicts (different file sets)
   - Share findings that affect other slices

---

## Success Criteria (All Slices)

- [ ] All duplicate `.js` files deleted from `presence/src/`
- [ ] All snake_case fields removed from type definitions
- [ ] TypeScript configs aligned with `strict: true`
- [ ] All strict flags enabled
- [ ] Build process works: `npm run build:presence`
- [ ] No broken imports
- [ ] No type errors
- [ ] JAUmemory updated for each slice
- [ ] Documentation updated

---

## Final Coordination

After all 8 slices complete:
1. Run comprehensive diagnostic: `scripts/diagnose-all-ts-fixes.ts`
2. Verify zero duplicates remain
3. Verify type definitions comply
4. Verify configs aligned
5. Run full build and test suite
6. Update JAUmemory with final status
7. Generate consolidated report

---

**Status**: ✅ **PROMPTS READY FOR PARALLEL EXECUTION**




