# TypeScript Best Practices Fix Slices - 8 Parallel Prompts
## Canopi Project - TypeScript Best Practices & Common Mistakes Resolution

**Date**: 2025-01-24  
**Orchestrator**: Orch Agent  
**Project**: canopi (metalayer-initiative)  
**Status**: READY FOR PARALLEL EXECUTION

---

## Shared Context (All Sessions)

**Problem Memory ID**: `862e9d97-57e3-4edf-bd4f-644a91820d03`  
**Audit Report**: `docs/TYPESCRIPT_BEST_PRACTICES_AUDIT_REPORT.md`  
**Total Issues**: 100+ TypeScript best practice violations

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

## PROMPT SLICE 1: Core Modules

**Scope**: Fix TypeScript best practices in core modules

**Files to Fix**:
- `presence/src/core/StateManager.ts`
- `presence/src/core/EventBus.ts`
- `presence/src/core/BuildTracker.ts`
- `presence/src/core/ContextMenuConfig.ts`
- `presence/src/core/CursorParkManager.ts`
- `presence/src/core/UserModule.ts`
- `presence/src/core/ConfigModule.ts`

**Issues**:
- Window object type casting
- Any type usage
- Type suppressions

**Tasks**:
1. Read the audit report for context
2. Scan each file for `any` types, `as any` assertions, `@ts-ignore`/`@ts-expect-error`
3. Replace `any` with proper types or `unknown`
4. Create proper type definitions for window extensions in `types/global.d.ts`
5. Remove or fix type suppressions
6. Run `npx tsc --noEmit` to verify fixes
7. Run `npm run build:presence` to verify build
8. Update JAUmemory with status: `core-modules-fixed`

**Success Criteria**: Zero `any` types, zero suppressions, proper types, build passes

---

## PROMPT SLICE 2: Messages Module (Critical - Most Issues)

**Scope**: Fix TypeScript best practices in Messages module (highest issue count)

**Files to Fix**:
- `presence/src/features/MessagesModule.ts` (20+ issues)
- `presence/src/features/MessagesModuleServiceIntegration.ts`
- `presence/src/components/UnifiedMessageDisplay.ts`
- `presence/src/components/UnifiedMessageModal.ts`
- `presence/src/utils/UnifiedMessageRenderer.ts`

**Issues**:
- 20+ `any` type usages
- `window as any` casting
- Function parameters with `any` types
- Return types with `any`

**Tasks**:
1. Read the audit report for context
2. **CRITICAL**: Create proper type definitions for message-related types
3. Replace all `any` types with proper interfaces/types
4. Fix `getWindowFunction` to use proper types
5. Type all message payload functions properly
6. Replace `window as any` with proper Window interface extension
7. Run `npx tsc --noEmit` to verify fixes
8. Run `npm run build:presence` to verify build
9. Update JAUmemory with status: `messages-module-fixed`

**Success Criteria**: Zero `any` types in Messages module, proper type definitions, build passes

---

## PROMPT SLICE 3: Profile & Auth Modules

**Scope**: Fix TypeScript best practices in Profile and Auth modules

**Files to Fix**:
- `presence/src/features/ProfileManager.ts` (5+ issues)
- `presence/src/features/AuthManager.ts`
- `presence/src/features/AuthModule.ts`
- `presence/src/features/PeopleModule.ts`
- `presence/src/features/DisplayNameManager.ts`
- `presence/src/features/SettingsHeadlineManager.ts`

**Issues**:
- `@ts-ignore` suppressions (2 instances)
- `as any` assertions
- `window as any` casting
- UserPreferencesManager type casting

**Tasks**:
1. Read the audit report for context
2. **CRITICAL**: Fix `@ts-ignore` suppressions - create proper type declarations for dynamic imports
3. Replace `(userPreferencesManager as any)` with proper type definitions
4. Fix window object type casting
5. Create proper types for user preferences
6. Run `npx tsc --noEmit` to verify fixes
7. Run `npm run build:presence` to verify build
8. Update JAUmemory with status: `profile-auth-modules-fixed`

**Success Criteria**: Zero suppressions, proper types, build passes

---

## PROMPT SLICE 4: UI & Visibility Modules

**Scope**: Fix TypeScript best practices in UI and Visibility modules

