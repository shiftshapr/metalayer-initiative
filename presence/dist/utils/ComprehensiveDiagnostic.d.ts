/**
 * COMPREHENSIVE DIAGNOSTIC TOOL
 * Root Cause Analysis for Messages and Visibility Tab Issues
 */
import type { ComprehensiveDiagnosticResults, UrlNormalizationDiagnostic, MessageLoadingDiagnostic, VisibilityTabDiagnostic, ApiConnectivityDiagnostic, DatabaseQueriesDiagnostic, ModuleDiagnosticResult } from './diagnostic-result-types';
interface DiagnosticResults extends ComprehensiveDiagnosticResults {
    timestamp: string;
    urlNormalization: UrlNormalizationDiagnostic;
    messageLoading: MessageLoadingDiagnostic;
    visibilityTab: VisibilityTabDiagnostic;
    apiConnectivity: ApiConnectivityDiagnostic;
    databaseQueries: DatabaseQueriesDiagnostic;
    errors: Array<{
        type: string;
        message?: string;
        error?: string;
        stack?: string;
    }>;
    moduleDiagnostics: Record<string, ModuleDiagnosticResult>;
}
declare class ComprehensiveDiagnostic {
    private results;
    constructor();
    runFullDiagnostic(): Promise<DiagnosticResults>;
    diagnoseUrlNormalization(): Promise<void>;
    diagnoseMessageLoading(): Promise<void>;
    diagnoseVisibilityTab(): Promise<void>;
    diagnoseApiConnectivity(): Promise<void>;
    diagnoseDatabaseQueries(): Promise<void>;
    runModuleDiagnostics(): Promise<void>;
    generateReport(): DiagnosticResults;
}
export { ComprehensiveDiagnostic };
//# sourceMappingURL=ComprehensiveDiagnostic.d.ts.map