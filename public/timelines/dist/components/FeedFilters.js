/**
 * Feed Filters Component
 * Handles filter buttons for Column B feed (My, Shared with Me, Communities, Rooms)
 */
import { MultiSelect } from '../utils/MultiSelect.js';
export class FeedFilters {
    constructor(container, getAuthHeaders, onFilterChange) {
        this.getAuthHeaders = null;
        this.communitiesMultiSelect = null;
        this.roomsMultiSelect = null;
        this.activeFilters = {
            following: false,
            my: true, // Default to My
            shared: false,
            communities: [],
            rooms: []
        };
        this.onFilterChange = null;
        if (!container) {
            throw new Error('FeedFilters: Container element is required');
        }
        this.container = container;
        this.getAuthHeaders = getAuthHeaders || null;
        this.onFilterChange = onFilterChange || null;
    }
    async render() {
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
        const communitiesContainer = this.container.querySelector('#communities-filter-container');
        const roomsContainer = this.container.querySelector('#rooms-filter-container');
        if (communitiesContainer && communities.length > 0) {
            const communityOptions = communities.map(comm => ({
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
            const roomOptions = rooms.map(room => ({
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
                const button = e.currentTarget;
                const filterType = button.getAttribute('data-filter');
                this.toggleFilter(filterType);
            });
        });
        // Update initial button states
        this.updateButtonStates();
    }
    async fetchCommunities() {
        try {
            const headers = {
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
        }
        catch (error) {
            console.warn('FeedFilters: Failed to fetch communities', error);
        }
        return [];
    }
    async fetchRooms() {
        try {
            const headers = {
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
        }
        catch (error) {
            console.warn('FeedFilters: Failed to fetch rooms', error);
        }
        return [];
    }
    toggleFilter(filterType) {
        // Toggle the filter state
        if (filterType === 'following') {
            this.activeFilters.following = !this.activeFilters.following;
        }
        else if (filterType === 'my') {
            this.activeFilters.my = !this.activeFilters.my;
        }
        else if (filterType === 'shared') {
            this.activeFilters.shared = !this.activeFilters.shared;
        }
        // Update button states
        this.updateButtonStates();
        // Trigger change
        this.handleFilterChange();
    }
    updateButtonStates() {
        const filterButtons = this.container.querySelectorAll('.feed-filter-btn');
        filterButtons.forEach(btn => {
            const filterType = btn.getAttribute('data-filter');
            let isActive = false;
            if (filterType === 'following') {
                isActive = this.activeFilters.following;
            }
            else if (filterType === 'my') {
                isActive = this.activeFilters.my;
            }
            else if (filterType === 'shared') {
                isActive = this.activeFilters.shared;
            }
            if (isActive) {
                btn.classList.add('active');
            }
            else {
                btn.classList.remove('active');
            }
        });
    }
    handleFilterChange() {
        if (this.onFilterChange) {
            const filters = {
                following: this.activeFilters.following,
                my: this.activeFilters.my,
                shared: this.activeFilters.shared,
                communities: this.communitiesMultiSelect?.getSelectedValues() || [],
                rooms: this.roomsMultiSelect?.getSelectedValues() || []
            };
            this.onFilterChange(filters);
        }
    }
    getCurrentFilters() {
        return {
            following: this.activeFilters.following,
            my: this.activeFilters.my,
            shared: this.activeFilters.shared,
            communities: this.communitiesMultiSelect?.getSelectedValues() || [],
            rooms: this.roomsMultiSelect?.getSelectedValues() || []
        };
    }
}
//# sourceMappingURL=FeedFilters.js.map