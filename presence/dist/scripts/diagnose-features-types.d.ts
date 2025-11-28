#!/usr/bin/env ts-node
/**
 * Diagnostic script for Slice 11: Features Type Errors
 * Identifies root causes of type errors in feature modules
 *
 * Usage:
 *   npx tsx presence/src/scripts/diagnose-features-types.ts [files...]
 *   npx tsx presence/src/scripts/diagnose-features-types.ts --help
 */
interface TypeScriptError {
    line: number;
    code: string;
    message: string;
    crossFile?: boolean;
}
interface ErrorReport {
    file: string;
    errors: TypeScriptError[];
}
declare function diagnoseTypeErrors(): ErrorReport[];
export { diagnoseTypeErrors };
//# sourceMappingURL=diagnose-features-types.d.ts.map