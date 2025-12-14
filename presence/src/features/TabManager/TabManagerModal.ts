/**
 * Tab Manager Modal Component
 * Full sidebar modal for managing tabs (reorder, visibility, count, app store)
 */

import { createEventListenerManager } from '../../utils/EventListenerManager.js';
import { TabConfig } from '../../types/index.js';
import { SDKApp, AppStoreFilters } from './AppStoreIntegration.js';
import { Logger } from '../../utils/Logger.js';

export class TabManagerModal {
  private modal: HTMLElement | null = null;
  private isOpen: boolean = false;
  private logger: typeof Logger;
  private eventManager = createEventListenerManager();
  private onClose?: () => void;
  private onTabOrderChange?: (tabId: string, newOrder: number) => void;
  private onTabVisibilityChange?: (tabId: string, visible: boolean) => void;
  private onVisibleTabCountChange?: (count: number) => void;
  private onTabClick?: (tabId: string) => void;

  constructor(logger: typeof Logger = Logger) {
    this.logger = logger;
  }

  /**
   * Initialize modal (create DOM structure)
   * ROOT CAUSE FIX: Ensure manage-tab content exists before creating modal
   */
  initialize(): void {
    // ROOT CAUSE FIX: Ensure manage-tab content exists in HTML
    this.ensureManageTabContentExists();
    this.createModalStructure();
    this.attachEventListeners();
    this.logger.debug?.('✅ TabManagerModal: Initialized');
  }

  /**
   * Ensure manage-tab content exists in DOM
   * ROOT CAUSE FIX: Create manage-tab content if it doesn't exist
   */
  private ensureManageTabContentExists(): void {
    let manageTabContent = document.getElementById('manage-tab');
    if (!manageTabContent) {
      // Create manage-tab content if it doesn't exist
      const sidebarContent = document.querySelector('.sidebar-content');
      if (sidebarContent) {
        manageTabContent = document.createElement('div');
        manageTabContent.id = 'manage-tab';
        manageTabContent.className = 'main-tab-content';
        sidebarContent.appendChild(manageTabContent);
        this.logger.debug?.('✅ TabManagerModal: Created manage-tab content div');
      } else {
        this.logger.error?.('❌ TabManagerModal: Cannot find .sidebar-content container');
      }
    }
  }

