/**
 * Diagnostic Script for Slice 2/4: Console Logging Migration
 *
 * Analyzes console.* usage across the codebase to track migration progress:
 * 1. Counts console.log, console.warn, console.error statements
 * 2. Identifies files that need migration
 * 3. Excludes diagnostic scripts and Logger.ts itself
 * 4. Reports by file and by type
 *
 * This diagnostic runs before and after implementation to measure improvements.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
const results = [];
const srcDir = join(__dirname, '..');
const excludedDirs = ['node_modules', 'dist', 'build', 'extension', '.git', 'diagnostics'];
const excludedFiles = ['.test.ts', '.spec.ts', '.d.ts'];
const excludedPatterns = [
    /diagnose-.*\.ts$/,
    /DIAGNOSTIC.*\.ts$/,
    /MESSAGE_LOADING_DIAGNOSTIC\.ts$/,
    /DEFAULT_VS_FOCUS_MODE_DIAGNOSTIC\.ts$/,
    /DIAGNOSTIC_HEADLINE_DISPLAYNAME\.ts$/,
    /ROOT_CAUSE_DIAGNOSTIC_FRAMEWORK\.ts$/,
    /MESSAGE_FETCH_DIAGNOSTIC\.ts$/,
    /DIAGNOSTIC_THEME_SAVING\.ts$/,
    /DIAGNOSTIC_LOADING_AND_REPLIES\.ts$/,
    /FOCUS_MODE_REPLY_DIAGNOSTIC\.ts$/,
    /REPLY_DISPLAY_DIAGNOSTIC\.ts$/,
    /Logger\.ts$/,
    /migrate-.*\.ts$/,
    /security-audit.*\.ts$/,
];
/**
 * Check if file should be analyzed
 */
function shouldAnalyzeFile(filePath) {
    const relativePath = relative(srcDir, filePath);
    // Exclude diagnostic files (in scripts/ or utils/)
    if (excludedPatterns.some(pattern => pattern.test(filePath))) {
        return false;
    }
    // Exclude test files
    if (excludedFiles.some(ext => filePath.endsWith(ext))) {
        return false;
    }
    // Exclude excluded directories
    if (excludedDirs.some(dir => relativePath.includes(dir))) {
        return false;
    }
    // Exclude README files
    if (filePath.endsWith('.md')) {
        return false;
    }
    return filePath.endsWith('.ts') || filePath.endsWith('.tsx');
}
/**
 * Recursively get all TypeScript/JavaScript files
 */
function getAllFiles(dir, fileList = []) {
    const files = readdirSync(dir);
    files.forEach(file => {
        const filePath = join(dir, file);
        const stat = statSync(filePath);
        if (stat.isDirectory()) {
            const dirName = file;
            if (!excludedDirs.includes(dirName)) {
                getAllFiles(filePath, fileList);
            }
        }
        else if (shouldAnalyzeFile(filePath)) {
            fileList.push(filePath);
        }
    });
    return fileList;
}
/**
 * Analyze a single file for console usage
 */
function analyzeFile(filePath) {
    try {
        const content = readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        const relativePath = relative(srcDir, filePath);
        lines.forEach((line, index) => {
            // Match console.log, console.warn, console.error, console.info, console.debug
            const consoleMatch = line.match(/console\.(log|warn|error|info|debug|trace|group|groupEnd|time|timeEnd|assert|table|dir|dirxml|clear|count|countReset|profile|profileEnd|timeStamp|context|memory)\s*\(/);
            if (consoleMatch) {
                const type = consoleMatch[1];
                results.push({
                    file: relativePath,
                    line: index + 1,
                    type: ['log', 'warn', 'error', 'info', 'debug'].includes(type) ? type : 'other',
                    statement: line.trim().substring(0, 100), // First 100 chars
                });
            }
        });
    }
    catch (error) {
        console.error(`Error analyzing ${filePath}:`, error);
    }
}
/**
 * Generate diagnostic report
 */
function generateReport() {
    const byType = {};
    const byFile = {};
    const excludedFiles = [];
    results.forEach(usage => {
        // Count by type
        byType[usage.type] = (byType[usage.type] || 0) + 1;
        // Group by file
        if (!byFile[usage.file]) {
            byFile[usage.file] = {
                file: usage.file,
                total: 0,
                byType: {},
                usages: [],
            };
        }
        byFile[usage.file].total++;
        byFile[usage.file].byType[usage.type] = (byFile[usage.file].byType[usage.type] || 0) + 1;
        byFile[usage.file].usages.push(usage);
    });
    return {
        totalStatements: results.length,
        filesWithConsole: Object.keys(byFile).length,
        byType,
        byFile: Object.values(byFile).sort((a, b) => b.total - a.total),
        excludedFiles,
    };
}
/**
 * Main diagnostic execution
 */
function main() {
    console.log('🔍 Starting console.log migration diagnostic...\n');
    const files = getAllFiles(srcDir);
    console.log(`📁 Analyzing ${files.length} files...\n`);
    files.forEach(file => {
        analyzeFile(file);
    });
    const report = generateReport();
    console.log('='.repeat(80));
    console.log('CONSOLE LOGGING MIGRATION DIAGNOSTIC REPORT');
    console.log('='.repeat(80));
    console.log(`\n📊 Summary:`);
    console.log(`   Total console.* statements: ${report.totalStatements}`);
    console.log(`   Files with console usage: ${report.filesWithConsole}`);
    console.log(`\n📈 By Type:`);
    Object.entries(report.byType)
        .sort((a, b) => b[1] - a[1])
        .forEach(([type, count]) => {
        console.log(`   console.${type}: ${count}`);
    });
    console.log(`\n📁 Top 20 Files by Console Usage:`);
    report.byFile.slice(0, 20).forEach(fileReport => {
        console.log(`\n   ${fileReport.file}: ${fileReport.total} statements`);
        Object.entries(fileReport.byType)
            .sort((a, b) => b[1] - a[1])
            .forEach(([type, count]) => {
            console.log(`      - console.${type}: ${count}`);
        });
    });
    if (report.byFile.length > 20) {
        console.log(`\n   ... and ${report.byFile.length - 20} more files`);
    }
    console.log('\n' + '='.repeat(80));
    console.log('Expected Migration Targets (from SLICE_4_PARALLEL_ORCH_SESSIONS.md):');
    console.log('='.repeat(80));
    console.log('Session 1: MessagesModule.ts (141 statements)');
    console.log('Session 2: RealtimeManager.ts (129 statements)');
    console.log('Session 3: AuthModule.ts + UserPreferencesManager.ts (157 statements)');
    console.log('Session 4: AgentModule.ts + APIModule.ts (133 statements)');
    console.log('Session 5: CommunityLoaders.ts + SupabaseService.ts + UnifiedStorageSync.ts (114 statements)');
    console.log('Session 6: APIService.ts + Components (53 statements)');
    console.log('Session 7: Core + Utils (51 statements)');
    console.log('Session 8: Features + Services (96 statements)');
    console.log('Total Expected: ~874 statements');
    console.log('='.repeat(80));
    // Exit with code 0 if no console statements found (migration complete)
    // Exit with code 1 if console statements remain (migration needed)
    process.exit(report.totalStatements === 0 ? 0 : 1);
}
main();
//# sourceMappingURL=diagnose-slice2-console-logging.js.map