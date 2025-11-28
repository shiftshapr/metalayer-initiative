/**
 * Tab Display Component
 * Renders visible tabs in the main navigation bar with manage button
 */
import { Logger } from '../../utils/Logger.js';
export class TabDisplay {
    constructor(logger = Logger) {
        this.container = null;
        this.manageButton = null;
        this.container = null;
        this.manageButton = null;
        this.logger = logger;
    }
    /**
     * Initialize tab display
     */
    initialize(containerSelector) {
        const selector = containerSelector || '.sidebar-nav-main';
        this.container = document.querySelector(selector);
        if (!this.container) {
            this.logger.error?.('❌ TabDisplay: Container not found: ' + selector);
            return;
        }
        this.logger.debug?.('✅ TabDisplay: Initialized');
    }
    /**
     * Render tabs based on configuration
     */
    render(tabs, currentTab) {
        if (!this.container) {
            this.logger.error?.('❌ TabDisplay: Container not initialized');
            return;
        }
        // Clear existing tabs (but keep manage button and nav buttons if they exist)
        const existingTabs = this.container.querySelectorAll('.main-nav-tab:not(.manage-button):not(.tab-nav-button)');
        existingTabs.forEach(tab => tab.remove());
        // Render visible tabs
        tabs.forEach(tab => {
            const tabElement = this.createTabElement(tab, currentTab === tab.id);
            if (this.container && this.manageButton) {
                this.container.insertBefore(tabElement, this.manageButton);
            }
            else if (this.container) {
                this.container.appendChild(tabElement);
            }
        });
        // Ensure manage button exists
        if (!this.manageButton) {
            this.createManageButton();
        }
        this.logger.debug?.(`✅ TabDisplay: Rendered ${tabs.length} tabs`);
    }
    /**
     * Create a tab element
     */
    createTabElement(tab, isActive) {
        const button = document.createElement('button');
        button.className = 'main-nav-tab';
        button.setAttribute('data-tab', tab.id);
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', String(isActive));
        button.setAttribute('aria-controls', tab.tabContentId);
        button.setAttribute('aria-label', `${tab.label} tab${isActive ? ', active' : ''}`);
        if (isActive) {
            button.classList.add('active');
        }
        // Add icon if present
        if (tab.icon) {
            const iconSpan = document.createElement('span');
            iconSpan.className = 'tab-icon';
            iconSpan.textContent = tab.icon;
            button.appendChild(iconSpan);
        }
        // Add label
        const labelSpan = document.createElement('span');
        labelSpan.className = 'tab-label';
        labelSpan.textContent = tab.label;
        button.appendChild(labelSpan);
        // Add visual distinction for SDK apps
        if (!tab.builtIn) {
            button.classList.add('sdk-app-tab');
            if (tab.isDeveloperMode) {
                button.classList.add('developer-mode-tab');
            }
        }
        // Add click handler
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.onTabClick) {
                this.onTabClick(tab.id);
            }
        }, true);
        return button;
    }
    /**
     * Create manage button (now a true tab)
     */
    createManageButton() {
        if (!this.container)
            return;
        // Check if manage button already exists
        let existingManageButton = this.container.querySelector('[data-tab="manage-tab"]');
        if (!existingManageButton) {
            existingManageButton = this.container.querySelector('#tab-manager-button');
        }
        if (existingManageButton) {
            if (!existingManageButton.hasAttribute('data-tab')) {
                existingManageButton.setAttribute('data-tab', 'manage-tab');
            }
            if (!existingManageButton.hasAttribute('data-permanent')) {
                existingManageButton.setAttribute('data-permanent', 'true');
            }
            this.manageButton = existingManageButton;
            return;
        }
        const button = document.createElement('button');
        button.className = 'main-nav-tab manage-button';
        button.setAttribute('data-tab', 'manage-tab');
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', 'false');
        button.setAttribute('aria-controls', 'manage-tab');
        button.setAttribute('aria-label', 'Manage tabs');
        button.setAttribute('data-permanent', 'true');
        button.id = 'tab-manager-button';
        const labelSpan = document.createElement('span');
        labelSpan.className = 'tab-label';
        labelSpan.textContent = 'Manage';
        button.appendChild(labelSpan);
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.onTabClick) {
                this.onTabClick('manage-tab');
            }
        }, true);
        if (this.container) {
            this.container.appendChild(button);
        }
        this.manageButton = button;
    }
    /**
     * Set tab click handler
     */
    setTabClickHandler(handler) {
        this.onTabClick = handler;
    }
    /**
     * Set manage button click handler (no-op, kept for compatibility)
     */
    setManageClickHandler(_handler) {
        // Manage button is now handled via tab click handler
    }
    /**
     * Update active tab visual state
     */
    updateActiveTab(tabId) {
        if (!this.container)
            return;
        const allTabs = this.container.querySelectorAll('.main-nav-tab');
        allTabs.forEach(tab => {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
        });
        if (tabId) {
            const currentTab = this.container.querySelector(`[data-tab="${tabId}"]`);
            if (currentTab) {
                currentTab.classList.add('active');
                currentTab.setAttribute('aria-selected', 'true');
            }
        }
    }
}
