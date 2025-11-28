# Slice 5: Missing Error Boundaries - Parallel Orchestration Sessions (8 Sessions)

**Date**: 2025-01-25  
**Status**: Ready for parallel execution  
**JAUmemory Problem ID**: `4c194f95-03da-4571-b57f-2ead01ad21ca`  
**Parent Document**: `SLICE5_ISSUE3_PARALLEL_PLAN.md`

---

## Instructions for Parallel Execution

Each session should be run independently with the prompt below. All sessions share:
- Same JAUmemory problem ID: `4c194f95-03da-4571-b57f-2ead01ad21ca`
- Same diagnostic script: `presence/src/scripts/diagnose-slice5-error-handling.ts`
- Same build command: `npm run build:presence`
- Same migration pattern: Wrap async functions with try-catch using `handleError()`

After all 8 sessions complete, run final verification:
```bash
cd /home/ubuntu/metalayer-initiative
npx tsx presence/src/scripts/diagnose-slice5-error-handling.ts
```

---

## Session 1: MessagesModule.ts (19 issues)

**Orch Prompt:**
```
Orch, initialize orchestration.

Objective: Add error boundaries to all async functions in MessagesModule.ts (19 missing error boundaries).

Enforce .cursorrules: CRITICAL: Never edit extension/, dist/, build/. Edit src/ only. Build required. TypeScript ES6 modules. Modular. No pre-launch backward-compat. Remove duplicates. Extract unified helpers. Plan→Scaffold→Build. Document in JAUmemory. No markdown/non-runtime in dist. Archive/delete stale diagnostics/tests. Log problem/diagnostic/solution/verification to JAUmemory. Commit on resolution.

Use Default Collaboration Workflow Manifest. Enforce blind-spot and red-line audits.

Workflow: pm → sd → test → red → white → purple → blindspot → blue → [learn] → [meta] → devops → ethics

Before SD, PM must: Search JAUmemory for existing problem memories. Create/update if missing (status=identified). Record context, impact, tags, links.

Diagnostic mandate: SD creates/references diagnostic script targeting root cause before coding. TEST runs diagnostics before/after implementation. Attach script IDs/results to problem memory. If not feasible, document exception.

Active project = canopi
JAUmemory Problem ID: 4c194f95-03da-4571-b57f-2ead01ad21ca

Tasks:
1. Identify all async functions with await but no try-catch in MessagesModule.ts
2. Wrap each async operation with try-catch blocks
3. Use handleError() with proper context: { operation: 'functionName', component: 'MessagesModule' }
4. Ensure ErrorHandler import is present: import { handleError, type ErrorContext } from '../utils/ErrorHandler.js';
5. Verify: Run diagnostic script - MessagesModule.ts should show 0 missing_error_boundary issues
6. Build: npm run build:presence
7. Update JAUmemory with completion status

Expected: 19 async functions fixed (open, render, getModalHTML, handleDrafts, handleSend, handleSaveDraft, handleFileSelect, addAttachment, etc.)
```

---

## Session 2: VisibilitySettings.ts (14 issues)

**Orch Prompt:**
```
Orch, initialize orchestration.

Objective: Add error boundaries to all async functions in VisibilitySettings.ts (14 missing error boundaries).

Enforce .cursorrules: CRITICAL: Never edit extension/, dist/, build/. Edit src/ only. Build required. TypeScript ES6 modules. Modular. No pre-launch backward-compat. Remove duplicates. Extract unified helpers. Plan→Scaffold→Build. Document in JAUmemory. No markdown/non-runtime in dist. Archive/delete stale diagnostics/tests. Log problem/diagnostic/solution/verification to JAUmemory. Commit on resolution.

Use Default Collaboration Workflow Manifest. Enforce blind-spot and red-line audits.

Workflow: pm → sd → test → red → white → purple → blindspot → blue → [learn] → [meta] → devops → ethics

Before SD, PM must: Search JAUmemory for existing problem memories. Create/update if missing (status=identified). Record context, impact, tags, links.

Diagnostic mandate: SD creates/references diagnostic script targeting root cause before coding. TEST runs diagnostics before/after implementation. Attach script IDs/results to problem memory. If not feasible, document exception.

Active project = canopi
JAUmemory Problem ID: 4c194f95-03da-4571-b57f-2ead01ad21ca

Tasks:
1. Identify all async functions with await but no try-catch in VisibilitySettings.ts
2. Wrap each async operation with try-catch blocks
3. Use handleError() with proper context: { operation: 'functionName', component: 'VisibilitySettings' }
4. Ensure ErrorHandler import is present: import { handleError, type ErrorContext } from '../../utils/ErrorHandler.js';
5. Verify: Run diagnostic script - VisibilitySettings.ts should show 0 missing_error_boundary issues
6. Build: npm run build:presence
7. Update JAUmemory with completion status

Expected: 14 async functions fixed
```

