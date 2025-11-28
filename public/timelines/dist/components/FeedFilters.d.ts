/**
 * Feed Filters Component
 * Handles filter buttons for Column B feed (My, Shared with Me, Communities, Rooms)
 */
export type FeedFilterType = 'following' | 'my' | 'shared' | 'communities' | 'rooms';
export interface FeedFilterValues {
    following: boolean;
    my: boolean;
    shared: boolean;
    communities: string[];
    rooms: string[];
}
export declare class FeedFilters {
    private container;
    private getAuthHeaders;
    private communitiesMultiSelect;
    private roomsMultiSelect;
    private activeFilters;
    private onFilterChange;
    constructor(container: HTMLElement | null, getAuthHeaders?: () => Record<string, string>, onFilterChange?: (filters: FeedFilterValues) => void);
    render(): Promise<void>;
    private fetchCommunities;
    private fetchRooms;
    private toggleFilter;
    private updateButtonStates;
    private handleFilterChange;
    getCurrentFilters(): FeedFilterValues;
}
//# sourceMappingURL=FeedFilters.d.ts.map