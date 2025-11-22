/**
 * Diagnostic: Settings Page Critical Bugs
 *
 * Checks:
 * 1. Theme toggle incorrectly toggling Visible
 * 2. Go Visible modal cancel button text color
 * 3. Go Invisible navigation
 * 4. Settings tab spacing
 */
function diagnoseSettingsCriticalBugs() {
    const results = [];
    // 1. Check theme toggle handler - ensure it's not attached to visibility toggle
    const themeToggle = document.getElementById('theme-toggle');
    const visibilityToggle = document.getElementById('visibility-toggle');
    if (themeToggle && visibilityToggle) {
        // Check if handlers are on correct elements
        const themeHandler = themeToggle.getAttribute('data-handler-attached');
        const visibilityHandler = visibilityToggle.getAttribute('data-handler-attached');
        // Check if theme toggle is somehow connected to visibility
        const themeParent = themeToggle.closest('.setting-item');
        const visibilityParent = visibilityToggle.closest('.setting-item');
        if (themeParent === visibilityParent) {
            results.push({
                issue: 'Theme and Visibility toggles in same container',
                status: 'WARN',
                details: 'Both toggles may be in same parent, check for event bubbling issues'
            });
        }
        // Check event listeners
        const themeListeners = themeToggle._listeners || [];
        const visibilityListeners = visibilityToggle._listeners || [];
        results.push({
            issue: 'Toggle handler attachment',
            status: themeHandler === 'true' && visibilityHandler === 'true' ? 'PASS' : 'FAIL',
            details: `Theme: ${themeHandler}, Visibility: ${visibilityHandler}`,
            recommendation: themeHandler !== 'true' || visibilityHandler !== 'true' ?
                'Ensure both handlers are properly attached' : undefined
        });
    }
    // 2. Check Go Visible modal cancel button styling
    const modal = document.querySelector('.go-visible-modal-overlay');
    if (modal) {
        const cancelBtn = modal.querySelector('.go-visible-cancel');
        if (cancelBtn) {
            const computedStyle = window.getComputedStyle(cancelBtn);
            const color = computedStyle.color;
            const theme = document.body.getAttribute('data-theme') || 'light';
            // Check if color is appropriate for theme
            const isLightTheme = theme === 'light';
            const isDarkColor = color.includes('rgb(0, 0, 0)') || color.includes('#000') ||
                color.includes('rgb(33, 37, 41)') || color.includes('#212529');
            if (isLightTheme && !isDarkColor) {
                results.push({
                    issue: 'Go Visible modal cancel button color',
                    status: 'FAIL',
                    details: `Light theme but cancel button color is ${color} (should be dark)`,
                    recommendation: 'Set cancel button color to dark text for light theme'
                });
            }
            else {
                results.push({
                    issue: 'Go Visible modal cancel button color',
                    status: 'PASS',
                    details: `Theme: ${theme}, Color: ${color}`
                });
            }
        }
    }
    else {
        results.push({
            issue: 'Go Visible modal exists',
            status: 'WARN',
            details: 'Modal not currently visible (test when modal is open)'
        });
    }
    // 3. Check Go Invisible button and navigation
    const goInvisibleBtn = document.getElementById('go-invisible-btn');
    if (goInvisibleBtn) {
        const hasHandler = goInvisibleBtn.onclick !== null ||
            goInvisibleBtn.getAttribute('data-handler-attached') === 'true';
        results.push({
            issue: 'Go Invisible button handler',
            status: hasHandler ? 'PASS' : 'WARN',
            details: hasHandler ? 'Handler attached' : 'Handler status unknown'
        });
    }
    else {
        results.push({
            issue: 'Go Invisible button exists',
            status: 'WARN',
            details: 'Button not found (may be in Visibility tab which is not active)'
        });
    }
    // 4. Check Settings tab spacing
    const settingsTab = document.getElementById('settings-tab');
    const settingsTabBtn = document.querySelector('[data-tab="settings-tab"]');
    const otherTabBtn = document.querySelector('[data-tab="discuss-tab"]');
    if (settingsTabBtn && otherTabBtn) {
        const settingsRect = settingsTabBtn.getBoundingClientRect();
        const otherRect = otherTabBtn.getBoundingClientRect();
        // Check if they have same height/padding
        const settingsPadding = window.getComputedStyle(settingsTabBtn).padding;
        const otherPadding = window.getComputedStyle(otherTabBtn).padding;
        if (settingsPadding !== otherPadding) {
            results.push({
                issue: 'Settings tab spacing consistency',
                status: 'FAIL',
                details: `Settings tab padding: ${settingsPadding}, Other tab padding: ${otherPadding}`,
                recommendation: 'Ensure all tabs have consistent padding'
            });
        }
        else {
            results.push({
                issue: 'Settings tab spacing consistency',
                status: 'PASS',
                details: `All tabs have padding: ${settingsPadding}`
            });
        }
    }
    // 5. Check VisibilityTabHandler loading
    const win = window;
    results.push({
        issue: 'VisibilityTabHandler loaded',
        status: !!(win.visibilityTabHandler || win.navigateToVisibilityTab) ? 'PASS' : 'FAIL',
        details: win.visibilityTabHandler ? 'visibilityTabHandler found' :
            win.navigateToVisibilityTab ? 'navigateToVisibilityTab found' :
                'Not found in window',
        recommendation: !win.visibilityTabHandler && !win.navigateToVisibilityTab ?
            'Add VisibilityTabHandler.js script to sidepanel.html' : undefined
    });
    return results;
}
// Export for use in console
if (typeof window !== 'undefined') {
    window.diagnoseSettingsCriticalBugs = diagnoseSettingsCriticalBugs;
    console.log('✅ Settings critical bugs diagnostic loaded. Run: diagnoseSettingsCriticalBugs()');
}
export { diagnoseSettingsCriticalBugs };
export default diagnoseSettingsCriticalBugs;
