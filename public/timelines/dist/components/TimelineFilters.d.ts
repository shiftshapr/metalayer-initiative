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
    constructor(container: HTMLElement | null, timelineManager: TimelineManager);
    render(communities?: Community[]): void;
    private setupEventListeners;
    private applyFilters;
    private escapeHtml;
}
export {};
//# sourceMappingURL=TimelineFilters.d.ts.map