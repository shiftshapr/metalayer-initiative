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
const errorPatterns = {
    'TS7053': { category: 'implicit-any', severity: 'critical', fixPattern: 'Add explicit type annotation or type guard' },
    'TS7006': { category: 'implicit-any', severity: 'critical', fixPattern: 'Add explicit parameter type' },
    'TS2339': { category: 'property-access', severity: 'critical', fixPattern: 'Cast to HTMLElement or add type guard' },
    'TS2345': { category: 'type-mismatch', severity: 'critical', fixPattern: 'Fix argument type or add type assertion' },
    'TS18047': { category: 'undefined-check', severity: 'critical', fixPattern: 'Add null/undefined check' },
    'TS18048': { category: 'undefined-check', severity: 'critical', fixPattern: 'Add null/undefined check' },
    'TS2322': { category: 'type-mismatch', severity: 'critical', fixPattern: 'Fix type assignment' },
    'TS2349': { category: 'callable', severity: 'critical', fixPattern: 'Add type guard for function call' },
    'TS6133': { category: 'unused', severity: 'warning', fixPattern: 'Prefix with _ or remove' },
    'TS2571': { category: 'type-mismatch', severity: 'critical', fixPattern: 'Add type assertion or type guard' },
    'TS7034': { category: 'implicit-any', severity: 'critical', fixPattern: 'Add explicit type annotation' },
    'TS7005': { category: 'implicit-any', severity: 'critical', fixPattern: 'Add explicit type annotation' },
    'TS2554': { category: 'type-mismatch', severity: 'critical', fixPattern: 'Fix function call arguments' },
    'TS2353': { category: 'type-mismatch', severity: 'critical', fixPattern: 'Fix object literal type' },
};
export function analyzeMessagesModuleErrors(errorOutput) {
    const lines = errorOutput.split('\n').filter(line => line.includes('MessagesModule.ts'));
    const errors = [];
    for (const line of lines) {
        const match = line.match(/MessagesModule\.ts\((\d+),(\d+)\): error (TS\d+): (.+)/);
        if (match) {
            const [, lineNum, , code, message] = match;
            const pattern = errorPatterns[code] || { category: 'other', severity: 'warning', fixPattern: 'Review and fix' };
            errors.push({
                line: parseInt(lineNum, 10),
                code,
                message,
                category: pattern.category,
                severity: pattern.severity,
                fixPattern: pattern.fixPattern
            });
        }
    }
    return errors;
}
export function generateFixReport(errors) {
    const byCategory = errors.reduce((acc, err) => {
        if (!acc[err.category])
            acc[err.category] = [];
        acc[err.category].push(err);
        return acc;
    }, {});
    let report = `# MessagesModule.ts Type Error Analysis\n\n`;
    report += `Total Errors: ${errors.length}\n`;
    report += `Critical: ${errors.filter(e => e.severity === 'critical').length}\n`;
    report += `Warnings: ${errors.filter(e => e.severity === 'warning').length}\n\n`;
    report += `## Error Distribution by Category\n\n`;
    for (const [category, categoryErrors] of Object.entries(byCategory)) {
        report += `### ${category} (${categoryErrors.length})\n`;
        report += `- Critical: ${categoryErrors.filter(e => e.severity === 'critical').length}\n`;
        report += `- Warnings: ${categoryErrors.filter(e => e.severity === 'warning').length}\n\n`;
    }
    report += `## Fix Priority\n\n`;
    const critical = errors.filter(e => e.severity === 'critical').sort((a, b) => a.line - b.line);
    report += `### Critical Errors (Fix First)\n\n`;
    for (const err of critical.slice(0, 20)) {
        report += `- Line ${err.line}: ${err.code} - ${err.message}\n`;
        report += `  Fix: ${err.fixPattern}\n\n`;
    }
    return report;
}
// For direct execution
if (require.main === module) {
    const fs = require('fs');
    const errorOutput = fs.readFileSync(0, 'utf-8');
    const errors = analyzeMessagesModuleErrors(errorOutput);
    const report = generateFixReport(errors);
    console.log(report);
}
//# sourceMappingURL=diagnose-messages-module-types.js.map