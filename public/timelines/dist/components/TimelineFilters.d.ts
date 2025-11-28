/**
 * Timeline Filters Component
 * Handles filter controls
 */
import type { TimelineManager } from '../modules/TimelineManager';
interface Community {
    id: string;
    name?: string;
    [key: string]: any;
}
export declare class TimelineFilters {
    private container;
    private timelineManager;
    private communityMultiSelect;
    private activityTypeMultiSelect;
    private getAuthHeaders;
    constructor(container: HTMLElement | null, timelineManager: TimelineManager, getAuthHeaders?: () => Record<string, string>);
    render(communities?: Community[]): Promise<void>;
    private setupEventListeners;
    private applyFilters;
    private escapeHtml;
}
export {};
//# sourceMappingURL=TimelineFilters.d.ts.map