**Files to Fix**:
- `presence/src/features/visibility/ui/VisibilitySettings.ts` (4+ issues)
- `presence/src/features/visibility/core/VisibilityManager.ts`
- `presence/src/features/visibility/core/VisibilityState.ts`
- `presence/src/features/visibility/services/VisibilityStorage.ts`
- `presence/src/features/UserHoverModal.ts` (2+ issues)
- `presence/src/features/UIManager.ts`
- `presence/src/features/AnchorHighlighter.ts`

**Issues**:
- `stateManagerInstance.getState('currentUser') as any` (4 instances in VisibilitySettings)
- `window.currentVisibilityDataUnfiltered` type casting
- Any type usage in visibility data

**Tasks**:
1. Read the audit report for context
2. **CRITICAL**: Create proper type for `currentUser` from StateManager
3. Fix all `as any` casts for currentUser
4. Create proper type definitions for visibility data structures
5. Type `window.currentVisibilityDataUnfiltered` properly
6. Replace `any` types in visibility services
7. Run `npx tsc --noEmit` to verify fixes
8. Run `npm run build:presence` to verify build
9. Update JAUmemory with status: `ui-visibility-modules-fixed`

**Success Criteria**: Zero `as any` casts, proper visibility types, build passes

---

## PROMPT SLICE 5: Tab Manager & Other Features

**Scope**: Fix TypeScript best practices in Tab Manager and other feature modules

**Files to Fix**:
- `presence/src/features/TabManager/TabManager.ts` (2+ issues)
- `presence/src/features/TabManager/TabManagerModal.ts`
- `presence/src/features/TabManager/TabConfiguration.ts`
- `presence/src/features/TabManager/initializeTabManager.ts`
- `presence/src/features/TabManager/AppStoreIntegration.ts`
- `presence/src/features/NotificationManager.ts`
- `presence/src/features/SubscriptionManager.ts`
- `presence/src/features/CommunitiesModule.ts`
- `presence/src/features/CommunityHelpers.ts`
- `presence/src/features/CommunityLoaders.ts`

**Issues**:
- `(window as any).userPreferencesManager` casting
- Any type usage
- Window object extensions

**Tasks**:
1. Read the audit report for context
2. Fix window object type casting for userPreferencesManager
3. Create proper type definitions for tab manager configurations
4. Replace `any` types with proper interfaces
5. Type community-related functions properly
6. Run `npx tsc --noEmit` to verify fixes
7. Run `npm run build:presence` to verify build
8. Update JAUmemory with status: `tab-manager-features-fixed`

**Success Criteria**: Zero `any` types, proper window types, build passes

---

## PROMPT SLICE 6: Services - Supabase & Realtime

**Scope**: Fix TypeScript best practices in Services module

**Files to Fix**:
- `presence/src/services/SupabaseService.ts` (3+ issues)
- `presence/src/services/SupabaseRealtimeClientFix.ts` (3+ issues)
- `presence/src/services/RealtimeSubscriptionService.ts`
- `presence/src/services/MessageStore.ts`
- `presence/src/services/MessageActionListenersService.ts`
- `presence/src/services/APIService.ts`
- `presence/src/services/MessageRendererService.ts`
- `presence/src/services/MessageLoadingService.ts`

**Issues**:
- `@ts-ignore` and `@ts-expect-error` suppressions
- `(this.client as any)` and `(supabaseClient as any)` casting
- Query builder type assertions

**Tasks**:
1. Read the audit report for context
2. **CRITICAL**: Fix `@ts-ignore`/`@ts-expect-error` suppressions in SupabaseService
3. Create proper type definitions for Supabase query builders
4. Replace `as any` assertions with proper Supabase types
5. Type all service methods properly
6. Fix dynamic import type issues
7. Run `npx tsc --noEmit` to verify fixes
8. Run `npm run build:presence` to verify build
9. Update JAUmemory with status: `services-module-fixed`

**Success Criteria**: Zero suppressions, proper Supabase types, build passes

---

## PROMPT SLICE 7: Utils - UserPreferences & Other Utilities

**Scope**: Fix TypeScript best practices in Utils module (high issue count)

