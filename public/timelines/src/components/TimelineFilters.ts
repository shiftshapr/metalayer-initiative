/**
 * Timeline Filters Component
 * Handles filter controls
 */

import type { ActivityType } from '../types';
import type { TimelineManager } from '../modules/TimelineManager';
import { MultiSelect, type MultiSelectOption } from '../utils/MultiSelect.js';

interface Community {
  id: string;
  name?: string;
  [key: string]: any;
}

interface FilterValues {
  search: string | null;
  communities: string[];  // Changed to array for multi-select
  activityTypes: ActivityType[];
}

export class TimelineFilters {
  private container: HTMLElement;
  private timelineManager: TimelineManager;
  private communityMultiSelect: MultiSelect | null = null;
  private activityTypeMultiSelect: MultiSelect | null = null;
  private getAuthHeaders: (() => Record<string, string>) | null = null;

  constructor(container: HTMLElement | null, timelineManager: TimelineManager, getAuthHeaders?: () => Record<string, string>) {
    if (!container) {
      throw new Error('TimelineFilters: Container element is required');
    }
    this.container = container;
    this.timelineManager = timelineManager;
    this.getAuthHeaders = getAuthHeaders || null;
  }

  async render(communities: Community[] = []): Promise<void> {
    // Fetch communities from API if not provided
    if (communities.length === 0) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        
        // Add auth headers if available
        if (this.getAuthHeaders) {
          Object.assign(headers, this.getAuthHeaders());
        }
        
        const response = await fetch('/communities', {
          headers
        });
        if (response.ok) {
          const data = await response.json();
          communities = data.communities || data || [];
        }
      } catch (error) {
        console.warn('TimelineFilters: Failed to fetch communities', error);
        communities = [];
      }
    }

    const activityTypes: Array<{ value: ActivityType; label: string }> = [
      { value: 'message', label: 'Posts' },  // UI shows "Posts", database uses "message"
      { value: 'reaction', label: 'Reactions' },
      { value: 'bookmark', label: 'Bookmarks' },
      { value: 'profileUpdate', label: 'Profile Updates' },
      { value: 'communityJoin', label: 'Community Joins' },
      { value: 'statusChange', label: 'Status Changes' },
      { value: 'auraChange', label: 'Aura Changes' }
    ];

    // Convert communities to MultiSelect options
    const communityOptions: MultiSelectOption[] = communities.map(comm => ({
      value: comm.id,
      label: comm.name || comm.id
    }));

    // Convert activity types to MultiSelect options
    // Default to "Posts" (message) selected
    const activityTypeOptions: MultiSelectOption[] = activityTypes.map(type => ({
      value: type.value,
      label: type.label,
      selected: type.value === 'message'  // Default to Posts selected
    }));

    this.container.innerHTML = `
      <div class="filter-group">
        <input type="text" id="search-filter" placeholder="Search timeline..." class="input-field">
        <div id="community-filter-container"></div>
        <div id="activity-type-filter-container"></div>
        <button id="clear-filters" class="btn-secondary">Clear Filters</button>
      </div>
    `;

    // Initialize multi-selects
    const communityContainer = this.container.querySelector('#community-filter-container') as HTMLElement | null;
    const activityTypeContainer = this.container.querySelector('#activity-type-filter-container') as HTMLElement | null;

    if (communityContainer) {
      this.communityMultiSelect = new MultiSelect(communityContainer, communityOptions, {
        placeholder: 'All Communities',
        showCount: true
      });
      this.communityMultiSelect.render();
      communityContainer.addEventListener('multiselect:change', () => {
        this.applyFilters();
      });
    }

    if (activityTypeContainer) {
      this.activityTypeMultiSelect = new MultiSelect(activityTypeContainer, activityTypeOptions, {
        placeholder: 'All Activity Types',
        showCount: true
      });
      this.activityTypeMultiSelect.render();
      activityTypeContainer.addEventListener('multiselect:change', () => {
        this.applyFilters();
      });
    }

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    let searchTimeout: ReturnType<typeof setTimeout> | null = null;
    const searchInput = this.container.querySelector('#search-filter') as HTMLInputElement | null;
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

    // Clear filters
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (this.communityMultiSelect) {
          this.communityMultiSelect.setSelectedValues([]);
        }
        if (this.activityTypeMultiSelect) {
          this.activityTypeMultiSelect.setSelectedValues([]);
        }
        this.applyFilters();
      });
    }
  }

  private applyFilters(): void {
    const searchInput = this.container.querySelector('#search-filter') as HTMLInputElement | null;

    const filters: FilterValues = {
      search: searchInput?.value.trim() || null,
      communities: this.communityMultiSelect?.getSelectedValues() || [],
      activityTypes: (this.activityTypeMultiSelect?.getSelectedValues() || []) as ActivityType[]
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










