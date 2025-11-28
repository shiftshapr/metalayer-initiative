/**
 * API RATE LIMITER
 * Prevents spamming Supabase API calls and monitors usage
 */

class APIRateLimiter {
  constructor() {
    this.callHistory = [];
    this.maxCallsPerMinute = 30; // Conservative limit
    this.maxCallsPerHour = 1000; // Conservative limit
    this.maxCallsPerDay = 10000; // Conservative limit
    this.retryDelay = 5000; // 5 seconds between retries
    this.lastCallTime = 0;
    this.isBlocked = false;
    this.blockUntil = 0;
    
    // API call counters
    this.counters = {
      total: 0,
      today: 0,
      thisHour: 0,
      thisMinute: 0,
      errors: 0,
      blocked: 0
    };
    
    console.log('🛡️ APIRateLimiter: Rate limiter initialized');
  }

  /**
   * Check if we can make an API call
   */
  canMakeCall() {
    const now = Date.now();
    
    // Check if we're currently blocked
    if (this.isBlocked && now < this.blockUntil) {
      this.counters.blocked++;
      console.warn(`⚠️ APIRateLimiter: API calls blocked until ${new Date(this.blockUntil).toLocaleTimeString()}`);
      return false;
    }
    
    // Reset block status if time has passed
    if (this.isBlocked && now >= this.blockUntil) {
      this.isBlocked = false;
      console.log('✅ APIRateLimiter: API block lifted');
    }
    
    // Clean old call history
    this.cleanCallHistory(now);
    
    // Check rate limits
    if (this.counters.thisMinute >= this.maxCallsPerMinute) {
      console.warn('⚠️ APIRateLimiter: Minute rate limit exceeded');
      return false;
    }
    
    if (this.counters.thisHour >= this.maxCallsPerHour) {
      console.warn('⚠️ APIRateLimiter: Hour rate limit exceeded');
      return false;
    }
    
    if (this.counters.today >= this.maxCallsPerDay) {
      console.warn('⚠️ APIRateLimiter: Daily rate limit exceeded');
      return false;
    }
    
    // Check minimum delay between calls
    if (now - this.lastCallTime < 100) { // Minimum 100ms between calls
      console.warn('⚠️ APIRateLimiter: Calls too frequent, throttling');
      return false;
    }
    
    return true;
  }

  /**
   * Record an API call
   */
  recordCall(success = true) {
    const now = Date.now();
    this.lastCallTime = now;
    
    // Update counters
    this.counters.total++;
    this.counters.today++;
    this.counters.thisHour++;
    this.counters.thisMinute++;
    
    if (!success) {
      this.counters.errors++;
    }
    
    // Record in history
    this.callHistory.push({
      timestamp: now,
      success: success
    });
    
    // Log usage every 10 calls
    if (this.counters.total % 10 === 0) {
      this.logUsage();
    }
  }

  /**
   * Block API calls for a period
   */
  blockCalls(durationMs) {
    this.isBlocked = true;
    this.blockUntil = Date.now() + durationMs;
    console.warn(`🚫 APIRateLimiter: API calls blocked for ${durationMs}ms`);
  }

  /**
   * Clean old call history
   */
  cleanCallHistory(now) {
    const oneMinuteAgo = now - 60000;
    const oneHourAgo = now - 3600000;
    const oneDayAgo = now - 86400000;
    
    // Remove old entries
    this.callHistory = this.callHistory.filter(call => call.timestamp > oneDayAgo);
    
    // Recalculate counters
    this.counters.thisMinute = this.callHistory.filter(call => call.timestamp > oneMinuteAgo).length;
    this.counters.thisHour = this.callHistory.filter(call => call.timestamp > oneHourAgo).length;
    this.counters.today = this.callHistory.length;
  }

  /**
   * Get current usage statistics
   */
  getUsageStats() {
    const now = Date.now();
    this.cleanCallHistory(now);
    
    return {
      total: this.counters.total,
      today: this.counters.today,
      thisHour: this.counters.thisHour,
      thisMinute: this.counters.thisMinute,
      errors: this.counters.errors,
      blocked: this.counters.blocked,
      isBlocked: this.isBlocked,
      blockUntil: this.blockUntil,
      limits: {
        perMinute: this.maxCallsPerMinute,
        perHour: this.maxCallsPerHour,
        perDay: this.maxCallsPerDay
      }
    };
  }

  /**
   * Log current usage
   */
  logUsage() {
    const stats = this.getUsageStats();
    console.log('📊 APIRateLimiter: Usage Stats', {
      total: stats.total,
      today: stats.today,
      thisHour: stats.thisHour,
      thisMinute: stats.thisMinute,
      errors: stats.errors,
      blocked: stats.blocked
    });
  }

  /**
   * Reset counters (for testing)
   */
  resetCounters() {
    this.callHistory = [];
    this.counters = {
      total: 0,
      today: 0,
      thisHour: 0,
      thisMinute: 0,
      errors: 0,
      blocked: 0
    };
    this.isBlocked = false;
    this.blockUntil = 0;
    console.log('🔄 APIRateLimiter: Counters reset');
  }

  /**
   * Get recommended delay before next call
   */
  getRecommendedDelay() {
    if (this.counters.thisMinute >= this.maxCallsPerMinute * 0.8) {
      return 2000; // 2 seconds if approaching minute limit
    }
    if (this.counters.thisHour >= this.maxCallsPerHour * 0.8) {
      return 5000; // 5 seconds if approaching hour limit
    }
    if (this.counters.today >= this.maxCallsPerDay * 0.8) {
      return 10000; // 10 seconds if approaching daily limit
    }
    return 100; // Minimum delay
  }
}

// Create global instance
window.apiRateLimiter = new APIRateLimiter();

console.log('✅ APIRateLimiter: Rate limiter loaded');
console.log('📋 APIRateLimiter: Use window.apiRateLimiter.getUsageStats() to check usage');
