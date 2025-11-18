/**
 * Profile Selector Component
 * Handles profile search and selection
 */

import type { User } from '../types';

// Type for TimelineApp (circular dependency handled via any)
type TimelineApp = any;

export class ProfileSelector {
  private modal: HTMLElement;
  private app: TimelineApp;
  private searchInput: HTMLInputElement;
  private resultsContainer: HTMLElement;
  private listeners: Map<string, Array<(data: any) => void>>;

  constructor(modalElement: HTMLElement | null, app: TimelineApp) {
    if (!modalElement) {
      throw new Error('ProfileSelector: Modal element is required');
    }
    this.modal = modalElement;
    this.app = app;
    this.searchInput = modalElement.querySelector('#profile-search-input') as HTMLInputElement;
    this.resultsContainer = modalElement.querySelector('#profile-search-results') as HTMLElement;
    this.listeners = new Map();
  }

  show(): void {
    this.modal.classList.remove('hidden');
    this.searchInput.focus();
    this.setupEventListeners();
  }

  hide(): void {
    this.modal.classList.add('hidden');
    this.searchInput.value = '';
    this.resultsContainer.innerHTML = '';
  }

  private setupEventListeners(): void {
    let searchTimeout: ReturnType<typeof setTimeout> | null = null;

    // Search input with debounce
    this.searchInput.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value.trim();
      
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      
      if (query.length < 2) {
        this.resultsContainer.innerHTML = '';
        return;
      }

      searchTimeout = setTimeout(async () => {
        await this.performSearch(query);
      }, 300);
    });

    // Cancel button
    const cancelBtn = this.modal.querySelector('#cancel-profile-select');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.hide();
      });
    }

    // Close on overlay click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });

    // Keyboard navigation
    this.searchInput.addEventListener('keydown', (e) => {
      const keyEvent = e as KeyboardEvent;
      if (keyEvent.key === 'Escape') {
        this.hide();
      }
    });
  }

  private async performSearch(query: string): Promise<void> {
    try {
      // Use TimelineQuery to search users
      const queryModule = this.app.query;
      const results = await queryModule.searchUsers(query);

      this.renderResults(results);
    } catch (error) {
      console.error('Profile search error:', error);
      this.resultsContainer.innerHTML = '<div class="search-error">Error searching users</div>';
    }
  }

  private renderResults(results: User[]): void {
    if (results.length === 0) {
      this.resultsContainer.innerHTML = '<div class="search-empty">No users found</div>';
      return;
    }

    const resultsHtml = results.map(user => {
      const avatarUrl = user.avatarUrl || '';
      const userName = user.name || user.handle || 'Unknown';
      const userHandle = user.handle || '';
      const userInitials = userName.charAt(0).toUpperCase();
      const userId = user.id || user.uuid || '';

      return `
        <div class="profile-search-result" data-user-id="${userId}" data-user-handle="${userHandle}">
          <div class="result-avatar">
            ${avatarUrl ? `<img src="${avatarUrl}" alt="${userName}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
            <div class="avatar-fallback" style="${avatarUrl ? 'display: none;' : 'display: flex;'}">${userInitials}</div>
          </div>
          <div class="result-info">
            <div class="result-name">${this.escapeHtml(userName)}</div>
            <div class="result-handle">@${this.escapeHtml(userHandle)}</div>
          </div>
        </div>
      `;
    }).join('');

    this.resultsContainer.innerHTML = resultsHtml;

    // Add click handlers
    this.resultsContainer.querySelectorAll('.profile-search-result').forEach(result => {
      result.addEventListener('click', () => {
        const userId = (result as HTMLElement).dataset.userId;
        const userHandle = (result as HTMLElement).dataset.userHandle;
        const identifier = userId || userHandle;
        this.emit('profile:selected', identifier);
      });

      // Keyboard support
      result.setAttribute('tabindex', '0');
      result.addEventListener('keydown', (e) => {
        const keyEvent = e as KeyboardEvent;
        if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
          e.preventDefault();
          (result as HTMLElement).click();
        }
      });
    });
  }

  private escapeHtml(text: string | null | undefined): string {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }
}

