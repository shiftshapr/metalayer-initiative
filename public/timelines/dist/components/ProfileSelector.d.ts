/**
 * Profile Selector Component
 * Handles profile search and selection
 */
type TimelineApp = any;
export declare class ProfileSelector {
    private modal;
    private app;
    private searchInput;
    private resultsContainer;
    private listeners;
    constructor(modalElement: HTMLElement | null, app: TimelineApp);
    show(): void;
    hide(): void;
    private setupEventListeners;
    private performSearch;
    private renderResults;
    private escapeHtml;
    on(event: string, callback: (data: any) => void): void;
    private emit;
}
export {};
//# sourceMappingURL=ProfileSelector.d.ts.map