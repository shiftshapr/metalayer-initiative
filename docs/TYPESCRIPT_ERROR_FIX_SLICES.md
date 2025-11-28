# TypeScript Error Fix Slices - 8 Parallel Prompts
## Canopi Project - TypeScript Compilation Error Resolution

**Date**: 2025-01-24  
**Orchestrator**: Orch Agent  
**Project**: canopi (metalayer-initiative)  
**Status**: READY FOR PARALLEL EXECUTION

---

## Shared Context (All Sessions)

**Problem Memory ID**: `d2b3212b-02f3-496a-a984-c542053e6896`  
**Audit Report**: `docs/TYPESCRIPT_FULL_AUDIT_REPORT.md`  
**Total Errors**: 70 TypeScript compilation errors

**Critical Rules**:
- NEVER edit `extension/`, `dist/`, `build/`. Edit `src/` only.
- Build required: `npm run build:presence` after changes
- TypeScript ES6 modules only. No CommonJS.
- No pre-launch backward-compat. Remove duplicates.
- Document in JAUmemory. No markdown in dist.
- Commit on resolution.

**Workflow**: pm → sd → test → red → white → purple → blindspot → blue → [learn] → [meta] → devops → ethics

**Before Starting**: Search JAUmemory for existing problem memories. Create/update if missing (status=identified).

**Verification**: After fixes, run `npm run build:presence` and `npx tsc --noEmit` to verify zero errors.

---

## PROMPT SLICE 1: Core Module Fixes

**Scope**: Fix TypeScript errors in `core/` module

**Files to Fix**:
- `presence/src/core/StateManager.ts` (2 errors)
- `presence/src/core/UnifiedContextMenu.ts` (1 error)

**Errors**:
1. `StateManager.ts(193,30)`: 'path' parameter is declared but never read
2. `StateManager.ts(193,44)`: 'value' parameter is declared but never read
3. `UnifiedContextMenu.ts(40,11)`: 'isVisible' variable is declared but never read

**Tasks**:
1. Read the audit report for context
2. Examine each file to understand the unused variables/parameters
3. Fix by either:
   - Removing unused variables/parameters
   - Prefixing with `_` if intentionally unused (e.g., `_path`, `_value`)
   - Using the variable if it should be used
4. Run `npx tsc --noEmit` to verify fixes
5. Run `npm run build:presence` to verify build
6. Update JAUmemory with status: `core-module-fixed`

**Success Criteria**: Zero errors in core module, build passes

---

## PROMPT SLICE 2: Features - Auth & Profile Modules

**Scope**: Fix unused variable/parameter errors in Auth and Profile modules

**Files to Fix**:
- `presence/src/features/AuthManager.ts` (1 error)
- `presence/src/features/AuthModule.ts` (3 errors)
- `presence/src/features/ProfileManager.ts` (5 errors)

**Errors**:
1. `AuthManager.ts(71,47)`: 'email' parameter is declared but never read
2. `AuthModule.ts(26,11)`: 'ApiClient' import is declared but never used
3. `AuthModule.ts(38,11)`: 'UserProfile' import is declared but never used
4. `AuthModule.ts(132,39)`: 'sessionError' variable is declared but never read
5. `ProfileManager.ts(144,11)`: 'authPromise' variable is declared but never read
6. `ProfileManager.ts(302,11)`: 'preRenderReady' variable is declared but never read
7. `ProfileManager.ts(732,11)`: 'currentUserUnsubscribe' variable is declared but never read
8. `ProfileManager.ts(1758,11)`: 'currentThemeGetter' variable is declared but never read
9. `ProfileManager.ts(2843,9)`: 'userAvatarContainer' variable is declared but never read

**Tasks**:
1. Read the audit report for context
2. Examine each file to understand unused variables/parameters/imports
3. Fix by removing unused code or prefixing with `_` if intentionally kept
4. Remove unused imports
5. Run `npx tsc --noEmit` to verify fixes
6. Run `npm run build:presence` to verify build
7. Update JAUmemory with status: `auth-profile-modules-fixed`

**Success Criteria**: Zero errors in Auth and Profile modules, build passes

---

## PROMPT SLICE 3: Features - Messages Module (Critical)

**Scope**: Fix errors in Messages module (includes missing property errors)

**Files to Fix**:
- `presence/src/features/MessagesModule.ts` (7 errors)
- `presence/src/features/MessagesModuleServiceIntegration.ts` (3 errors)

