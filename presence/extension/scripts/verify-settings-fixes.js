/**
 * Verification Script for Settings Page Fixes
 * COMP: Verifies all fixes are properly implemented
 *
 * Run this in browser console after loading Settings page
 */
function verifySettingsFixes() {
    const results = [];
    // Check 1: CSS spacing rules exist
    const styleSheets = Array.from(document.styleSheets);
    let spacingRuleFound = false;
    for (const sheet of styleSheets) {
        try {
            const rules = Array.from(sheet.cssRules || sheet.rules || []);
            for (const rule of rules) {
                if (rule instanceof CSSStyleRule) {
                    if (rule.selectorText === '#settings-tab .settings-section' ||
                        rule.selectorText.includes('#settings-tab .settings-section')) {
                        spacingRuleFound = true;
                        const marginTop = rule.style.marginTop;
                        const marginLeft = rule.style.marginLeft;
                        const marginRight = rule.style.marginRight;
                        results.push({
                            check: 'CSS spacing rules',
                            passed: marginTop === '16px' && (marginLeft === '16px' || marginRight === '16px'),
                            details: `Found rule with margin-top: ${marginTop}, margin-left: ${marginLeft}, margin-right: ${marginRight}`,
                            fix: marginTop !== '16px' ? 'Update CSS to margin: 16px' : undefined
                        });
                        break;
                    }
                }
            }
        }
        catch (e) {
            // Cross-origin stylesheet, skip
        }
    }
    if (!spacingRuleFound) {
        results.push({
            check: 'CSS spacing rules',
            passed: false,
            details: 'CSS rule #settings-tab .settings-section not found',
            fix: 'Add CSS rule: #settings-tab .settings-section { margin: 16px; }'
        });
    }
    // Check 2: VisibilityTabHandler loaded
    const win = window;
    results.push({
        check: 'VisibilityTabHandler loaded',
        passed: !!(win.visibilityTabHandler || win.navigateToVisibilityTab),
        details: win.visibilityTabHandler ? 'visibilityTabHandler found' :
            win.navigateToVisibilityTab ? 'navigateToVisibilityTab found' :
                'Neither found in window',
        fix: !win.visibilityTabHandler && !win.navigateToVisibilityTab ?
            'Ensure VisibilityTabHandler.js is loaded in sidepanel.html' : undefined
    });
    // Check 3: Visibility toggle handler attached
    const visibilityToggle = document.getElementById('visibility-toggle');
    if (visibilityToggle) {
        const isAttached = visibilityToggle.getAttribute('data-handler-attached') === 'true';
        results.push({
            check: 'Visibility toggle handler',
            passed: isAttached,
            details: isAttached ? 'Handler attached' : 'Handler not attached',
            fix: !isAttached ? 'Call VisibilitySettingsManager.setupEventListeners()' : undefined
        });
    }
    else {
        results.push({
            check: 'Visibility toggle element exists',
            passed: false,
            details: 'visibility-toggle element not found',
            fix: 'Check HTML for visibility-toggle element'
        });
    }
    // Check 4: Theme toggle handler attached
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const isAttached = themeToggle.getAttribute('data-handler-attached') === 'true';
        results.push({
            check: 'Theme toggle handler',
            passed: isAttached,
            details: isAttached ? 'Handler attached' : 'Handler not attached',
            fix: !isAttached ? 'Call VisibilitySettingsManager.setupEventListeners()' : undefined
        });
    }
    else {
        results.push({
            check: 'Theme toggle element exists',
            passed: false,
            details: 'theme-toggle element not found',
            fix: 'Check HTML for theme-toggle element'
        });
    }
    // Check 5: VisibilityTabHandler script in HTML
    const scripts = Array.from(document.querySelectorAll('script[type="module"]'));
    const hasVisibilityTabHandler = scripts.some(script => script.src.includes('VisibilityTabHandler.js'));
    results.push({
        check: 'VisibilityTabHandler script tag',
        passed: hasVisibilityTabHandler,
        details: hasVisibilityTabHandler ? 'Script tag found' : 'Script tag not found',
        fix: !hasVisibilityTabHandler ? 'Add <script type="module" src="features/VisibilityTabHandler.js"></script> to sidepanel.html' : undefined
    });
    // Check 6: Go Visible modal available
    const win2 = window;
    results.push({
        check: 'Go Visible modal available',
        passed: !!(win2.showGoVisibleModal || win2.openGoVisibleModal),
        details: win2.showGoVisibleModal ? 'showGoVisibleModal found' :
            win2.openGoVisibleModal ? 'openGoVisibleModal found' :
                'Neither found',
        fix: !win2.showGoVisibleModal && !win2.openGoVisibleModal ?
            'Ensure GoVisibleModal.js is loaded' : undefined
    });
    // Check 7: setVisibilityStatus available
    const win3 = window;
    results.push({
        check: 'setVisibilityStatus available',
        passed: !!win3.setVisibilityStatus,
        details: win3.setVisibilityStatus ? 'setVisibilityStatus found' : 'setVisibilityStatus not found',
        fix: !win3.setVisibilityStatus ? 'Ensure VisibilitySettingsManager exports setVisibilityStatus' : undefined
    });
    // Print results
    console.log('\n🔍 SETTINGS_PAGE_VERIFICATION: Results\n');
    console.log('='.repeat(60));
    results.forEach((result, index) => {
        const icon = result.passed ? '✅' : '❌';
        console.log(`${icon} [${index + 1}] ${result.check}`);
        console.log(`   ${result.details}`);
        if (!result.passed && result.fix) {
            console.log(`   🔧 Fix: ${result.fix}`);
        }
        console.log('');
    });
    console.log('='.repeat(60));
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    console.log(`\nSummary: ${passed} passed, ${failed} failed out of ${results.length} checks\n`);
    if (failed === 0) {
        console.log('✅ ALL CHECKS PASSED! Settings page fixes are properly implemented.');
    }
    else {
        console.log('❌ SOME CHECKS FAILED - Review fixes above.');
    }
    return results;
}
// Export for use in console
if (typeof window !== 'undefined') {
    window.verifySettingsFixes = verifySettingsFixes;
    console.log('✅ Settings page verification script loaded. Run: verifySettingsFixes()');
}
export { verifySettingsFixes };
export default verifySettingsFixes;
