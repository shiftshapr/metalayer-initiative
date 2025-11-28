/**
 * Feed Filters Component
 * Handles filter buttons for Column B feed (My, Shared with Me, Communities, Rooms)
 */

import { MultiSelect, type MultiSelectOption } from '../utils/MultiSelect.js';

interface Community {
  id: string;
  name?: string;
  [key: string]: any;
}

interface Room {
  id: string;
  name?: string;
  [key: string]: any;
}

export type FeedFilterType = 'following' | 'my' | 'shared' | 'communities' | 'rooms';

export interface FeedFilterValues {
  following: boolean;
  my: boolean;
  shared: boolean;
  communities: string[];
  rooms: string[];
}

export class FeedFilters {
  private container: HTMLElement;
  private getAuthHeaders: (() => Record<string, string>) | null = null;
  private communitiesMultiSelect: MultiSelect | null = null;
  private roomsMultiSelect: MultiSelect | null = null;
  private activeFilters: FeedFilterValues = {
    following: false,
    my: true, // Default to My
    shared: false,
    communities: [],
    rooms: []
  };
  private onFilterChange: ((filters: FeedFilterValues) => void) | null = null;

  constructor(
    container: HTMLElement | null,
    getAuthHeaders?: () => Record<string, string>,
    onFilterChange?: (filters: FeedFilterValues) => void
  ) {
    if (!container) {
      throw new Error('FeedFilters: Container element is required');
    }
    this.container = container;
    this.getAuthHeaders = getAuthHeaders || null;
    this.onFilterChange = onFilterChange || null;
  }

  async render(): Promise<void> {
    // Fetch communities and rooms
    const [communities, rooms] = await Promise.all([
      this.fetchCommunities(),
      this.fetchRooms()
    ]);

    // Render filter buttons (not mutually exclusive)
    this.container.innerHTML = `
      <button class="feed-filter-btn" data-filter="following">Following</button>
      <button class="feed-filter-btn active" data-filter="my">My</button>
      <button class="feed-filter-btn" data-filter="shared">Shared with Me</button>
      <div id="communities-filter-container" class="feed-filter-multiselect"></div>
      <div id="rooms-filter-container" class="feed-filter-multiselect"></div>
    `;

    // Initialize multi-selects
    const communitiesContainer = this.container.querySelector('#communities-filter-container') as HTMLElement | null;
    const roomsContainer = this.container.querySelector('#rooms-filter-container') as HTMLElement | null;

    if (communitiesContainer && communities.length > 0) {
      const communityOptions: MultiSelectOption[] = communities.map(comm => ({
        value: comm.id,
        label: comm.name || comm.id
      }));

      this.communitiesMultiSelect = new MultiSelect(communitiesContainer, communityOptions, {
        placeholder: 'Communities',
        showCount: true
      });
      this.communitiesMultiSelect.render();
      
      communitiesContainer.addEventListener('multiselect:change', () => {
        this.handleFilterChange();
      });
    }

    if (roomsContainer && rooms.length > 0) {
      const roomOptions: MultiSelectOption[] = rooms.map(room => ({
        value: room.id,
        label: room.name || room.id
      }));

      this.roomsMultiSelect = new MultiSelect(roomsContainer, roomOptions, {
        placeholder: 'Rooms',
        showCount: true
      });
      this.roomsMultiSelect.render();
      
      roomsContainer.addEventListener('multiselect:change', () => {
        this.handleFilterChange();
      });
    }

    // Set up filter button click handlers (toggle, not mutually exclusive)
    const filterButtons = this.container.querySelectorAll('.feed-filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const button = e.currentTarget as HTMLElement;
        const filterType = button.getAttribute('data-filter') as FeedFilterType;
        this.toggleFilter(filterType);
      });
    });

    // Update initial button states
    this.updateButtonStates();
  }

  private async fetchCommunities(): Promise<Community[]> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (this.getAuthHeaders) {
        Object.assign(headers, this.getAuthHeaders());
      }
      
      const response = await fetch('/communities', { headers });
      if (response.ok) {
        const data = await response.json();
        return data.communities || data || [];
      }
    } catch (error) {
      console.warn('FeedFilters: Failed to fetch communities', error);
    }
    return [];
  }

  private async fetchRooms(): Promise<Room[]> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (this.getAuthHeaders) {
        Object.assign(headers, this.getAuthHeaders());
      }
      
      const response = await fetch('/api/rooms', { headers });
      if (response.ok) {
        const data = await response.json();
        return data.rooms || data || [];
      }
    } catch (error) {
      console.warn('FeedFilters: Failed to fetch rooms', error);
    }
    return [];
  }

  private toggleFilter(filterType: FeedFilterType): void {
    // Toggle the filter state
    if (filterType === 'following') {
      this.activeFilters.following = !this.activeFilters.following;
    } else if (filterType === 'my') {
      this.activeFilters.my = !this.activeFilters.my;
    } else if (filterType === 'shared') {
      this.activeFilters.shared = !this.activeFilters.shared;
    }
    
    // Update button states
    this.updateButtonStates();
    
    // Trigger change
    this.handleFilterChange();
  }

  private updateButtonStates(): void {
    const filterButtons = this.container.querySelectorAll('.feed-filter-btn');
    filterButtons.forEach(btn => {
      const filterType = btn.getAttribute('data-filter') as FeedFilterType;
      let isActive = false;
      
      if (filterType === 'following') {
        isActive = this.activeFilters.following;
      } else if (filterType === 'my') {
        isActive = this.activeFilters.my;
      } else if (filterType === 'shared') {
        isActive = this.activeFilters.shared;
      }
      
      if (isActive) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  private handleFilterChange(): void {
    if (this.onFilterChange) {
      const filters: FeedFilterValues = {
        following: this.activeFilters.following,
        my: this.activeFilters.my,
        shared: this.activeFilters.shared,
        communities: this.communitiesMultiSelect?.getSelectedValues() || [],
        rooms: this.roomsMultiSelect?.getSelectedValues() || []
      };
      this.onFilterChange(filters);
    }
  }

  getCurrentFilters(): FeedFilterValues {
    return {
      following: this.activeFilters.following,
      my: this.activeFilters.my,
      shared: this.activeFilters.shared,
      communities: this.communitiesMultiSelect?.getSelectedValues() || [],
      rooms: this.roomsMultiSelect?.getSelectedValues() || []
    };
  }
}

