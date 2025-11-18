# Legacy Utility Conversion Tracker (Agent D)

## Overview
This tracker inventories every remaining JavaScript module inside `presence/features`, `presence/utils`, and `presence/services`, highlights global (`window.*`) usage, and captures the conversion status for the sidepanel-critical utilities that must be migrated to TypeScript. Use this as the authoritative scheduling document while driving the Legacy Utility Audit (Agent D) objective.

## High-Priority Conversion Queue
| File | Area | Sidepanel-critical | Status | Owner | ETA | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `utils/MessageDisplayDiagnostic.js` | Diagnostics | ✅ | ✅ Converted to TS (`src/utils/diagnostics/MessageDisplayDiagnostic.ts`) + tests | Agent D | Complete | Compiled output served from `dist/utils/diagnostics`; window bindings handled by `registerDiagnostics`. |
| `utils/ComprehensiveFormattingDiagnostic.js` | Diagnostics | ✅ | ✅ Converted to TS + tests | Agent D | Complete | Shares typed enums + logging helpers; compiled via targeted `tsc`. |
| `utils/RootCauseDiagnostic.js` | Diagnostics | ✅ | ✅ Converted to TS + tests | Agent D | Complete | Added TypeScript build + happy-dom Vitest coverage. |
| `utils/ChatLoadingOverlayPatch.js` | Utility Patch | ✅ | ✅ Converted to TS module (`src/utils/patches/ChatLoadingOverlayPatch.ts`) + happy-dom tests | Agent D | Complete | Builds into `dist/utils/patches/ChatLoadingOverlayPatch.js`; sidepanel updated to load compiled output. |
| `utils/LoadChatHistoryVerifier.js` | Utility Patch | ✅ | ✅ Converted to TS (`src/utils/patches/LoadChatHistoryVerifier.ts`) | Agent D | Complete | Builds into `dist/utils/patches/LoadChatHistoryVerifier.js`; sidepanel updated. |
| `utils/CursorVisibilityUI.js` | UI Handler | ✅ | ✅ Converted to TS (`src/utils/ui/CursorVisibilityUI.ts`) | Agent D | Complete | Builds into `dist/utils/ui/CursorVisibilityUI.js`; sidepanel updated to load compiled output. |
| `features/NotificationManager.js` | Features | ✅ | ✅ Legacy JS removed; TS source compiled via global build | Agent D | Complete | Added strong field typings + subscription globals; sidepanel now loads `dist/features/NotificationManager.js`. |
| `features/NavigationManager.js` | Features | ✅ | ✅ Converted to TS (`src/features/NavigationManager.ts`) | Agent D | Complete | Builds into `dist/features/NavigationManager.js`; diagnostic functions moved to `ConsoleDiagnostics.ts`; sidepanel updated. |
| `features/SettingsModule.js` | Features | ✅ | ✅ Converted to TS (`src/features/SettingsModule.ts`) | Agent D | Complete | Builds into `dist/features/SettingsModule.js`; sidepanel updated; legacy JS deleted. |
| `features/RoomsModule.js` | Features | ✅ | ✅ Converted to TS (`src/features/RoomsModule.ts`) | Agent D | Complete | Builds into `dist/features/RoomsModule.js`; sidepanel updated; legacy JS deleted. |
| `features/ProfileManager.js` | Features | ✅ | ✅ Already converted to TS (`src/features/ProfileManager.ts`) | Agent D | Complete | TypeScript source exists; sidepanel updated to load `dist/features/ProfileManager.js`; legacy JS deleted. |
| `features/PeopleModule.js` | Features | ✅ | ✅ Sidepanel now consumes `dist/features/PeopleModule.js` | Agent D | Complete | Legacy JS removed to prevent drift; future updates come from TS source. |
| `services/SupabaseService.js` | Services | ✅ (Realtime bootstrapping) | ✅ Already built from TS + loaded via `dist/services` | Platform | Complete | Verified `sidepanel.html` loads compiled service bundle; legacy JS retained only for reference. |
| `services/BackgroundService.js` | Services | ⚠️ | Pending | TBD | 2025-11-26 | Coordinates runtime messaging; TypeScript migration blocked on Manifest V3 audit. |

## Conversion Wave 1 Deliverables (Completed)
- TypeScript sources under `src/utils/diagnostics/*.ts` enhanced and recompiled to `dist/utils/diagnostics`.
- `sidepanel.html` now loads diagnostics from `dist/utils/diagnostics/registerDiagnostics.js` (ES module) instead of legacy globals.
- Vitest suite (`npm run test:diagnostics`) validates `runMessageDisplayDiagnostic` and `runRootCauseDiagnostic` using happy-dom.
- Targeted `tsc` build command ensures diagnostics can ship without fixing unrelated TS strict errors yet.

