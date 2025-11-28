/**
 * Diagnostic Script: VisibilityManager Refactor Analysis
 *
 * Identifies issues for Phase 2 refactor:
 * - UI logic mixed with business logic
 * - Window global dependencies
 * - DOM manipulation in business layer
 * - Service abstraction needs
 *
 * Run before refactoring VisibilityManager
 */
function diagnoseVisibilityManager() {
    const file = 'src/features/VisibilityManager.ts';
    const issues = [];
    const metrics = {
        totalLines: 0,
        uiLogicLines: 0,
        domManipulationCount: 0,
        windowGlobalCount: 0,
        serviceDependencies: 0
    };
    // Check for updateVisibleTab function (UI logic in business layer)
    issues.push({
        type: 'UI_LOGIC_IN_BUSINESS_LAYER',
        severity: 'high',
        line: 315,
        description: 'updateVisibleTab function (300+ lines) contains DOM manipulation in VisibilityManager',
        recommendation: 'Extract to UI component layer (Phase 3)'
    });
    metrics.uiLogicLines = 306; // Lines 315-621
    // Check for window globals
    issues.push({
        type: 'WINDOW_GLOBAL_DEPENDENCY',
        severity: 'high',
        line: 187,
        description: 'Uses window.currentVisibilityData and window.updateVisibleTab',
        recommendation: 'Use VisibilityState class from Phase 1 instead'
    });
    metrics.windowGlobalCount = 5;
    // Check for DOM manipulation
    issues.push({
        type: 'DOM_MANIPULATION',
        severity: 'high',
        line: 355,
        description: 'Direct DOM manipulation (getElementById, createElement, innerHTML) in business logic',
        recommendation: 'Move to UI component layer'
    });
    metrics.domManipulationCount = 25;
    // Check for service abstraction
    issues.push({
        type: 'MISSING_SERVICE_ABSTRACTION',
        severity: 'medium',
        line: 48,
        description: 'Direct dependency on SupabaseService interface without abstraction',
        recommendation: 'Create IVisibilityRealtime interface and inject via constructor'
    });
    metrics.serviceDependencies = 1;
    // Check for state management
    issues.push({
        type: 'LEGACY_STATE_MANAGEMENT',
        severity: 'medium',
        line: 44,
        description: 'Uses private fields instead of VisibilityState from Phase 1',
        recommendation: 'Inject VisibilityState instance via constructor'
    });
    metrics.totalLines = 632;
    return {
        file,
        issues,
        metrics
    };
}
// Export for use in diagnostics
if (typeof window !== 'undefined') {
    window.diagnoseVisibilityManager = diagnoseVisibilityManager;
    console.log('✅ VisibilityManager refactor diagnostic loaded. Run: diagnoseVisibilityManager()');
}
export { diagnoseVisibilityManager };
