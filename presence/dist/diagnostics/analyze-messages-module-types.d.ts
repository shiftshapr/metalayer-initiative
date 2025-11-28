/**
 * Diagnostic Script: Analyze Messages Module Type Issues
 *
 * Identifies all `any` types, `as any` assertions, and type safety issues
 * in the Messages module files (Slice 2).
 */
interface TypeIssue {
    file: string;
    line: number;
    type: 'any-return' | 'any-param' | 'as-any' | 'window-as-any' | 'any-type';
    code: string;
    context: string;
}
declare function analyzeFile(filePath: string): TypeIssue[];
declare function main(): TypeIssue[];
export { analyzeFile, main };
//# sourceMappingURL=analyze-messages-module-types.d.ts.map