**Errors**:
1. `MessagesModule.ts(99,15)`: '_isInitialLoad' variable is declared but never read
2. `MessagesModule.ts(100,15)`: '_initialLoadComplete' variable is declared but never read
3. `MessagesModule.ts(2366,57)`: Property 'action' does not exist on type '{}' (CRITICAL)
4. `MessagesModule.ts(2385,53)`: Property 'action' does not exist on type '{}' (CRITICAL)
5. `MessagesModule.ts(2413,11)`: '_sendButton' variable is declared but never read
6. `MessagesModuleServiceIntegration.ts(13,3)`: 'MessageRendererService' import is declared but never used
7. `MessagesModuleServiceIntegration.ts(22,3)`: 'MessageActionListenersService' import is declared but never used
8. `MessagesModuleServiceIntegration.ts(76,9)`: 'messageLoading' variable is declared but never read

**Tasks**:
1. Read the audit report for context
2. **CRITICAL**: Fix missing property errors first (lines 2366, 2385)
   - Check `toggleResponse.data` type definition
   - Add proper type for response data with 'action' property
   - Use type assertion or type guard if needed
3. Fix unused variables/imports
4. Run `npx tsc --noEmit` to verify fixes
5. Run `npm run build:presence` to verify build
6. Update JAUmemory with status: `messages-module-fixed`

**Success Criteria**: Zero errors in Messages module, build passes, type safety maintained

---

## PROMPT SLICE 4: Features - UI & Tab Modules

**Scope**: Fix unused variable/parameter errors in UI and Tab modules

**Files to Fix**:
- `presence/src/features/UIManager.ts` (5 errors)
- `presence/src/features/UserHoverModal.ts` (5 errors)
- `presence/src/features/TabManager/TabManager.ts` (1 error)
- `presence/src/features/TabManager/TabManagerModal.ts` (1 error)
- `presence/src/features/TabManager/AppStoreIntegration.ts` (3 errors)

**Errors**:
1. `UIManager.ts(1,16)`: 'TabData' import is declared but never used
2. `UIManager.ts(1,25)`: 'Preferences' import is declared but never used
3. `UIManager.ts(111,7)`: 'createFallbackAvatar' variable is declared but never read
4. `UIManager.ts(123,20)`: 'window' parameter is declared but never read
5. `UIManager.ts(137,32)`: Property 'deps' is declared but never read
6. `UIManager.ts(865,42)`: 'metadata' parameter is declared but never read
7. `UserHoverModal.ts(59,11)`: 'isVisible' variable is declared but never read
8. `UserHoverModal.ts(60,11)`: 'currentTarget' variable is declared but never read
9. `UserHoverModal.ts(61,11)`: 'logger' variable is declared but never read
10. `UserHoverModal.ts(454,15)`: 'event' parameter is declared but never read
11. `UserHoverModal.ts(486,37)`: 'targetElement' variable is declared but never read
12. `TabManager.ts(10,1)`: All imports in import declaration are unused
13. `TabManagerModal.ts(317,34)`: 'filters' parameter is declared but never read
14. `AppStoreIntegration.ts(12,11)`: 'filters' parameter is declared but never read
15. `AppStoreIntegration.ts(152,38)`: 'limit' parameter is declared but never read
16. `AppStoreIntegration.ts(152,54)`: 'offset' parameter is declared but never read

**Tasks**:
1. Read the audit report for context
2. Examine each file to understand unused variables/parameters/imports
3. Fix by removing unused code or prefixing with `_` if intentionally kept
4. Remove unused imports
5. Run `npx tsc --noEmit` to verify fixes
6. Run `npm run build:presence` to verify build
7. Update JAUmemory with status: `ui-tab-modules-fixed`

**Success Criteria**: Zero errors in UI and Tab modules, build passes

---

## PROMPT SLICE 5: Features - Notification & Other Modules (Critical)

**Scope**: Fix possibly undefined errors and unused variables in Notification and other feature modules

**Files to Fix**:
- `presence/src/features/NotificationManager.ts` (6 errors - 5 CRITICAL)
- `presence/src/features/AnchorHighlighter.ts` (2 errors - 1 CRITICAL)
- `presence/src/features/CursorVisualSettingsManager.ts` (1 error)
- `presence/src/features/PeopleModule.ts` (1 error)
- `presence/src/features/SubscriptionManager.ts` (1 error)

