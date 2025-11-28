/**
 * VISIBILITY MODULE - Main Export
 *
 * Central export point for the refactored visibility module.
 * Phase 1: Foundation - Module Exports
 * Phase 2: Core Logic Separation - Service Abstractions
 */
export * from './core/VisibilityTypes.js';
export * from './core/VisibilityState.js';
export * from './core/VisibilityManager.js';
export * from './services/VisibilityRealtime.js';
export * from './services/VisibilityStorage.js';
export * from './ui/VisibilityTab.js';
export * from './ui/VisibilityModal.js';
export * from './ui/VisibilitySettings.js';
export * from './ui/VisibilityUIEvents.js';
export * from './utils/pageIdResolver.js';
export * from './utils/visibilityHelpers.js';
export * from './integration/buildGraphAdapter.js';
export * from './integration/createVisibilityRefresher.js';
export type { VisibilityUser, IVisibilityRealtime, IVisibilityStorage, VisibilityStateSnapshot, VisibilityEventType, VisibilityEvent, PageIdResolution, VisibilityManagerStatus } from './core/VisibilityTypes.js';
//# sourceMappingURL=index.d.ts.map