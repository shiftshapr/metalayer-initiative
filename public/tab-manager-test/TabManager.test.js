/**
 * Tab Manager Module - Test Suite
 * Run tests to verify functionality before integration
 */
import { getTabManager } from './TabManager.js';
import { TabConfiguration } from './TabConfiguration.js';
import { TabDisplay } from './TabDisplay.js';
import { TabManagerModal } from './TabManagerModal.js';
import { DEFAULT_TABS } from './types.js';
import { Logger } from './utils/Logger.js';
/**
 * Test utilities
 */
class TestUtils {
    static createMockDocument() {
        // Create a minimal DOM structure for testing
        const doc = document.implementation.createHTMLDocument('Test');
        // Create sidebar nav container
        const navContainer = doc.createElement('div');
        navContainer.className = 'sidebar-nav-main';
        doc.body.appendChild(navContainer);
        return doc;
    }
    static async clearStorage() {
        return new Promise((resolve) => {
            chrome.storage.local.remove(['tabManagerConfig'], () => {
                resolve();
            });
        });
    }
}
/**
 * Test Suite
 */
export class TabManagerTestSuite {
    constructor(logger = Logger) {
        this.results = [];
        this.logger = logger;
    }
    /**
     * Run all tests
     */
    async runAll() {
        console.log('🧪 Starting Tab Manager Test Suite...\n');
        await this.testTabConfiguration();
        await this.testTabDisplay();
        await this.testTabManagerModal();
        await this.testTabManager();
        await this.testCurrentPreviousTabTracking();
        this.printResults();
    }
    /**
     * Test TabConfiguration service
     */
    async testTabConfiguration() {
        console.log('📋 Testing TabConfiguration...');
        try {
            await TestUtils.clearStorage();
            const config = new TabConfiguration();
            await config.initialize();
            // Test initial state
            const state = config.getState();
            this.assert(state.tabs.length === 7, 'Should have 7 default tabs');
            this.assert(state.currentTab === 'discuss-tab', 'Current tab should be discuss-tab');
            this.assert(state.previousTab === null, 'Previous tab should be null at start');
            // Test tab switching
            await config.switchToTab('settings-tab');
            this.assert(config.getCurrentTab() === 'settings-tab', 'Current tab should be settings-tab');
            this.assert(config.getPreviousTab() === 'discuss-tab', 'Previous tab should be discuss-tab');
            // Test visibility
            await config.setTabVisibility('rooms-tab', false);
            const visibleTabs = config.getVisibleTabs();
            const roomsTab = visibleTabs.find(t => t.id === 'rooms-tab');
            this.assert(!roomsTab, 'Rooms tab should not be visible');
            // Test tab count
            await config.setVisibleTabCount(5);
            const limitedTabs = config.getVisibleTabs();
            this.assert(limitedTabs.length === 5, 'Should show only 5 tabs');
            // Test tab order
            await config.updateTabOrder('settings-tab', 0);
            const reorderedTabs = config.getTabs();
            this.assert(reorderedTabs[0].id === 'settings-tab', 'Settings should be first');
            console.log('✅ TabConfiguration tests passed\n');
        }
        catch (error) {
            this.recordFailure('TabConfiguration', error);
        }
    }
    /**
     * Test TabDisplay component
     */
    async testTabDisplay() {
        console.log('📺 Testing TabDisplay...');
        try {
            const display = new TabDisplay();
            // Create test container
            const container = document.createElement('div');
            container.className = 'sidebar-nav-main';
            document.body.appendChild(container);
            display.initialize('.sidebar-nav-main');
            let clickedTab = null;
            display.setTabClickHandler((tabId) => {
                clickedTab = tabId;
            });
            // Render tabs
            const tabs = DEFAULT_TABS.slice(0, 3);
            display.render(tabs, 'discuss-tab');
            // Check if tabs were rendered
            const renderedTabs = container.querySelectorAll('.main-nav-tab:not(.manage-button)');
            this.assert(renderedTabs.length === 3, 'Should render 3 tabs');
            // Check if manage button exists
            const manageButton = container.querySelector('.manage-button');
            this.assert(!!manageButton, 'Manage button should exist');
            // Test tab click
            const firstTab = renderedTabs[0];
            firstTab.click();
            this.assert(clickedTab === 'discuss-tab', 'Tab click should trigger handler');
            // Cleanup
            document.body.removeChild(container);
            console.log('✅ TabDisplay tests passed\n');
        }
        catch (error) {
            this.recordFailure('TabDisplay', error);
        }
    }
    /**
     * Test TabManagerModal component
     */
    async testTabManagerModal() {
        console.log('🪟 Testing TabManagerModal...');
        try {
            const modal = new TabManagerModal();
            modal.initialize();
            // Test modal creation
            const modalElement = document.getElementById('tab-manager-modal');
            this.assert(!!modalElement, 'Modal should be created');
            // Test open/close
            modal.open();
            this.assert(modal.getIsOpen() === true, 'Modal should be open');
            this.assert(modalElement?.style.display === 'flex', 'Modal should be visible');
            modal.close();
            this.assert(modal.getIsOpen() === false, 'Modal should be closed');
            this.assert(modalElement?.style.display === 'none', 'Modal should be hidden');
            // Test tab list rendering
            modal.open();
            modal.renderTabList(DEFAULT_TABS.slice(0, 3));
            const tabList = modalElement?.querySelector('#tab-list');
            const tabItems = tabList?.querySelectorAll('.tab-list-item');
            this.assert(tabItems?.length === 3, 'Should render 3 tab items');
            modal.close();
            console.log('✅ TabManagerModal tests passed\n');
        }
        catch (error) {
            this.recordFailure('TabManagerModal', error);
        }
    }
    /**
     * Test TabManager orchestrator
     */
    async testTabManager() {
        console.log('🎯 Testing TabManager...');
        try {
            await TestUtils.clearStorage();
            // Create test container
            const container = document.createElement('div');
            container.className = 'sidebar-nav-main';
            document.body.appendChild(container);
            const manager = getTabManager();
            await manager.initialize();
            // Test initialization
            this.assert(manager.getCurrentTab() === 'discuss-tab', 'Should initialize with discuss-tab');
            this.assert(manager.getPreviousTab() === null, 'Previous tab should be null');
            // Test tab switching
            const config = manager.getConfiguration();
            await config.switchToTab('settings-tab');
            this.assert(manager.getCurrentTab() === 'settings-tab', 'Current tab should update');
            this.assert(manager.getPreviousTab() === 'discuss-tab', 'Previous tab should update');
            // Cleanup
            document.body.removeChild(container);
            console.log('✅ TabManager tests passed\n');
        }
        catch (error) {
            this.recordFailure('TabManager', error);
        }
    }
    /**
     * Test currentTab/previousTab tracking
     */
    async testCurrentPreviousTabTracking() {
        console.log('🔄 Testing currentTab/previousTab tracking...');
        try {
            await TestUtils.clearStorage();
            const config = new TabConfiguration();
            await config.initialize();
            // Initial state
            this.assert(config.getCurrentTab() === 'discuss-tab', 'Initial currentTab should be discuss-tab');
            this.assert(config.getPreviousTab() === null, 'Initial previousTab should be null');
            // First switch
            await config.switchToTab('visibility-tab');
            this.assert(config.getCurrentTab() === 'visibility-tab', 'After switch 1: currentTab should be visibility-tab');
            this.assert(config.getPreviousTab() === 'discuss-tab', 'After switch 1: previousTab should be discuss-tab');
            // Second switch
            await config.switchToTab('settings-tab');
            this.assert(config.getCurrentTab() === 'settings-tab', 'After switch 2: currentTab should be settings-tab');
            this.assert(config.getPreviousTab() === 'visibility-tab', 'After switch 2: previousTab should be visibility-tab');
            // Third switch
            await config.switchToTab('people-tab');
            this.assert(config.getCurrentTab() === 'people-tab', 'After switch 3: currentTab should be people-tab');
            this.assert(config.getPreviousTab() === 'settings-tab', 'After switch 3: previousTab should be settings-tab');
            // Test persistence
            const config2 = new TabConfiguration();
            await config2.initialize();
            this.assert(config2.getCurrentTab() === 'people-tab', 'Persisted currentTab should be people-tab');
            this.assert(config2.getPreviousTab() === 'settings-tab', 'Persisted previousTab should be settings-tab');
            console.log('✅ currentTab/previousTab tracking tests passed\n');
        }
        catch (error) {
            this.recordFailure('CurrentPreviousTabTracking', error);
        }
    }
    /**
     * Assert helper
     */
    assert(condition, message) {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
    }
    /**
     * Record test result
     */
    recordFailure(test, error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.results.push({ test, passed: false, error: errorMessage });
        console.error(`❌ ${test} failed:`, errorMessage);
    }
    /**
     * Print test results
     */
    printResults() {
        console.log('\n📊 Test Results:');
        console.log('================');
        const passed = this.results.filter(r => r.passed).length;
        const failed = this.results.filter(r => !r.passed).length;
        if (failed === 0) {
            console.log(`✅ All tests passed! (${passed} tests)`);
        }
        else {
            console.log(`❌ ${failed} test(s) failed, ${passed} passed`);
            this.results.filter(r => !r.passed).forEach(r => {
                console.log(`  - ${r.test}: ${r.error}`);
            });
        }
    }
}
/**
 * Run tests if this file is executed directly
 */
if (typeof window !== 'undefined') {
    // Make test suite available globally for manual testing
    window.TabManagerTestSuite = TabManagerTestSuite;
    // Auto-run tests if in test mode
    if (window.location.search.includes('test=true')) {
        const suite = new TabManagerTestSuite();
        suite.runAll().catch(console.error);
    }
}