---

## Session 3: UnifiedMessageModal.ts (12 issues)

**Orch Prompt:**
```
Orch, initialize orchestration.

Objective: Add error boundaries to all async functions in UnifiedMessageModal.ts (12 missing error boundaries).

Enforce .cursorrules: CRITICAL: Never edit extension/, dist/, build/. Edit src/ only. Build required. TypeScript ES6 modules. Modular. No pre-launch backward-compat. Remove duplicates. Extract unified helpers. Plan→Scaffold→Build. Document in JAUmemory. No markdown/non-runtime in dist. Archive/delete stale diagnostics/tests. Log problem/diagnostic/solution/verification to JAUmemory. Commit on resolution.

Use Default Collaboration Workflow Manifest. Enforce blind-spot and red-line audits.

Workflow: pm → sd → test → red → white → purple → blindspot → blue → [learn] → [meta] → devops → ethics

Before SD, PM must: Search JAUmemory for existing problem memories. Create/update if missing (status=identified). Record context, impact, tags, links.

Diagnostic mandate: SD creates/references diagnostic script targeting root cause before coding. TEST runs diagnostics before/after implementation. Attach script IDs/results to problem memory. If not feasible, document exception.

Active project = canopi
JAUmemory Problem ID: 4c194f95-03da-4571-b57f-2ead01ad21ca

Tasks:
1. Identify all async functions with await but no try-catch in UnifiedMessageModal.ts
2. Wrap each async operation with try-catch blocks
3. Use handleError() with proper context: { operation: 'functionName', component: 'UnifiedMessageModal' }
4. Ensure ErrorHandler import is present: import { handleError, type ErrorContext } from '../utils/ErrorHandler.js';
5. Verify: Run diagnostic script - UnifiedMessageModal.ts should show 0 missing_error_boundary issues
6. Build: npm run build:presence
7. Update JAUmemory with completion status

Expected: 12 async functions fixed
```

---

## Session 4: VisibilityStorage.ts (10 issues)

**Orch Prompt:**
```
Orch, initialize orchestration.

Objective: Add error boundaries to all async functions in VisibilityStorage.ts (10 missing error boundaries).

Enforce .cursorrules: CRITICAL: Never edit extension/, dist/, build/. Edit src/ only. Build required. TypeScript ES6 modules. Modular. No pre-launch backward-compat. Remove duplicates. Extract unified helpers. Plan→Scaffold→Build. Document in JAUmemory. No markdown/non-runtime in dist. Archive/delete stale diagnostics/tests. Log problem/diagnostic/solution/verification to JAUmemory. Commit on resolution.

Use Default Collaboration Workflow Manifest. Enforce blind-spot and red-line audits.

Workflow: pm → sd → test → red → white → purple → blindspot → blue → [learn] → [meta] → devops → ethics

Before SD, PM must: Search JAUmemory for existing problem memories. Create/update if missing (status=identified). Record context, impact, tags, links.

Diagnostic mandate: SD creates/references diagnostic script targeting root cause before coding. TEST runs diagnostics before/after implementation. Attach script IDs/results to problem memory. If not feasible, document exception.

Active project = canopi
JAUmemory Problem ID: 4c194f95-03da-4571-b57f-2ead01ad21ca

Tasks:
1. Identify all async functions with await but no try-catch in VisibilityStorage.ts
2. Wrap each async operation with try-catch blocks
3. Use handleError() or handleStorageError() with proper context: { operation: 'functionName', component: 'VisibilityStorage' }
4. Ensure ErrorHandler import is present: import { handleError, handleStorageError, type ErrorContext } from '../../../utils/ErrorHandler.js';
5. Verify: Run diagnostic script - VisibilityStorage.ts should show 0 missing_error_boundary issues
6. Build: npm run build:presence
7. Update JAUmemory with completion status

Expected: 10 async functions fixed
```

---

## Session 5: ContextMenuConfig.ts (9 issues)

