/**
 * CORE MODULES - Central Exports
 * Export all core modules from a single entry point
 */
export { AVATAR_FALLBACK_COLOR } from './ConfigModule.js';
export { getCurrentUser, setCurrentUser, isAuthenticated } from './UserModule.js';
export { getCurrentUrl, getCurrentOrigin, getCurrentPathname, getFullUrl } from './LocationModule.js';
export { StateManager } from './StateManager.js';
export { EventBus } from './EventBus.js';
