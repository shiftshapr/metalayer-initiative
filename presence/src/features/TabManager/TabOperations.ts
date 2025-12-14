/**
 * Tab Operation Types
 *
 * Defines the different types of tab operations to replace the ambiguous forceLoad boolean.
 * This provides clear semantic meaning for different tab switching scenarios.
 */
export enum TabOperation {
  /**
   * LOAD: Load tab content for the first time
   * - Always loads content regardless of loadedTabs state
   * - Used during initialization or when tab content needs to be populated
   * - Sets loadedTabs tracking
   */
  LOAD = 'load',

  /**
   * SWITCH: Switch to an already loaded tab (UI only)
   * - Never loads content, only changes UI state
   * - Used when switching between already loaded tabs
   * - Preserves loadedTabs state
   */
  SWITCH = 'switch',

  /**
   * REFRESH: Force reload existing tab content
   * - Always loads content, ignores loadedTabs state
   * - Used when content needs to be refreshed due to external changes
   * - Preserves loadedTabs tracking (content is still considered loaded)
   */
  REFRESH = 'refresh'
}

export type TabOperationType = TabOperation;

