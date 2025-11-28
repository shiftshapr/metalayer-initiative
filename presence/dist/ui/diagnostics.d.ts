/**
 * Diagnostics controller
 */
import { Logger } from '../utils/Logger.js';
interface DiagnosticsHooks {
    updateVisualHierarchy?: () => void;
    debugHierarchy?: () => void;
    forceRefreshCSS?: () => void;
}
export declare function createDiagnosticsController(hooks?: DiagnosticsHooks, logger?: typeof Logger): {
    updateVisualHierarchy: () => void;
    debugHierarchy: () => void;
    forceRefreshCSS: () => void;
};
export default createDiagnosticsController;
//# sourceMappingURL=diagnostics.d.ts.map