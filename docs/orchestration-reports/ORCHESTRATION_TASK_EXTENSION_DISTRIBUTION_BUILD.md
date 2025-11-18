# Task Invocation Template

## Task Metadata
- **Task ID**: `ORCH-DIST-20251117`
- **Project**: `canopi`
- **Date**: `2025-11-17`
- **Objective**: `Distribution & Build Pipeline (Agent E) - ensure compiled-only Chrome extension output and strip window shim exports`
- **Priority**: `HIGH`
- **Status**: `IN_PROGRESS`

## Objective
Ensure the Chrome extension build produces distribution artifacts that contain only compiled JavaScript, updates the manifest/HTML integration points to reference the generated modules, and removes residual `window.*` shim exports from the build output while validating via Default Collaboration Workflow Manifest.

## Requirements
1. Wire the build pipeline to compile TypeScript to `presence/dist` and generate a clean `presence/build` distribution directory without `.ts` artifacts.
2. Update extension entry points (e.g., `sidepanel.html`) and supporting scripts to reference module-based JS paths and remove `window.*` shim exports from generated files.
3. Add post-build validation that enforces the absence of `.ts` files and capitalized `window.*` shim exports before distribution.

## Constraints
- Must follow the Default Collaboration Workflow Manifest across PM → SD → TEST → RED → WHITE → PURPLE → BLINDSPOT → BLUE → DEVOPS → ETHICS.
- Preserve existing functionality; legacy globals such as `window.api` must continue to work after the refactor.
- Active project context: **canopi**; integrate findings with JAUmemory tracking where applicable.

## Context
- Previous builds leaked `.ts` sources and relied on TypeScript modules exporting themselves via `window.*` shims.
- Diagnostic scripts (e.g., `ROOT_CAUSE_DIAGNOSTIC_FRAMEWORK.js`) already exist and should continue to run post-build.
- Build should succeed even when TypeScript emits diagnostics (project uses `noEmitOnError: false`), but distribution validation must still pass.

## Success Criteria
- [ ] `npm run build:extension` compiles TS, copies assets into `presence/build`, and removes `.ts` files.
- [ ] `sidepanel.html` and other entry points load compiled modules from `dist/*.js` paths only.
- [ ] Post-build validation reports zero capitalized `window.*` shim exports and zero `.ts` artifacts in `presence/build`.

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
- [ ] Updated build script(s) and documentation covering compilation + validation.
- [ ] Clean `presence/build` distribution ready for Chrome extension packaging.
- [ ] Multi-agent workflow audit notes (PM → ETHICS) with findings and approvals.

## Notes
- Post-build validation focuses on capitalized shims (`window.StateManager`, `window.EventBus`, etc.); legacy lowercase globals remain until downstream modules are refactored.
- Build diagnostics from `tsc` are logged but tolerated; validation ensures distribution correctness despite TypeScript warnings.




