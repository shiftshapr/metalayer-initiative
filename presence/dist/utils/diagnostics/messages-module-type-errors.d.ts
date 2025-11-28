/**
 * Diagnostic Script: MessagesModule.ts TypeScript Error Analysis
 *
 * This script categorizes and analyzes TypeScript errors in MessagesModule.ts
 * Run: npx tsc --noEmit 2>&1 | node -e "require('./messages-module-type-errors.ts')"
 *
 * Or use: npx tsc --noEmit 2>&1 | grep MessagesModule.ts
 */
declare const ERROR_CATEGORIES: {
    'type-safety': string[];
    unused: string[];
    other: never[];
};
declare function categorizeError(code: string): 'type-safety' | 'unused' | 'other';
declare function analyzeMessagesModuleErrors(): void;
export { analyzeMessagesModuleErrors, categorizeError, ERROR_CATEGORIES };
//# sourceMappingURL=messages-module-type-errors.d.ts.map