/**
 * Profile Selector Component
 * Handles profile search and selection
 */
export class ProfileSelector {
    constructor(modalElement, app) {
        if (!modalElement) {
            throw new Error('ProfileSelector: Modal element is required');
        }
        this.modal = modalElement;
        this.app = app;
        this.searchInput = modalElement.querySelector('#profile-search-input');
        this.resultsContainer = modalElement.querySelector('#profile-search-results');
        this.listeners = new Map();
    }
    show() {
        this.modal.classList.remove('hidden');
        this.searchInput.focus();
        this.setupEventListeners();
    }
    hide() {
        this.modal.classList.add('hidden');
        this.searchInput.value = '';
        this.resultsContainer.innerHTML = '';
    }
    setupEventListeners() {
        let searchTimeout = null;
        // Search input with debounce
        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
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
            const keyEvent = e;
            if (keyEvent.key === 'Escape') {
                this.hide();
            }
        });
    }
    async performSearch(query) {
        try {
            // Use TimelineQuery to search users
            const queryModule = this.app.query;
            const results = await queryModule.searchUsers(query);
            this.renderResults(results);
        }
        catch (error) {
            console.error('Profile search error:', error);
            this.resultsContainer.innerHTML = '<div class="search-error">Error searching users</div>';
        }
    }
    renderResults(results) {
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
                const userId = result.dataset.userId;
                const userHandle = result.dataset.userHandle;
                const identifier = userId || userHandle;
                this.emit('profile:selected', identifier);
            });
            // Keyboard support
            result.setAttribute('tabindex', '0');
            result.addEventListener('keydown', (e) => {
                const keyEvent = e;
                if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
                    e.preventDefault();
                    result.click();
                }
            });
        });
    }
    escapeHtml(text) {
        if (!text)
            return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    emit(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(cb => cb(data));
        }
    }
}
//# sourceMappingURL=ProfileSelector.js.map