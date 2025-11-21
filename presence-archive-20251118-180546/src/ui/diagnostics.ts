import { Logger, type LogData } from '../utils/Logger.js';

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

export function createDiagnosticsController(hooks: DiagnosticsHooks = {}, logger: typeof Logger = Logger): DiagnosticsController {
  const safeInvoke = (label: string, fn?: () => void): void => {
    logger.debug?.(`🔍 UI DIAGNOSTIC: ${label} invoked`);
    try {
      fn?.();
    } catch (error) {
      logger.error?.(`❌ UI DIAGNOSTIC: ${label} failed`, error as unknown as LogData);
    }
  };

  return {
    updateVisualHierarchy: () => safeInvoke('updateVisualHierarchy', hooks.updateVisualHierarchy),
    debugHierarchy: () => safeInvoke('debugHierarchy', hooks.debugHierarchy),
    forceRefreshCSS: () => safeInvoke('forceRefreshCSS', hooks.forceRefreshCSS)
  };
}

export default createDiagnosticsController;
