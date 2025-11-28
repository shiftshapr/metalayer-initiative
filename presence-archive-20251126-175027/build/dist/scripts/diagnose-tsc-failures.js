/**
 * diagnose-tsc-failures.ts
 * Runs `npx tsc --noEmit --pretty false` and summarizes failures by file.
 *
 * Usage:
 *   cd /home/ubuntu/metalayer-initiative
 *   npx tsx presence/src/scripts/diagnose-tsc-failures.ts
 */
import { spawnSync } from 'node:child_process';
function runTypeCheck() {
    const result = spawnSync('npx', ['tsc', '--noEmit', '--pretty', 'false'], {
        cwd: process.cwd(),
        encoding: 'utf-8'
    });
    if (result.error) {
        throw result.error;
    }
    if (result.status === 0) {
        console.log('✅ TypeScript check passed with no errors.');
        return '';
    }
    return result.stdout || result.stderr;
}
const errorRegex = /^(?<file>.+\.ts)\((?<line>\d+),(?<column>\d+)\): error (?<code>TS\d+): (?<message>.+)$/;
function parseErrors(output) {
    const summaries = new Map();
    output
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .forEach(line => {
        const match = line.match(errorRegex);
        if (!match || !match.groups)
            return;
        const { file, line: lineNum, column, code, message } = match.groups;
        if (!file || !lineNum || !column || !code || !message)
            return;
        const summary = summaries.get(file) ??
            {
                file,
                errors: []
            };
        summary.errors.push({
            line: Number(lineNum),
            column: Number(column),
            code,
            message,
            raw: line
        });
        summaries.set(file, summary);
    });
    return Array.from(summaries.values()).sort((a, b) => b.errors.length - a.errors.length);
}
function printSummary(summaries) {
    if (summaries.length === 0) {
        console.log('No TypeScript errors detected.');
        return;
    }
    console.log('❌ TypeScript errors detected:');
    for (const summary of summaries) {
        console.log(`\n📄 ${summary.file} (${summary.errors.length} issues)`);
        summary.errors.slice(0, 5).forEach(error => {
            console.log(`  - ${error.raw}`);
        });
        if (summary.errors.length > 5) {
            console.log(`  … ${summary.errors.length - 5} more in this file`);
        }
    }
    console.log('\nTotal files with errors:', summaries.length);
}
try {
    const output = runTypeCheck();
    const summaries = parseErrors(output);
    printSummary(summaries);
    if (summaries.length > 0) {
        process.exitCode = 1;
    }
}
catch (error) {
    console.error('Failed to run TypeScript diagnostic:', error);
    process.exitCode = 2;
}
//# sourceMappingURL=diagnose-tsc-failures.js.map