**Orch Prompt:**
```
Orch, initialize orchestration.

Objective: Add error boundaries to all async functions in ContextMenuConfig.ts (9 missing error boundaries).

Enforce .cursorrules: CRITICAL: Never edit extension/, dist/, build/. Edit src/ only. Build required. TypeScript ES6 modules. Modular. No pre-launch backward-compat. Remove duplicates. Extract unified helpers. Plan→Scaffold→Build. Document in JAUmemory. No markdown/non-runtime in dist. Archive/delete stale diagnostics/tests. Log problem/diagnostic/solution/verification to JAUmemory. Commit on resolution.

Use Default Collaboration Workflow Manifest. Enforce blind-spot and red-line audits.

Workflow: pm → sd → test → red → white → purple → blindspot → blue → [learn] → [meta] → devops → ethics

Before SD, PM must: Search JAUmemory for existing problem memories. Create/update if missing (status=identified). Record context, impact, tags, links.

Diagnostic mandate: SD creates/references diagnostic script targeting root cause before coding. TEST runs diagnostics before/after implementation. Attach script IDs/results to problem memory. If not feasible, document exception.

Active project = canopi
JAUmemory Problem ID: 4c194f95-03da-4571-b57f-2ead01ad21ca

Tasks:
1. Identify all async functions with await but no try-catch in ContextMenuConfig.ts
2. Wrap each async operation with try-catch blocks
3. Use handleError() with proper context: { operation: 'functionName', component: 'ContextMenuConfig' }
4. Ensure ErrorHandler import is present: import { handleError, type ErrorContext } from '../utils/ErrorHandler.js';
5. Verify: Run diagnostic script - ContextMenuConfig.ts should show 0 missing_error_boundary issues
6. Build: npm run build:presence
7. Update JAUmemory with completion status

Expected: 9 async functions fixed
```

---

## Session 6: UIManager.ts + ProfileManager.ts (13 issues)

**Orch Prompt:**
```
Orch, initialize orchestration.

Objective: Add error boundaries to async functions in UIManager.ts (7) and ProfileManager.ts (6) to Logger (13 total issues).

Enforce .cursorrules: CRITICAL: Never edit extension/, dist/, build/. Edit src/ only. Build required. TypeScript ES6 modules. Modular. No pre-launch backward-compat. Remove duplicates. Extract unified helpers. Plan→Scaffold→Build. Document in JAUmemory. No markdown/non-runtime in dist. Archive/delete stale diagnostics/tests. Log problem/diagnostic/solution/verification to JAUmemory. Commit on resolution.

Use Default Collaboration Workflow Manifest. Enforce blind-spot and red-line audits.

Workflow: pm → sd → test → red → white → purple → blindspot → blue → [learn] → [meta] → devops → ethics

Before SD, PM must: Search JAUmemory for existing problem memories. Create/update if missing (status=identified). Record context, impact, tags, links.

Diagnostic mandate: SD creates/references diagnostic script targeting root cause before coding. TEST runs diagnostics before/after implementation. Attach script IDs/results to problem memory. If not feasible, document exception.

Active project = canopi
JAUmemory Problem ID: 4c194f95-03da-4571-b57f-2ead01ad21ca

Tasks:
1. Add ErrorHandler import to both files: import { handleError, type ErrorContext } from '../utils/ErrorHandler.js';
2. UIManager.ts: Wrap async functions with try-catch, use context: { operation: 'functionName', component: 'UIManager' }
3. ProfileManager.ts: Wrap async functions with try-catch, use context: { operation: 'functionName', component: 'ProfileManager' }
4. Verify: grep -n "missing_error_boundary" diagnostic output for these files (should be 0)
5. Build: npm run build:presence
6. Update JAUmemory with completion status

Expected: UIManager.ts: 7 issues, ProfileManager.ts: 6 issues
```

---

## Session 7: TabManager Files (12 issues)

**Orch Prompt:**
```
Orch, initialize orchestration.

Objective: Add error boundaries to async functions in TabConfiguration.ts (6) and TabManager.ts (5) and initializeTabManager.ts (1) to Logger (12 total issues).

Enforce .cursorrules: CRITICAL: Never edit extension/, dist/, build/. Edit src/ only. Build required. TypeScript ES6 modules. Modular. No pre-launch backward-compat. Remove duplicates. Extract unified helpers. Plan→Scaffold→Build. Document in JAUmemory. No markdown/non-runtime in dist. Archive/delete stale diagnostics/tests. Log problem/diagnostic/solution/verification to JAUmemory. Commit on resolution.

Use Default Collaboration Workflow Manifest. Enforce blind-spot and red-line audits.

Workflow: pm → sd → test → red → white → purple → blindspot → blue → [learn] → [meta] → devops → ethics

Before SD, PM must: Search JAUmemory for existing problem memories. Create/update if missing (status=identified). Record context, impact, tags, links.

Diagnostic mandate: SD creates/references diagnostic script targeting root cause before coding. TEST runs diagnostics before/after implementation. Attach script IDs/results to problem memory. If not feasible, document exception.

Active project = canopi
JAUmemory Problem ID: 4c194f95-03da-4571-b57f-2ead01ad21ca

Tasks:
1. Add ErrorHandler import to each file: import { handleError, type ErrorContext } from '../../utils/ErrorHandler.js';
2. TabConfiguration.ts: Wrap async functions with try-catch, use context: { operation: 'functionName', component: 'TabConfiguration' }
3. TabManager.ts: Wrap async functions with try-catch, use context: { operation: 'functionName', component: 'TabManager' }
4. initializeTabManager.ts: Wrap async functions with try-catch, use context: { operation: 'functionName', component: 'TabManager' }
5. Verify: Run diagnostic script - these files should show 0 missing_error_boundary issues
6. Build: npm run build:presence
7. Update JAUmemory with completion status

Expected: TabConfiguration.ts: 6 issues, TabManager.ts: 5 issues, initializeTabManager.ts: 1 issue
```

