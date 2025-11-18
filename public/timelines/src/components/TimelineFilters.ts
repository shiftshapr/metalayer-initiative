/**
 * Timeline Filters Component
 * Handles filter controls
 */

import type { ActivityType } from '../types';
import type { TimelineManager } from '../modules/TimelineManager';

interface Community {
  id: string;
  name?: string;
  [key: string]: any;
}

interface FilterValues {
  search: string | null;
  community: string | null;
  activityTypes: ActivityType[];
}

export class TimelineFilters {
  private container: HTMLElement;
  private timelineManager: TimelineManager;

  constructor(container: HTMLElement | null, timelineManager: TimelineManager) {
    if (!container) {
      throw new Error('TimelineFilters: Container element is required');
    }
    this.container = container;
    this.timelineManager = timelineManager;
  }

  render(communities: Community[] = []): void {
    const activityTypes: Array<{ value: ActivityType; label: string }> = [
      { value: 'message', label: 'Messages' },
      { value: 'reaction', label: 'Reactions' },
      { value: 'bookmark', label: 'Bookmarks' },
      { value: 'profileUpdate', label: 'Profile Updates' },
      { value: 'communityJoin', label: 'Community Joins' },
      { value: 'statusChange', label: 'Status Changes' },
      { value: 'auraChange', label: 'Aura Changes' }
    ];

    const communitiesHtml = communities.map(comm => 
      `<option value="${comm.id}">${this.escapeHtml(comm.name || comm.id)}</option>`
    ).join('');

    const activityTypesHtml = activityTypes.map(type =>
      `<option value="${type.value}">${type.label}</option>`
    ).join('');

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

  private setupEventListeners(): void {
    let searchTimeout: ReturnType<typeof setTimeout> | null = null;
    const searchInput = this.container.querySelector('#search-filter') as HTMLInputElement | null;
    const communityFilter = this.container.querySelector('#community-filter') as HTMLSelectElement | null;
    const activityTypeFilter = this.container.querySelector('#activity-type-filter') as HTMLSelectElement | null;
    const clearBtn = this.container.querySelector('#clear-filters') as HTMLButtonElement | null;

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
        if (searchInput) searchInput.value = '';
        if (communityFilter) communityFilter.value = '';
        if (activityTypeFilter) {
          Array.from(activityTypeFilter.options).forEach(opt => opt.selected = false);
        }
        this.applyFilters();
      });
    }
  }

  private applyFilters(): void {
    const searchInput = this.container.querySelector('#search-filter') as HTMLInputElement | null;
    const communityFilter = this.container.querySelector('#community-filter') as HTMLSelectElement | null;
    const activityTypeFilter = this.container.querySelector('#activity-type-filter') as HTMLSelectElement | null;

    const filters: FilterValues = {
      search: searchInput?.value.trim() || null,
      community: communityFilter?.value || null,
      activityTypes: Array.from(activityTypeFilter?.selectedOptions || [])
        .map(opt => opt.value as ActivityType)
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

  private escapeHtml(text: string | null | undefined): string {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}





