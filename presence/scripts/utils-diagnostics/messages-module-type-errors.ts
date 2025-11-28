/**
 * Diagnostic Script: MessagesModule.ts TypeScript Error Analysis
 * 
 * This script categorizes and analyzes TypeScript errors in MessagesModule.ts
 * Run: npx tsc --noEmit 2>&1 | node -e "require('./messages-module-type-errors.ts')"
 * 
 * Or use: npx tsc --noEmit 2>&1 | grep MessagesModule.ts
 */

import { execSync } from 'child_process';
import { join } from 'path';
import * as fs from 'fs';

interface ErrorInfo {
    line: number;
    column: number;
    code: string;
    message: string;
    category: 'type-safety' | 'unused' | 'other';
}

const ERROR_CATEGORIES = {
    'type-safety': [
        'TS2322', // Type assignment errors
        'TS2532', // Object possibly undefined
        'TS2345', // Argument type mismatch
        'TS18048', // Possibly undefined access
        'TS18047', // Possibly null
        'TS7053', // Implicit any index access
        'TS7006', // Parameter implicitly any
        'TS2339', // Property does not exist
        'TS2349', // Expression not callable
        'TS2554', // Argument count mismatch
        'TS2571', // Object is of type unknown
        'TS7034', // Variable implicitly any
        'TS7005', // Variable implicitly any
        'TS2353', // Object literal unknown properties
    ],
    'unused': [
        'TS6133', // Unused variables/parameters
    ],
    'other': []
};

function categorizeError(code: string): 'type-safety' | 'unused' | 'other' {
    for (const [category, codes] of Object.entries(ERROR_CATEGORIES)) {
        if ((codes as readonly string[]).includes(code)) {
            return category as 'type-safety' | 'unused' | 'other';
        }
    }
    return 'other';
}

function analyzeMessagesModuleErrors(): void {
    try {
        const tscOutput = execSync('npx tsc --noEmit 2>&1', { 
            encoding: 'utf-8',
            cwd: join(__dirname, '../..')
        });
        
        const errors: ErrorInfo[] = [];
        const lines = tscOutput.split('\n');
        
        for (const line of lines) {
            const match = line.match(/MessagesModule\.ts\((\d+),(\d+)\): error (TS\d+): (.+)/);
            if (match) {
                const lineNum = match[1];
                const colNum = match[2];
                const code = match[3];
                const message = match[4];
                if (lineNum && colNum && code && message) {
                    errors.push({
                        line: parseInt(lineNum, 10),
                        column: parseInt(colNum, 10),
                        code,
                        message,
                        category: categorizeError(code)
                    });
                }
            }
        }
        
        // Categorize errors
        const typeSafetyErrors = errors.filter(e => e.category === 'type-safety');
        const unusedErrors = errors.filter(e => e.category === 'unused');
        const otherErrors = errors.filter(e => e.category === 'other');
        
        console.log('=== MessagesModule.ts TypeScript Error Analysis ===\n');
        console.log(`Total Errors: ${errors.length}`);
        console.log(`Type Safety Errors: ${typeSafetyErrors.length}`);
        console.log(`Unused Variable Errors: ${unusedErrors.length}`);
        console.log(`Other Errors: ${otherErrors.length}\n`);
        
        // Group by error code
        const byCode: Record<string, ErrorInfo[]> = {};
        for (const error of errors) {
            if (!byCode[error.code]) {
                byCode[error.code] = [];
            }
            const codeErrors = byCode[error.code];
            if (codeErrors) {
                codeErrors.push(error);
            }
        }
        
        console.log('=== Error Code Distribution ===');
        for (const [code, codeErrors] of Object.entries(byCode).sort((a, b) => b[1].length - a[1].length)) {
            console.log(`${code}: ${codeErrors.length} occurrences`);
        }
        
        console.log('\n=== Type Safety Errors (Critical) ===');
        for (const error of typeSafetyErrors.slice(0, 20)) {
            console.log(`Line ${error.line}:${error.column} [${error.code}] ${error.message}`);
        }
        if (typeSafetyErrors.length > 20) {
            console.log(`... and ${typeSafetyErrors.length - 20} more`);
        }
        
        console.log('\n=== Unused Variable Errors (Cleanup) ===');
        for (const error of unusedErrors.slice(0, 10)) {
            console.log(`Line ${error.line}:${error.column} [${error.code}] ${error.message}`);
        }
        if (unusedErrors.length > 10) {
            console.log(`... and ${unusedErrors.length - 10} more`);
        }
        
        // Write detailed report
        const reportPath = join(__dirname, '../../../../docs/diagnostics/messages-module-errors.json');
        const report = {
            timestamp: new Date().toISOString(),
            totalErrors: errors.length,
            typeSafetyErrors: typeSafetyErrors.length,
            unusedErrors: unusedErrors.length,
            otherErrors: otherErrors.length,
            errorsByCode: Object.fromEntries(
                Object.entries(byCode).map(([code, errs]) => [code, errs.length])
            ),
            errors: errors.map(e => ({
                line: e.line,
                column: e.column,
                code: e.code,
                message: e.message,
                category: e.category
            }))
        };
        
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n✅ Detailed report written to: ${reportPath}`);
        
    } catch (error: any) {
        console.error('Error running diagnostic:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    analyzeMessagesModuleErrors();
}

export { analyzeMessagesModuleErrors, categorizeError, ERROR_CATEGORIES };

