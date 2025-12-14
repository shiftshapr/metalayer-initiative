// src/features/TabManager/types.ts
// TypeScript Foundation Layer - Session A
// Provides type-safe interfaces and contracts for all TabManager operations
// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================
/**
 * Tab operation types - discriminated union for type safety
 */
export const TAB_OPERATION_TYPES = {
    LOAD: 'LOAD',
    SWITCH: 'SWITCH'
};
/**
 * Tab content loading states
 */
export const TAB_CONTENT_STATES = {
    NOT_LOADED: 'NOT_LOADED',
    LOADING: 'LOADING',
    LOADED: 'LOADED',
    LOAD_FAILED: 'LOAD_FAILED'
};
/**
 * Tab display states
 */
export const TAB_DISPLAY_STATES = {
    NOT_DISPLAYED: 'NOT_DISPLAYED',
    DISPLAYED: 'DISPLAYED'
};
/**
 * Tab persistence types
 */
export const TAB_PERSISTENCE_TYPES = {
    SESSION_ONLY: 'SESSION_ONLY',
    PERSIST_VISIBLE: 'PERSIST_VISIBLE'
};
// ============================================================================
// ERROR HIERARCHY
// ============================================================================
/**
 * Base TabManager error with type safety
 */
export class TabManagerError extends Error {
    constructor(message, code, tabId) {
        super(message);
        this.name = 'TabManagerError';
        this.code = code;
        this.tabId = tabId;
    }
}
/**
 * State transition specific errors
 */
export class TabStateError extends TabManagerError {
    constructor(message, code, tabId, stateTransition) {
        super(message, code, tabId);
        this.name = 'TabStateError';
        this.stateTransition = stateTransition;
    }
}
// ============================================================================
// STATE TRANSITIONS
// ============================================================================
/**
 * Strict state transition rules - compile-time validation
 */
export const CONTENT_STATE_TRANSITIONS = {
    [TAB_CONTENT_STATES.NOT_LOADED]: [TAB_CONTENT_STATES.LOADING],
    [TAB_CONTENT_STATES.LOADING]: [TAB_CONTENT_STATES.LOADED, TAB_CONTENT_STATES.LOAD_FAILED],
    [TAB_CONTENT_STATES.LOADED]: [TAB_CONTENT_STATES.LOADING], // Allow refresh
    [TAB_CONTENT_STATES.LOAD_FAILED]: [TAB_CONTENT_STATES.LOADING], // Allow retry
};
/**
 * Type-safe transition validation helper
 */
export function getAllowedTransitions(state) {
    return CONTENT_STATE_TRANSITIONS[state];
}
// ============================================================================
// REACTIVE INTEGRATION TYPES
// ============================================================================
/**
 * Reactive event types for coordination
 */
export const TAB_MANAGER_EVENTS = {
    UI_OPERATION: 'reactive:tabManager:uiOperation',
    CONTENT_NEEDED: 'reactive:tabManager:contentNeeded',
    STATE_CHANGED: 'reactive:tabManager:stateChanged'
};
// ============================================================================
// TYPE GUARDS & UTILITIES
// ============================================================================
/**
 * Runtime type guard for TabId validation
 */
export function isValidTabId(value) {
    // Allow any string that looks like a valid tab ID
    return typeof value === 'string' &&
        value.length > 0 &&
        value.length < 50 && // Reasonable length limit
        /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(value) && // Valid characters
        value.endsWith('-tab'); // Convention enforcement
}
/**
 * Safe TabId constructor with validation
 */
export function toTabId(value) {
    if (!isValidTabId(value)) {
        throw new TabManagerError(`Invalid tab ID: ${value}`, 'INVALID_TAB_ID');
    }
    return value;
}
/**
 * Type guard for known vs dynamic tabs
 */
export function isKnownTab(_tabId) {
    // This will be populated by TabRegistry
    return false; // Placeholder - will be implemented by registry
}
/**
 * Type guard for tabs requiring content loading
 */
export function isContentLoadableTab(_tabId) {
    // Default to true for dynamic tabs
    return true;
}
/**
 * Type guard for persistent tabs
 */
export function requiresPersistence(_tabId) {
    // Default to session-only for dynamic tabs
    return false;
}
/**
 * Default tab manager state
 */
export const DEFAULT_STATE = {
    tabs: [],
    currentTab: null,
    previousTab: null,
    visibleTabCount: 0,
    userTabLimit: 10,
    isModalOpen: false,
};
// ============================================================================
// EXPORTS
// ============================================================================
// All types and functions are already exported individually above
// No additional exports needed
//# sourceMappingURL=types.js.map