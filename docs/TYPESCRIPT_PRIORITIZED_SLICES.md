# TypeScript Best Practices Fix Slices - 8 Prioritized Parallel Prompts
## Canopi Project - Prioritized TypeScript Best Practices Resolution

**Date**: 2025-01-24  
**Orchestrator**: Orch Agent  
**Project**: canopi (metalayer-initiative)  
**Status**: READY FOR PARALLEL EXECUTION - RESOURCES PRIORITIZED

---

## Shared Context (All Sessions)

**Problem Memory ID**: `862e9d97-57e3-4edf-bd4f-644a91820d03`  
**Prioritized Analysis**: `docs/TYPESCRIPT_PATTERNS_PRIORITIZED.json`  
**Total Issues**: 54 issues across 13 files

**Priority Findings** (Higher = More Resources):
1. **any-type-annotation** (Priority: 60) - 20 instances, 9 files - **HIGHEST PRIORITY**
2. **as-any-assertion** (Priority: 56) - 14 instances, 5 files - **HIGH PRIORITY**
3. **function-param-any** (Priority: 33) - 11 instances, 7 files
4. **ts-ignore** (Priority: 12) - 4 instances, 2 files
5. **ts-expect-error** (Priority: 8) - 4 instances, 2 files
6. **window-as-any** (Priority: 3) - 1 instance, 1 file

**Resource Allocation Strategy**:
- **Slices 1-3**: Focus on highest-priority patterns (any-type-annotation, as-any-assertion)
- **Slices 4-5**: Address function-param-any pattern
- **Slices 6-7**: Handle type suppressions and remaining issues
- **Slice 8**: Window casting and cleanup

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

## PROMPT SLICE 1: Any Type Annotations - Part 1 (HIGHEST PRIORITY)

**Scope**: Fix `: any` type annotations - Highest priority pattern (Priority: 60)

**Files to Fix** (Focus on highest issue count):
- `presence/src/features/AgentModule.ts` (Multiple `: any` annotations)
- `presence/src/features/visibility/integration/buildGraphAdapter.ts` (7 issues)
- `presence/src/features/visibility/services/VisibilityStorage.ts` (6 issues)

**Pattern**: `: any` type annotations (20 instances total)

**Issues**:
- Function return types with `any`
- Object property types with `any`
- Generic type parameters with `any`
- Window interface extensions with `any`

**Tasks**:
1. Read prioritized analysis report
2. **CRITICAL**: Focus on AgentModule.ts - highest issue count (14 issues)
3. Replace `: any` with proper types:
   - Create interfaces for API responses
   - Type YouTube service properly
   - Type window extensions in `types/global.d.ts`
4. Fix buildGraphAdapter.ts - type graph structures properly
5. Fix VisibilityStorage.ts - type storage interfaces properly
6. Run `npx tsc --noEmit` to verify fixes
7. Run `npm run build:presence` to verify build
8. Update JAUmemory with status: `any-type-annotations-part1-fixed`

**Success Criteria**: Zero `: any` annotations in target files, proper types, build passes

**Resource Allocation**: HIGH - This is the highest priority pattern

---

## PROMPT SLICE 2: Any Type Annotations - Part 2 (HIGHEST PRIORITY)

**Scope**: Fix remaining `: any` type annotations

**Files to Fix**:
- `presence/src/features/CursorVisualSettingsManager.ts` (2 issues)
- `presence/src/features/DisplayNameManager.ts` (2 issues)
- `presence/src/features/SettingsHeadlineManager.ts` (2 issues)
- `presence/src/sidepanel/Sidepanel.ts` (2 issues)
- `presence/src/utils/DEFAULT_VS_FOCUS_MODE_DIAGNOSTIC.ts` (2 issues)
- Other files with `: any` annotations

**Pattern**: `: any` type annotations (remaining instances)

**Issues**:
- Chrome storage result types
- Window extension types
- Diagnostic function types

