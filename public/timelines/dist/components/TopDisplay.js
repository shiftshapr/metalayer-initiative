/**
 * Unified Top Display Component
 * Displays top items (Posts, Canopies, etc.) with configurable algorithm
 */
export class TopDisplay {
    constructor(container, apiEndpoint, config, getAuthHeaders, onItemClick) {
        this.getAuthHeaders = null;
        if (!container) {
            throw new Error('TopDisplay: Container element is required');
        }
        this.container = container;
        this.apiEndpoint = apiEndpoint;
        this.config = config;
        this.getAuthHeaders = getAuthHeaders || null;
        this.onItemClick = onItemClick;
    }
    async load() {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };
            if (this.getAuthHeaders) {
                Object.assign(headers, this.getAuthHeaders());
            }
            const url = `${this.apiEndpoint}?algorithm=${this.config.algorithm}&limit=${this.config.limit}`;
            const response = await fetch(url, { headers });
            if (response.ok) {
                const data = await response.json();
                const items = data.items || data.posts || data.canopies || [];
                this.render(items);
            }
            else {
                this.renderEmpty('Failed to load');
            }
        }
        catch (error) {
            console.warn(`TopDisplay: Failed to load from ${this.apiEndpoint}`, error);
            this.renderEmpty('Failed to load');
        }
    }
    render(items) {
        if (items.length === 0) {
            this.renderEmpty('No items available');
            return;
        }
        const html = items.map(item => `
      <div class="sidebar-item" data-item-id="${item.id}">
        <div class="sidebar-item-title">${this.escapeHtml(item.title)}</div>
        ${item.subtitle ? `<div class="sidebar-item-subtitle">${this.escapeHtml(item.subtitle)}</div>` : ''}
        ${item.metadata ? `<div class="sidebar-item-meta">${this.escapeHtml(item.metadata)}</div>` : ''}
      </div>
    `).join('');
        this.container.innerHTML = html;
        // Add click handlers
        this.container.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', () => {
                const itemId = item.getAttribute('data-item-id');
                if (itemId && this.onItemClick) {
                    const clickedItem = items.find(i => i.id === itemId);
                    if (clickedItem) {
                        this.onItemClick(clickedItem);
                    }
                }
            });
        });
    }
    renderEmpty(message) {
        this.container.innerHTML = `<div class="loading-state">${message}</div>`;
    }
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    async refresh() {
        await this.load();
    }
}
//# sourceMappingURL=TopDisplay.js.map