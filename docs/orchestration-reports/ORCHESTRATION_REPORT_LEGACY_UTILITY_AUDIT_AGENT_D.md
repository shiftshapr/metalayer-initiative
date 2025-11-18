# Task Invocation Template

## Task Metadata
- **Task ID**: `LEGACY-UTILITY-AUDIT-AGENT-D`
- **Project**: `canopi`
- **Date**: `2025-11-17`
- **Objective**: `Legacy Utility Audit (Agent D) – convert remaining JS utilities/features/services that still rely on globals into first-class TypeScript modules with diagnostics + test coverage`
- **Priority**: `HIGH`
- **Status**: `IN_PROGRESS`

## Objective
Sweep `presence/features`, `presence/utils`, and `presence/services` to find any remaining `.js` modules that still depend on global state (`window.*`, `legacyContext`, implicit singletons). Prioritize diagnostics-, formatting-, and notification-related modules that sidepanel still touches. Convert the highest-risk modules to TypeScript, align their imports with the new architecture, add diagnostics/tests where feasible, and produce an auditable conversion list with scheduling for the remaining files.

## Requirements
1. Inventory every `.js` module under `presence/features`, `presence/utils`, `presence/services` and flag global usage.
2. Highlight and prioritize sidepanel-critical modules (diagnostics, formatting, notifications, modals, helper utilities).
3. Convert the top-priority modules to TypeScript (`src/`), ensuring they are compiled and wired into the sidepanel build.
4. Add or update diagnostic scripts/tests that cover the converted modules.
5. Produce a conversion tracker (spreadsheet-style list) with ownership, priority, and scheduling notes.

## Constraints
- Must follow the Default Collaboration Workflow Manifest (PM→SD→TEST→RED→WHITE→PURPLE→BLINDSPOT→BLUE→DEVOPS→ETHICS).
- Enforce blind-spot and red-line audits; escalate violations immediately.
- Use the unified TypeScript architecture (ES modules, no globals, camelCase fields, boundary normalization).
- Active project context: `canopi`; reuse preferences/policies stored in JAUmemory.
- Maintain backward compatibility with existing sidepanel behavior and diagnostic expectations.

## Context
- Prior TS migration already produced `src/features/*` modules, but legacy `.js` counterparts still load in production due to manual compilation gaps.
- Sidepanel still references diagnostics, notification, and formatting helpers inside `presence/features/*.js` and `presence/utils/*.js`.
- Preferences system has strict rules: no fallback chains, immediate camelCase normalization, diagnostics required for changes.
- TypeScript compilation gap previously caused runtime regressions; ensure `npx tsc` runs for each converted module.

## Success Criteria
- [ ] Complete inventory of `.js` modules with global-usage notes.
- [ ] Conversion tracker lists priority, owner, ETA for each module.
- [ ] At least diagnostics + notification modules converted to TypeScript with tests/diagnostics.
- [ ] Sidepanel build uses the new TypeScript outputs (no stale JS).
- [ ] Blind-spot and red-line audits documented with outcomes.
- [ ] JAUmemory updated with problem + solution status across workflow phases.

## Agent Workflow
Execute using Default Collaboration Workflow Manifest:
1. **PM** - Problem analysis and requirements validation
2. **SD** - Solution design and architecture
3. **TEST** - Test plan and verification
4. **RED** - Red-line audit (critical constraints)
5. **WHITE** - White-hat security review
6. **PURPLE** - Purple-team adversarial testing
7. **BLINDSPOT** - Blind-spot analysis
8. **BLUE** - Blue-hat final review
9. **DEVOPS** - Deployment and operations
10. **ETHICS** - Ethical considerations

## Deliverables
- [ ] JS-to-TS conversion tracker (spreadsheet/list)
- [ ] Converted + integrated TypeScript modules (diagnostics/notifications/helpers)
- [ ] Updated/added tests & diagnostic scripts
- [ ] Agent-phase reports (PM→ETHICS) with audit checklists
- [ ] JAUmemory updates and final orchestration summary

## Notes
- Maintain alignment with `UserPreferencesManager` + state managers; replace `window.*` usage with injected managers.
- Diagnostics should leverage `/presence/utils/ROOT_CAUSE_DIAGNOSTIC_FRAMEWORK.js`.
- Prioritize modules invoked by `sidepanel.js` (diagnostics panels, notification badges, formatting helpers).




