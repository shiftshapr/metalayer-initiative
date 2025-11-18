/**
 * Timeline View Component
 * Renders timeline display
 */
import type { TimelineData, Activity, TimelineViewOptions } from '../types';
import type { TimelineManager } from '../modules/TimelineManager';
export declare class TimelineView {
    private container;
    private timelineManager;
    constructor(container: HTMLElement | null, timelineManager: TimelineManager);
    render(timeline: TimelineData, options?: TimelineViewOptions): Promise<void>;
    renderActivity(activity: Activity): Promise<string | null>;
    private formatTimestamp;
    private getActivityIcon;
    private getStatusIcon;
    private getVisibilityBadge;
    private escapeHtml;
    private renderEmpty;
    private setupEventListeners;
    private handleActivityClick;
}
//# sourceMappingURL=TimelineView.d.ts.map