**Errors**:
1. `NotificationManager.ts(6,33)`: 'NotificationOptions' import is declared but never used
2. `NotificationManager.ts(460,40)`: Object is possibly 'undefined' (CRITICAL)
3. `NotificationManager.ts(462,46)`: Object is possibly 'undefined' (CRITICAL)
4. `NotificationManager.ts(463,49)`: Object is possibly 'undefined' (CRITICAL)
5. `NotificationManager.ts(474,17)`: 'tab' is possibly 'undefined' (CRITICAL)
6. `NotificationManager.ts(475,47)`: 'tab' is possibly 'undefined' (CRITICAL)
7. `NotificationManager.ts(731,27)`: 'type' parameter is declared but never read
8. `AnchorHighlighter.ts(104,36)`: 'state' parameter is declared but never read
9. `AnchorHighlighter.ts(120,5)`: Type 'string | undefined' is not assignable to type 'string' (CRITICAL)
10. `CursorVisualSettingsManager.ts(230,11)`: 'escapeHtml' variable is declared but never read
11. `PeopleModule.ts(15,11)`: 'logger' variable is declared but never read
12. `SubscriptionManager.ts(378,15)`: 'subscription' variable is declared but never read

**Tasks**:
1. Read the audit report for context
2. **CRITICAL**: Fix possibly undefined errors first
   - Add null/undefined checks before property access
   - Use optional chaining (`?.`) where appropriate
   - Use nullish coalescing (`??`) for defaults
   - Add type guards where needed
3. **CRITICAL**: Fix type assignment error in AnchorHighlighter.ts
   - Add null check or default value
   - Use `??` operator for default
4. Fix unused variables/imports
5. Run `npx tsc --noEmit` to verify fixes
6. Run `npm run build:presence` to verify build
7. Update JAUmemory with status: `notification-other-modules-fixed`

**Success Criteria**: Zero errors in Notification and other modules, build passes, type safety maintained

---

## PROMPT SLICE 6: Services Module Fixes

**Scope**: Fix unused variable/parameter errors in Services module

**Files to Fix**:
- `presence/src/services/MessageLoadingService.ts` (1 error)
- `presence/src/services/MessageRendererService.ts` (2 errors)
- `presence/src/services/RealtimeSubscriptionService.ts` (3 errors)
- `presence/src/services/SupabaseRealtimeClientFix.ts` (2 errors)
- `presence/src/services/SupabaseService.ts` (3 errors)

**Errors**:
1. `MessageLoadingService.ts(30,11)`: '_container' variable is declared but never read
2. `MessageRendererService.ts(59,11)`: 'userResolutionService' variable is declared but never read
3. `MessageRendererService.ts(86,7)`: 'container' parameter is declared but never read
4. `RealtimeSubscriptionService.ts(9,29)`: 'Message' import is declared but never used
5. `RealtimeSubscriptionService.ts(17,11)`: 'SubscriptionOptions' import is declared but never used
6. `RealtimeSubscriptionService.ts(62,21)`: 'communityId' parameter is declared but never read
7. `SupabaseRealtimeClientFix.ts(44,11)`: 'originalMethod' variable is declared but never read
8. `SupabaseRealtimeClientFix.ts(56,13)`: 'useApiEndpoint' variable is declared but never read
9. `SupabaseService.ts(93,11)`: 'logLevel' parameter is declared but never read
10. `SupabaseService.ts(132,15)`: 'authSubscription' variable is declared but never read
11. `SupabaseService.ts(371,6)`: 'event' parameter is declared but never read

**Tasks**:
1. Read the audit report for context
2. Examine each file to understand unused variables/parameters/imports
3. Fix by removing unused code or prefixing with `_` if intentionally kept
4. Remove unused imports
5. Run `npx tsc --noEmit` to verify fixes
6. Run `npm run build:presence` to verify build
7. Update JAUmemory with status: `services-module-fixed`

**Success Criteria**: Zero errors in Services module, build passes

---

## PROMPT SLICE 7: Utils Module Fixes (Critical)

**Scope**: Fix type assignment and possibly undefined errors in Utils module

**Files to Fix**:
- `presence/src/utils/Logger.ts` (1 error - CRITICAL)
- `presence/src/utils/AvatarUtils.ts` (1 error)
- `presence/src/utils/ComprehensiveDiagnostic.ts` (1 error)
- `presence/src/utils/DEFAULT_VS_FOCUS_MODE_DIAGNOSTIC.ts` (2 errors - CRITICAL)
- `presence/src/utils/DIAGNOSTIC_HEADLINE_DISPLAYNAME.ts` (1 error)
- `presence/src/utils/FOCUS_MODE_REPLY_DIAGNOSTIC.ts` (5 errors - CRITICAL)