**Files to Fix**:
- `presence/src/utils/UserPreferencesManager.ts` (10+ issues)
- `presence/src/utils/ThemeChangeTracker.ts`
- `presence/src/utils/UnifiedStorageSync.ts`
- `presence/src/utils/AvatarUtils.ts`
- `presence/src/utils/Logger.ts`
- `presence/src/utils/ApiBoundaryHelpers.ts`
- `presence/src/utils/UrlUtils.ts`
- `presence/src/utils/UserUtils.ts`
- `presence/src/utils/provenance/ProvenanceLinkInjector.ts`

**Issues**:
- 10+ `any` types in UserPreferencesManager
- `(this as any)` internal property access
- `validator: (v: any) => boolean` patterns
- Window object extensions

**Tasks**:
1. Read the audit report for context
2. **CRITICAL**: Fix UserPreferencesManager - replace all `any` types
3. Create proper type definitions for preference validators
4. Type internal properties properly instead of `(this as any)`
5. Fix window object extensions with proper types
6. Replace `any` in utility functions
7. Run `npx tsc --noEmit` to verify fixes
8. Run `npm run build:presence` to verify build
9. Update JAUmemory with status: `utils-module-fixed`

**Success Criteria**: Zero `any` types in utils, proper validator types, build passes

---

## PROMPT SLICE 8: Components & Sidepanel

**Scope**: Fix TypeScript best practices in Components and Sidepanel

**Files to Fix**:
- `presence/src/sidepanel/Sidepanel.ts` (multiple issues)
- `presence/src/sidepanel/buildGraph.ts`
- `presence/src/sidepanel/controllers/BootController.ts`
- `presence/src/sidepanel/controllers/TabController.ts`
- `presence/src/components/MessageLoader.ts`
- `presence/src/components/DraftSelectionModal.ts`
- `presence/src/components/GoVisibleModal.ts`
- `presence/src/components/OverlaySpinner.ts`
- `presence/src/ui/autoResize.ts`
- `presence/src/ui/messagingBridge.ts`
- `presence/src/ui/tabNavigation.ts`

**Issues**:
- `(graph as any)` casting
- `(window as any)` extensions
- Any type usage in components
- Module graph type definitions

**Tasks**:
1. Read the audit report for context
2. Create proper type definitions for module graph
3. Replace `(graph as any)` with proper graph types
4. Fix window object extensions
5. Type all component props and state properly
6. Replace `any` types in UI utilities
7. Run `npx tsc --noEmit` to verify fixes
8. Run `npm run build:presence` to verify build
9. Update JAUmemory with status: `components-sidepanel-fixed`

**Success Criteria**: Zero `any` types, proper graph types, build passes

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
   - Execute fixes systematically
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
   - Share findings that affect other slices (especially type definitions)

---

## Final Verification

After all 8 slices complete:
1. Run comprehensive verification: `npx tsc --noEmit`
2. Verify zero errors: `npm run build:presence`
3. Check all files compile successfully
4. Verify no `any` types remain (except properly justified)
5. Verify no type suppressions remain (except properly documented)
6. Update JAUmemory with final status
7. Generate consolidated report

---

## Success Criteria (All Slices)

- [ ] Zero `any` types in production code (or properly justified with comments)
- [ ] Zero `@ts-ignore`/`@ts-expect-error` suppressions (or properly documented)
- [ ] All window extensions properly typed in `types/global.d.ts`
- [ ] All type assertions use proper types
- [ ] Build succeeds: `npm run build:presence`
- [ ] Type checking passes: `tsc --noEmit`
- [ ] All type definitions complete
- [ ] JAUmemory updated for each slice
- [ ] Documentation updated

---

## Type Definition Strategy

**Window Extensions**: All window object extensions should be defined in `types/global.d.ts`:
```typescript
interface Window {
  userPreferencesManager?: UserPreferencesManager;
  currentVisibilityDataUnfiltered?: VisibilityData;
  // ... other extensions
}
```

**Dynamic Imports**: Create proper type declarations or use type assertions with specific types instead of `any`.

**Internal Properties**: Use private/protected modifiers or proper interfaces instead of `(this as any)`.

---

**Status**: ✅ **PROMPTS READY FOR PARALLEL EXECUTION**

**Total Issues to Fix**: 100+  
**Slices**: 8 balanced slices  
**Estimated Time**: High (depends on complexity of type definitions)


