import { Logger } from '../utils/Logger.js';
export interface DiagnosticsHooks {
    updateVisualHierarchy?: () => void;
    debugHierarchy?: () => void;
    forceRefreshCSS?: () => void;
}
export interface DiagnosticsController {
    updateVisualHierarchy: () => void;
    debugHierarchy: () => void;
    forceRefreshCSS: () => void;
}
export declare function createDiagnosticsController(hooks?: DiagnosticsHooks, logger?: typeof Logger): DiagnosticsController;
export default createDiagnosticsController;
//# sourceMappingURL=diagnostics.d.ts.map