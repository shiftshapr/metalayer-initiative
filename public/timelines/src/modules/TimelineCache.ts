/**
 * Timeline Cache Manager
 * Manages caching of timeline data
 */

import type { TimelineData } from '../types';

interface CachedTimelineEntry {
  data: TimelineData;
  timestamp: number;
  ttl: number;
  expiresAt: number;
}

export class TimelineCache {
  private cache: Map<string, CachedTimelineEntry>;
  private defaultTTL: number;
  private maxCacheSize: number;

  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
    this.maxCacheSize = 50; // Maximum number of cached timelines
  }

  /**
   * Get cached timeline
   */
  get(userId: string): TimelineData | null {
    const cached = this.cache.get(userId);
    if (!cached) {
      return null;
    }

    const age = Date.now() - cached.timestamp;
    if (age > cached.ttl) {
      // Cache expired
      this.cache.delete(userId);
      return null;
    }

    // Return deep copy to prevent mutation
    return JSON.parse(JSON.stringify(cached.data));
  }

  /**
   * Set cached timeline
   */
  set(userId: string, data: TimelineData, ttl: number = this.defaultTTL): void {
    // Enforce max cache size
    if (this.cache.size >= this.maxCacheSize) {
      this.evictOldest();
    }

    this.cache.set(userId, {
      data: JSON.parse(JSON.stringify(data)), // Deep copy
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
      ttl
    });
  }

  /**
   * Invalidate cache for user
   */
  invalidate(userId: string): void {
    this.cache.delete(userId);
  }

  /**
   * Invalidate all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Evict oldest cache entry
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, value] of this.cache.entries()) {
      if (value.timestamp < oldestTime) {
        oldestTime = value.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { total: number; valid: number; expired: number } {
    const now = Date.now();
    let valid = 0;
    let expired = 0;

    for (const value of this.cache.values()) {
      const age = now - value.timestamp;
      if (age > value.ttl) {
        expired++;
      } else {
        valid++;
      }
    }

    return {
      total: this.cache.size,
      valid,
      expired
    };
  }
}

