/**
 * Right Sidebar Component (Column C)
 * Handles Search, Top Timelines, Top Posts, Top Canopies
 */
export declare class SidebarRight {
    private searchInput;
    private rewardsContainer;
    private topCanopiesContainer;
    private topTimelineContainer;
    private topPostsContainer;
    private topBridgersContainer;
    private getAuthHeaders;
    private onSearch;
    constructor(searchInputId: string, rewardsId: string, topCanopiesId: string, topTimelineId: string, topPostsId: string, topBridgersId: string, getAuthHeaders?: () => Record<string, string>, onSearch?: (query: string) => void);
    init(): Promise<void>;
    private loadRewards;
    private loadTopCanopies;
    private loadTopTimeline;
    private loadTopPosts;
    private renderRewards;
    private renderTopCanopies;
    private renderTopTimeline;
    private renderTopPosts;
    private loadTopBridgers;
    private renderTopBridgers;
    private escapeHtml;
}
//# sourceMappingURL=SidebarRight.d.ts.map