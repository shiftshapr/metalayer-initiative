/**
 * Diagnostic Script: MessagesModule.ts Type Errors
 *
 * Analyzes and categorizes TypeScript errors in MessagesModule.ts
 * Run: npx tsc --noEmit 2>&1 | grep "MessagesModule.ts" | node diagnose-messages-module-types.ts
 *
 * Error Categories:
 * - TS7053: Implicit any index access
 * - TS7006: Parameter implicitly any
 * - TS2339: Property does not exist
 * - TS2345: Argument type mismatch
 * - TS18047/TS18048: Possibly undefined/null
 * - TS2322: Type assignment errors
 * - TS2349: Expression not callable
 * - TS6133: Unused variables
 */
interface ErrorAnalysis {
    line: number;
    code: string;
    message: string;
    category: 'implicit-any' | 'property-access' | 'type-mismatch' | 'undefined-check' | 'callable' | 'unused' | 'other';
    severity: 'critical' | 'warning';
    fixPattern: string;
}
export declare function analyzeMessagesModuleErrors(errorOutput: string): ErrorAnalysis[];
export declare function generateFixReport(errors: ErrorAnalysis[]): string;
export {};
//# sourceMappingURL=diagnose-messages-module-types.d.ts.map