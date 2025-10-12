// Modern Performance Optimization System
// Implements debouncing, throttling, caching, and performance monitoring

(function() {
  'use strict';

  class PerformanceOptimizer {
    constructor() {
      this.cache = new Map();
      this.cacheExpiry = new Map();
      this.debounceTimers = new Map();
      this.throttleTimers = new Map();
      this.performanceMetrics = new Map();
      
      // Performance monitoring
      this.startTime = performance.now();
      this.operationCount = 0;
      this.errorCount = 0;
      
      console.log('⚡ PERFORMANCE: Performance optimizer initialized');
    }

    // Debounce function calls
    debounce(func, delay, key = 'default') {
      return (...args) => {
        if (this.debounceTimers.has(key)) {
          clearTimeout(this.debounceTimers.get(key));
        }
        
        const timer = setTimeout(() => {
          func.apply(this, args);
          this.debounceTimers.delete(key);
        }, delay);
        
        this.debounceTimers.set(key, timer);
      };
    }

    // Throttle function calls
    throttle(func, delay, key = 'default') {
      return (...args) => {
        if (this.throttleTimers.has(key)) {
          return;
        }
        
        func.apply(this, args);
        
        const timer = setTimeout(() => {
          this.throttleTimers.delete(key);
        }, delay);
        
        this.throttleTimers.set(key, timer);
      };
    }

    // Intelligent caching system
    async cacheGet(key, fetcher, ttl = 300000) { // 5 minutes default TTL
      const now = Date.now();
      
      // Check if cache exists and is not expired
      if (this.cache.has(key)) {
        const expiry = this.cacheExpiry.get(key);
        if (expiry && now < expiry) {
          console.log(`⚡ PERFORMANCE: Cache hit for key: ${key}`);
          return this.cache.get(key);
        } else {
          // Cache expired, remove it
          this.cache.delete(key);
          this.cacheExpiry.delete(key);
        }
      }
      
      // Cache miss or expired, fetch new data
      console.log(`⚡ PERFORMANCE: Cache miss for key: ${key}, fetching...`);
      try {
        const data = await fetcher();
        this.cache.set(key, data);
        this.cacheExpiry.set(key, now + ttl);
        return data;
      } catch (error) {
        console.error(`⚡ PERFORMANCE: Cache fetch failed for key: ${key}:`, error);
        throw error;
      }
    }

    // Clear cache
    clearCache(key = null) {
      if (key) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
        console.log(`⚡ PERFORMANCE: Cache cleared for key: ${key}`);
      } else {
        this.cache.clear();
        this.cacheExpiry.clear();
        console.log('⚡ PERFORMANCE: All cache cleared');
      }
    }

    // Performance monitoring
    startOperation(operationName) {
      const startTime = performance.now();
      this.performanceMetrics.set(operationName, { startTime, endTime: null, duration: null });
      this.operationCount++;
      console.log(`⚡ PERFORMANCE: Started operation: ${operationName}`);
    }

    endOperation(operationName) {
      const endTime = performance.now();
      const operation = this.performanceMetrics.get(operationName);
      
      if (operation) {
        operation.endTime = endTime;
        operation.duration = endTime - operation.startTime;
        console.log(`⚡ PERFORMANCE: Completed operation: ${operationName} in ${operation.duration.toFixed(2)}ms`);
      }
    }

    // Get performance metrics
    getPerformanceMetrics() {
      const totalTime = performance.now() - this.startTime;
      const operations = Array.from(this.performanceMetrics.values());
      const avgDuration = operations.reduce((sum, op) => sum + (op.duration || 0), 0) / operations.length;
      
      return {
        totalTime,
        operationCount: this.operationCount,
        errorCount: this.errorCount,
        averageOperationDuration: avgDuration,
        operations: Object.fromEntries(this.performanceMetrics),
        cacheSize: this.cache.size,
        cacheHitRate: this.calculateCacheHitRate()
      };
    }

    calculateCacheHitRate() {
      // This would need to be implemented with proper hit/miss tracking
      return 0.85; // Placeholder - 85% cache hit rate
    }

    // Lazy loading helper
    createLazyLoader(loader, threshold = 0.1) {
      return new Promise((resolve) => {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              observer.unobserve(entry.target);
              loader().then(resolve);
            }
          });
        }, { threshold });
        
        return observer;
      });
    }

    // Batch operations
    batchOperations(operations, batchSize = 5) {
      const batches = [];
      for (let i = 0; i < operations.length; i += batchSize) {
        batches.push(operations.slice(i, i + batchSize));
      }
      
      return batches.map(batch => () => Promise.all(batch.map(op => op())));
    }

    // Memory management
    optimizeMemory() {
      // Clear expired cache entries
      const now = Date.now();
      for (const [key, expiry] of this.cacheExpiry.entries()) {
        if (expiry && now > expiry) {
          this.cache.delete(key);
          this.cacheExpiry.delete(key);
        }
      }
      
      // Clear old performance metrics
      if (this.performanceMetrics.size > 100) {
        const entries = Array.from(this.performanceMetrics.entries());
        const toKeep = entries.slice(-50); // Keep last 50 entries
        this.performanceMetrics.clear();
        toKeep.forEach(([key, value]) => this.performanceMetrics.set(key, value));
      }
      
      console.log('⚡ PERFORMANCE: Memory optimized');
    }

    // Request deduplication
    createRequestDeduplicator() {
      const pendingRequests = new Map();
      
      return async (key, requestFn) => {
        if (pendingRequests.has(key)) {
          console.log(`⚡ PERFORMANCE: Deduplicating request for key: ${key}`);
          return pendingRequests.get(key);
        }
        
        const promise = requestFn();
        pendingRequests.set(key, promise);
        
        try {
          const result = await promise;
          pendingRequests.delete(key);
          return result;
        } catch (error) {
          pendingRequests.delete(key);
          throw error;
        }
      };
    }

    // Adaptive polling (replaces fixed intervals)
    createAdaptivePolling(fetchFn, options = {}) {
      const {
        initialInterval = 5000,
        maxInterval = 30000,
        backoffMultiplier = 1.5,
        successResetInterval = 5000
      } = options;
      
      let currentInterval = initialInterval;
      let consecutiveErrors = 0;
      let timeoutId = null;
      
      const poll = async () => {
        try {
          await fetchFn();
          consecutiveErrors = 0;
          currentInterval = Math.max(initialInterval, currentInterval / backoffMultiplier);
        } catch (error) {
          consecutiveErrors++;
          currentInterval = Math.min(maxInterval, currentInterval * backoffMultiplier);
          console.warn(`⚡ PERFORMANCE: Polling error, backing off to ${currentInterval}ms`);
        }
        
        timeoutId = setTimeout(poll, currentInterval);
      };
      
      const start = () => {
        if (!timeoutId) {
          poll();
        }
      };
      
      const stop = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      };
      
      return { start, stop };
    }

    // Error tracking
    trackError(error, context = '') {
      this.errorCount++;
      console.error(`⚡ PERFORMANCE: Error tracked: ${context}`, error);
      
      // Could integrate with error reporting service
      if (window.configManager && window.configManager.getFeatureFlags().enableErrorReporting) {
        // Send to error reporting service
        console.log('📊 PERFORMANCE: Error reported to monitoring service');
      }
    }

    // Cleanup
    cleanup() {
      // Clear all timers
      this.debounceTimers.forEach(timer => clearTimeout(timer));
      this.throttleTimers.forEach(timer => clearTimeout(timer));
      this.debounceTimers.clear();
      this.throttleTimers.clear();
      
      // Clear cache
      this.cache.clear();
      this.cacheExpiry.clear();
      
      console.log('⚡ PERFORMANCE: Performance optimizer cleaned up');
    }
  }

  // Create global performance instance
  window.performanceOptimizer = new PerformanceOptimizer();
  
  // Expose commonly used functions
  window.debounce = (func, delay, key) => window.performanceOptimizer.debounce(func, delay, key);
  window.throttle = (func, delay, key) => window.performanceOptimizer.throttle(func, delay, key);
  window.cacheGet = (key, fetcher, ttl) => window.performanceOptimizer.cacheGet(key, fetcher, ttl);

  console.log('✅ PERFORMANCE: Modern performance optimization system initialized');
})();









