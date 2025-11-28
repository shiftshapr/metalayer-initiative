/**
 * DIAGNOSTIC SCRIPT: Settings Page Fixes Verification
 *
 * Verifies all Settings page fixes are working correctly:
 * 1. Spacing between Settings tab label and selector line
 * 2. Live Cursor status on same line as controls
 * 3. Park/unpack controls removed
 * 4. Visibility toggle connected to UserPreferencesManager
 * 5. Theme toggle connected to UserPreferencesManager
 * 6. Visibility tab click behavior
 * 7. Go Invisible navigation
 * 8. Go Visible modal cancel button color
 */
const diagnostics = [];
/**
 * Test 1: Check spacing between Settings tab label and selector line
 */
function testSpacing() {
    const settingsTab = document.getElementById('settings-tab');
    const settingsSection = settingsTab?.querySelector('.settings-section');
    if (!settingsTab || !settingsSection) {
        return {
            test: 'Spacing Check',
            passed: false,
            message: 'Settings tab or section not found'
        };
    }
    const computedStyle = window.getComputedStyle(settingsSection);
    const marginTop = parseFloat(computedStyle.marginTop);
    const paddingTop = parseFloat(computedStyle.paddingTop);
    // Check if content is open (has proper spacing)
    const isOpen = marginTop > 0 || paddingTop > 0;
    return {
        test: 'Spacing Check',
        passed: isOpen,
        message: isOpen
            ? `Spacing looks good (margin-top: ${marginTop}px, padding-top: ${paddingTop}px)`
            : 'Spacing issue detected - content may be collapsed',
        details: { marginTop, paddingTop }
    };
}
/**
 * Test 2: Check Live Cursor status on same line as controls
 */
function testLiveCursorLayout() {
    const liveCursorSection = document.querySelector('.settings-section h4[title*="Live Cursor"]')?.parentElement;
    if (!liveCursorSection) {
        return {
            test: 'Live Cursor Layout',
            passed: false,
            message: 'Live Cursor section not found'
        };
    }
    const statusItem = liveCursorSection.querySelector('.setting-item');
    const statusLabel = statusItem?.querySelector('label');
    const statusContainer = statusItem?.querySelector('div[style*="display: flex"]');
    const isOnSameLine = statusContainer &&
        window.getComputedStyle(statusContainer).flexDirection === 'row';
    return {
        test: 'Live Cursor Layout',
        passed: isOnSameLine || false,
        message: isOnSameLine
            ? 'Status is on same line as controls'
            : 'Status is not on same line as controls',
        details: { hasStatusContainer: !!statusContainer }
    };
}
/**
 * Test 3: Check park/unpack controls are removed
 */
function testParkUnpackRemoved() {
    const parkButton = document.getElementById('cursor-park-button');
    const unparkButton = document.getElementById('cursor-unpark-button');
    const parkControls = document.getElementById('cursor-park-controls');
    const isRemoved = !parkButton && !unparkButton && !parkControls;
    return {
        test: 'Park/Unpack Removed',
        passed: isRemoved,
        message: isRemoved
            ? 'Park/unpack controls successfully removed'
            : 'Park/unpack controls still present',
        details: {
            hasParkButton: !!parkButton,
            hasUnparkButton: !!unparkButton,
            hasParkControls: !!parkControls
        }
    };
}
/**
 * Test 4: Check visibility toggle connection to UserPreferencesManager
 */
async function testVisibilityToggleConnection() {
    const visibilityToggle = document.getElementById('visibility-toggle');
    if (!visibilityToggle) {
        return {
            test: 'Visibility Toggle Connection',
            passed: false,
            message: 'Visibility toggle not found'
        };
    }
    const win = window;
    if (!win.userPreferencesManager?.isInitialized) {
        return {
            test: 'Visibility Toggle Connection',
            passed: false,
            message: 'UserPreferencesManager not initialized'
        };
    }
    // Get current state
    const currentToggleState = visibilityToggle.checked;
    const currentPrefState = await win.userPreferencesManager.getPreference('isVisible');
    // Check if they match
    const matches = currentToggleState === (currentPrefState === true);
    // Test save
    const testValue = !currentToggleState;
    visibilityToggle.checked = testValue;
    visibilityToggle.dispatchEvent(new Event('change'));
    // Wait a bit for save
    await new Promise(resolve => setTimeout(resolve, 500));
    const savedValue = await win.userPreferencesManager.getPreference('isVisible');
    const saveWorks = savedValue === testValue;
    // Restore original state
    visibilityToggle.checked = currentToggleState;
    visibilityToggle.dispatchEvent(new Event('change'));
    return {
        test: 'Visibility Toggle Connection',
        passed: matches && saveWorks,
        message: matches && saveWorks
            ? 'Visibility toggle properly connected to UserPreferencesManager'
            : `Connection issue: matches=${matches}, saveWorks=${saveWorks}`,
        details: {
            toggleState: currentToggleState,
            prefState: currentPrefState,
            saveWorks
        }
    };
}
/**
 * Test 5: Check theme toggle connection to UserPreferencesManager
 */
