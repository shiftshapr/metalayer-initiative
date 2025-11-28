/**
 * Unified Top Display Component
 * Displays top items (Posts, Canopies, etc.) with configurable algorithm
 */

export interface TopDisplayItem {
  id: string;
  title: string;
  subtitle?: string;
  metadata?: string;
  [key: string]: any;
}

export interface TopDisplayConfig {
  algorithm: 'simple' | 'engagement' | 'recent' | 'custom';
  limit: number;
  showMetadata?: boolean;
}

export class TopDisplay {
  private container: HTMLElement;
  private config: TopDisplayConfig;
  private getAuthHeaders: (() => Record<string, string>) | null = null;
  private apiEndpoint: string;
  private onItemClick?: (item: TopDisplayItem) => void;

  constructor(
    container: HTMLElement | null,
    apiEndpoint: string,
    config: TopDisplayConfig,
    getAuthHeaders?: () => Record<string, string>,
    onItemClick?: (item: TopDisplayItem) => void
  ) {
    if (!container) {
      throw new Error('TopDisplay: Container element is required');
    }
    this.container = container;
    this.apiEndpoint = apiEndpoint;
    this.config = config;
    this.getAuthHeaders = getAuthHeaders || null;
    this.onItemClick = onItemClick;
  }

  async load(): Promise<void> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (this.getAuthHeaders) {
        Object.assign(headers, this.getAuthHeaders());
      }

      const url = `${this.apiEndpoint}?algorithm=${this.config.algorithm}&limit=${this.config.limit}`;
      const response = await fetch(url, { headers });
      
      if (response.ok) {
        const data = await response.json();
        const items: TopDisplayItem[] = data.items || data.posts || data.canopies || [];
        this.render(items);
      } else {
        this.renderEmpty('Failed to load');
      }
    } catch (error) {
      console.warn(`TopDisplay: Failed to load from ${this.apiEndpoint}`, error);
      this.renderEmpty('Failed to load');
    }
  }

  private render(items: TopDisplayItem[]): void {
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

  private renderEmpty(message: string): void {
    this.container.innerHTML = `<div class="loading-state">${message}</div>`;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  updateConfig(config: Partial<TopDisplayConfig>): void {
    this.config = { ...this.config, ...config };
  }

  async refresh(): Promise<void> {
    await this.load();
  }
}


