/**
 * Diagnostic Script: Legacy References Audit
 *
 * Purpose: Catalog all mentions of "legacy" in source code and identify:
 * - Legacy function/interface names
 * - Legacy fallback patterns
 * - Legacy comments/documentation
 * - Usage patterns and dependencies
 *
 * This script runs before legacy removal to ensure safe refactoring.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
const SOURCE_DIRS = [
    '/home/ubuntu/metalayer-initiative/presence/src',
    '/home/ubuntu/src'
];
const EXCLUDE_PATTERNS = [
    /node_modules/,
    /dist\//,
    /extension\//,
    /build\//,
    /\.d\.ts$/
];
const LEGACY_PATTERNS = [
    /legacy/i,
    /Legacy/i,
    /LEGACY/i
];
function shouldProcessFile(filePath) {
    const ext = extname(filePath);
    const validExtensions = ['.ts', '.tsx', '.js', '.jsx'];
    if (!validExtensions.includes(ext)) {
        return false;
    }
    for (const pattern of EXCLUDE_PATTERNS) {
        if (pattern.test(filePath)) {
            return false;
        }
    }
    return true;
}
function findLegacyReferences(filePath) {
    const references = [];
    try {
        const content = readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        lines.forEach((line, index) => {
            for (const pattern of LEGACY_PATTERNS) {
                if (pattern.test(line)) {
                    const lineNum = index + 1;
                    let type = 'other';
                    // Classify the type of legacy reference
                    if (/function\s+\w*[Ll]egacy|export\s+(async\s+)?function\s+\w*[Ll]egacy/.test(line)) {
                        type = 'function';
                    }
                    else if (/interface\s+\w*[Ll]egacy|type\s+\w*[Ll]egacy/.test(line)) {
                        type = 'interface';
                    }
                    else if (/const\s+\w*[Ll]egacy|let\s+\w*[Ll]egacy|var\s+\w*[Ll]egacy/.test(line)) {
                        type = 'variable';
                    }
                    else if (/\/\/.*[Ll]egacy|\/\*.*[Ll]egacy/.test(line)) {
                        type = 'comment';
                    }
                    else if (/\|\|.*[Ll]egacy|fallback.*[Ll]egacy|compat.*[Ll]egacy/.test(line)) {
                        type = 'fallback';
                    }
                    // Get context (3 lines before and after)
                    const contextStart = Math.max(0, index - 3);
                    const contextEnd = Math.min(lines.length, index + 4);
                    const context = lines.slice(contextStart, contextEnd).join('\n');
                    references.push({
                        file: filePath,
                        line: lineNum,
                        content: line.trim(),
                        type,
                        context
                    });
                }
            }
        });
    }
    catch (error) {
        console.error(`Error reading ${filePath}:`, error);
    }
    return references;
}
function walkDirectory(dir, results = []) {
    try {
        const entries = readdirSync(dir);
        for (const entry of entries) {
            const fullPath = join(dir, entry);
            try {
                const stat = statSync(fullPath);
                if (stat.isDirectory()) {
                    walkDirectory(fullPath, results);
                }
                else if (stat.isFile() && shouldProcessFile(fullPath)) {
                    const refs = findLegacyReferences(fullPath);
                    results.push(...refs);
                }
            }
            catch (error) {
                // Skip files we can't access
                continue;
            }
        }
    }
    catch (error) {
        console.error(`Error reading directory ${dir}:`, error);
    }
    return results;
}
function generateReport(references) {
    console.log('\n=== LEGACY REFERENCES DIAGNOSTIC REPORT ===\n');
    console.log(`Total references found: ${references.length}\n`);
    // Group by type
    const byType = {};
    references.forEach(ref => {
        if (!byType[ref.type]) {
            byType[ref.type] = [];
        }
        byType[ref.type].push(ref);
    });
    console.log('Breakdown by type:');
    Object.entries(byType).forEach(([type, refs]) => {
        console.log(`  ${type}: ${refs.length}`);
    });
    // Group by file
    const byFile = {};
    references.forEach(ref => {
        if (!byFile[ref.file]) {
            byFile[ref.file] = [];
        }
        byFile[ref.file].push(ref);
    });
    console.log(`\nFiles with legacy references: ${Object.keys(byFile).length}\n`);
    // Detailed report
    console.log('\n=== DETAILED FINDINGS ===\n');
    Object.entries(byFile).forEach(([file, refs]) => {
        console.log(`\n${file}:`);
        refs.forEach(ref => {
            console.log(`  Line ${ref.line} [${ref.type}]: ${ref.content.substring(0, 80)}`);
        });
    });
    // Recommendations
    console.log('\n=== RECOMMENDATIONS ===\n');
    console.log('1. Remove legacy function exports and replace with direct calls');
    console.log('2. Remove legacy interface types and update references');
    console.log('3. Remove legacy fallback patterns (per RED-LINE policy)');
    console.log('4. Remove legacy comments');
    console.log('5. Update legacyContext type definition in global.d.ts');
    console.log('6. Replace sendLegacyMessage/reloadLegacyChatHistory with direct window calls');
}
// Main execution
function main() {
    console.log('Scanning source directories for legacy references...\n');
    const allReferences = [];
    for (const dir of SOURCE_DIRS) {
        try {
            const refs = walkDirectory(dir);
            allReferences.push(...refs);
        }
        catch (error) {
            console.error(`Error scanning ${dir}:`, error);
        }
    }
    generateReport(allReferences);
    // Return exit code based on findings
    process.exit(allReferences.length > 0 ? 1 : 0);
}
// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
export { findLegacyReferences, walkDirectory, generateReport };