  /**
   * Create modal DOM structure (now renders inside manage-tab content)
   */
  private createModalStructure(): void {
    // Check if modal already exists
    this.modal = document.getElementById('tab-manager-modal');
    if (this.modal) {
      return;
    }

    // Find or create manage-tab content container
    let manageTabContent = document.getElementById('manage-tab');
    if (!manageTabContent) {
      // Create manage-tab content if it doesn't exist
      const sidebarContent = document.querySelector('.sidebar-content');
      if (sidebarContent) {
        manageTabContent = document.createElement('div');
        manageTabContent.id = 'manage-tab';
        manageTabContent.className = 'main-tab-content';
        sidebarContent.appendChild(manageTabContent);
      } else {
        this.logger.error?.('❌ TabManagerModal: Cannot find .sidebar-content container');
        return;
      }
    }

    // Create modal container (now as tab content, not overlay)
    this.modal = document.createElement('div');
    this.modal.id = 'tab-manager-modal';
    this.modal.className = 'tab-manager-content';
    this.modal.setAttribute('role', 'region');
    this.modal.setAttribute('aria-labelledby', 'tab-manager-title');

    // SECURITY: Build modal structure with DOM manipulation
    const wrapper = document.createElement('div');
    wrapper.className = 'tab-manager-content-wrapper';

    const body = document.createElement('div');
    body.className = 'tab-manager-body';

    // Tab Management Section
    const tabSection = document.createElement('section');
    tabSection.className = 'tab-manager-section';
    tabSection.id = 'tab-management-section';

    const tabList = document.createElement('div');
    tabList.className = 'tab-list';
    tabList.id = 'tab-list';
    tabSection.appendChild(tabList);
    body.appendChild(tabSection);

    // Display Settings Section
    const displaySection = document.createElement('section');
    displaySection.className = 'tab-manager-section';
    displaySection.id = 'display-settings-section';

    const countControl = document.createElement('div');
    countControl.className = 'visible-tab-count-control';

    const countLabel = document.createElement('label');
    countLabel.setAttribute('for', 'visible-tab-count');
    countLabel.textContent = 'Max # of visible tabs:';

    const countInput = document.createElement('input');
    countInput.type = 'number';
    countInput.id = 'visible-tab-count';
    countInput.min = '1';
    countInput.max = '10';
    countInput.value = '7';
    countInput.style.textAlign = 'right';

    countControl.appendChild(countLabel);
    countControl.appendChild(countInput);
    displaySection.appendChild(countControl);
    body.appendChild(displaySection);

    // App Store Section
    const appStoreSection = document.createElement('section');
    appStoreSection.className = 'tab-manager-section';
    appStoreSection.id = 'app-store-section';

    const appStoreH3 = document.createElement('h3');
    appStoreH3.textContent = 'App Store';
    appStoreSection.appendChild(appStoreH3);

    const filters = document.createElement('div');
    filters.className = 'app-store-filters';

    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.id = 'app-store-search';
    searchInput.placeholder = 'Search apps...';
    filters.appendChild(searchInput);

    const categorySelect = document.createElement('select');
    categorySelect.id = 'app-store-category-filter';
    const allCategoriesOption = document.createElement('option');
    allCategoriesOption.value = '';
    allCategoriesOption.textContent = 'All Categories';
    categorySelect.appendChild(allCategoriesOption);
    filters.appendChild(categorySelect);

    const sortSelect = document.createElement('select');
    sortSelect.id = 'app-store-sort';
    const sortOptions = [
      { value: 'recent', text: 'Recently Added' },
      { value: 'popular', text: 'Most Popular' },
      { value: 'updated', text: 'Recently Updated' },
      { value: 'name', text: 'Name' },
    ];
    sortOptions.forEach(({ value, text }) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = text;
      sortSelect.appendChild(option);
    });
    filters.appendChild(sortSelect);

    appStoreSection.appendChild(filters);

    const appList = document.createElement('div');
    appList.className = 'app-store-list';
    appList.id = 'app-store-list';
    appStoreSection.appendChild(appList);

    body.appendChild(appStoreSection);
    wrapper.appendChild(body);
    this.modal.appendChild(wrapper);

    manageTabContent.appendChild(this.modal);
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    if (!this.modal) return;

    // No close button needed - tab switching handles visibility
    // ESC key to close removed - tab switching handles visibility

