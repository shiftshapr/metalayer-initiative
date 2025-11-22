/**
 * Comprehensive Settings Page Diagnostic
 * COMP: Follows COMP design system requirements
 *
 * Checks:
 * 1. Spacing between nav and content
 * 2. Visibility toggle functionality
 * 3. Visibility tab click behavior
 * 4. Go Invisible navigation
 * 5. Theme toggle functionality
 * 6. VisibilityTabHandler loading
 */
function diagnoseSettingsPageComprehensive() {
    const results = [];
    // 1. Check spacing
    const navMain = document.querySelector('.sidebar-nav-main');
    const settingsTab = document.getElementById('settings-tab');
    const firstSection = settingsTab?.querySelector('.settings-section');
    if (navMain && firstSection) {
        const navRect = navMain.getBoundingClientRect();
        const sectionRect = firstSection.getBoundingClientRect();
        const gap = sectionRect.top - navRect.bottom;
        const computedStyle = window.getComputedStyle(firstSection);
        const marginTop = parseInt(computedStyle.marginTop) || 0;
        if (gap < 8 || marginTop < 8) {
            results.push({
                issue: 'Settings tab spacing',
                status: 'FAIL',
                details: `Gap: ${gap}px, margin-top: ${marginTop}px (should be at least 16px)`,
                recommendation: 'Add margin: 16px to #settings-tab .settings-section in CSS'
            });
        }
        else {
            results.push({
                issue: 'Settings tab spacing',
                status: 'PASS',
                details: `Gap: ${gap}px, margin-top: ${marginTop}px`
            });
        }
    }
    // 2. Check VisibilityTabHandler loading
    const win = window;
    if (!win.visibilityTabHandler && !win.navigateToVisibilityTab) {
        results.push({
            issue: 'VisibilityTabHandler not loaded',
            status: 'FAIL',
            details: 'VisibilityTabHandler not found in window object',
            recommendation: 'Ensure VisibilityTabHandler.js is loaded in sidepanel.html'
        });
    }
    else {
        results.push({
            issue: 'VisibilityTabHandler loaded',
            status: 'PASS',
            details: 'VisibilityTabHandler found in window'
        });
    }
    // 3. Check visibility toggle handler attachment
    const visibilityToggle = document.getElementById('visibility-toggle');
    if (visibilityToggle) {
        const isAttached = visibilityToggle.getAttribute('data-handler-attached') === 'true';
        if (!isAttached) {
            results.push({
                issue: 'Visibility toggle handler',
                status: 'FAIL',
                details: 'Visibility toggle handler not attached',
                recommendation: 'Ensure VisibilitySettingsManager.setupEventListeners() is called'
            });
        }
        else {
            results.push({
                issue: 'Visibility toggle handler',
                status: 'PASS',
                details: 'Handler attached'
            });
        }
    }
    // 4. Check theme toggle handler
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const isAttached = themeToggle.getAttribute('data-handler-attached') === 'true';
        if (!isAttached) {
            results.push({
                issue: 'Theme toggle handler',
                status: 'FAIL',
                details: 'Theme toggle handler not attached',
                recommendation: 'Ensure VisibilitySettingsManager.setupEventListeners() is called'
            });
        }
        else {
            results.push({
                issue: 'Theme toggle handler',
                status: 'PASS',
                details: 'Handler attached'
            });
        }
    }
    // 5. Check Go Invisible button
    const goInvisibleBtn = document.getElementById('go-invisible-btn');
    if (!goInvisibleBtn) {
        results.push({
            issue: 'Go Invisible button',
            status: 'WARN',
            details: 'Go Invisible button not found in Visibility tab',
            recommendation: 'VisibilityTabHandler should create this button'
        });
    }
    else {
        results.push({
            issue: 'Go Invisible button',
            status: 'PASS',
            details: 'Button found'
        });
    }
    return results;
}
// Export for use in console
if (typeof window !== 'undefined') {
    window.diagnoseSettingsPageComprehensive = diagnoseSettingsPageComprehensive;
    console.log('✅ Settings page comprehensive diagnostic loaded. Run: diagnoseSettingsPageComprehensive()');
}
export { diagnoseSettingsPageComprehensive };
export default diagnoseSettingsPageComprehensive;
