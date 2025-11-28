/**
 * Unified Top Display Component
 * Displays top items (Posts, Canopies, etc.) with configurable algorithm
 */
export interface TopDisplayItem {
    id: string;
    title: string;
    subtitle?: string;
    metadata?: string;
    [key: string]: any;
}
export interface TopDisplayConfig {
    algorithm: 'simple' | 'engagement' | 'recent' | 'custom';
    limit: number;
    showMetadata?: boolean;
}
export declare class TopDisplay {
    private container;
    private config;
    private getAuthHeaders;
    private apiEndpoint;
    private onItemClick?;
    constructor(container: HTMLElement | null, apiEndpoint: string, config: TopDisplayConfig, getAuthHeaders?: () => Record<string, string>, onItemClick?: (item: TopDisplayItem) => void);
    load(): Promise<void>;
    private render;
    private renderEmpty;
    private escapeHtml;
    updateConfig(config: Partial<TopDisplayConfig>): void;
    refresh(): Promise<void>;
}
//# sourceMappingURL=TopDisplay.d.ts.map