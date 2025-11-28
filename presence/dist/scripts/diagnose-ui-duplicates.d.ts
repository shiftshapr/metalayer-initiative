/**
 * Diagnostic Script: UI Duplicate Files Detection
 *
 * Purpose: Verify duplicate .js files in presence/src/ui/ and check for imports
 *
 * Files to check:
 * - presence/src/ui/diagnostics.js (should be deleted)
 * - presence/src/ui/autoResize.js (should be deleted)
 * - presence/src/ui/tabNavigation.js (should be deleted)
 *
 * Corresponding .ts files should exist and be complete.
 */
interface DiagnosticResult {
    file: string;
    jsExists: boolean;
    tsExists: boolean;
    jsShouldBeDeleted: boolean;
    importsFound: string[];
}
declare const results: DiagnosticResult[];
declare const duplicatesFound: number;
declare const missingTS: number;
export { results, duplicatesFound, missingTS };
//# sourceMappingURL=diagnose-ui-duplicates.d.ts.map