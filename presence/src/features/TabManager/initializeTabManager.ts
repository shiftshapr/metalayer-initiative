/**
 * Tab Manager Initialization
 * Initializes the Tab Manager after DOM is ready
 */

import { getTabManager } from './TabManager.js';
import { Logger } from '../../utils/Logger.js';
import { handleError } from '../../utils/ErrorHandler.js';
import { userPreferencesManager } from '../../utils/UserPreferencesManager.js';

let tabManagerInitialized = false;

async function initializeTabManager() {
  if (tabManagerInitialized) {
    Logger.warn?.('⚠️ TabManager: Already initialized');
    return;
  }

  try {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', async () => {
        try {
          await doInitialize();
        } catch (error: unknown) {
          handleError(error, {
            context: { operation: 'initializeTabManager.DOMContentLoaded', component: 'TabManager' }
          });
        }
      });
    } else {
      await doInitialize();
    }
  } catch (error: unknown) {
    handleError(error, {
      context: { operation: 'initializeTabManager', component: 'TabManager' }
    });
  }
}

/**
 * Wait for UserPreferencesManager to be ready
 * Returns a promise that resolves when UserPreferencesManager is initialized
 * Since we're using ES6 imports, the module is always available, we just need to wait for initialization
 */
function waitForPreferencesManager(): Promise<typeof userPreferencesManager | null> {
  return new Promise((resolve) => {
    // Check if already initialized
    if (userPreferencesManager.isInitialized) {
      Logger.debug?.('✅ TabManager: UserPreferencesManager already ready');
      resolve(userPreferencesManager);
      return;
    }

    // Set up event handler for initialization
    const eventHandler = () => {
      if (userPreferencesManager.isInitialized) {
        Logger.debug?.('✅ TabManager: UserPreferencesManager ready (from event)');
        window.removeEventListener('preferenceLoaded', eventHandler);
        resolve(userPreferencesManager);
      }
    };

    window.addEventListener('preferenceLoaded', eventHandler);

    // Also check periodically as fallback (max 5 seconds)
    let attempts = 0;
    const maxAttempts = 10; // 10 * 500ms = 5 seconds
    const checkInterval = setInterval(() => {
      attempts++;
      if (userPreferencesManager.isInitialized) {
        clearInterval(checkInterval);
        window.removeEventListener('preferenceLoaded', eventHandler);
        resolve(userPreferencesManager);
        return;
      }
      if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        window.removeEventListener('preferenceLoaded', eventHandler);
        Logger.warn?.('⚠️ TabManager: UserPreferencesManager timeout, proceeding anyway');
        resolve(userPreferencesManager); // Return instance even if not initialized
      }
    }, 500);
  });
}

async function doInitialize() {
  try {
    // Wait for UserPreferencesManager to be ready (promise-based, no polling)
    await waitForPreferencesManager();
    
    const tabManager = getTabManager();
    await tabManager.initialize();
    tabManagerInitialized = true;
    
    // ES6 pattern: TabManager is available via getTabManager() export, no window exposure needed
    // Removed window.tabContextManager assignment - use ES6 imports instead
    
    Logger.debug?.('✅ TabManager: Initialized successfully');
    
    // Dispatch event to notify other modules
    document.dispatchEvent(new CustomEvent('tabManager:initialized', {
      detail: { tabManager }
    }));
  } catch (error: unknown) {
    Logger.error?.('❌ TabManager: Initialization error', error);
  }
}

// Auto-initialize when module loads
initializeTabManager();