---

## Session 8: Remaining Files (49 issues across 20 files)

**Orch Prompt:**
```
Orch, initialize orchestration.

Objective: Add error boundaries to async functions in remaining files (49 issues across 20 files).

Enforce .cursorrules: CRITICAL: Never edit extension/, dist/, build/. Edit src/ only. Build required. TypeScript ES6 modules. Modular. No pre-launch backward-compat. Remove duplicates. Extract unified helpers. Plan→Scaffold→Build. Document in JAUmemory. No markdown/non-runtime in dist. Archive/delete stale diagnostics/tests. Log problem/diagnostic/solution/verification to JAUmemory. Commit on resolution.

Use Default Collaboration Workflow Manifest. Enforce blind-spot and red-line audits.

Workflow: pm → sd → test → red → white → purple → blindspot → blue → [learn] → [meta] → devops → ethics

Before SD, PM must: Search JAUmemory for existing problem memories. Create/update if missing (status=identified). Record context, impact, tags, links.

Diagnostic mandate: SD creates/references diagnostic script targeting root cause before coding. TEST runs diagnostics before/after implementation. Attach script IDs/results to problem memory. If not feasible, document exception.

Active project = canopi
JAUmemory Problem ID: 4c194f95-03da-4571-b57f-2ead01ad21ca

Files to fix:
- components/DraftSelectionModal.ts (2)
- components/GoVisibleModal.ts (1)
- components/UnifiedMessageDisplay.ts (1)
- core/CursorParkManager.ts (1)
- core/DependencyContainer.ts (1)
- core/StateManager.ts (1)
- core/UnifiedContextMenu.ts (1)
- features/AuthManager.ts (1)
- features/CommunityHelpers.ts (4)
- features/CursorVisualSettingsManager.ts (1)
- features/DisplayNameManager.ts (1)
- features/MessageSystemIntegration.ts (2)
- features/NotificationManager.ts (2)
- features/RealtimeManager.ts (3)
- features/SettingsHeadlineManager.ts (1)
- features/SubscriptionManager.ts (1)
- features/UserHoverModal.ts (1)
- features/settings/helpers/profileSettingChannel.ts (3)
- features/social-share/platforms/base/BasePlatformAdapter.ts (1)
- features/visibility/ui/VisibilityUIEvents.ts (2)

Tasks:
1. For each file, add ErrorHandler import if missing: import { handleError, type ErrorContext } from '../utils/ErrorHandler.js'; (adjust path as needed)
2. Wrap each async function with await but no try-catch with try-catch blocks
3. Use handleError() with proper context: { operation: 'functionName', component: 'ComponentName' }
4. Verify: Run diagnostic script - all these files should show 0 missing_error_boundary issues
5. Build: npm run build:presence
6. Update JAUmemory with completion status

Expected: 49 issues fixed across 20 files
```

---

## Final Verification (After All Sessions Complete)

Once all 8 sessions report completion:

1. **Run diagnostic**:
   ```bash
   cd /home/ubuntu/metalayer-initiative
   npx tsx presence/src/scripts/diagnose-slice5-error-handling.ts
   ```

2. **Expected result**: Missing error boundaries reduced from 144 to 0 (excluding diagnostic scripts)

3. **Build verification**:
   ```bash
   npm run build:presence
   ```

4. **Update JAUmemory**: Mark problem `4c194f95-03da-4571-b57f-2ead01ad21ca` as solved

5. **Generate final report**: Consolidate all session results into Slice 5 completion report

---

*Generated for parallel orchestration - Slice 5 error boundary migration*





