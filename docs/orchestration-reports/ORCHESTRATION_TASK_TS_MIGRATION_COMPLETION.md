# Task Invocation Template

## Task Metadata
- **Task ID**: `TS-MIGRATION-COMPLETION-2025-01-17`
- **Project**: `canopi`
- **Date**: `2025-01-17`
- **Objective**: `Complete TypeScript/ES Module Migration - Sidepanel Refactor & Legacy Utility Audit`
- **Priority**: `HIGH`
- **Status**: `IN_PROGRESS`

## Objective
Complete the TypeScript/ES module migration for the Chrome extension by:
1. **Sidepanel TS Refactor (Agent B's task)**: Convert `sidepanel.js` (>3k lines) into TypeScript modules (`src/sidepanel`), remove residual global exports, ensure new entry points align with refactored features.
2. **Legacy Utility Audit (Agent D's task)**: Identify remaining `.js` helpers (especially under `features/` and `utils/`) that still depend on globals, convert/modernize or schedule their migration to keep the codebase consistent.
3. **Integration & Verification**: After B and D merge their work, run `tsc`, lint, and functional diagnostics (messages, visibility, modals, Supabase realtime, etc.), update `manifest.json` and `sidepanel.html` to point only to the new module graph, confirm distribution build outputs compiled JS only (no `.ts` files shipped).

## Requirements
1. Complete inventory of all `.js` modules under `presence/features/`, `presence/utils/`, and `presence/services/` with global-usage flags.
2. Convert `sidepanel.js` to TypeScript modules in `src/sidepanel/` (partially exists, needs completion).
3. Convert highest-priority legacy utilities (diagnostics, formatting, notifications, modals, helper utilities) to TypeScript.
4. Remove all `window.*` global dependencies from converted modules.
5. Update `manifest.json` and `sidepanel.html` to use only TypeScript module entry points.
6. Ensure `npx tsc` compiles without errors.
7. Verify functional diagnostics (messages, visibility, modals, Supabase realtime).
8. Confirm distribution build outputs compiled JS only (no `.ts` files shipped).

## Constraints
- Must follow the Default Collaboration Workflow Manifest (PM→SD→TEST→RED→WHITE→PURPLE→BLINDSPOT→BLUE→DEVOPS→ETHICS).
- Enforce blind-spot and red-line audits; escalate violations immediately.
- Use the unified TypeScript architecture (ES modules, no globals, camelCase fields, boundary normalization).
- Active project context: `canopi`; reuse preferences/policies stored in JAUmemory.
- Maintain backward compatibility with existing sidepanel behavior and diagnostic expectations.
- **RED-LINE**: No `window.*` globals except at approved boundary normalization sites (commented).
- **RED-LINE**: Field naming standardization - use camelCase only, convert snake_case at boundaries, delete duplicates.
- StateManager, SupabaseService, and other core singletons are already TypeScript modules; reuse their exports.
- Avoid adding any new window references—user explicitly prohibits globals.
- Diagnostics formerly in `presence/utils/*.js` were removed; new equivalents likely live elsewhere (check repo for their replacements before re-adding references).

## Context
- Full TypeScript/ES module migration for the Chrome extension is underway.
- Most major feature modules are already converted and no longer rely on window globals.
- Parallel agents delivered updates on UI, diagnostics, build pipeline, and state consistency.
- Outstanding work: legacy utility audit (Agent D) and sidepanel refactor (Agent B) were still in progress when the previous session paused.
- Numerous updated `.ts` files (UI, visibility, profile, messaging, services) are checked in.
- `sidepanel.html` partially refactored toward module loading, but final integration pending.
- Large batch of Markdown reports documenting each agent's work under `docs/orchestration-reports/*.md`.
- Build/distribution docs now at `docs/orchestration-reports/ORCHESTRATION_TASK_EXTENSION_DISTRIBUTION_BUILD.md`.
- `sidepanel.js` is 3470+ lines and heavily uses `window.*` globals.
- `src/sidepanel/Sidepanel.ts` exists but is minimal (~57 lines) - needs completion.
- Legacy `.js` files in `presence/features/` and `presence/utils/` still use `window.*` globals extensively.

## Success Criteria
- [ ] Complete inventory of `.js` modules with global-usage notes.
- [ ] Conversion tracker lists priority, owner, ETA for each module.
- [ ] `sidepanel.js` fully converted to TypeScript modules in `src/sidepanel/`.
- [ ] At least diagnostics + notification modules converted to TypeScript with tests/diagnostics.
- [ ] Sidepanel build uses the new TypeScript outputs (no stale JS).
- [ ] `npx tsc` compiles without errors.
- [ ] Functional diagnostics pass (messages, visibility, modals, Supabase realtime).
- [ ] `manifest.json` and `sidepanel.html` updated to use only module entry points.
- [ ] Distribution build outputs compiled JS only (no `.ts` files shipped).
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
- [ ] Converted + integrated TypeScript modules (sidepanel, diagnostics/notifications/helpers)
- [ ] Updated/added tests & diagnostic scripts
- [ ] Agent-phase reports (PM→ETHICS) with audit checklists
- [ ] JAUmemory updates and final orchestration summary
- [ ] Updated `manifest.json` and `sidepanel.html`
- [ ] Distribution build verification report

## Notes
- Maintain alignment with `UserPreferencesManager` + state managers; replace `window.*` usage with injected managers.
- Diagnostics should leverage `/presence/src/utils/diagnostics/` framework.
- Prioritize modules invoked by `sidepanel.js` (diagnostics panels, notification badges, formatting helpers).
- Check for existing TypeScript equivalents before creating new modules.
- Ensure all boundary normalization sites are documented and commented.


