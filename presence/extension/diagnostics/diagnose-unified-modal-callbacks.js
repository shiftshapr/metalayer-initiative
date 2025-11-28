/**
 * diagnose-unified-modal-callbacks.ts
 *
 * Diagnostic script for Slice B - Unified Message Modal alignment.
 *
 * Checks:
 * 1. Callback signature consistency across UnifiedMessageModal, UserHoverModal, UnifiedMessageRenderer
 * 2. Window augmentation types for modal/renderer registration
 * 3. Optional renderer references (should be explicit imports)
 *
 * Usage:
 *   cd /home/ubuntu/metalayer-initiative
 *   npx tsx presence/src/diagnostics/diagnose-unified-modal-callbacks.ts
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const results = [];
const projectRoot = join(process.cwd(), 'presence', 'src');
function addResult(category, severity, message, file, line, code) {
    results.push({ category, severity, message, file, line, code });
}
function readFileSafe(path) {
    try {
        return readFileSync(path, 'utf-8');
    }
    catch {
        return null;
    }
}
function checkCallbackSignatures() {
    const modalFile = join(projectRoot, 'components', 'UnifiedMessageModal.ts');
    const hoverFile = join(projectRoot, 'features', 'UserHoverModal.ts');
    const rendererFile = join(projectRoot, 'utils', 'UnifiedMessageRenderer.ts');
    const modalContent = readFileSafe(modalFile);
    if (!modalContent) {
        addResult('callbacks', 'error', `Cannot read ${modalFile}`, modalFile);
        return;
    }
    // Check UnifiedMessageModal callback definitions
    const onSuccessMatch = modalContent.match(/onSuccess\?:\s*\(([^)]+)\)\s*=>\s*void/);
    const onDraftSavedMatch = modalContent.match(/onDraftSaved\?:\s*\(([^)]+)\)\s*=>\s*void/);
    const onCancelMatch = modalContent.match(/onCancel\?:\s*\(\)\s*=>\s*void/);
    if (!onSuccessMatch) {
        addResult('callbacks', 'error', 'onSuccess callback signature not found in UnifiedMessageModal', modalFile);
    }
    else {
        const paramType = onSuccessMatch[1].trim();
        if (paramType !== 'message: Message') {
            addResult('callbacks', 'warning', `onSuccess parameter type may be inconsistent: ${paramType}`, modalFile);
        }
    }
    if (!onDraftSavedMatch) {
        addResult('callbacks', 'error', 'onDraftSaved callback signature not found in UnifiedMessageModal', modalFile);
    }
    else {
        const paramType = onDraftSavedMatch[1].trim();
        if (paramType !== 'message: Message') {
            addResult('callbacks', 'warning', `onDraftSaved parameter type may be inconsistent: ${paramType}`, modalFile);
        }
    }
    if (!onCancelMatch) {
        addResult('callbacks', 'error', 'onCancel callback signature not found in UnifiedMessageModal', modalFile);
    }
    // Check for callback usage in UserHoverModal
    const hoverContent = readFileSafe(hoverFile);
    if (hoverContent) {
        // Check if UserHoverModal uses UnifiedMessageModal callbacks
        if (hoverContent.includes('openMessageModal') || hoverContent.includes('unifiedMessageModal')) {
            // Check if callbacks are passed correctly
            const callbackUsage = hoverContent.match(/(onSuccess|onDraftSaved|onCancel)\s*[:=]/g);
            if (callbackUsage) {
                addResult('callbacks', 'info', `UserHoverModal uses modal callbacks: ${callbackUsage.join(', ')}`, hoverFile);
            }
        }
    }
    // Check UnifiedMessageRenderer for callback usage
    const rendererContent = readFileSafe(rendererFile);
    if (rendererContent) {
        // Renderer shouldn't directly use modal callbacks, but check for indirect usage
        if (rendererContent.includes('onSuccess') || rendererContent.includes('onDraftSaved')) {
            addResult('callbacks', 'warning', 'UnifiedMessageRenderer may have direct callback usage (should be indirect)', rendererFile);
        }
    }
}
function checkWindowAugmentations() {
    const globalTypesFile = join(projectRoot, 'types', 'global.d.ts');
    const globalContent = readFileSafe(globalTypesFile);
    if (!globalContent) {
        addResult('window-types', 'error', 'Cannot read global.d.ts', globalTypesFile);
        return;
    }
    // Check for unifiedMessageModal
    if (!globalContent.includes('unifiedMessageModal')) {
        addResult('window-types', 'error', 'window.unifiedMessageModal not declared in global.d.ts', globalTypesFile);
    }
    else {
        // Check if it's properly typed
        const modalMatch = globalContent.match(/unifiedMessageModal\?:\s*([^;]+)/);
        if (modalMatch) {
            const type = modalMatch[1].trim();
            if (type === 'unknown' || type === 'any') {
                addResult('window-types', 'warning', `window.unifiedMessageModal typed as ${type} (should be UnifiedMessageModal)`, globalTypesFile);
            }
        }
    }
    // Check for userHoverModal
    if (!globalContent.includes('userHoverModal')) {
        addResult('window-types', 'error', 'window.userHoverModal not declared in global.d.ts', globalTypesFile);
    }
    else {
        const hoverMatch = globalContent.match(/userHoverModal\?:\s*([^;]+)/);
        if (hoverMatch) {
            const type = hoverMatch[1].trim();
            if (type === 'unknown' || type === 'any') {
                addResult('window-types', 'warning', `window.userHoverModal typed as ${type} (should be UserHoverModal)`, globalTypesFile);
            }
        }
    }
    // Check for UnifiedMessageRenderer
    if (!globalContent.includes('UnifiedMessageRenderer')) {
        addResult('window-types', 'error', 'window.UnifiedMessageRenderer not declared in global.d.ts', globalTypesFile);
    }
    else {
        const rendererMatch = globalContent.match(/UnifiedMessageRenderer\?:\s*([^;]+)/);
        if (rendererMatch) {
            const type = rendererMatch[1].trim();
            if (type === 'unknown' || type === 'any') {
                addResult('window-types', 'warning', `window.UnifiedMessageRenderer typed as ${type} (should be typeof UnifiedMessageRenderer)`, globalTypesFile);
            }
        }
    }
    // Check for openMessageModal, openReplyModal, openQuoteModal
    const hasOpenMessageModal = globalContent.includes('openMessageModal');
    const hasOpenReplyModal = globalContent.includes('openReplyModal');
    const hasOpenQuoteModal = globalContent.includes('openQuoteModal');
    if (!hasOpenMessageModal) {
        addResult('window-types', 'error', 'window.openMessageModal not declared in global.d.ts', globalTypesFile);
    }
    if (!hasOpenReplyModal) {
        addResult('window-types', 'error', 'window.openReplyModal not declared in global.d.ts', globalTypesFile);
    }
    if (!hasOpenQuoteModal) {
        addResult('window-types', 'error', 'window.openQuoteModal not declared in global.d.ts', globalTypesFile);
    }
}
function checkOptionalRendererReferences() {
    const modalFile = join(projectRoot, 'components', 'UnifiedMessageModal.ts');
    const hoverFile = join(projectRoot, 'features', 'UserHoverModal.ts');
    const rendererFile = join(projectRoot, 'utils', 'UnifiedMessageRenderer.ts');
    const modalContent = readFileSafe(modalFile);
    const hoverContent = readFileSafe(hoverFile);
    const rendererContent = readFileSafe(rendererFile);
    // Check for window.UnifiedMessageRenderer usage (should be explicit import)
    if (modalContent) {
        const windowRendererMatches = modalContent.match(/window\.UnifiedMessageRenderer/g);
        if (windowRendererMatches) {
            addResult('renderer-refs', 'warning', `UnifiedMessageModal uses window.UnifiedMessageRenderer (should use explicit import)`, modalFile);
        }
        // Check for import of UnifiedMessageRenderer
        const hasImport = modalContent.includes("import.*UnifiedMessageRenderer") ||
            modalContent.match(/from\s+['"].*UnifiedMessageRenderer/);
        if (!hasImport && windowRendererMatches) {
            addResult('renderer-refs', 'error', 'UnifiedMessageModal references UnifiedMessageRenderer but has no import', modalFile);
        }
    }
    if (hoverContent) {
        const windowRendererMatches = hoverContent.match(/window\.UnifiedMessageRenderer/g);
        if (windowRendererMatches) {
            addResult('renderer-refs', 'warning', `UserHoverModal uses window.UnifiedMessageRenderer (should use explicit import)`, hoverFile);
        }
    }
    // Check for optional chaining on renderer (indicates optional reference)
    if (modalContent) {
        const optionalRendererMatches = modalContent.match(/UnifiedMessageRenderer\?\./g);
        if (optionalRendererMatches) {
            addResult('renderer-refs', 'warning', 'UnifiedMessageModal uses optional chaining on UnifiedMessageRenderer (should be required)', modalFile);
        }
    }
    if (hoverContent) {
        const optionalRendererMatches = hoverContent.match(/UnifiedMessageRenderer\?\./g);
        if (optionalRendererMatches) {
            addResult('renderer-refs', 'warning', 'UserHoverModal uses optional chaining on UnifiedMessageRenderer (should be required)', hoverFile);
        }
    }
}
function checkHoverModalRegistration() {
    const hoverFile = join(projectRoot, 'features', 'UserHoverModal.ts');
    const hoverContent = readFileSafe(hoverFile);
    if (!hoverContent) {
        addResult('hover-registration', 'error', `Cannot read ${hoverFile}`, hoverFile);
        return;
    }
    // Check if userHoverModal is exported to window
    if (!hoverContent.includes('window.userHoverModal') && !hoverContent.includes('win.userHoverModal')) {
        addResult('hover-registration', 'error', 'UserHoverModal does not register to window.userHoverModal', hoverFile);
    }
    else {
        // Check if it's properly typed in the assignment
        const registrationMatch = hoverContent.match(/window\.userHoverModal\s*=\s*([^;]+)/);
        if (registrationMatch) {
            const assigned = registrationMatch[1].trim();
            if (assigned.includes('userHoverModalInstance') || assigned.includes('new UserHoverModal')) {
                addResult('hover-registration', 'info', 'UserHoverModal registered to window', hoverFile);
            }
        }
    }
}
function printResults() {
    const errors = results.filter(r => r.severity === 'error');
    const warnings = results.filter(r => r.severity === 'warning');
    const info = results.filter(r => r.severity === 'info');
    console.log('\n🔍 Slice B - Unified Message Modal Diagnostic Results\n');
    console.log(`Total issues: ${results.length} (${errors.length} errors, ${warnings.length} warnings, ${info.length} info)\n`);
    if (errors.length > 0) {
        console.log('❌ ERRORS:');
        errors.forEach(r => {
            console.log(`  [${r.category}] ${r.message}`);
            if (r.file)
                console.log(`    File: ${r.file}`);
            if (r.line)
                console.log(`    Line: ${r.line}`);
            if (r.code)
                console.log(`    Code: ${r.code}`);
            console.log('');
        });
    }
    if (warnings.length > 0) {
        console.log('⚠️  WARNINGS:');
        warnings.forEach(r => {
            console.log(`  [${r.category}] ${r.message}`);
            if (r.file)
                console.log(`    File: ${r.file}`);
            if (r.line)
                console.log(`    Line: ${r.line}`);
            console.log('');
        });
    }
    if (info.length > 0) {
        console.log('ℹ️  INFO:');
        info.forEach(r => {
            console.log(`  [${r.category}] ${r.message}`);
            if (r.file)
                console.log(`    File: ${r.file}`);
            console.log('');
        });
    }
    // Summary by category
    const byCategory = new Map();
    results.forEach(r => {
        byCategory.set(r.category, (byCategory.get(r.category) || 0) + 1);
    });
    console.log('\n📊 Summary by Category:');
    byCategory.forEach((count, category) => {
        console.log(`  ${category}: ${count} issue(s)`);
    });
    if (errors.length > 0) {
        process.exitCode = 1;
    }
}
// Run diagnostics
try {
    checkCallbackSignatures();
    checkWindowAugmentations();
    checkOptionalRendererReferences();
    checkHoverModalRegistration();
    printResults();
}
catch (error) {
    console.error('❌ Diagnostic script failed:', error);
    process.exitCode = 2;
}
//# sourceMappingURL=diagnose-unified-modal-callbacks.js.map