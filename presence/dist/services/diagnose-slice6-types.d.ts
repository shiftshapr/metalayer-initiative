/**
 * Diagnostic Script for Slice 6: Services Module TypeScript Issues
 *
 * Identifies:
 * - @ts-ignore and @ts-expect-error suppressions
 * - `as any` type assertions
 * - `window as any` casts
 * - Missing type definitions for Supabase query builders
 */
interface Issue {
    file: string;
    line: number;
    type: 'suppression' | 'any-assertion' | 'window-any' | 'unknown-assertion';
    code: string;
    context: string;
}
declare const issues: Issue[];
declare const byType: {
    suppression: Issue[];
    'any-assertion': Issue[];
    'window-any': Issue[];
    'unknown-assertion': Issue[];
};
declare const byFile: Record<string, Issue[]>;
export { issues, byType, byFile };
//# sourceMappingURL=diagnose-slice6-types.d.ts.map