/**
 * Diagnostic Script for Slice 5 TypeScript Errors
 * Checks for possibly undefined errors and type assignment issues
 */
import { readFileSync } from 'fs';
import { join } from 'path';
const results = [];
// Check NotificationManager.ts
const notificationManagerPath = join(__dirname, '../features/NotificationManager.ts');
try {
    const content = readFileSync(notificationManagerPath, 'utf-8');
    const lines = content.split('\n');
    // Check line 460 - tabs[0] possibly undefined
    if (lines[459]?.includes('tabs[0]')) {
        results.push({
            file: 'NotificationManager.ts',
            line: 460,
            error: 'tabs[0] possibly undefined',
            severity: 'critical',
            fixed: false
        });
    }
    // Check line 474 - tab possibly undefined
    if (lines[473]?.includes('const [tab]')) {
        results.push({
            file: 'NotificationManager.ts',
            line: 474,
            error: 'tab possibly undefined from destructuring',
            severity: 'critical',
            fixed: false
        });
    }
    // Check unused import
    if (lines[5]?.includes('NotificationOptions')) {
        results.push({
            file: 'NotificationManager.ts',
            line: 6,
            error: 'NotificationOptions import unused',
            severity: 'warning',
            fixed: false
        });
    }
    // Check unused parameter
    if (lines[730]?.includes('playNotificationSound(type: string)')) {
        results.push({
            file: 'NotificationManager.ts',
            line: 731,
            error: 'type parameter unused',
            severity: 'warning',
            fixed: false
        });
    }
}
catch (error) {
    console.error('Error checking NotificationManager.ts:', error);
}
// Check AnchorHighlighter.ts
const anchorHighlighterPath = join(__dirname, '../features/AnchorHighlighter.ts');
try {
    const content = readFileSync(anchorHighlighterPath, 'utf-8');
    const lines = content.split('\n');
    // Check line 120 - type assignment
    if (lines[119]?.includes('classes[styleStr]')) {
        results.push({
            file: 'AnchorHighlighter.ts',
            line: 120,
            error: 'Type string | undefined not assignable to string',
            severity: 'critical',
            fixed: false
        });
    }
    // Check unused parameter
    if (lines[103]?.includes('removeAllHighlights()')) {
        results.push({
            file: 'AnchorHighlighter.ts',
            line: 104,
            error: 'state parameter unused',
            severity: 'warning',
            fixed: false
        });
    }
}
catch (error) {
    console.error('Error checking AnchorHighlighter.ts:', error);
}
console.log('Slice 5 Diagnostic Results:');
console.log('============================');
results.forEach(r => {
    console.log(`[${r.severity.toUpperCase()}] ${r.file}:${r.line} - ${r.error}`);
});
const criticalCount = results.filter(r => r.severity === 'critical').length;
const warningCount = results.filter(r => r.severity === 'warning').length;
console.log(`\nTotal: ${results.length} errors (${criticalCount} critical, ${warningCount} warnings)`);
export { results };
//# sourceMappingURL=diagnose-slice5-errors.js.map