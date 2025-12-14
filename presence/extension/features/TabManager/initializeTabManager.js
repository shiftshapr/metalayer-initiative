/**
 * TAB MANAGER INITIALIZER
 * Initializes the TabManager system and renders tabs
 */
import { Logger } from '../../utils/Logger.js';
import { TabManager } from './TabManager.js';
// Global logger instance
const logger = Logger;
/**
 * Initialize the Tab Manager system
 */
async function initializeTabManager() {
    try {
        logger.info('🚀 Initializing TabManager system...', null, 'tab-manager');
        // Create TabManager instance
        const tabManager = new TabManager(logger);
        // Store globally for access by other modules
        if (typeof window !== 'undefined') {
            window.tabManager = tabManager;
        }
        // Initialize TabManager
        await tabManager.initialize();
        logger.info('✅ TabManager system initialized successfully', null, 'tab-manager');
    }
    catch (error) {
        logger.error('❌ Failed to initialize TabManager system', error, 'tab-manager');
        throw error;
    }
}
// Initialize immediately when module loads
if (typeof document !== 'undefined') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeTabManager().catch(error => {
                logger.error('❌ TabManager initialization failed on DOMContentLoaded', error, 'tab-manager');
            });
        });
    }
    else {
        // DOM already loaded
        initializeTabManager().catch(error => {
            logger.error('❌ TabManager initialization failed immediately', error, 'tab-manager');
        });
    }
}
// Export for manual initialization if needed
export { initializeTabManager };
export default initializeTabManager;
//# sourceMappingURL=initializeTabManager.js.map