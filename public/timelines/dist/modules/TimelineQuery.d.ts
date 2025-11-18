/**
 * Timeline Query Builder
 * Handles API requests for timeline data
 */
import type { TimelineQueryOptions, TimelineApiResponse, MultipleTimelinesApiResponse, User } from '../types';
export declare class TimelineQuery {
    private baseUrl;
    constructor(baseUrl?: string);
    /**
     * Build query parameters from options
     */
    buildQueryParams(options: TimelineQueryOptions): string;
    /**
     * Get authentication headers
     */
    getAuthHeaders(): Record<string, string>;
    /**
     * Get current user ID
     */
    getCurrentUserId(): string | null;
    /**
     * Get current user email
     */
    getCurrentUserEmail(): string | null;
    /**
     * Get current user name
     */
    getCurrentUserName(): string | null;
    /**
     * Get current user avatar
     */
    getCurrentUserAvatar(): string | null;
    /**
     * Fetch timeline for a user
     */
    getTimeline(identifier: string, options?: TimelineQueryOptions): Promise<TimelineApiResponse>;
    /**
     * Fetch multiple timelines (multi-profile view)
     */
    getMultipleTimelines(userIds: string[], options?: TimelineQueryOptions): Promise<MultipleTimelinesApiResponse>;
    /**
     * Search for users by username or UUID
     */
    searchUsers(query: string): Promise<User[]>;
}
//# sourceMappingURL=TimelineQuery.d.ts.map