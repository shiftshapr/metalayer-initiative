# Slice 5 Issue #3: Missing Error Boundaries - Parallel Agent Plan (8 Agents)

**Date**: 2025-01-24  
**Status**: Ready for parallel execution  
**Context**: 144 missing error boundaries across 38 files - async functions without error handling

---

## Shared Context for All Agents

### Problem Memory
- **JAUmemory ID**: `c44b9925-9454-4f76-ac8f-ae2d6f060ea0`
- **Status**: Migration in progress
- **Diagnostic**: `presence/src/scripts/diagnose-slice5-error-handling.ts`
- **Pattern**: Wrap async functions with try-catch blocks using `handleError()` utility

### Critical Rules
- ✅ **ONLY edit files in `src/`** - NEVER edit `extension/`, `dist/`, or `build/`
- ✅ **Use ErrorHandler utilities**: `handleError()`, `handleAsyncError()`, `withErrorHandling()`, `errorBoundary()`
- ✅ **Add imports if needed**: `import { handleError, type ErrorContext } from '../utils/ErrorHandler.js';`
- ✅ **Build after changes**: `npm run build:presence`
- ✅ **Update JAUmemory** with progress after completion

### Error Boundary Pattern
```typescript
// Before
async function someOperation(): Promise<Result> {
  await riskyOperation();
  return result;
}

// After
async function someOperation(): Promise<Result> {
  try {
    await riskyOperation();
    return result;
  } catch (error: unknown) {
    const context: ErrorContext = {
      operation: 'someOperation',
      component: 'ComponentName'
    };
    handleError(error, {
      log: true,
      logLevel: 'error',
      context
    });
    throw error; // or return default value
  }
}
```

### File Distribution (144 issues across 38 files)
- **Agent 1**: 19 issues (MessagesModule.ts)
- **Agent 2**: 14 issues (features/visibility/ui/VisibilitySettings.ts)
- **Agent 3**: 12 issues (components/UnifiedMessageModal.ts)
- **Agent 4**: 10 issues (features/visibility/services/VisibilityStorage.ts)
- **Agent 5**: 9 issues (core/ContextMenuConfig.ts)
- **Agent 6**: 11 issues (UIManager.ts 7 + ProfileManager.ts 6 = 13, adjusted to 11)
- **Agent 7**: 11 issues (TabConfiguration.ts 6 + TabManager.ts 5 = 11)
- **Agent 8**: 58 issues (remaining 30 files, ~1-5 issues each)

---

## Agent 1: MessagesModule.ts (19 issues)

**Scope**: Add error boundaries to async functions in MessagesModule.ts

**File**:
- `presence/src/features/MessagesModule.ts`

**Tasks**:
1. Identify all async functions with `await` but no try-catch
2. Wrap async operations with try-catch blocks
3. Use `handleError()` with proper context
4. Ensure imports are present
5. Test that modal still works correctly

**Expected Functions to Fix**:
- `open()`, `render()`, `getModalHTML()`, `handleDrafts()`, `handleSend()`, `handleSaveDraft()`, `handleFileSelect()`, `addAttachment()`, etc.

**Context**: `'MessagesModule'`

**Note**: This file already has many catch blocks - focus on async functions without any error handling.

---

## Agent 2: VisibilitySettings.ts (14 issues)

**Scope**: Add error boundaries to async functions in VisibilitySettings.ts

**File**:
- `presence/src/features/visibility/ui/VisibilitySettings.ts`

**Tasks**:
1. Find async functions missing error handling
2. Add try-catch blocks around await operations
3. Use appropriate error context (operation name, visibility-related context)
4. Ensure visibility operations are resilient

**Context**: `'VisibilitySettings'`

---

## Agent 3: UnifiedMessageModal.ts (12 issues)

**Scope**: Add error boundaries to all async functions in UnifiedMessageModal.ts

**File**:
- `presence/src/components/UnifiedMessageModal.ts`

**Scope**: Add error boundaries to async functions in UnifiedMessageDisplay.ts

**File**:
- `presence/src/components/UnifiedMessageDisplay.ts`

**Tasks**:
1. Identify async rendering/loading functions
2. Add error boundaries
3. Ensure errors don't break message display
4. Use proper context for debugging

**Context**: `'UnifiedMessageModal'`

---

## Agent 4: VisibilityStorage.ts (10 issues)

**Scope**: Add error boundaries to async functions in VisibilityStorage.ts

**File**:
- `presence/src/features/visibility/services/VisibilityStorage.ts`

**Tasks**:
1. Find async storage operations
2. Add error boundaries
3. Ensure storage operations handle errors gracefully
4. Use storage-specific context

**Context**: `'VisibilityStorage'`

---

## Agent 5: ContextMenuConfig.ts (9 issues)

**Scope**: Add error boundaries to async event handlers in ContextMenuConfig.ts

**File**:
- `presence/src/core/ContextMenuConfig.ts`

**Tasks**:
1. Find async action handlers
2. Wrap with try-catch
3. Ensure context menu actions handle errors gracefully
4. Don't break context menu functionality

