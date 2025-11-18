/**
 * Timeline Filters Component
 * Handles filter controls
 */
export class TimelineFilters {
    constructor(container, timelineManager) {
        if (!container) {
            throw new Error('TimelineFilters: Container element is required');
        }
        this.container = container;
        this.timelineManager = timelineManager;
    }
    render(communities = []) {
        const activityTypes = [
            { value: 'message', label: 'Messages' },
            { value: 'reaction', label: 'Reactions' },
            { value: 'bookmark', label: 'Bookmarks' },
            { value: 'profileUpdate', label: 'Profile Updates' },
            { value: 'communityJoin', label: 'Community Joins' },
            { value: 'statusChange', label: 'Status Changes' },
            { value: 'auraChange', label: 'Aura Changes' }
        ];
        const communitiesHtml = communities.map(comm => `<option value="${comm.id}">${this.escapeHtml(comm.name || comm.id)}</option>`).join('');
        const activityTypesHtml = activityTypes.map(type => `<option value="${type.value}">${type.label}</option>`).join('');
        this.container.innerHTML = `
      <div class="filter-group">
        <input type="text" id="search-filter" placeholder="Search timeline..." class="input-field">
        <select id="community-filter" class="select-input">
          <option value="">All Communities</option>
          ${communitiesHtml}
        </select>
        <select id="activity-type-filter" class="select-input" multiple>
          ${activityTypesHtml}
        </select>
        <button id="clear-filters" class="btn-secondary">Clear Filters</button>
      </div>
    `;
        this.setupEventListeners();
    }
    setupEventListeners() {
        let searchTimeout = null;
        const searchInput = this.container.querySelector('#search-filter');
        const communityFilter = this.container.querySelector('#community-filter');
        const activityTypeFilter = this.container.querySelector('#activity-type-filter');
        const clearBtn = this.container.querySelector('#clear-filters');
        // Search with debounce
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                if (searchTimeout) {
                    clearTimeout(searchTimeout);
                }
                searchTimeout = setTimeout(() => {
                    this.applyFilters();
                }, 300);
            });
        }
        // Community filter
        if (communityFilter) {
            communityFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }
        // Activity type filter
        if (activityTypeFilter) {
            activityTypeFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }
        // Clear filters
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (searchInput)
                    searchInput.value = '';
                if (communityFilter)
                    communityFilter.value = '';
                if (activityTypeFilter) {
                    Array.from(activityTypeFilter.options).forEach(opt => opt.selected = false);
                }
                this.applyFilters();
            });
        }
    }
    applyFilters() {
        const searchInput = this.container.querySelector('#search-filter');
        const communityFilter = this.container.querySelector('#community-filter');
        const activityTypeFilter = this.container.querySelector('#activity-type-filter');
        const filters = {
            search: searchInput?.value.trim() || null,
            community: communityFilter?.value || null,
            activityTypes: Array.from(activityTypeFilter?.selectedOptions || [])
                .map(opt => opt.value)
        };
        // Emit filter change event
        if (this.timelineManager && typeof this.timelineManager.applyFilters === 'function') {
            this.timelineManager.applyFilters(filters);
        }
        // Dispatch custom event for app to handle
        document.dispatchEvent(new CustomEvent('timeline:filters:changed', {
            detail: filters
        }));
    }
    escapeHtml(text) {
        if (!text)
            return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
//# sourceMappingURL=TimelineFilters.js.map