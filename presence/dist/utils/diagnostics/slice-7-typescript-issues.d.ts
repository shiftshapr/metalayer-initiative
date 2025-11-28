/**
 * DIAGNOSTIC SCRIPT: Slice 7 TypeScript Best Practices Issues
 * Identifies all TypeScript violations in Utils module
 *
 * Run: npx tsx presence/src/utils/diagnostics/slice-7-typescript-issues.ts
 */
interface Issue {
    file: string;
    line: number;
    type: 'any' | 'as-any' | 'ts-ignore' | 'ts-expect-error' | 'this-as-any';
    code: string;
    context: string;
}
declare const issues: Issue[];
declare const byType: Record<string, number>;
declare const byFile: Record<string, Issue[]>;
export { issues, byFile, byType };
//# sourceMappingURL=slice-7-typescript-issues.d.ts.map