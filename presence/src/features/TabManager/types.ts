// src/features/TabManager/types.ts
// TypeScript Foundation Layer - Session A
// Provides type-safe interfaces and contracts for all TabManager operations

import { TabConfig } from '../../types/index.js';

// import * as t from 'io-ts';

// ============================================================================
// BRANDED TYPES
// ============================================================================

/**
 * Branded type for Tab IDs to prevent string/TabId confusion at compile time
 */
export type TabId = string & { readonly __brand: 'TabId' };

/**
 * Branded type for error codes
 */
export type TabManagerErrorCode = string & { readonly __brand: 'TabManagerErrorCode' };

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

/**
 * Tab operation types - discriminated union for type safety
 */
export const TAB_OPERATION_TYPES = {
  LOAD: 'LOAD',
  SWITCH: 'SWITCH'
} as const;

export type TabOperationType = typeof TAB_OPERATION_TYPES[keyof typeof TAB_OPERATION_TYPES];

/**
 * Tab content loading states
 */
export const TAB_CONTENT_STATES = {
  NOT_LOADED: 'NOT_LOADED',
  LOADING: 'LOADING',
  LOADED: 'LOADED',
  LOAD_FAILED: 'LOAD_FAILED'
} as const;

export type TabContentState = typeof TAB_CONTENT_STATES[keyof typeof TAB_CONTENT_STATES];

/**
 * Tab display states
 */
export const TAB_DISPLAY_STATES = {
  NOT_DISPLAYED: 'NOT_DISPLAYED',
  DISPLAYED: 'DISPLAYED'
} as const;

export type TabDisplayState = typeof TAB_DISPLAY_STATES[keyof typeof TAB_DISPLAY_STATES];

/**
 * Tab persistence types
 */
export const TAB_PERSISTENCE_TYPES = {
  SESSION_ONLY: 'SESSION_ONLY',
  PERSIST_VISIBLE: 'PERSIST_VISIBLE'
} as const;

export type TabPersistenceType = typeof TAB_PERSISTENCE_TYPES[keyof typeof TAB_PERSISTENCE_TYPES];

// ============================================================================
// DISCRIMINATED UNIONS
// ============================================================================

/**
 * Tab operation context - discriminated union for type safety
 */
export type TabOperationContext =
  | { readonly type: 'initialization'; readonly preserveTheme: boolean }
  | { readonly type: 'user_action'; readonly notifyBootController: boolean }
  | { readonly type: 'system'; readonly skipValidation: boolean };

/**
 * Theme change reasons - type-safe theme operation classification
 */
export type ThemeChangeReason =
  | { readonly type: 'user_action'; readonly source: 'settings' | 'system' }
  | { readonly type: 'initialization'; readonly source: 'boot' }
  | { readonly type: 'system'; readonly reason: string };

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Core tab operation interface with discriminated union
 */
export interface TabOperation {
  readonly type: TabOperationType;
  readonly tabId: TabId;
  readonly context: TabOperationContext;
}

/**
 * Tab state interface - comprehensive state tracking
 */
export interface TabState {
  readonly tabId: TabId;
  readonly contentState: TabContentState;
  readonly displayState: TabDisplayState;
  readonly lastLoadAttempt?: number;
  readonly loadCount: number;
  readonly errorCount: number;
  readonly persistenceType: TabPersistenceType;
  readonly requiresContentLoading?: boolean;
}

/**
 * UI operation result - separated from content operations
 */
export interface UiOperationResult {
  readonly success: boolean;
  readonly tabId: TabId;
  readonly operation: TabOperationType;
  readonly displayState: TabDisplayState;
  readonly duration: number;
  readonly error?: TabManagerError;
}

/**
 * Content operation result - BootController coordination
 */
export interface ContentOperationResult {
  readonly success: boolean;
  readonly tabId: TabId;
  readonly shouldLoad: boolean;
  readonly reason: string;
  readonly error?: TabManagerError;
}