**Tasks**:
1. Read prioritized analysis report
2. Fix Chrome storage types - create proper interface for `chrome.storage.local.get` results
3. Fix window extension types - add to `types/global.d.ts`
4. Fix diagnostic types - create proper type definitions
5. Replace all remaining `: any` with proper types
6. Run `npx tsc --noEmit` to verify fixes
7. Run `npm run build:presence` to verify build
8. Update JAUmemory with status: `any-type-annotations-part2-fixed`

**Success Criteria**: Zero `: any` annotations in target files, proper types, build passes

**Resource Allocation**: HIGH - Part of highest priority pattern

---

## PROMPT SLICE 3: As Any Assertions (HIGH PRIORITY)

**Scope**: Fix `as any` type assertions - Second highest priority (Priority: 56)

**Files to Fix**:
- `presence/src/features/AgentModule.ts` (Multiple `as any` assertions)
- `presence/src/features/APIModule.ts` (2 issues)
- `presence/src/scripts/verify-cleanup-safety.ts` (2 issues)
- Other files with `as any` assertions

**Pattern**: `as any` type assertions (14 instances total)

**Issues**:
- Error object casting: `(errorData as any).error`
- Response object casting: `(response as any).content`
- State manager casting: `getState('supabase') as any`
- Internal property access patterns

**Tasks**:
1. Read prioritized analysis report
2. **CRITICAL**: Fix error handling - create proper error types instead of `as any`
3. Fix API response types - create interfaces for API responses
4. Fix state manager types - properly type state values
5. Replace all `as any` with proper type assertions or type guards
6. Use type guards for runtime type checking
7. Run `npx tsc --noEmit` to verify fixes
8. Run `npm run build:presence` to verify build
9. Update JAUmemory with status: `as-any-assertions-fixed`

**Success Criteria**: Zero `as any` assertions, proper type guards, build passes

**Resource Allocation**: HIGH - Second highest priority pattern

---

## PROMPT SLICE 4: Function Parameters with Any (MEDIUM-HIGH PRIORITY)

**Scope**: Fix function parameters with `any` types (Priority: 33)

**Files to Fix**:
- `presence/src/features/AgentModule.ts` (Multiple function params)
- `presence/src/features/visibility/integration/buildGraphAdapter.ts`
- `presence/src/features/visibility/services/VisibilityStorage.ts`
- Other files with function parameter `any` types

**Pattern**: Function parameters with `any` (11 instances total)

**Issues**:
- Function parameters: `(videoData: any) => Promise<any>`
- Callback parameters: `validator: (v: any) => boolean`
- Event handler parameters with `any`

**Tasks**:
1. Read prioritized analysis report
2. Create proper interfaces for function parameters
3. Type all callback functions properly
4. Replace `any` parameters with specific types or generics
5. Use generic types where appropriate: `<T>` instead of `any`
6. Run `npx tsc --noEmit` to verify fixes
7. Run `npm run build:presence` to verify build
8. Update JAUmemory with status: `function-param-any-fixed`

**Success Criteria**: Zero `any` in function parameters, proper interfaces, build passes

**Resource Allocation**: MEDIUM-HIGH - Third priority pattern

---

## PROMPT SLICE 5: Messages Module - Any Types (CRITICAL FILE)

**Scope**: Fix `any` types in MessagesModule.ts (from previous audit - 20+ issues)

**Files to Fix**:
- `presence/src/features/MessagesModule.ts` (20+ `any` types from previous audit)
- `presence/src/features/MessagesModuleServiceIntegration.ts`
- `presence/src/components/UnifiedMessageDisplay.ts`
- `presence/src/utils/UnifiedMessageRenderer.ts`

**Issues** (From previous comprehensive audit):
- `getWindowFunction = (name: string): any => {`
- `const win = window as any;`
- `setCurrentChatData = (messages: any[]) => {`
- Multiple function parameters and return types with `any`

**Tasks**:
1. Read both audit reports (comprehensive + prioritized)
2. **CRITICAL**: This file has the most issues from comprehensive audit
3. Create proper type definitions for message types
4. Fix `getWindowFunction` - use proper Window interface extension
5. Type all message payload functions
6. Replace all `any` types with proper interfaces
7. Run `npx tsc --noEmit` to verify fixes
8. Run `npm run build:presence` to verify build
9. Update JAUmemory with status: `messages-module-any-types-fixed`

