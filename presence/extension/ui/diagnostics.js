/**
 * Diagnostics controller
 */
import { Logger } from '../utils/Logger.js';
export function createDiagnosticsController(hooks = {}, logger = Logger) {
    const safeInvoke = (label, fn) => {
        logger.debug?.(`🔍 UI DIAGNOSTIC: ${label} invoked`);
        try {
            fn?.();
        }
        catch (error) {
            logger.error?.(`❌ UI DIAGNOSTIC: ${label} failed`, error);
        }
    };
    return {
        updateVisualHierarchy: () => safeInvoke('updateVisualHierarchy', hooks.updateVisualHierarchy),
        debugHierarchy: () => safeInvoke('debugHierarchy', hooks.debugHierarchy),
        forceRefreshCSS: () => safeInvoke('forceRefreshCSS', hooks.forceRefreshCSS)
    };
}
export default createDiagnosticsController;
