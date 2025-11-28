/**
 * Tab Manager Diagnostic Script
 * Diagnoses issues with tab content switching, currentTab/previousTab tracking,
 * test suite, and visible tab count updates
 */
class TabManagerDiagnostic {
    constructor() {
        this.results = [];
    }
    async runDiagnostics() {
        console.log('🔍 Tab Manager Diagnostic Starting...\n');
        this.checkTabContentSwitching();
        this.checkCurrentPreviousTabTracking();
        this.checkTestSuite();
        this.checkVisibleTabCount();
        this.checkTabDisplayRendering();
        this.checkStoragePersistence();
        this.printResults();
    }
    checkTabContentSwitching() {
        console.log('📋 Checking tab content switching...');
        const issue = 'Tab content does not change when clicking tab buttons';
        // Check if tab content elements exist
        const tabContents = document.querySelectorAll('.main-tab-content');
        if (tabContents.length === 0) {
            this.results.push({
                issue,
                status: 'FAIL',
                details: 'No .main-tab-content elements found in DOM',
                recommendation: 'Ensure tab content divs exist with class .main-tab-content'
            });
            return;
        }
        // Check if active class switching works
        const discussTab = document.getElementById('discuss-tab');
        const settingsTab = document.getElementById('settings-tab');
        if (!discussTab || !settingsTab) {
            this.results.push({
                issue,
                status: 'FAIL',
                details: 'Required tab content elements missing (discuss-tab or settings-tab)',
                recommendation: 'Ensure all tab content divs exist with correct IDs'
            });
            return;
        }
        // Check if triggerTabSwitch is working
        const tabButtons = document.querySelectorAll('.main-nav-tab[data-tab]');
        if (tabButtons.length === 0) {
            this.results.push({
                issue,
                status: 'FAIL',
                details: 'No tab buttons found with data-tab attribute',
                recommendation: 'TabDisplay.render() should create buttons with data-tab attributes'
            });
            return;
        }
        // Check if click handlers are attached
        let hasClickHandlers = false;
        tabButtons.forEach(btn => {
            const listeners = btn.__eventListeners || [];
            if (listeners.length > 0)
                hasClickHandlers = true;
        });
        this.results.push({
            issue,
            status: hasClickHandlers ? 'PASS' : 'WARN',
            details: `Found ${tabButtons.length} tab buttons. Click handlers: ${hasClickHandlers ? 'Present' : 'May be missing'}`,
            recommendation: hasClickHandlers ? undefined : 'Verify TabDisplay.setTabClickHandler() is called'
        });
    }
    checkCurrentPreviousTabTracking() {
        console.log('📋 Checking currentTab/previousTab tracking...');
        const issue = 'currentTab and previousTab do not update on tab clicks';
        // Check if TabManager is initialized
        const tabManager = window.tabManager;
        if (!tabManager) {
            this.results.push({
                issue,
                status: 'FAIL',
                details: 'TabManager not initialized or not accessible on window',
                recommendation: 'Call tabManager.initialize() and ensure it\'s accessible'
            });
            return;
        }
        // Check if switchToTab method exists
        const config = tabManager.getConfiguration?.();
        if (!config || !config.switchToTab) {
            this.results.push({
                issue,
                status: 'FAIL',
                details: 'TabConfiguration.switchToTab() method not accessible',
                recommendation: 'Verify TabManager.getConfiguration() returns valid TabConfiguration instance'
            });
            return;
        }
        // Check current state
        const currentTab = config.getCurrentTab?.();
        const previousTab = config.getPreviousTab?.();
        this.results.push({
            issue,
            status: 'PASS',
            details: `Current tab: ${currentTab || 'null'}, Previous tab: ${previousTab || 'null'}`,
            recommendation: currentTab === null ? 'TabManager may not be initialized properly' : undefined
        });
    }
    checkTestSuite() {
        console.log('📋 Checking test suite...');
        const issue = 'Run all tests button does not work';
        // Check if test suite is loaded
        const TabManagerTestSuite = window.TabManagerTestSuite;
        if (!TabManagerTestSuite) {
            this.results.push({
                issue,
                status: 'FAIL',
                details: 'TabManagerTestSuite not loaded or not accessible',
                recommendation: 'Ensure TabManager.test.js is imported and TabManagerTestSuite is exported'
            });
            return;
        }
        // Check if run button exists
        const runButton = document.getElementById('run-tests-btn');
        if (!runButton) {
            this.results.push({
                issue,
                status: 'FAIL',
                details: 'Run tests button not found in DOM',
                recommendation: 'Ensure button with id="run-tests-btn" exists'
            });
            return;
        }
        this.results.push({
            issue,
            status: 'PASS',
            details: 'Test suite class and button found',
            recommendation: 'Check console for errors when clicking run button'
        });
    }
    checkVisibleTabCount() {
        console.log('📋 Checking visible tab count...');
        const issue = 'Changing visible tab count does not update display';
        const tabManager = window.tabManager;
        if (!tabManager) {
            this.results.push({
                issue,
                status: 'FAIL',
                details: 'TabManager not initialized',
                recommendation: 'Initialize TabManager first'
            });
            return;
        }
        const config = tabManager.getConfiguration?.();
        if (!config) {
            this.results.push({
                issue,
                status: 'FAIL',
                details: 'TabConfiguration not accessible',
                recommendation: 'Verify TabManager initialization'
            });
            return;
        }
        const state = config.getState?.();
        const visibleTabs = config.getVisibleTabs?.();
        this.results.push({
            issue,
            status: 'PASS',
            details: `Visible tab count: ${state?.visibleTabCount || 'unknown'}, Visible tabs: ${visibleTabs?.length || 0}`,
            recommendation: state?.visibleTabCount !== visibleTabs?.length ? 'Count and visible tabs mismatch' : undefined
        });
    }
    checkTabDisplayRendering() {
        console.log('📋 Checking tab display rendering...');
        const navContainer = document.querySelector('.sidebar-nav-main');
        if (!navContainer) {
            this.results.push({
                issue: 'Tab display not rendering',
                status: 'FAIL',
                details: '.sidebar-nav-main container not found',
                recommendation: 'Ensure container exists in DOM'
            });
            return;
        }
        const tabs = navContainer.querySelectorAll('.main-nav-tab:not(.manage-button)');
        const manageButton = navContainer.querySelector('.manage-button');
        this.results.push({
            issue: 'Tab display rendering',
            status: tabs.length > 0 ? 'PASS' : 'FAIL',
            details: `Found ${tabs.length} tabs, manage button: ${manageButton ? 'Present' : 'Missing'}`,
            recommendation: tabs.length === 0 ? 'Call TabDisplay.render() with tab configuration' : undefined
        });
    }
    checkStoragePersistence() {
        console.log('📋 Checking storage persistence...');
        // Check if chrome.storage is available (mocked in test page)
        const hasChromeStorage = typeof chrome !== 'undefined' && chrome.storage?.local;
        this.results.push({
            issue: 'Storage persistence',
            status: hasChromeStorage ? 'PASS' : 'WARN',
            details: `chrome.storage.local: ${hasChromeStorage ? 'Available' : 'Not available (may be mocked)'}`,
            recommendation: hasChromeStorage ? undefined : 'Ensure chrome.storage mock is working in test page'
        });
    }
    printResults() {
        console.log('\n📊 Diagnostic Results:');
        console.log('====================\n');
        const passed = this.results.filter(r => r.status === 'PASS').length;
        const failed = this.results.filter(r => r.status === 'FAIL').length;
        const warnings = this.results.filter(r => r.status === 'WARN').length;
        this.results.forEach(result => {
            const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
            console.log(`${icon} ${result.issue}`);
            console.log(`   Status: ${result.status}`);
            console.log(`   Details: ${result.details}`);
            if (result.recommendation) {
                console.log(`   Recommendation: ${result.recommendation}`);
            }
            console.log('');
        });
        console.log(`Summary: ${passed} passed, ${failed} failed, ${warnings} warnings\n`);
    }
    getResults() {
        return this.results;
    }
}
// Export for use in test page
if (typeof window !== 'undefined') {
    window.TabManagerDiagnostic = TabManagerDiagnostic;
    // Auto-run if in diagnostic mode
    if (window.location.search.includes('diagnose=true')) {
        const diagnostic = new TabManagerDiagnostic();
        diagnostic.runDiagnostics().catch(console.error);
    }
}
export default TabManagerDiagnostic;
//# sourceMappingURL=diagnose-tab-manager-issues.js.map