/**
 * Tab registration for dynamic tabs
 */
export interface TabRegistration {
  readonly persistenceType?: TabPersistenceType;
  readonly requiresContentLoading?: boolean;
  readonly displayName?: string;
  readonly category?: string;
}

// ============================================================================
// ERROR HIERARCHY
// ============================================================================

/**
 * Base TabManager error with type safety
 */
export class TabManagerError extends Error {
  readonly code: TabManagerErrorCode;
  readonly tabId?: TabId;

  constructor(message: string, code: TabManagerErrorCode, tabId?: TabId) {
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
  readonly stateTransition?: {
    from: TabContentState;
    to: TabContentState;
    allowed: readonly TabContentState[];
  };

  constructor(
    message: string,
    code: TabManagerErrorCode,
    tabId: TabId,
    stateTransition?: TabStateError['stateTransition']
  ) {
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
  [TAB_CONTENT_STATES.NOT_LOADED]: [TAB_CONTENT_STATES.LOADING] as const,
  [TAB_CONTENT_STATES.LOADING]: [TAB_CONTENT_STATES.LOADED, TAB_CONTENT_STATES.LOAD_FAILED] as const,
  [TAB_CONTENT_STATES.LOADED]: [TAB_CONTENT_STATES.LOADING] as const, // Allow refresh
  [TAB_CONTENT_STATES.LOAD_FAILED]: [TAB_CONTENT_STATES.LOADING] as const, // Allow retry
} as const;

/**
 * Type-safe transition validation helper
 */
export function getAllowedTransitions(state: TabContentState): readonly TabContentState[] {
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
} as const;

export type TabManagerEventType = typeof TAB_MANAGER_EVENTS[keyof typeof TAB_MANAGER_EVENTS];

/**
 * Strongly typed event detail interfaces
 */
export interface UiOperationEventDetail {
  readonly tabId: TabId;
  readonly operation: TabOperationType;
  readonly timestamp: number;
}

export interface ContentNeededEventDetail {
  readonly tabId: TabId;
  readonly reason: string;
  readonly timestamp: number;
}

export interface StateChangedEventDetail {
  readonly tabId: TabId;
  readonly contentState: TabContentState;
  readonly displayState: TabDisplayState;
  readonly timestamp: number;
}

// ============================================================================
// TYPE GUARDS & UTILITIES
// ============================================================================

/**
 * Runtime type guard for TabId validation
 */
export function isValidTabId(value: string): value is TabId {
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
export function toTabId(value: string): TabId {
  if (!isValidTabId(value)) {
    throw new TabManagerError(`Invalid tab ID: ${value}`, 'INVALID_TAB_ID' as TabManagerErrorCode);
  }
  return value as TabId;
}

/**
 * Type guard for known vs dynamic tabs
 */
export function isKnownTab(_tabId: TabId): boolean {
  // This will be populated by TabRegistry
  return false; // Placeholder - will be implemented by registry
}

/**
 * Type guard for tabs requiring content loading
 */
export function isContentLoadableTab(_tabId: TabId): boolean {
  // Default to true for dynamic tabs
  return true;
}

/**
 * Type guard for persistent tabs
 */
export function requiresPersistence(_tabId: TabId): boolean {
  // Default to session-only for dynamic tabs
  return false;
}

// ============================================================================
// RUNTIME VALIDATION CODECS (io-ts)
// ============================================================================

// IO-TS codecs removed - io-ts dependency not available
// Runtime validation can be implemented with simple type guards if needed

// ============================================================================
// TAB MANAGER STATE TYPES
// ============================================================================

/**
 * Tab manager state interface
 */
export interface TabManagerState {
  tabs: TabConfig[];
  currentTab: string | null;
  previousTab: string | null;
  visibleTabCount: number;
  userTabLimit: number;
  isModalOpen?: boolean;
}

/**
 * Default tab manager state
 */
export const DEFAULT_STATE: TabManagerState = {
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


