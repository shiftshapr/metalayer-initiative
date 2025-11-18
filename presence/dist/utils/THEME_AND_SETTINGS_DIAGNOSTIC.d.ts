/**
 * THEME AND SETTINGS DIAGNOSTIC
 * Comprehensive diagnostic to verify theme toggle and settings functionality
 */
interface DiagnosticResult {
    status: 'pending' | 'PASSED' | 'FAILED';
    details: string[];
}
interface DiagnosticResults {
    profileMenuThemeToggle: DiagnosticResult;
    settingsTabThemeToggle: DiagnosticResult;
    visibilityToggle: DiagnosticResult;
    repliesInFocusMode: DiagnosticResult;
    headlineLoading: DiagnosticResult;
    displayNameLoading: DiagnosticResult;
}
/**
 * Run all diagnostics
 */
export declare function runThemeAndSettingsDiagnostic(): Promise<DiagnosticResults>;
export {};
//# sourceMappingURL=THEME_AND_SETTINGS_DIAGNOSTIC.d.ts.map