**Success Criteria**: Zero `any` types in Messages module, proper message types, build passes

**Resource Allocation**: HIGH - Critical file with most issues

---

## PROMPT SLICE 6: UserPreferencesManager - Any Types (CRITICAL FILE)

**Scope**: Fix `any` types in UserPreferencesManager.ts (10+ issues from previous audit)

**Files to Fix**:
- `presence/src/utils/UserPreferencesManager.ts` (10+ `any` types)
- `presence/src/utils/ThemeChangeTracker.ts`
- `presence/src/utils/UnifiedStorageSync.ts`
- Related utility files

**Issues** (From previous comprehensive audit):
- `validator: (v: any) => boolean`
- `(this as any)._defaultValues` internal property access
- `let finalValue: any;`
- Preference value types with `any`

**Tasks**:
1. Read both audit reports
2. **CRITICAL**: Fix UserPreferencesManager - highest issue count in utils
3. Create proper type for preference validators: `type PreferenceValidator<T> = (v: T) => boolean`
4. Replace `(this as any)` with proper private properties or interfaces
5. Type all preference values properly
6. Create generic types for preferences
7. Run `npx tsc --noEmit` to verify fixes
8. Run `npm run build:presence` to verify build
9. Update JAUmemory with status: `userpreferences-any-types-fixed`

**Success Criteria**: Zero `any` types in UserPreferencesManager, proper validator types, build passes

**Resource Allocation**: HIGH - Critical file with many issues

---

## PROMPT SLICE 7: Type Suppressions & Profile Manager (MEDIUM PRIORITY)

**Scope**: Fix type suppressions and ProfileManager issues

**Files to Fix**:
- `presence/src/features/ProfileManager.ts` (2 `@ts-ignore` from previous audit)
- `presence/src/services/SupabaseService.ts` (2 suppressions: `@ts-ignore` + `@ts-expect-error`)
- Other files with type suppressions

**Pattern**: `@ts-ignore` and `@ts-expect-error` (8 instances total)

**Issues**:
- `// @ts-ignore - Dynamic import of JS module`
- `// @ts-expect-error - Dynamic runtime import path`
- Dynamic import type issues

**Tasks**:
1. Read both audit reports
2. **CRITICAL**: Fix dynamic import type issues
3. Create proper type declarations for dynamic imports
4. Use `import()` with proper types instead of suppressions
5. Fix ProfileManager dynamic imports
6. Fix SupabaseService runtime path issues
7. Remove all `@ts-ignore` and `@ts-expect-error` suppressions
8. Run `npx tsc --noEmit` to verify fixes
9. Run `npm run build:presence` to verify build
10. Update JAUmemory with status: `type-suppressions-fixed`

**Success Criteria**: Zero type suppressions, proper import types, build passes

**Resource Allocation**: MEDIUM - Lower priority but important for code quality

---

## PROMPT SLICE 8: Window Casting & Remaining Issues (LOW-MEDIUM PRIORITY)

**Scope**: Fix window object casting and remaining issues

**Files to Fix**:
- `presence/src/features/TabManager/TabManager.ts`
- `presence/src/features/TabManager/initializeTabManager.ts`
- `presence/src/features/UserHoverModal.ts`
- `presence/src/features/visibility/ui/VisibilitySettings.ts`
- `presence/src/services/SupabaseRealtimeClientFix.ts`
- Other files with window casting

**Pattern**: `window as any` and `(window as Window & {...})` (30+ instances from previous audit)

**Issues**:
- `(window as any).userPreferencesManager`
- `window.currentVisibilityDataUnfiltered` type casting
- Window interface extensions

**Tasks**:
1. Read both audit reports
2. **CRITICAL**: Extend Window interface in `types/global.d.ts`
3. Add all window extensions to global types
4. Replace `window as any` with proper Window interface
5. Fix visibility data types
6. Fix tab manager window extensions
7. Clean up any remaining window casting
8. Run `npx tsc --noEmit` to verify fixes
9. Run `npm run build:presence` to verify build
10. Update JAUmemory with status: `window-casting-fixed`