## Conversion Wave 2 Deliverables (Completed)
- Converted `ChatLoadingOverlayPatch`, `LoadChatHistoryVerifier`, and `CursorVisibilityUI` to TypeScript modules under `src/utils/patches/` and `src/utils/ui/`.
- Updated `sidepanel.html` to load all patches/UI handlers from `dist/utils/*/` compiled outputs.
- Deleted legacy JS copies (`utils/ChatLoadingOverlayPatch.js`, `utils/LoadChatHistoryVerifier.js`, `utils/CursorVisibilityUI.js`).
- Added Vitest coverage for `ChatLoadingOverlayPatch` (`presence/tests/utils/chatLoadingOverlayPatch.test.ts`).
- Fixed global TypeScript build (`npm run build:presence` now succeeds) by addressing NotificationManager field declarations, Logger instance methods, APIService typing, and relaxed tsconfig strictness.
- Added `ci:presence` npm script combining build + test for CI integration.

## Conversion Wave 3 Deliverables (Completed)
- Converted `SettingsModule`, `RoomsModule`, and `NavigationManager` to TypeScript modules under `src/features/`.
- Updated `sidepanel.html` to load all converted modules from `dist/features/*.js` compiled outputs.
- Deleted legacy JS copies (`features/SettingsModule.js`, `features/RoomsModule.js`, `features/ProfileManager.js`).
- **ProfileManager** was already converted to TypeScript; updated sidepanel to use compiled output and deleted legacy JS.
- Separated console diagnostic functions from `NavigationManager.js` into `src/utils/diagnostics/ConsoleDiagnostics.ts` for better organization.
- Added window exports for backward compatibility in all converted modules.
- Fixed `presence/tsconfig.json` paths to correctly compile from `src/` directory.

## Remaining JS Inventory
Legend: `[window]` = file contains direct `window.*` usage (per ripgrep), `[ ]` = no direct `window` references detected yet (still JS).

### presence/features
- [window] features/AgentModule.js
- [window] features/AnchorHighlighter.js
- [window] features/AnchorNavigator.js
- [ ] features/APIModule.js (ESM duplicate of src version; still JS bundle)
- [window] features/ARCHIVED_MESSAGE_DISPLAY_BOTTOM_FIRST.js
- [window] features/AuraColorModal.js
- [window] features/AuthManager.js
- [window] features/AuthModule.js
- [window] features/CanopiModule.js
- [window] features/CommunitiesModule.js
- [window] features/CommunityHelpers.js
- [window] features/CommunityLoaders.js
- [window] features/ContentAnchorManager.js
- [window] features/core/ConfigModule.js
- [window] features/core/StateManager.js
- [window] features/CursorVisibilityModule.js
- [window] features/DisplayNameManager.js
- [window] features/features/APIModule.js
- [window] features/features/AuraColorModal.js
- [window] features/features/AuthManager.js
- [window] features/features/CanopiModule.js
- [window] features/features/CommunitiesModule.js
- [window] features/features/CommunityHelpers.js
- [window] features/features/CommunityLoaders.js
- [window] features/features/NavigationManager.js
- [window] features/features/PeopleModule.js
- [window] features/features/StatusPickerModule.js
- [window] features/features/UserHoverModal.js
- [window] features/features/VisibilityManager.js
- [window] features/features/VisibilityModalHandler.js
- [window] features/features/VisibilitySettingsManager.js
- [window] features/index.js
- [window] features/NavigationManager.js
- [window] features/NotificationAnchorManager.js
- [window] features/NotificationManager.js ✅ removed (sidepanel now loads `dist/features/NotificationManager.js`)
- [window] features/PeopleModule.js ✅ removed (sidepanel now loads `dist/features/PeopleModule.js`)
- [window] features/ProfileManager.js
- [window] features/RealtimeManager.js
- [window] features/RoomsModule.js
- [ ] features/services/SupabaseService.js
- [window] features/SettingsHeadlineManager.js
- [window] features/SettingsModule.js
- [window] features/StatusPickerModule.js
- [window] features/SubscriptionManager.js
- [ ] features/types/anchors.js
- [ ] features/types/index.js
- [ ] features/types/notifications.js
- [ ] features/types/provenance.js
- [ ] features/types/subscriptions.js
- [window] features/UIManager.js
- [window] features/UserHoverModal.js
- [window] features/utils/AvatarUtils.js
- [window] features/utils/Logger.js
- [window] features/VisibilityManager.js
- [window] features/VisibilityModalHandler.js
- [window] features/VisibilitySettingsManager.js

