/**
 * Diagnostic Script: Slice 5 TypeScript Best Practices Issues
 * Identifies all any types, window as any casts, and type suppressions in Slice 5 files
 *
 * Generated: 2025-01-24
 * Slice: 5 (Tab Manager & Other Features)
 */
interface Issue {
    file: string;
    line: number;
    type: 'any-type' | 'window-as-any' | 'ts-ignore' | 'ts-expect-error' | 'any-parameter' | 'any-return';
    code: string;
    context: string;
}
declare function scanFile(filePath: string): Issue[];
export { scanFile, Issue };
//# sourceMappingURL=diagnose-slice5-typescript-issues.d.ts.map