**Success Criteria**: Zero `window as any`, proper Window interface, build passes

**Resource Allocation**: MEDIUM - Important for type safety but lower frequency

---

## Execution Instructions

**For Each Prompt Slice**:

1. **Before Starting**:
   - Search JAUmemory for existing memories related to your slice
   - Create/update problem memory if missing (status=identified)
   - Read shared context documents
   - Read prioritized analysis report: `docs/TYPESCRIPT_PATTERNS_PRIORITIZED.json`

2. **During Execution**:
   - Follow workflow: pm → sd → test → red → white → purple → blindspot → blue
   - Create diagnostic script if needed (SD phase)
   - Execute fixes systematically, prioritizing your slice's pattern
   - Run tests: `npx tsc --noEmit` and `npm run build:presence`
   - Update JAUmemory with progress

3. **After Completion**:
   - Update JAUmemory with status: `completed`
   - Document findings, issues, solutions
   - Link related memories
   - Report status: PASSED/FAILED/WARNINGS

4. **Coordination**:
   - Check JAUmemory for other slices' progress
   - Avoid conflicts (different file sets mostly)
   - Share findings that affect other slices (especially type definitions in `types/global.d.ts`)

---

## Resource Allocation Summary

**High Priority Slices** (More resources allocated):
- Slice 1: Any Type Annotations Part 1 (Priority: 60)
- Slice 2: Any Type Annotations Part 2 (Priority: 60)
- Slice 3: As Any Assertions (Priority: 56)
- Slice 5: Messages Module (20+ issues)
- Slice 6: UserPreferencesManager (10+ issues)

**Medium Priority Slices**:
- Slice 4: Function Parameters with Any (Priority: 33)
- Slice 7: Type Suppressions (Priority: 12)
- Slice 8: Window Casting (Priority: 3)

---

## Final Verification

After all 8 slices complete:
1. Run comprehensive verification: `npx tsc --noEmit`
2. Verify zero errors: `npm run build:presence`
3. Check all files compile successfully
4. Verify no `any` types remain (except properly justified)
5. Verify no type suppressions remain (except properly documented)
6. Run prioritized diagnostic again to verify reduction
7. Update JAUmemory with final status
8. Generate consolidated report

---

## Success Criteria (All Slices)

- [ ] Zero `any` types in production code (or properly justified with comments)
- [ ] Zero `@ts-ignore`/`@ts-expect-error` suppressions (or properly documented)
- [ ] All window extensions properly typed in `types/global.d.ts`
- [ ] All type assertions use proper types
- [ ] Build succeeds: `npm run build:presence`
- [ ] Type checking passes: `tsc --noEmit`
- [ ] Prioritized pattern counts reduced by 80%+
- [ ] All type definitions complete
- [ ] JAUmemory updated for each slice
- [ ] Documentation updated

---

## Type Definition Strategy

**Window Extensions** (Slice 8): All window object extensions should be defined in `types/global.d.ts`:
```typescript
interface Window {
  userPreferencesManager?: UserPreferencesManager;
  currentVisibilityDataUnfiltered?: VisibilityData;
  youtubeService?: YouTubeService;
  AgentModule?: AgentModule;
  // ... other extensions
}
```

**Dynamic Imports** (Slice 7): Create proper type declarations or use type assertions with specific types instead of `any`.

**Internal Properties** (Slice 6): Use private/protected modifiers or proper interfaces instead of `(this as any)`.

**Function Parameters** (Slice 4): Use generic types `<T>` or specific interfaces instead of `any`.

---

**Status**: ✅ **PROMPTS READY FOR PARALLEL EXECUTION - RESOURCES PRIORITIZED**

**Total Issues to Fix**: 54 (prioritized) + additional from comprehensive audit  
**Slices**: 8 prioritized slices  
**Estimated Time**: High (depends on complexity of type definitions)  
**Resource Allocation**: Prioritized to highest-frequency patterns


