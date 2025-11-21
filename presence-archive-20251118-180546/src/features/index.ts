/**
 * FEATURE MODULES - Central Exports
 * Export all feature modules from a single entry point
 */

export { AuthManager } from './AuthManager.js';
export { VisibilityManager, updateVisibleTab } from './VisibilityManager.js';
export { 
  CanopiModule,
  createUnifiedMessageElement,
  updateReactionDisplay,
  addMessageActionListeners,
  loadMessageReactions,
  handleMessageFocus,
  loadChatHistory
} from './CanopiModule.js';

