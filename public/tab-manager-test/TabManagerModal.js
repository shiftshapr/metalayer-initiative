/**
 * Tab Manager Modal Component
 * Full sidebar modal for managing tabs (reorder, visibility, count, app store)
 */
import { Logger } from './utils/Logger.js';
export class TabManagerModal {
    constructor(logger = Logger) {
        this.modal = null;
        this.isOpen = false;
        this.logger = logger;
    }
    /**
     * Initialize modal (create DOM structure)
     */
    initialize() {
        this.createModalStructure();
        this.attachEventListeners();
        this.logger.debug?.('✅ TabManagerModal: Initialized');
    }
    /**
     * Create modal DOM structure
     */
    createModalStructure() {
        // Check if modal already exists
        this.modal = document.getElementById('tab-manager-modal');
        if (this.modal) {
            return;
        }
        // Create modal container
        this.modal = document.createElement('div');
        this.modal.id = 'tab-manager-modal';
        this.modal.className = 'tab-manager-modal';
        this.modal.setAttribute('role', 'dialog');
        this.modal.setAttribute('aria-labelledby', 'tab-manager-title');
        this.modal.setAttribute('aria-modal', 'true');
        this.modal.innerHTML = `
      <div class="tab-manager-modal-content">
        <div class="tab-manager-modal-header">
          <h2 id="tab-manager-title">Manage Tabs</h2>
          <button class="tab-manager-close" aria-label="Close tab manager">&times;</button>
        </div>
        <div class="tab-manager-modal-body">
          <!-- Tab Management Section -->
          <section class="tab-manager-section" id="tab-management-section">
            <h3>Tab Management</h3>
            <div class="tab-list" id="tab-list"></div>
          </section>

          <!-- Display Settings Section -->
          <section class="tab-manager-section" id="display-settings-section">
            <h3>Display Settings</h3>
            <div class="visible-tab-count-control">
              <label for="visible-tab-count">Show tabs:</label>
              <input type="number" id="visible-tab-count" min="1" max="10" value="7">
              <span class="tab-count-preview">(showing first 7 visible tabs)</span>
            </div>
          </section>

          <!-- App Store Section -->
          <section class="tab-manager-section" id="app-store-section">
            <h3>App Store</h3>
            <div class="app-store-filters">
              <input type="search" id="app-store-search" placeholder="Search apps...">
              <select id="app-store-category-filter">
                <option value="">All Categories</option>
              </select>
              <select id="app-store-sort">
                <option value="recent">Recently Added</option>
                <option value="popular">Most Popular</option>
                <option value="updated">Recently Updated</option>
                <option value="name">Name</option>
              </select>
            </div>
            <div class="app-store-list" id="app-store-list"></div>
          </section>
        </div>
      </div>
    `;
        document.body.appendChild(this.modal);
    }
    /**
     * Attach event listeners
     */
    attachEventListeners() {
        if (!this.modal)
            return;
        // Close button
        const closeButton = this.modal.querySelector('.tab-manager-close');
        closeButton?.addEventListener('click', () => this.close());
        // Click outside to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
        // Visible tab count input - use input event for real-time updates
        const countInput = this.modal.querySelector('#visible-tab-count');
        if (countInput) {
            countInput.addEventListener('input', (e) => {
                const count = parseInt(e.target.value, 10);
                if (!isNaN(count) && this.onVisibleTabCountChange) {
                    this.onVisibleTabCountChange(count);
                }
            });
            countInput.addEventListener('change', (e) => {
                const count = parseInt(e.target.value, 10);
                if (!isNaN(count) && this.onVisibleTabCountChange) {
                    this.onVisibleTabCountChange(count);
                }
            });
        }
    }
    /**
     * Open modal
     */
    open(visibleTabCount) {
        if (!this.modal) {
            this.initialize();
        }
        if (!this.modal)
            return;
        // Update visible tab count input if provided
        if (visibleTabCount !== undefined) {
            const countInput = this.modal.querySelector('#visible-tab-count');
            if (countInput) {
                countInput.value = String(visibleTabCount);
                // Update preview
                const preview = this.modal.querySelector('.tab-count-preview');
                if (preview) {
                    preview.textContent = `(showing first ${visibleTabCount} visible tabs)`;
                }
            }
        }
        this.modal.style.display = 'flex';
        this.isOpen = true;
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        this.logger.debug?.('✅ TabManagerModal: Opened');
    }
    /**
     * Close modal
     */
    close() {
        if (!this.modal)
            return;
        this.modal.style.display = 'none';
        this.isOpen = false;
        document.body.style.overflow = '';
        if (this.onClose) {
            this.onClose();
        }
        this.logger.debug?.('✅ TabManagerModal: Closed');
    }
    /**
     * Render tab list for reordering
     */
    renderTabList(tabs) {
        const tabList = this.modal?.querySelector('#tab-list');
        if (!tabList)
            return;
        tabList.innerHTML = '';
        // Sort tabs by order before rendering
        const sortedTabs = [...tabs].sort((a, b) => a.order - b.order);
        sortedTabs.forEach(tab => {
            const tabItem = this.createTabListItem(tab);
            tabList.appendChild(tabItem);
        });
        this.logger.debug?.(`✅ TabManagerModal: Rendered ${tabs.length} tabs in list`);
    }
    /**
     * Create tab list item for management
     */
    createTabListItem(tab) {
        const item = document.createElement('div');
        item.className = 'tab-list-item';
        item.setAttribute('data-tab-id', tab.id);
        item.draggable = true; // For drag-and-drop
        // Visual distinction
        if (tab.builtIn) {
            item.classList.add('built-in-tab');
        }
        else {
            item.classList.add('sdk-tab');
            if (tab.isDeveloperMode) {
                item.classList.add('developer-mode-tab');
            }
        }
        item.innerHTML = `
      <div class="tab-list-item-handle" aria-label="Drag to reorder">⋮⋮</div>
      <div class="tab-list-item-content">
        ${tab.icon ? `<span class="tab-icon">${tab.icon}</span>` : ''}
        <span class="tab-label">${tab.label}</span>
        ${tab.builtIn ? '<span class="tab-badge built-in-badge">Built-in</span>' : ''}
        ${!tab.builtIn ? '<span class="tab-badge sdk-badge">App Store</span>' : ''}
      </div>
      <label class="tab-visibility-toggle">
        <input type="checkbox" ${tab.visible ? 'checked' : ''} data-tab-id="${tab.id}">
        <span class="toggle-slider"></span>
      </label>
    `;
        // Visibility toggle handler
        const toggle = item.querySelector('input[type="checkbox"]');
        toggle?.addEventListener('change', (e) => {
            const visible = e.target.checked;
            if (this.onTabVisibilityChange) {
                this.onTabVisibilityChange(tab.id, visible);
            }
        });
        // Drag-and-drop handlers
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer?.setData('text/plain', tab.id);
            e.dataTransfer.effectAllowed = 'move';
            item.classList.add('dragging');
        });
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
        });
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            const dragging = document.querySelector('.tab-list-item.dragging');
            if (!dragging || dragging === item)
                return;
            const rect = item.getBoundingClientRect();
            const next = (e.clientY - rect.top) < (rect.height / 2);
            if (next) {
                item.parentNode?.insertBefore(dragging, item);
            }
            else {
                item.parentNode?.insertBefore(dragging, item.nextSibling);
            }
        });
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedId = e.dataTransfer?.getData('text/plain');
            if (!draggedId)
                return;
            const tabList = item.closest('.tab-list');
            if (!tabList)
                return;
            const items = Array.from(tabList.querySelectorAll('.tab-list-item'));
            const newOrder = items.findIndex(i => i === item);
            if (newOrder >= 0 && this.onTabOrderChange) {
                this.onTabOrderChange(draggedId, newOrder);
            }
        });
        return item;
    }
    /**
     * Render app store list
     */
    renderAppStore(apps, filters) {
        const appList = this.modal?.querySelector('#app-store-list');
        if (!appList)
            return;
        // TODO: Apply filters (Phase 3)
        // TODO: Implement search (Phase 3)
        appList.innerHTML = '';
        apps.forEach(app => {
            const appItem = this.createAppStoreItem(app);
            appList.appendChild(appItem);
        });
        this.logger.debug?.(`✅ TabManagerModal: Rendered ${apps.length} apps in store`);
    }
    /**
     * Create app store item
     */
    createAppStoreItem(app) {
        const item = document.createElement('div');
        item.className = 'app-store-item';
        item.setAttribute('data-app-id', app.id);
        const rating = app.rating ? app.rating.toFixed(1) : 'N/A';
        const reviewCount = app.reviewCount || 0;
        const verifiedBadge = app.digitalProvenance?.verified
            ? '<span class="provenance-badge verified">✓ Verified</span>'
            : '<span class="provenance-badge unverified">⚠ Unverified</span>';
        item.innerHTML = `
      <div class="app-store-item-header">
        ${app.icon ? `<img src="${app.icon}" alt="${app.name}" class="app-icon">` : ''}
        <div class="app-info">
          <h4>${app.name}</h4>
          <p class="app-developer">by ${app.developer}</p>
          <div class="app-rating">
            <span class="stars">${this.renderStars(app.rating || 0)}</span>
            <span class="rating-text">${rating} (${reviewCount} reviews)</span>
          </div>
        </div>
        ${verifiedBadge}
      </div>
      <p class="app-description">${app.description}</p>
      <div class="app-store-item-actions">
        <button class="app-install-btn" data-app-id="${app.id}">
          ${app.installed ? 'Uninstall' : 'Install'}
        </button>
        <button class="app-details-btn" data-app-id="${app.id}">Details</button>
      </div>
    `;
        return item;
    }
    /**
     * Render star rating
     */
    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        return '★'.repeat(fullStars) +
            (hasHalfStar ? '½' : '') +
            '☆'.repeat(emptyStars);
    }
    /**
     * Set event handlers
     */
    setOnClose(handler) {
        this.onClose = handler;
    }
    setOnTabOrderChange(handler) {
        this.onTabOrderChange = handler;
    }
    setOnTabVisibilityChange(handler) {
        this.onTabVisibilityChange = handler;
    }
    setOnVisibleTabCountChange(handler) {
        this.onVisibleTabCountChange = handler;
    }
    /**
     * Check if modal is open
     */
    getIsOpen() {
        return this.isOpen;
    }
    /**
     * Get modal element (for internal use)
     */
    getModal() {
        return this.modal;
    }
}
