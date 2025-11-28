import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const filesToScan = [
    'src/utils/UserPreferencesManager.ts',
    'src/utils/ThemeChangeTracker.ts',
    'src/utils/UnifiedStorageSync.ts'
];
const patterns = [
    { type: 'any-type-annotation', regex: /:\s*any\b/ },
    { type: 'as-any-assertion', regex: /\bas\s+any\b/ },
    { type: 'window-as-any', regex: /\(window\s+as\s+any\)/ },
    { type: 'this-as-any', regex: /\(this\s+as\s+any\)/ }
];
const projectRoot = resolve(__dirname, '../../..');
function scanFile(relativePath) {
    const absolutePath = resolve(projectRoot, relativePath);
    const content = readFileSync(absolutePath, 'utf8');
    const lines = content.split('\n');
    const violations = [];
    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('*/')) {
            return;
        }
        for (const pattern of patterns) {
            if (pattern.regex.test(line)) {
                violations.push({
                    file: relativePath,
                    line: index + 1,
                    type: pattern.type,
                    snippet: trimmed
                });
            }
        }
    });
    return violations;
}
function main() {
    const violations = filesToScan.flatMap(scanFile);
    if (violations.length === 0) {
        console.log('✅ userPreferencesAnyScan: No forbidden any-type patterns found.');
        return;
    }
    console.error('❌ userPreferencesAnyScan: Forbidden patterns detected:');
    violations.forEach((violation) => {
        console.error(` - [${violation.type}] ${violation.file}:${violation.line} :: ${violation.snippet}`);
    });
    process.exitCode = 1;
}
main();
