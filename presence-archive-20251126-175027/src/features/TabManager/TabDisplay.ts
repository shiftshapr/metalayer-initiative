/**
 * Tab Display Component
 * Renders visible tabs in the main navigation bar with manage button
 */

import { TabConfig } from './types.js';
import { Logger } from '../../utils/Logger.js';

export class TabDisplay {
  private container: HTMLElement | null = null;
  private manageButton: HTMLElement | null = null;
  private logger: typeof Logger;
  private onTabClick?: (tabId: string) => void;
  // onManageClick removed - manage button is now a regular tab

  constructor(logger: typeof Logger = Logger) {
    this.logger = logger;
  }

  /**
   * Initialize tab display
   */
  initialize(containerSelector?: string): void {
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
  render(tabs: TabConfig[], currentTab: string | null): void {
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
      this.container?.insertBefore(tabElement, this.manageButton);
    });

    // Ensure manage button exists
    if (!this.manageButton) {
      this.createManageButton();
    }

    // TODO: Navigation buttons for tab scrolling (if needed in future)
    // this.createNavigationButtons();
    // this.updateNavigationButtons();

    this.logger.debug?.(`✅ TabDisplay: Rendered ${tabs.length} tabs`);
  }

  /**
   * Create a tab element
   */
  private createTabElement(tab: TabConfig, isActive: boolean): HTMLElement {
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

    // Add click handler - use capture phase to ensure it fires
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
   * ROOT CAUSE FIX: Ensure manage-tab is permanent (always far right, cannot move/remove)
   */
  private createManageButton(): void {
    if (!this.container) return;

    // ROOT CAUSE FIX: Check if manage button already exists to prevent duplicates
    // Check both by data-tab and by ID to handle legacy buttons
    let existingManageButton = this.container.querySelector('[data-tab="manage-tab"]') as HTMLElement;
    if (!existingManageButton) {
      existingManageButton = this.container.querySelector('#tab-manager-button') as HTMLElement;
    }
    if (existingManageButton) {
      // ROOT CAUSE FIX: Ensure existing button has all required attributes
      if (!existingManageButton.hasAttribute('data-tab')) {
        existingManageButton.setAttribute('data-tab', 'manage-tab');
        this.logger.debug?.('✅ TabDisplay: Added missing data-tab attribute to existing manage button');
      }
      if (!existingManageButton.hasAttribute('data-permanent')) {
        existingManageButton.setAttribute('data-permanent', 'true');
      }
      this.manageButton = existingManageButton;
      this.logger.debug?.('✅ TabDisplay: Manage button already exists, reusing');
      return;
    }

    const button = document.createElement('button');
    button.className = 'main-nav-tab manage-button';
    button.setAttribute('data-tab', 'manage-tab');
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', 'false');
    button.setAttribute('aria-controls', 'manage-tab');
    button.setAttribute('aria-label', 'Manage tabs');
    // ROOT CAUSE FIX: Add permanent attribute to prevent removal/movement
    button.setAttribute('data-permanent', 'true');
    button.id = 'tab-manager-button';
    
    // ROOT CAUSE FIX: Use same structure as other tabs (label span) for consistent text positioning
    // Direct textContent causes different baseline when font-weight changes to 700 (bold)
    const labelSpan = document.createElement('span');
    labelSpan.className = 'tab-label';
    labelSpan.textContent = 'Manage';
    button.appendChild(labelSpan);

    // Treat as a regular tab - use tab click handler instead of manage click handler
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.onTabClick) {
        this.onTabClick('manage-tab');
      }
    }, true);

    // ROOT CAUSE FIX: Always append to end (far right) - CSS margin-left: auto will push it right
    this.container.appendChild(button);
    this.manageButton = button;
    this.logger.debug?.('✅ TabDisplay: Created manage button as permanent tab (far right)');
  }

  /**
   * Set tab click handler
   */
  setTabClickHandler(handler: (tabId: string) => void): void {
    this.onTabClick = handler;
  }

  /**
   * Set manage button click handler
   * NOTE: Manage button is now a regular tab, so this is no longer used
   * Kept for backward compatibility
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setManageClickHandler(_handler: () => void): void {
    // Manage button is now handled via tab click handler
  }

  /**
   * Update active tab visual state
   * ROOT CAUSE FIX: Ensure manage-tab selector line displays correctly
   */
  updateActiveTab(tabId: string | null): void {
    if (!this.container) return;

    // Remove active class from all tabs (including manage button)
    const allTabs = this.container.querySelectorAll('.main-nav-tab');
    allTabs.forEach(tab => {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
    });

    // Add active class to current tab (including manage-tab)
    if (tabId) {
      const currentTab = this.container.querySelector(`[data-tab="${tabId}"]`);
      if (currentTab) {
        currentTab.classList.add('active');
        currentTab.setAttribute('aria-selected', 'true');
        this.logger.debug?.(`✅ TabDisplay: Activated tab ${tabId} (selector line should be visible)`);
      } else {
        this.logger.warn?.(`⚠️ TabDisplay: Tab ${tabId} not found in container`);
      }
    }
  }
}

