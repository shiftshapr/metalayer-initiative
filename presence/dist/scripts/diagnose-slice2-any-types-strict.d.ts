/**
 * Diagnostic Script: Slice 2 - Any Type Annotations (Strict Mode)
 *
 * Scans prioritized files for `any` type annotations.
 * Exits with non-zero code if any are found (for CI/CD enforcement).
 *
 * Usage in CI/CD:
 *   npx tsx src/scripts/diagnose-slice2-any-types-strict.ts
 *
 * This will fail the build if any `: any` annotations are found.
 */
interface AnyTypeMatch {
    file: string;
    line: number;
    column: number;
    context: string;
}
interface DiagnosticSummary {
    file: string;
    count: number;
}
declare const matches: AnyTypeMatch[];
export { matches, AnyTypeMatch, DiagnosticSummary };
//# sourceMappingURL=diagnose-slice2-any-types-strict.d.ts.map