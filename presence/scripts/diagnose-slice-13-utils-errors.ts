/**
 * Diagnostic Script: Slice 13 - Utils and Diagnostics TypeScript Errors
 * 
 * This script analyzes TypeScript errors in utility and diagnostic files
 * for Slice 13 of the TypeScript error fixing orchestration.
 * 
 * Run: npx ts-node presence/scripts/diagnose-slice-13-utils-errors.ts
 */

import { execSync } from 'child_process';
import { join } from 'path';

interface ErrorInfo {
    file: string;
    line: number;
    column: number;
    code: string;
    message: string;
    category: 'type-safety' | 'unused' | 'other';
}

const SLICE_13_FILES = [
    'presence/src/utils/AvatarUtils.ts',
    'presence/src/utils/ComprehensiveDiagnostic.ts',
    'presence/src/utils/DEFAULT_VS_FOCUS_MODE_DIAGNOSTIC.ts',
    'presence/src/utils/DIAGNOSTIC_HEADLINE_DISPLAYNAME.ts',
    'presence/src/utils/FOCUS_MODE_REPLY_DIAGNOSTIC.ts',
    'presence/src/utils/Logger.ts',
    'presence/src/utils/provenance/ProvenanceDiagnostic.ts',
    'presence/src/utils/provenance/ProvenanceLinkInjector.ts',
    'presence/src/utils/provenance/ProvenanceService.ts',
    'presence/src/utils/provenance/verify.ts',
    'presence/src/utils/ThemeChangeTracker.ts',
    'presence/src/utils/UnifiedMessageRenderer.ts',
    'presence/src/utils/UserPreferencesManager.ts',
    'presence/src/utils/XPatternSystem.ts',
    'presence/src/visibility/diagnostics/check-types-duplicates.ts',
];

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
} as const;

function categorizeError(code: string): 'type-safety' | 'unused' | 'other' {
    for (const [category, codes] of Object.entries(ERROR_CATEGORIES)) {
        if ((codes as readonly string[]).includes(code)) {
            return category as 'type-safety' | 'unused' | 'other';
        }
    }
    return 'other';
}

function analyzeSlice13Errors(): void {
    try {
        const tscOutput = execSync('npx tsc --noEmit 2>&1', { 
            encoding: 'utf-8',
            cwd: join(__dirname, '../..')
        });
        
        const errors: ErrorInfo[] = [];
        const lines = tscOutput.split('\n');
        
        for (const line of lines) {
            for (const file of SLICE_13_FILES) {
                const filePattern = file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const match = line.match(new RegExp(`${filePattern}\\((\\d+),(\\d+)\\): error (TS\\d+): (.+)`));
                if (match) {
                    const lineNum = match[1];
                    const colNum = match[2];
                    const code = match[3];
                    const message = match[4];
                    if (lineNum && colNum && code && message) {
                        errors.push({
                            file,
                            line: parseInt(lineNum, 10),
                            column: parseInt(colNum, 10),
                            code,
                            message,
                            category: categorizeError(code)
                        });
                    }
                }
            }
        }
        
        // Categorize errors
        const typeSafetyErrors = errors.filter(e => e.category === 'type-safety');
        const unusedErrors = errors.filter(e => e.category === 'unused');
        const otherErrors = errors.filter(e => e.category === 'other');
        
        console.log('=== Slice 13: Utils and Diagnostics TypeScript Error Analysis ===\n');
        console.log(`Total Errors: ${errors.length}`);
        console.log(`Type Safety Errors: ${typeSafetyErrors.length}`);
        console.log(`Unused Variable Errors: ${unusedErrors.length}`);
        console.log(`Other Errors: ${otherErrors.length}\n`);
        
        if (errors.length === 0) {
            console.log('✅ No TypeScript errors found in Slice 13 files!');
            return;
        }
        
        // Group by file
        const byFile: Record<string, ErrorInfo[]> = {};
        for (const error of errors) {
            if (!byFile[error.file]) {
                byFile[error.file] = [];
            }
            const fileErrors = byFile[error.file];
            if (fileErrors) {
                fileErrors.push(error);
            }
        }
        
        console.log('=== Errors by File ===');
        for (const [file, fileErrors] of Object.entries(byFile).sort((a, b) => (b[1]?.length || 0) - (a[1]?.length || 0))) {
            if (fileErrors) {
                console.log(`\n${file}: ${fileErrors.length} errors`);
                for (const error of fileErrors.slice(0, 5)) {
                    console.log(`  Line ${error.line}:${error.column} [${error.code}] ${error.message}`);
                }
                if (fileErrors.length > 5) {
                    console.log(`  ... and ${fileErrors.length - 5} more`);
                }
            }
        }
        
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
        
        console.log('\n=== Error Code Distribution ===');
        for (const [code, codeErrors] of Object.entries(byCode).sort((a, b) => (b[1]?.length || 0) - (a[1]?.length || 0))) {
            if (codeErrors) {
                console.log(`${code}: ${codeErrors.length} occurrences`);
            }
        }
        
        console.log('\n=== Type Safety Errors (Critical) ===');
        for (const error of typeSafetyErrors.slice(0, 20)) {
            console.log(`${error.file}:${error.line}:${error.column} [${error.code}] ${error.message}`);
        }
        if (typeSafetyErrors.length > 20) {
            console.log(`... and ${typeSafetyErrors.length - 20} more`);
        }
        
        console.log('\n=== Unused Variable Errors (Cleanup) ===');
        for (const error of unusedErrors.slice(0, 10)) {
            console.log(`${error.file}:${error.line}:${error.column} [${error.code}] ${error.message}`);
        }
        if (unusedErrors.length > 10) {
            console.log(`... and ${unusedErrors.length - 10} more`);
        }
        
    } catch (error: unknown) {
        const err = error as { message?: string };
        if (err && err.message) {
            console.error('Error running diagnostic:', err.message);
        } else {
            console.error('Error running diagnostic:', String(error));
        }
        process.exit(1);
    }
}

if (require.main === module) {
    analyzeSlice13Errors();
}

export { analyzeSlice13Errors, categorizeError, ERROR_CATEGORIES, SLICE_13_FILES };