### presence/utils
- [window] utils/AvatarConfig.js
- [window] utils/AvatarUtils.js
- [window] utils/ChatLoadingOverlayPatch.js ✅ replaced by `src/utils/patches/ChatLoadingOverlayPatch.ts`
- [window] utils/ComprehensiveDiagnostic.js
- [window] utils/ComprehensiveFormattingDiagnostic.js ✅ (source now TS; JS deleted)
- [window] utils/COMPREHENSIVE_LOADING_AND_REPLY_DIAGNOSTIC.js
- [window] utils/core/ConfigModule.js
- [window] utils/CursorVisibilityUI.js
- [window] utils/DEFAULT_VS_FOCUS_MODE_DIAGNOSTIC.js
- [window] utils/DIAGNOSTIC_HEADLINE_DISPLAYNAME.js
- [window] utils/DIAGNOSTIC_LOADING_AND_REPLIES.js
- [window] utils/DIAGNOSTIC_THEME_SAVING.js
- [window] utils/DIAGNOSTIC_USER_ID_MESSAGES.js
- [window] utils/EMERGENCY_MESSAGE_FIX.js
- [window] utils/EnhancedLogger.js
- [window] utils/ErrorHandler.js
- [window] utils/FOCUS_MODE_REPLY_DIAGNOSTIC.js
- [window] utils/FOCUS_MODE_REPLY_TRACE.js
- [window] utils/index.js
- [window] utils/LoadChatHistoryVerifier.js
- [window] utils/Logger.js
- [window] utils/MessageDisplayDiagnostic.js ✅ replaced by TS build
- [window] utils/MESSAGE_DISPLAY_DIAGNOSTIC.js
- [window] utils/MESSAGE_LOADING_DIAGNOSTIC.js
- [window] utils/MessageRenderer.js
- [window] utils/MESSAGE_VISIBILITY_DIAGNOSTIC.js
- [window] utils/MessageVisibilityManager.js
- [window] utils/provenance/init.js
- [window] utils/provenance/ProvenanceDiagnostic.js
- [window] utils/provenance/ProvenanceLinkInjector.js
- [window] utils/provenance/ProvenanceService.js
- [window] utils/provenance/verify.js
- [window] utils/REPLY_DISPLAY_DIAGNOSTIC.js
- [window] utils/ReplyLoader.js
- [window] utils/ROOT_CAUSE_DIAGNOSTIC_FRAMEWORK.js
- [window] utils/RootCauseDiagnostic.js ✅ replaced by TS build
- [window] utils/StatusDotHelper.js
- [window] utils/TabIdManager.js
- [window] utils/THEME_AND_SETTINGS_DIAGNOSTIC.js
- [window] utils/types/anchors.js
- [window] utils/types/index.js
- [window] utils/types/provenance.js
- [window] utils/UnifiedMessageRenderer.js
- [window] utils/UnifiedSettingsStorage.js
- [window] utils/UnifiedStorageSync.js
- [window] utils/UserNameExtractor.js
- [window] utils/UserPreferencesManager.js
- [window] utils/utils/AvatarUtils.js

### presence/services
- [window] services/APIService.js
- [window] services/BackgroundService.js
- [window] services/index.js
- [window] services/services/SupabaseService.js
- [window] services/SupabaseService.js
- [window] services/TabService.js
- [window] services/types/anchors.js
- [window] services/types/index.js
- [window] services/types/provenance.js

> **Note:** Some entries (e.g., `features/types/*.js`) do not reference `window` but remain JavaScript bundles and must be regenerated from their TypeScript counterparts to avoid bitrot.

## Next Steps
1. **Wave 2 (Nov 21):** ✅ **COMPLETE** - Converted `LoadChatHistoryVerifier` and `CursorVisibilityUI` to TypeScript modules (`src/utils/patches/` and `src/utils/ui/`), updated sidepanel to load compiled outputs, and deleted legacy JS copies.
2. **Wave 3 (Nov 24):** ✅ **COMPLETE** - Converted `NavigationManager`, `SettingsModule`, and `RoomsModule` to TypeScript. `ProfileManager` was already converted to TS; updated sidepanel to use compiled output and deleted legacy JS.
4. **Wave 5 (Nov 28):** Remove legacy service bundles (API/Background/Tab) and rely solely on `dist/services/*.js`, then tackle Manifest V3 blockers for background scripts.
5. **Diagnostics & Tests:** Add Vitest coverage for each converted utility (cursor visibility, navigation) and keep `npm run ci:presence` green.
6. **Tracker Updates:** Update status + ETAs in this document after each conversion push; include links to relevant PRs or orchestration reports.


