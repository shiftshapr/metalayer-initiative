/**
 * Diagnostic Script: Settings Page Issues
 *
 * Checks for:
 * 1. Missing space between tab and selector line
 * 2. Park/unpack controls presence in Live Cursor section
 * 3. Cursor visualization options availability
 * 4. Visibility tab click behavior
 * 5. Go Visible modal integration
 * 6. Go Invisible button functionality
 */
function diagnoseSettingsPageIssues() {
    const results = [];
    // 1. Check spacing between nav tabs and content
    const navMain = document.querySelector('.sidebar-nav-main');
    const firstTabContent = document.querySelector('.main-tab-content.active');
    if (navMain && firstTabContent) {
        const navRect = navMain.getBoundingClientRect();
        const contentRect = firstTabContent.getBoundingClientRect();
        const gap = contentRect.top - navRect.bottom;
        if (gap < 8) {
            results.push({
                issue: 'Missing space between tab and selector line',
                status: 'FAIL',
                details: `Gap between nav and content is ${gap}px (should be at least 8px)`,
                recommendation: 'Add margin-top to .main-tab-content or margin-bottom to .sidebar-nav-main'
            });
        }
        else {
            results.push({
                issue: 'Spacing between tab and selector line',
                status: 'PASS',
                details: `Gap is ${gap}px (acceptable)`
            });
        }
    }
    // 2. Check for park/unpack controls in Live Cursor section
    const parkControls = document.getElementById('cursor-park-controls');
    const parkButton = document.getElementById('cursor-park-button');
    const unparkButton = document.getElementById('cursor-unpark-button');
    if (parkControls || parkButton || unparkButton) {
        results.push({
            issue: 'Park/unpack controls in Live Cursor section',
            status: 'FAIL',
            details: 'Park/unpack controls should be removed from Live Cursor section',
            recommendation: 'Remove #cursor-park-controls, #cursor-park-button, and #cursor-unpark-button from Live Cursor section'
        });
    }
    else {
        results.push({
            issue: 'Park/unpack controls removed',
            status: 'PASS',
            details: 'No park/unpack controls found in Live Cursor section'
        });
    }
    // 3. Check for cursor visualization options
    const cursorVisualSection = document.getElementById('cursor-visual-settings-section');
    const visualStyleRadios = document.querySelectorAll('input[name="cursor-visual-style"]');
    const expectedOptions = ['regular', 'aura-circle', 'avatar', 'custom-image'];
    if (visualStyleRadios.length === 0) {
        results.push({
            issue: 'Cursor visualization options missing',
            status: 'FAIL',
            details: 'No cursor visualization radio buttons found',
            recommendation: 'Add cursor visualization selector with options: existing cursor, mini dot with aura, avatar with aura, image upload'
        });
    }
    else {
        const foundOptions = [];
        visualStyleRadios.forEach(radio => {
            const input = radio;
            if (input.value)
                foundOptions.push(input.value);
        });
        const missingOptions = expectedOptions.filter(opt => !foundOptions.includes(opt));
        if (missingOptions.length > 0) {
            results.push({
                issue: 'Incomplete cursor visualization options',
                status: 'WARN',
                details: `Missing options: ${missingOptions.join(', ')}`,
                recommendation: `Add missing visualization options: ${missingOptions.join(', ')}`
            });
        }
        else {
            results.push({
                issue: 'Cursor visualization options',
                status: 'PASS',
                details: `All expected options found: ${foundOptions.join(', ')}`
            });
        }
    }
    // 4. Check Visibility tab click behavior
    const visibilityTab = document.querySelector('[data-tab="visibility-tab"]');
    const visibilityToggle = document.getElementById('visibility-toggle');
    const goVisibleModal = window.showGoVisibleModal || window.openGoVisibleModal;
    if (visibilityTab && visibilityToggle) {
        const isVisible = visibilityToggle.checked;
        // Check if click handler exists
        const hasClickHandler = visibilityTab.getAttribute('data-handler-attached') === 'true' ||
            visibilityTab.addEventListener.toString().includes('visibility');
        if (!isVisible && !goVisibleModal) {
            results.push({
                issue: 'Go Visible modal not available',
                status: 'FAIL',
                details: 'When Visible is No, clicking Visibility tab should show Go Visible modal, but modal function not found',
                recommendation: 'Ensure GoVisibleModal is loaded and exported to window'
            });
        }
        else if (!isVisible && goVisibleModal) {
            results.push({
                issue: 'Visibility tab click behavior',
                status: 'PASS',
                details: 'Go Visible modal is available for when Visible is No'
            });
        }
    }
    // 5. Check Go Invisible button
    const goInvisibleBtn = document.getElementById('go-invisible-btn') ||
        document.querySelector('[id*="go-invisible"]') ||
        document.querySelector('button:contains("Go Invisible")');
    if (!goInvisibleBtn) {
        results.push({
            issue: 'Go Invisible button missing',
            status: 'WARN',
            details: 'Go Invisible button not found in Visibility tab',
            recommendation: 'Add Go Invisible button to Visibility tab that sets Visible to No and moves to Settings tab'
        });
    }
    else {
        results.push({
            issue: 'Go Invisible button',
            status: 'PASS',
            details: 'Go Invisible button found'
        });
    }
    return results;
}
// Export for use in console
if (typeof window !== 'undefined') {
    window.diagnoseSettingsPageIssues = diagnoseSettingsPageIssues;
    console.log('✅ Settings page diagnostic loaded. Run: diagnoseSettingsPageIssues()');
}
export { diagnoseSettingsPageIssues };
export default diagnoseSettingsPageIssues;