**Errors**:
1. `Logger.ts(30,10)`: Type 'number | undefined' is not assignable to type 'number' (CRITICAL)
2. `AvatarUtils.ts(144,11)`: 'showStatus' variable is declared but never read
3. `ComprehensiveDiagnostic.ts(33,6)`: 'DiagnosticError' import is declared but never used
4. `DEFAULT_VS_FOCUS_MODE_DIAGNOSTIC.ts(297,33)`: 'defaultInfo' is possibly 'undefined' (CRITICAL)
5. `DEFAULT_VS_FOCUS_MODE_DIAGNOSTIC.ts(297,72)`: 'defaultInfo' is possibly 'undefined' (CRITICAL)
6. `DIAGNOSTIC_HEADLINE_DISPLAYNAME.ts(88,13)`: 'testDisplayName' variable is declared but never read
7. `FOCUS_MODE_REPLY_DIAGNOSTIC.ts(170,13)`: 'msg' is possibly 'undefined' (CRITICAL)
8. `FOCUS_MODE_REPLY_DIAGNOSTIC.ts(171,22)`: 'msg' is possibly 'undefined' (CRITICAL)
9. `FOCUS_MODE_REPLY_DIAGNOSTIC.ts(172,17)`: 'msg' is possibly 'undefined' (CRITICAL)
10. `FOCUS_MODE_REPLY_DIAGNOSTIC.ts(220,30)`: 'msg' is possibly 'undefined' (CRITICAL)
11. `FOCUS_MODE_REPLY_DIAGNOSTIC.ts(220,49)`: 'message' is possibly 'undefined' (CRITICAL)

**Tasks**:
1. Read the audit report for context
2. **CRITICAL**: Fix type assignment error in Logger.ts
   - Check LOG_LEVELS definition
   - Add null check or default value
   - Use `??` operator for default
3. **CRITICAL**: Fix all possibly undefined errors
   - Add null/undefined checks before property access
   - Use optional chaining (`?.`) where appropriate
   - Use nullish coalescing (`??`) for defaults
   - Add type guards where needed
4. Fix unused variables/imports
5. Run `npx tsc --noEmit` to verify fixes
6. Run `npm run build:presence` to verify build
7. Update JAUmemory with status: `utils-module-fixed`

**Success Criteria**: Zero errors in Utils module, build passes, type safety maintained

---

## PROMPT SLICE 8: Type Definitions & Configuration

**Scope**: Fix type definitions and verify TypeScript configuration

**Files to Review/Fix**:
- `presence/src/types/index.ts` (check for duplicate snake_case/camelCase fields)
- `tsconfig.json` (root - verify strict mode)
- `presence/tsconfig.json` (verify strict flags)

**Tasks**:
1. Review type definitions for any issues
2. Verify TypeScript configurations are aligned
3. Check for any remaining type definition issues
4. Verify all strict flags are enabled
5. Run `npx tsc --noEmit` to verify zero errors across entire codebase
6. Run `npm run build:presence` to verify build
7. Update JAUmemory with status: `type-definitions-config-verified`

**Success Criteria**: Zero TypeScript errors across entire codebase, build passes, configs aligned

---

## Execution Instructions

**For Each Prompt Slice**:

1. **Before Starting**:
   - Search JAUmemory for existing memories related to your slice
   - Create/update problem memory if missing (status=identified)
   - Read shared context documents
   - Read the audit report

2. **During Execution**:
   - Follow workflow: pm → sd → test → red → white → purple → blindspot → blue
   - Create diagnostic script if needed (SD phase)
   - Execute fixes
   - Run tests: `npx tsc --noEmit` and `npm run build:presence`
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

## Final Verification

After all 8 slices complete:
1. Run comprehensive verification: `npx tsc --noEmit`
2. Verify zero errors: `npm run build:presence`
3. Check all files compile successfully
4. Update JAUmemory with final status
5. Generate consolidated report

---

## Success Criteria (All Slices)

- [ ] Zero TypeScript compilation errors
- [ ] Build succeeds: `npm run build:presence`
- [ ] Type checking passes: `tsc --noEmit`
- [ ] All critical errors fixed (possibly undefined, type assignment, missing property)
- [ ] All unused code removed or properly marked
- [ ] All null checks in place
- [ ] All type definitions complete
- [ ] JAUmemory updated for each slice
- [ ] Documentation updated

---

**Status**: ✅ **PROMPTS READY FOR PARALLEL EXECUTION**

**Total Errors to Fix**: 70  
**Slices**: 8 balanced slices  
**Estimated Time**: Medium-High (depends on complexity of fixes)
