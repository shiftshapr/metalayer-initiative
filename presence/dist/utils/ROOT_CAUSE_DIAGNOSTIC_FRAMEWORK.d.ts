/**
 * ROOT CAUSE DIAGNOSTIC FRAMEWORK
 *
 * Comprehensive diagnostic system for identifying root causes of issues.
 * This framework should be used for ALL problems being worked on, regardless
 * of whether a solution is being provided.
 *
 * Usage:
 *   - Call diagnoseIssue('issueName') to run specific diagnostics
 *   - Call diagnoseAll() to run all available diagnostics
 *   - Check console for detailed diagnostic output
 */
type DiagnosticFunction = () => Promise<DiagnosticResult>;
type DiagnosticStatus = 'success' | 'failed' | 'error';
interface DiagnosticResult {
    error?: string;
    [key: string]: any;
}
interface DiagnosticRunResult {
    name: string;
    description: string;
    result: DiagnosticResult | null;
    duration: number;
    timestamp: string;
    status: DiagnosticStatus;
    error?: string;
}
declare class RootCauseDiagnosticFramework {
    private diagnostics;
    private results;
    private startTime;
    constructor();
    /**
     * Register a diagnostic function
     */
    register(name: string, diagnosticFn: DiagnosticFunction, description?: string): void;
    /**
     * Run a specific diagnostic
     */
    runDiagnostic(name: string): Promise<DiagnosticResult | null>;
    /**
     * Run all enabled diagnostics
     */
    runAll(): Promise<Record<string, DiagnosticResult | null>>;
    /**
     * Print diagnostic summary
     */
    printSummary(): void;
    /**
     * Get diagnostic results
     */
    getResults(): DiagnosticRunResult[];
    /**
     * Get results for a specific diagnostic
     */
    getResult(name: string): DiagnosticRunResult | undefined;
}
declare const diagnosticFramework: RootCauseDiagnosticFramework;
/**
 * Run all diagnostics
 */
export declare function diagnoseAll(): Promise<Record<string, DiagnosticResult | null>>;
/**
 * Run a specific diagnostic
 */
export declare function diagnoseIssue(issueName: string): Promise<DiagnosticResult | null>;
/**
 * Get diagnostic results
 */
export declare function getDiagnosticResults(): DiagnosticRunResult[];
export { diagnosticFramework };
//# sourceMappingURL=ROOT_CAUSE_DIAGNOSTIC_FRAMEWORK.d.ts.map