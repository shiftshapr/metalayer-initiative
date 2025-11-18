/**
 * Timeline Cache Manager
 * Manages caching of timeline data
 */
import type { TimelineData } from '../types';
export declare class TimelineCache {
    private cache;
    private defaultTTL;
    private maxCacheSize;
    constructor();
    /**
     * Get cached timeline
     */
    get(userId: string): TimelineData | null;
    /**
     * Set cached timeline
     */
    set(userId: string, data: TimelineData, ttl?: number): void;
    /**
     * Invalidate cache for user
     */
    invalidate(userId: string): void;
    /**
     * Invalidate all cache
     */
    clear(): void;
    /**
     * Evict oldest cache entry
     */
    private evictOldest;
    /**
     * Get cache statistics
     */
    getStats(): {
        total: number;
        valid: number;
        expired: number;
    };
}
//# sourceMappingURL=TimelineCache.d.ts.map