/**
 * VISIBILITY MODULE - Main Export
 * 
 * Central export point for the refactored visibility module.
 * Phase 1: Foundation - Module Exports
 * Phase 2: Core Logic Separation - Service Abstractions
 */

// Core exports
export * from './core/VisibilityTypes.js';
export * from './core/VisibilityState.js';
export * from './core/VisibilityManager.js';

// Service exports
export * from './services/VisibilityRealtime.js';
export * from './services/VisibilityStorage.js';

// UI exports
export * from './ui/VisibilityTab.js';
export * from './ui/VisibilityModal.js';
export * from './ui/VisibilitySettings.js';
export * from './ui/VisibilityUIEvents.js';

// Utility exports
export * from './utils/pageIdResolver.js';
export * from './utils/visibilityHelpers.js';

// Integration helpers
export * from './integration/buildGraphAdapter.js';
export * from './integration/createVisibilityRefresher.js';

// Re-export types for convenience
export type {
  VisibilityUser,
  IVisibilityRealtime,
  IVisibilityStorage,
  VisibilityStateSnapshot,
  VisibilityEventType,
  VisibilityEvent,
  PageIdResolution,
  VisibilityManagerStatus
} from './core/VisibilityTypes.js';

