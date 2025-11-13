/**
 * Timeline Cache Manager
 * Manages caching of timeline data
 */

export class TimelineCache {
  constructor() {
    this.cache = new Map(); // userId -> { data, timestamp, ttl }
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
    this.maxCacheSize = 50; // Maximum number of cached timelines
  }

  /**
   * Get cached timeline
   */
  get(userId) {
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
  set(userId, data, ttl = this.defaultTTL) {
    // Enforce max cache size
    if (this.cache.size >= this.maxCacheSize) {
      this.evictOldest();
    }

    this.cache.set(userId, {
      data: JSON.parse(JSON.stringify(data)), // Deep copy
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Invalidate cache for user
   */
  invalidate(userId) {
    this.cache.delete(userId);
  }

  /**
   * Invalidate all cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Evict oldest cache entry
   */
  evictOldest() {
    let oldestKey = null;
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
  getStats() {
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