**Context**: `'ContextMenuConfig'`

---

## Agent 6: UIManager.ts + ProfileManager.ts (11 issues)

**Scope**: Add error boundaries to async functions in UIManager.ts and ProfileManager.ts

**Files**:
- `presence/src/features/UIManager.ts` (7 issues)
- `presence/src/features/ProfileManager.ts` (6 issues)

**Tasks**:
1. Find async functions without error handling in both files
2. Add try-catch blocks
3. Use appropriate context for each file
4. Ensure UI and profile operations are resilient

**Context**: `'UIManager'` and `'ProfileManager'`

**Note**: ProfileManager.ts is large - focus on async functions that don't already have error handling.

---

## Agent 7: TabManager Files (11 issues)

**Scope**: Add error boundaries to async functions in DraftSelectionModal.ts

**File**:
- `presence/src/components/DraftSelectionModal.ts`

**Tasks**:
1. Wrap async operations (loadDrafts, deleteDraft, etc.)
2. Add proper error handling
3. Ensure modal operations are resilient

**Context**: `'DraftSelectionModal'`

---

**Scope**: Add error boundaries to async functions in TabManager files

**Files**:
- `presence/src/features/TabManager/TabConfiguration.ts` (6 issues)
- `presence/src/features/TabManager/TabManager.ts` (5 issues)

**Tasks**:
1. Find async tab operations
2. Add error boundaries
3. Ensure tab management is resilient

**Context**: `'TabManager'`

---

## Agent 8: Remaining Files (58 issues across 30 files)

**Scope**: Add error boundaries to async functions in remaining files

**Files** (1-5 issues each):
- `utils/ROOT_CAUSE_DIAGNOSTIC_FRAMEWORK.ts` (5 issues)
- `utils/provenance/ProvenanceService.ts` (4 issues)
- `sidepanel/controllers/TabController.ts` (4 issues)
- `sidepanel/controllers/BootController.ts` (4 issues)
- `features/CommunityHelpers.ts` (4 issues)
- `utils/UserPreferencesManager.ts` (3 issues)
- `features/settings/helpers/profileSettingChannel.ts` (3 issues)
- `features/RealtimeManager.ts` (3 issues)
- `services/MessageRendererService.ts` (2 issues)
- `features/visibility/ui/VisibilityUIEvents.ts` (2 issues)
- `features/NotificationManager.ts` (2 issues)
- `features/MessageSystemIntegration.ts` (2 issues)
- `components/DraftSelectionModal.ts` (2 issues)
- `utils/DIAGNOSTIC_LOADING_AND_REPLIES.ts` (1 issue)
- `sidepanel/Sidepanel.ts` (1 issue)
- `features/UserHoverModal.ts` (1 issue)
- `features/TabManager/initializeTabManager.ts` (1 issue)
- `features/SubscriptionManager.ts` (1 issue)
- `features/social-share/platforms/base/BasePlatformAdapter.ts` (1 issue)
- `features/SettingsHeadlineManager.ts` (1 issue)
- `features/DisplayNameManager.ts` (1 issue)
- `features/CursorVisualSettingsManager.ts` (1 issue)
- `features/AuthManager.ts` (1 issue)
- `core/UnifiedContextMenu.ts` (1 issue)
- `core/StateManager.ts` (1 issue)
- `core/DependencyContainer.ts` (1 issue)
- `core/CursorParkManager.ts` (1 issue)
- `components/UnifiedMessageDisplay.ts` (1 issue)
- `components/GoVisibleModal.ts` (1 issue)

**Tasks**:
1. Process files systematically
2. Add error boundaries to async functions
3. Use appropriate context for each file
4. Ensure no functionality is broken

---

## Verification Steps (All Agents)

After completing your assigned files:

1. **TypeScript Check**:
   ```bash
   npx tsc --noEmit --project .
   ```

2. **Run Diagnostic**:
   ```bash
   npx tsx src/scripts/diagnose-slice5-error-handling.ts
   ```

3. **Verify Your Files**:
   - Check that your assigned files show reduced or zero missing_error_boundary issues
   - Ensure no new TypeScript errors introduced

4. **Update JAUmemory**:
   - Record files completed
   - Note any issues encountered
   - Document patterns found

---

## Success Criteria

- ✅ All async functions with `await` have try-catch blocks
- ✅ Errors are logged using `handleError()` utility
- ✅ Proper error context provided (operation, component)
- ✅ No TypeScript compilation errors
- ✅ Diagnostic shows reduced missing_error_boundary count
- ✅ Functionality remains intact

---

## Notes

- **Priority**: Focus on user-facing async operations first (modals, message sending, UI updates)
- **Pattern**: Use `errorBoundary()` for critical operations, `handleAsyncError()` for simpler cases
- **Testing**: Test critical user flows after adding error boundaries
- **Documentation**: Update ERROR_HANDLING_GUIDE.md if new patterns emerge

---

*Plan created for parallel execution of 144 missing error boundary fixes across 8 agents*

