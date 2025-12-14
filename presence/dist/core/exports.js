/**
 * Core Module Exports to Window
 * Makes critical modules available globally for runtime access
 */
// State Management
export { stateManagerInstance, getState, setState, StateManager } from './StateManager.js';
// Configuration
export { AVATAR_FALLBACK_COLOR, configManagerInstance } from '../utils/ConfigManager.js';
// Logging
export { Logger } from '../utils/ErrorHandler.js';
// Community Helpers
export { updateCommunityDropdown, initializeCommunityDropdown } from '../features/CommunityHelpers.js';
// Tab Management
export { getTabManager } from '../features/TabManager/TabManager.js';
// Make critical instances available on window
import { stateManagerInstance } from './StateManager.js';
import { Logger } from '../utils/ErrorHandler.js';
import { getTabManager } from '../features/TabManager/TabManager.js';
if (typeof window !== 'undefined') {
    // Core state and logging
    window.stateManagerInstance = stateManagerInstance;
    window.Logger = Logger;
    // Community utilities
    // CommunityHelpers functions are available through individual imports
    // Tab management
    window.getTabManager = getTabManager;
    console.log('✅ Core exports initialized on window');
}
//# sourceMappingURL=exports.js.map