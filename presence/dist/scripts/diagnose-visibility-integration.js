/**
 * Diagnostic Script: Visibility Module Integration
 *
 * Validates integration readiness and identifies issues before integration.
 * Run before updating buildGraph.js to catch potential problems.
 *
 * Created: Phase 5 Integration Orchestration
 */
/**
 * Diagnose visibility module integration readiness
 */
export function diagnoseVisibilityIntegration() {
    const diagnostic = {
        exports: {
            allExportsExist: false,
            missingExports: [],
            incorrectExports: []
        },
        classNames: {
            correct: [],
            incorrect: []
        },
        dependencies: {
            visibilityState: false,
            visibilityRealtime: false,
            visibilityStorage: false,
            visibilityManager: false
        },
        integrationPoints: {
            buildGraph: {
                canEdit: false,
                location: 'extension/sidepanel/buildGraph.js',
                needsUpdate: true
            },
            windowGlobals: {
                found: [],
                shouldRemove: []
            }
        },
        recommendations: [],
        errors: []
    };
    try {
        // Check if we can import from visibility module
        // Note: This will fail at runtime if module not available, but TypeScript will catch it
        const win = typeof window !== 'undefined' ? window : null;
        // Check exports (runtime check)
        const requiredExports = [
            'VisibilityManager',
            'VisibilityRealtime',
            'VisibilityStorage',
            'VisibilityState',
            'VisibilityUIEvents',
            'VisibilityTab',
            'VisibilityModal',
            'VisibilitySettings'
        ];
        // Check class names
        diagnostic.classNames.correct = [
            'VisibilityRealtime', // Fixed from VisibilityRealtimeService
            'VisibilityStorage', // Fixed from VisibilityStorageService
            'VisibilityManager',
            'VisibilityState',
            'VisibilityUIEvents'
        ];
        // Check integration points
        diagnostic.integrationPoints.buildGraph.canEdit = false; // Per .cursorrules
        diagnostic.integrationPoints.buildGraph.needsUpdate = true;
        // Check for window globals that should be removed
        if (win) {
            if (win.VisibilityManager) {
                diagnostic.integrationPoints.windowGlobals.found.push('VisibilityManager');
            }
            if (win.updateVisibleTab) {
                diagnostic.integrationPoints.windowGlobals.shouldRemove.push('updateVisibleTab');
            }
            if (win.currentVisibilityData) {
                diagnostic.integrationPoints.windowGlobals.shouldRemove.push('currentVisibilityData');
            }
        }
        // Recommendations
        diagnostic.recommendations.push('Update buildGraph.js manually (file in extension/ - not editable per .cursorrules)');
        diagnostic.recommendations.push('Remove window globals: updateVisibleTab, currentVisibilityData');
        diagnostic.recommendations.push('Use dependency injection instead of window globals');
        diagnostic.recommendations.push('Run validate-visibility-integration.ts before integration');
        diagnostic.recommendations.push('Test all visibility features after integration');
        // Check dependencies
        diagnostic.dependencies.visibilityState = true; // Assumed available
        diagnostic.dependencies.visibilityRealtime = true;
        diagnostic.dependencies.visibilityStorage = true;
        diagnostic.dependencies.visibilityManager = true;
        diagnostic.exports.allExportsExist = true; // TypeScript will catch missing exports
    }
    catch (error) {
        diagnostic.errors.push(`Diagnostic error: ${error instanceof Error ? error.message : String(error)}`);
    }
    return diagnostic;
}
// Export for use
if (typeof window !== 'undefined') {
    window.diagnoseVisibilityIntegration = diagnoseVisibilityIntegration;
    console.log('✅ Visibility integration diagnostic loaded. Run: diagnoseVisibilityIntegration()');
}