    // Visible tab count input - use input event for real-time updates
    const countInput = this.modal.querySelector('#visible-tab-count') as HTMLInputElement;
    if (countInput) {
      this.eventManager.on(countInput, 'input', (e) => {
        const count = parseInt((e.target as HTMLInputElement).value, 10);
        if (!isNaN(count) && this.onVisibleTabCountChange) {
          this.onVisibleTabCountChange(count);
        }
      });
      this.eventManager.on(countInput, 'change', (e) => {
        const count = parseInt((e.target as HTMLInputElement).value, 10);
        if (!isNaN(count) && this.onVisibleTabCountChange) {
          this.onVisibleTabCountChange(count);
        }
      });
    }
  }

  /**
   * Open/Show content (now part of tab, not modal overlay)
   */
  open(visibleTabCount?: number): void {
    if (!this.modal) {
      this.initialize();
    }
    if (!this.modal) return;

    // Update visible tab count input if provided
    if (visibleTabCount !== undefined) {
      const countInput = this.modal.querySelector('#visible-tab-count') as HTMLInputElement;
      if (countInput) {
        countInput.value = String(visibleTabCount);
      }
    }

    // Content is always visible when manage-tab is active (handled by tab switching)
    this.isOpen = true;

    this.logger.debug?.('✅ TabManagerModal: Content ready');
  }

  /**
   * Close/Hide content (now handled by tab switching)
   */
  /**
   * Cleanup event listeners
   */
  cleanup(): void {
    this.eventManager.cleanup();
  }

  close(): void {
    this.cleanup();
    if (!this.modal) return;

    this.isOpen = false;

    if (this.onClose) {
      this.onClose();
    }

    this.logger.debug?.('✅ TabManagerModal: Content hidden');
  }

  /**
   * Render tab list for reordering
   */
  renderTabList(tabs: TabConfig[], currentTabId?: string | null): void {
    const tabList = this.modal?.querySelector('#tab-list');
    if (!tabList) return;

    // SECURITY: Clear with DOM manipulation instead of innerHTML
    while (tabList.firstChild) {
      tabList.removeChild(tabList.firstChild);
    }

    // Filter out manage-tab (it should not appear in the management UI)
    const manageableTabs = tabs.filter((tab) => tab.id !== 'manage-tab');

    // Sort tabs by order before rendering
    const sortedTabs = [...manageableTabs].sort((a, b) => (a.order || 0) - (b.order || 0));

    sortedTabs.forEach((tab) => {
      const tabItem = this.createTabListItem(tab, currentTabId === tab.id);
      tabList.appendChild(tabItem);
    });

    this.logger.debug?.(
      `✅ TabManagerModal: Rendered ${sortedTabs.length} manageable tabs (excluded manage-tab)`
    );
  }

  /**
   * Create tab list item for management
   */
  private createTabListItem(tab: TabConfig, isCurrentTab: boolean = false): HTMLElement {
    const item = document.createElement('div');
    item.className = 'tab-list-item';
    item.setAttribute('data-tab-id', tab.id);
    item.draggable = true; // For drag-and-drop

    // Visual distinction
    if (tab.builtIn) {
      item.classList.add('built-in-tab');
    } else {
      item.classList.add('sdk-tab');
      if (tab.isDeveloperMode) {
        item.classList.add('developer-mode-tab');
      }
    }

    // Add active class if this is the current tab (selector line indicator)
    if (isCurrentTab) {
      item.classList.add('current-tab');
    }

    // SECURITY: Build tab list item with DOM manipulation
    const handle = document.createElement('div');
    handle.className = 'tab-list-item-handle';
    handle.setAttribute('aria-label', 'Drag to reorder');
    handle.textContent = '⋮⋮';

    const content = document.createElement('div');
    content.className = 'tab-list-item-content';

    if (tab.icon) {
      const iconSpan = document.createElement('span');
      iconSpan.className = 'tab-icon';
      iconSpan.textContent = tab.icon;
      content.appendChild(iconSpan);
    }

    const labelSpan = document.createElement('span');
    labelSpan.className = 'tab-label clickable-tab-label';
    labelSpan.setAttribute('data-tab-id', tab.id);
    labelSpan.setAttribute('role', 'button');
    labelSpan.setAttribute('tabindex', '0');
    labelSpan.setAttribute('aria-label', `Click to switch to ${tab.label} tab`);
    labelSpan.textContent = tab.label;
    content.appendChild(labelSpan);

    const badgeWrapper = document.createElement('span');
    badgeWrapper.className = 'tab-badge-wrapper';

    if (tab.builtIn) {
      const builtInBadge = document.createElement('span');
      builtInBadge.className = 'tab-badge built-in-badge';
      builtInBadge.textContent = 'Built-in';
      badgeWrapper.appendChild(builtInBadge);
    } else {
      const sdkBadge = document.createElement('span');
      sdkBadge.className = 'tab-badge sdk-badge';
      sdkBadge.textContent = 'App Store';
      badgeWrapper.appendChild(sdkBadge);
    }

    content.appendChild(badgeWrapper);

    const toggleLabel = document.createElement('label');
    toggleLabel.className = 'tab-visibility-toggle';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.setAttribute('data-tab-id', tab.id);
    if (tab.visible) {
      checkbox.checked = true;
    }

    const slider = document.createElement('span');
    slider.className = 'toggle-slider';

    toggleLabel.appendChild(checkbox);
    toggleLabel.appendChild(slider);

    item.appendChild(handle);
    item.appendChild(content);
    item.appendChild(toggleLabel);

    // Visibility toggle handler
    const toggle = item.querySelector('input[type="checkbox"]') as HTMLInputElement;
    if (toggle) {
      this.eventManager.on(toggle, 'change', (e) => {
        const visible = (e.target as HTMLInputElement).checked;
        if (this.onTabVisibilityChange) {
          this.onTabVisibilityChange(tab.id, visible);
        }
      });
    }

    // Tab label click handler (click-through to switch tabs)
    const tabLabel = item.querySelector('.clickable-tab-label') as HTMLElement;
    if (tabLabel) {
      const handleTabClick = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.onTabClick) {
          this.onTabClick(tab.id);
        }
      };

      this.eventManager.on(tabLabel, 'click', handleTabClick);
      this.eventManager.on(tabLabel, 'keydown', (e) => {
        const keyboardEvent = e as KeyboardEvent;
        if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
          keyboardEvent.preventDefault();
          handleTabClick(e);
        }
      });
    }

    // Drag-and-drop handlers
    this.eventManager.on(item, 'dragstart', (e) => {
      const dragEvent = e as DragEvent;
      if (!dragEvent.dataTransfer) {
        Logger.warn('⚠️ TAB_MANAGER: dataTransfer not available', null, 'tabs');
        return;
      }
      dragEvent.dataTransfer.setData('text/plain', tab.id);
      dragEvent.dataTransfer.effectAllowed = 'move';
      item.classList.add('dragging');
    });

    this.eventManager.on(item, 'dragend', () => {
      item.classList.remove('dragging');
    });

    this.eventManager.on(item, 'dragover', (e) => {
      const dragEvent = e as DragEvent;
      dragEvent.preventDefault();
      if (dragEvent.dataTransfer) {
        dragEvent.dataTransfer.dropEffect = 'move';
      }

      const dragging = document.querySelector('.tab-list-item.dragging');
      if (!dragging || dragging === item) return;

      const rect = item.getBoundingClientRect();
      const next = dragEvent.clientY - rect.top < rect.height / 2;

      if (next) {
        item.parentNode?.insertBefore(dragging, item);
      } else {
        item.parentNode?.insertBefore(dragging, item.nextSibling);
      }
    });

    this.eventManager.on(item, 'drop', (e) => {
      const dragEvent = e as DragEvent;
      dragEvent.preventDefault();
      const draggedId = dragEvent.dataTransfer?.getData('text/plain');
      if (!draggedId) return;

      const tabList = item.closest('.tab-list');
      if (!tabList) return;

      const items = Array.from(tabList.querySelectorAll('.tab-list-item'));
      const newOrder = items.findIndex((i) => i === item);

      if (newOrder >= 0 && this.onTabOrderChange) {
        this.onTabOrderChange(draggedId, newOrder);
      }
    });

    return item;
  }

  /**
   * Render app store list
   */
  renderAppStore(apps: SDKApp[], _filters?: AppStoreFilters): void {
    const appList = this.modal?.querySelector('#app-store-list');
    if (!appList) return;

    // TODO: Apply filters (Phase 3)
    // TODO: Implement search (Phase 3)

    // SECURITY: Clear with DOM manipulation instead of innerHTML
    while (appList.firstChild) {
      appList.removeChild(appList.firstChild);
    }

    apps.forEach((app) => {
      const appItem = this.createAppStoreItem(app);
      appList.appendChild(appItem);
    });

    this.logger.debug?.(`✅ TabManagerModal: Rendered ${apps.length} apps in store`);
  }

  /**
   * Create app store item
   */
  private createAppStoreItem(app: SDKApp): HTMLElement {
    const item = document.createElement('div');
    item.className = 'app-store-item';
    item.setAttribute('data-app-id', app.id);

    const rating = (typeof app.rating === 'number') ? app.rating.toFixed(1) : 'N/A';
    const reviewCount = app.reviewCount || 0;

    // SECURITY: Build app store item with DOM manipulation
    const header = document.createElement('div');
    header.className = 'app-store-item-header';

    if (app.icon && typeof app.icon === 'string') {
      const icon = document.createElement('img');
      icon.src = app.icon;
      icon.alt = app.name;
      icon.className = 'app-icon';
      header.appendChild(icon);
    }

    const appInfo = document.createElement('div');
    appInfo.className = 'app-info';

    const h4 = document.createElement('h4');
    h4.textContent = app.name;
    appInfo.appendChild(h4);

    const developerP = document.createElement('p');
    developerP.className = 'app-developer';
    developerP.textContent = `by ${app.developer}`;
    appInfo.appendChild(developerP);

    const ratingDiv = document.createElement('div');
    ratingDiv.className = 'app-rating';

    const starsSpan = document.createElement('span');
    starsSpan.className = 'stars';
    // SECURITY: Use template element to safely parse star rating HTML
    const starsHtml = this.renderStars(typeof app.rating === 'number' ? app.rating : 0);
    const starsTemplate = document.createElement('template');
    starsTemplate.innerHTML = starsHtml;
    starsSpan.appendChild(starsTemplate.content);

    const ratingTextSpan = document.createElement('span');
    ratingTextSpan.className = 'rating-text';
    ratingTextSpan.textContent = `${rating} (${reviewCount} reviews)`;

    ratingDiv.appendChild(starsSpan);
    ratingDiv.appendChild(ratingTextSpan);
    appInfo.appendChild(ratingDiv);

    header.appendChild(appInfo);

    const verifiedBadge = document.createElement('span');
    verifiedBadge.className = app.digitalProvenance?.verified
      ? 'provenance-badge verified'
      : 'provenance-badge unverified';
    verifiedBadge.textContent = app.digitalProvenance?.verified ? '✓ Verified' : '⚠ Unverified';
    header.appendChild(verifiedBadge);

    item.appendChild(header);

    const descriptionP = document.createElement('p');
    descriptionP.className = 'app-description';
    descriptionP.textContent = app.description || '';
    item.appendChild(descriptionP);

    const actions = document.createElement('div');
    actions.className = 'app-store-item-actions';

    const installBtn = document.createElement('button');
    installBtn.className = 'app-install-btn';
    installBtn.setAttribute('data-app-id', app.id);
    installBtn.textContent = app.installed ? 'Uninstall' : 'Install';
    actions.appendChild(installBtn);

    const detailsBtn = document.createElement('button');
    detailsBtn.className = 'app-details-btn';
    detailsBtn.setAttribute('data-app-id', app.id);
    detailsBtn.textContent = 'Details';
    actions.appendChild(detailsBtn);

    item.appendChild(actions);

    return item;
  }

  /**
   * Render star rating
   */
  private renderStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(emptyStars);
  }

  /**
   * Set event handlers
   */
  setOnClose(handler: () => void): void {
    this.onClose = handler;
  }

  setOnTabOrderChange(handler: (tabId: string, newOrder: number) => void): void {
    this.onTabOrderChange = handler;
  }

  setOnTabVisibilityChange(handler: (tabId: string, visible: boolean) => void): void {
    this.onTabVisibilityChange = handler;
  }

  setOnVisibleTabCountChange(handler: (count: number) => void): void {
    this.onVisibleTabCountChange = handler;
  }

  setOnTabClick(handler: (tabId: string) => void): void {
    this.onTabClick = handler;
  }

  /**
   * Check if modal is open
   */
  getIsOpen(): boolean {
    return this.isOpen;
  }

  /**
   * Get modal element (for internal use)
   */
  getModal(): HTMLElement | null {
    return this.modal;
  }
}
