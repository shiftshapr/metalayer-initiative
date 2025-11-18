# Task Invocation Template

## Task Metadata
- **Task ID**: ORCH-INTEGRATION-DIAG-001
- **Project**: canopi
- **Date**: 2025-11-17
- **Objective**: Integration & Diagnostics (Agent F) – migrate diagnostics to TS modules and create structured checklist/logging.
- **Priority**: HIGH
- **Status**: IN_PROGRESS

## Objective
Provide TypeScript-native diagnostic coverage for message display, formatting, and root-cause flows while documenting integration tests (message load, visibility tab, modal flows, Supabase realtime, navigation, status picker, profile updates) and establishing rapid regression alerts.

## Requirements
1. Adapt legacy diagnostic scripts (message display, formatting, root cause) into reusable TypeScript modules.
2. Produce an integration checklist covering the requested features with pass/fail documentation.
3. Emit structured, automated diagnostic logs that downstream agents can consume for regression alerts.

## Constraints
- Honor Default Collaboration Workflow Manifest (PM → SD → TEST → RED → WHITE → PURPLE → BLINDSPOT → BLUE → DEVOPS → ETHICS).
- Enforce blind-spot and red-line audits.
- Active project context: `canopi`; reuse JAUmemory preferences/policies/agents when available.

## Context
- Legacy diagnostics lived under `presence/utils/*.js` and were not integrated with the TypeScript migration.
- Agents need rapid feedback when Supabase realtime/state regressions surface during module migration.
- Diagnostics must continue to run inside the sidepanel (Chrome extension) and expose results on `window`.

## Success Criteria
- [ ] New TypeScript diagnostics attach to `window` and can be invoked via console.
- [ ] Structured logs emitted + event dispatch for regression listeners.
- [ ] Integration checklist committed with clear instructions for post-merge verification.

## Agent Workflow
Execute using Default Collaboration Workflow Manifest:
1. **PM** - validate requirements against JAUmemory, scope diagnostics + checklist.
2. **SD** - design TS modules + logging architecture.
3. **TEST** - define verification steps (diagnostic runs + manual checks).
4. **RED** - confirm no red-line violations (e.g., bypassing auditable logging).
5. **WHITE** - ensure diagnostics respect security (no sensitive data leakage).
6. **PURPLE** - adversarially test diagnostic toggles/event dispatch.
7. **BLINDSPOT** - analyze for untested flows (e.g., navigation edge cases).
8. **BLUE** - final approval and JAUmemory status update.
9. **DEVOPS** - note deployment implications (build order, sidepanel scripts).
10. **ETHICS** - confirm diagnostics/logging align with user privacy expectations.

## Deliverables
- [ ] TypeScript diagnostic modules + registration harness.
- [ ] Integration & diagnostics checklist document.
- [ ] Updated orchestration report summarizing test evidence and audits.

## Notes
- Structured logs stored under `window.__canopiDiagnosticLog__` and broadcast via `canopi-diagnostic-results`.
- Checklist stored at `presence/docs/INTEGRATION_DIAGNOSTICS_CHECKLIST.md`.
- Red-line reminder: no silent fallbacks; diagnostics must fail loudly when dependencies are missing.


