/**
 * Tab Manager Diagnostic Script
 * Diagnoses issues with tab content switching, currentTab/previousTab tracking,
 * test suite, and visible tab count updates
 */
interface DiagnosticResult {
    issue: string;
    status: 'PASS' | 'FAIL' | 'WARN';
    details: string;
    recommendation?: string;
}
declare class TabManagerDiagnostic {
    private results;
    runDiagnostics(): Promise<void>;
    private checkTabContentSwitching;
    private checkCurrentPreviousTabTracking;
    private checkTestSuite;
    private checkVisibleTabCount;
    private checkTabDisplayRendering;
    private checkStoragePersistence;
    private printResults;
    getResults(): DiagnosticResult[];
}
export default TabManagerDiagnostic;
//# sourceMappingURL=diagnose-tab-manager-issues.d.ts.map