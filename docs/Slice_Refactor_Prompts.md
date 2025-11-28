# Slice Refactor Prompt Pack

Use these prompts to run up to six parallel agents (max 8 available). Each follows the Slice 2 blueprint: diagnostics first, consolidate exports, add an initializer guard, and validate with type-check/build.

General constraints for every agent:
- Edit **only** under `presence/src/**`. Never touch `extension/`, `dist/`, or `build/`.
- TypeScript ES modules only; no global window exports.
- Follow `.cursorrules`: Plan → Scaffold → Build; run diagnostics before coding; execute `npm run build:presence` afterwards.
- Keep comments minimal and only for non-obvious logic.
- Do not bypass Husky hooks; if they fail because of pre-existing debt, capture the output.

Each prompt includes module-specific details plus shared tasks/deliverables.

---

## 1. UIManager Export & Logger Cleanup
**Scope:** `presence/src/features/UIManager.ts`

**Prompt:**
- Consolidate all exports into a single `uiManagerApi` object + named exports, mirroring `MessagesModule`.
- Remove duplicate `Logger` imports and unused symbols introduced by ErrorHandler refactor.
- Add `initializeUIManager()` to bootstrap DOM listeners once; guard for SSR (`typeof window`).
- Author `presence/src/tools/uiManagerExportsTypecheck.ts` that runs `npm run type-check` and filters `UIManager.ts` errors.
- Run the diagnostic before/after changes; log results plus `npm run build:presence`.
- Update JAUmemory with problem status, diagnostics, and verification.

**Deliverables:** Updated module, new diagnostic script, JAUmemory entry, summary report.

---

## 2. RealtimeManager Typing & Export Consolidation
**Scope:** `presence/src/features/RealtimeManager.ts`

**Prompt:**
- Collapse duplicate exports into `realtimeManagerApi`; ensure `initializeRealtimeManager()` safely attaches realtime listeners.
- Fix TS2554/2322 hotspots (argument count mismatches, intersection return types) enough to unblock exports.
- Add `presence/src/tools/realtimeManagerTypecheck.ts` filtering errors for `RealtimeManager.ts`.
- Diagnostics pre/post, then `npm run build:presence`; capture remaining errors if external.
- JAUmemory updates with diagnostics/test evidence.

---

## 3. ProfileManager Logging & Return Types
**Scope:** `presence/src/features/ProfileManager.ts`

**Prompt:**
- Strip noisy “SD1 PROFILE DEBUG” logs or gate them behind `Logger.isDebugEnabled('profile')`.
- Normalize exports into `profileManagerApi` + `initializeProfileManager()`.
- Fix return-type issues around lines ~3652 (functions returning `{}` vs `string`/`Promise<string>`).
- Add `presence/src/tools/profileManagerDiagnostics.ts` to surface `ProfileManager.ts` warnings/errors.
- Run diagnostics + build; document outcomes and update JAUmemory.

---

## 4. PeopleModule Logger Typings & API Surface
**Scope:** `presence/src/features/PeopleModule.ts`

**Prompt:**
- Provide proper type declarations for `../utils/Logger.js` so imports are satisfied (create or extend `.d.ts` if needed under `presence/src/types`).
- Consolidate exports (`peopleModuleApi`) and add `initializePeopleModule()`.
- Create `presence/src/tools/peopleModuleExportsTypecheck.ts` diagnostic.
- Execute diag + build; note any outstanding failures and record in JAUmemory.

---

## 5. Core Modules ErrorContext Cleanup
**Scope:** `presence/src/core` + shared helpers plagued by unused `ErrorContext`.

**Prompt:**
- Remove unused `ErrorContext` imports across core modules (StateManager, EventBus, UnifiedContextMenu, DependencyContainer, etc.) without breaking actual usage.
- Where ErrorContext is still needed, ensure it’s referenced; otherwise delete or convert to inline comments.
- Build a diagnostic `presence/src/tools/coreErrorContextSweep.ts` that checks `npm run type-check` output for `ErrorContext` warnings/errors.
- Validate via diag + build; update JAUmemory with paths touched and results.

---

## 6. Settings/Profile Helper Harmonization
**Scope:** `presence/src/features/settings/helpers/profileSettingChannel.ts` and related helper files.

**Prompt:**
- Fix missing Logger typings/imports, consolidate exports, and ensure helpers expose a single ES module surface.
- If helpers attach DOM listeners, add an `initializeProfileSettingHelpers()` guard.
- Diagnostic: `presence/src/tools/settingsHelpersTypecheck.ts` focusing on helper-related TS errors.
- Run diag + build; log outputs and update JAUmemory.

---

### Shared Deliverables Checklist
1. Module file cleaned with single export surface + initializer.
2. New diagnostic script checking `npm run type-check` for module-specific issues.
3. Diagnostics run pre/post, with results documented.
4. `npm run build:presence` executed; if it fails elsewhere, include console output.
5. JAUmemory problem entry updated through identified → solved lifecycle, referencing diagnostics/script IDs.
6. Final summary/report noting findings, residual risks, and next steps.

Use the remaining 2 agent slots for follow-up slices (Supabase realtime services, MessageSystemIntegration, UnifiedMessageRenderer); after these, only 2–3 additional focused slices should be needed to close out the high-ROI backlog.

---

## 7. Supabase Realtime Services Stabilization
**Scope:** `presence/src/services/RealtimeSubscriptionService.ts`, `presence/src/services/SupabaseRealtimeClientFix.ts`

**Prompt:**
- Normalize exports into `supabaseRealtimeApi` per service file and ensure no duplicate default exports remain.
- Fix inconsistent return signatures (e.g., `getPageUsers` must consistently return `PresenceRecord[]`) and eliminate string-or-array unions that break TS.
- Add `initializeSupabaseRealtimeServices()` to wire subscriptions only once and guard against missing credentials.
- Diagnostic: `presence/src/tools/supabaseRealtimeDiagnostics.ts` filtering `SupabaseRealtimeClientFix.ts` + `RealtimeSubscriptionService.ts`.
- Run diag pre/post, then `npm run build:presence`; document failures if elsewhere.
- Update JAUmemory with findings, diagnostics, and verification.

---

## 8. MessageSystemIntegration Export Hygiene
**Scope:** `presence/src/features/MessageSystemIntegration.ts`

**Prompt:**
- Collapse exports into `messageSystemIntegrationApi`; ensure integration hooks are initialized through `initializeMessageSystemIntegration()`.
- Remove stale ErrorContext imports and align helper usage with `MessagesModule`.
- Diagnostic: `presence/src/tools/messageSystemIntegrationTypecheck.ts` (filters errors referencing `MessageSystemIntegration.ts`).
- Execute diag + build; capture outputs/remaining blockers, update JAUmemory accordingly.

---

## 9. UnifiedMessageRenderer Consistency
**Scope:** `presence/src/utils/UnifiedMessageRenderer.ts`

**Prompt:**
- Normalize renderer exports by creating `unifiedMessageRendererApi` plus a guarded initializer for DOM-dependent helpers.
- Ensure helper functions reference shared Logger/ErrorHandler utilities via ES imports, no window globals.
- Diagnostic: `presence/src/tools/unifiedMessageRendererDiagnostics.ts` running `npm run type-check` and filtering renderer errors.
- Run diag + build, document results, update JAUmemory with status/verification steps.

---


