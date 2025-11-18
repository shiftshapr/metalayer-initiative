# Integration & Diagnostics Checklist (Agent F)

**Project:** canopi  
**Purpose:** Track integration diagnostics as modules migrate and ensure rapid feedback loops.

## Execution Protocol
1. Run `window.canopiDiagnostics.runAll()` after each major merge or deployment.
2. Capture console output plus structured log from `window.__canopiDiagnosticLog__` (download via `copy()` if needed).
3. Update the table below with pass/fail + notes; link to any regressions, issues, or Jira tickets.

## Feature Checklist
| Feature | Diagnostic / Manual Step | Status (✅/⚠️/❌) | Notes & Links |
| --- | --- | --- | --- |
| Message Load | `runMessageDisplayDiagnostic()` → verify conversations/messages counts |  |  |
| Visibility Tab | `runComprehensiveFormattingDiagnostic()` → ensure tab renders users only |  |  |
| Modal Flows | Trigger visibility + profile modals; ensure `visibilityModalHandler.checkVisibility()` succeeds |  |  |
| Supabase Realtime | Watch `window.supabaseRealtimeClient` subscriptions + `getPageUsers()` output |  |  |
| Navigation | Validate `NavigationManager` tab switches + URL normalization results |  |  |
| Status Picker | Update status via `StatusPickerModule` + confirm `currentVisibilityData` refresh |  |  |
| Profile Updates | Modify avatar/aura, confirm `AvatarUtils` renders new values |  |  |

## Logging Template
```
Date:
Build / Commit:
Operators:

Diagnostics Run:
- Message Display: pass/fail + issue ids
- Formatting: pass/fail + issue ids
- Root Cause: pass/fail + issue ids

Manual Checks:
- Modal Flow:
- Supabase Realtime:
- Navigation:
- Status Picker:
- Profile Updates:

Regression Alerts:
- [ ] Posted to agent channel (link)
- [ ] JAUmemory updated (memory id)
```

## Rapid Feedback Workflow
- Dispatch `CustomEvent('canopi-diagnostic-results')` listeners to notify other agents instantly.
- When a regression is detected, ping the owning agent with:
  - Diagnostic log entry
  - Repro steps
  - Impact assessment
- Update JAUmemory record with status `regression-detected` → `regression-resolved`.

## Checkpoints
- Automated logs stored in `window.__canopiDiagnosticLog__`.
- After each major merge:
  - [ ] Run diagnostics suite
  - [ ] Update feature table
  - [ ] Publish status summary to team channel
  - [ ] Log pass/fail in JAUmemory