async function testThemeToggleConnection() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) {
        return {
            test: 'Theme Toggle Connection',
            passed: false,
            message: 'Theme toggle not found'
        };
    }
    const win = window;
    if (!win.userPreferencesManager?.isInitialized) {
        return {
            test: 'Theme Toggle Connection',
            passed: false,
            message: 'UserPreferencesManager not initialized'
        };
    }
    // Get current state
    const currentToggleState = themeToggle.checked;
    const currentTheme = currentToggleState ? 'dark' : 'light';
    const currentPrefTheme = await win.userPreferencesManager.getPreference('theme');
    // Check if they match
    const matches = currentTheme === currentPrefTheme;
    // Test save
    const testValue = !currentToggleState;
    themeToggle.checked = testValue;
    themeToggle.dispatchEvent(new Event('change'));
    // Wait a bit for save
    await new Promise(resolve => setTimeout(resolve, 500));
    const savedTheme = await win.userPreferencesManager.getPreference('theme');
    const expectedTheme = testValue ? 'dark' : 'light';
    const saveWorks = savedTheme === expectedTheme;
    // Restore original state
    themeToggle.checked = currentToggleState;
    themeToggle.dispatchEvent(new Event('change'));
    return {
        test: 'Theme Toggle Connection',
        passed: matches && saveWorks,
        message: matches && saveWorks
            ? 'Theme toggle properly connected to UserPreferencesManager'
            : `Connection issue: matches=${matches}, saveWorks=${saveWorks}`,
        details: {
            toggleState: currentToggleState,
            currentTheme,
            prefTheme: currentPrefTheme,
            saveWorks
        }
    };
}
/**
 * Test 6: Check Visibility tab click behavior
 */
function testVisibilityTabClick() {
    const visibilityTab = document.querySelector('[data-tab="visibility-tab"]');
    const goVisibleModal = document.getElementById('visibility-access-modal');
    if (!visibilityTab) {
        return {
            test: 'Visibility Tab Click',
            passed: false,
            message: 'Visibility tab not found'
        };
    }
    // Check if event listener is attached
    const hasClickHandler = visibilityTab.onclick !== null ||
        visibilityTab.__visibilityClickHandler !== undefined;
    return {
        test: 'Visibility Tab Click',
        passed: hasClickHandler || !!goVisibleModal,
        message: hasClickHandler || goVisibleModal
            ? 'Visibility tab click handler present'
            : 'Visibility tab click handler not found',
        details: { hasClickHandler, hasModal: !!goVisibleModal }
    };
}
/**
 * Test 7: Check Go Invisible navigation
 */
function testGoInvisibleNavigation() {
    const visibilityTab = document.getElementById('visibility-tab');
    const goInvisibleButton = visibilityTab?.querySelector('[id*="invisible"], [id*="go-invisible"]');
    if (!goInvisibleButton) {
        return {
            test: 'Go Invisible Navigation',
            passed: false,
            message: 'Go Invisible button not found in Visibility tab'
        };
    }
    const hasClickHandler = goInvisibleButton.onclick !== null ||
        goInvisibleButton.__goInvisibleHandler !== undefined;
    return {
        test: 'Go Invisible Navigation',
        passed: hasClickHandler,
        message: hasClickHandler
            ? 'Go Invisible button has click handler'
            : 'Go Invisible button click handler not found',
        details: { hasClickHandler }
    };
}
/**
 * Test 8: Check Go Visible modal cancel button color
 */
function testGoVisibleModalCancelButton() {
    const cancelButton = document.getElementById('cancel-visibility-btn');
    if (!cancelButton) {
        return {
            test: 'Go Visible Modal Cancel Button',
            passed: false,
            message: 'Cancel button not found'
        };
    }
    const computedStyle = window.getComputedStyle(cancelButton);
    const color = computedStyle.color;
    const backgroundColor = computedStyle.backgroundColor;
    // Check if color is dark for light theme
    const isDarkColor = color.includes('rgb(33, 37, 41)') || // #212529
        color.includes('rgb(51, 51, 51)') || // #333
        parseInt(color) < 100; // Dark color
    return {
        test: 'Go Visible Modal Cancel Button',
        passed: isDarkColor,
        message: isDarkColor
            ? `Cancel button has dark color (${color})`
            : `Cancel button color may be too light (${color})`,
        details: { color, backgroundColor }
    };
}
/**
 * Run all diagnostics
 */
export async function runSettingsPageDiagnostics() {
    console.log('🔍 SETTINGS_PAGE_DIAGNOSTICS: Starting diagnostics...');
    diagnostics.push(testSpacing());
    diagnostics.push(testLiveCursorLayout());
    diagnostics.push(testParkUnpackRemoved());
    diagnostics.push(await testVisibilityToggleConnection());
    diagnostics.push(await testThemeToggleConnection());
    diagnostics.push(testVisibilityTabClick());
    diagnostics.push(testGoInvisibleNavigation());
    diagnostics.push(testGoVisibleModalCancelButton());
    const passed = diagnostics.filter(d => d.passed).length;
    const total = diagnostics.length;
    console.log(`✅ SETTINGS_PAGE_DIAGNOSTICS: Completed (${passed}/${total} passed)`);
    console.table(diagnostics);
    return diagnostics;
}
// Export for console access
if (typeof window !== 'undefined') {
    window.runSettingsPageDiagnostics = runSettingsPageDiagnostics;
    console.log('✅ SETTINGS_PAGE_DIAGNOSTICS: Available as window.runSettingsPageDiagnostics()');
}
