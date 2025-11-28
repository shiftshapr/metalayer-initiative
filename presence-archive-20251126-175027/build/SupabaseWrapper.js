/**
 * SUPABASE WRAPPER
 * Wraps Supabase calls with rate limiting and monitoring
 */

class SupabaseWrapper {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.rateLimiter = window.apiRateLimiter;
    this.callQueue = [];
    this.isProcessingQueue = false;
    
    console.log('🛡️ SupabaseWrapper: Wrapper initialized');
  }

  /**
   * Make a rate-limited Supabase call
   */
  async makeCall(operation, ...args) {
    // Check if we can make the call
    if (!this.rateLimiter.canMakeCall()) {
      console.warn('⚠️ SupabaseWrapper: Rate limit exceeded, queuing call');
      return this.queueCall(operation, ...args);
    }

    try {
      // Make the actual call
      const result = await operation.apply(this.supabase, args);
      
      // Record successful call
      this.rateLimiter.recordCall(true);
      
      // Log the call
      console.log(`✅ SupabaseWrapper: Call successful`, {
        operation: operation.name || 'unknown',
        timestamp: new Date().toISOString()
      });
      
      return result;
      
    } catch (error) {
      // Record failed call
      this.rateLimiter.recordCall(false);
      
      // Log the error
      console.error('❌ SupabaseWrapper: Call failed', {
        operation: operation.name || 'unknown',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      // If it's a rate limit error, block calls temporarily
      if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
        this.rateLimiter.blockCalls(30000); // Block for 30 seconds
      }
      
      throw error;
    }
  }

  /**
   * Queue a call for later execution
   */
  async queueCall(operation, ...args) {
    return new Promise((resolve, reject) => {
      this.callQueue.push({
        operation,
        args,
        resolve,
        reject,
        timestamp: Date.now()
      });
      
      // Start processing queue if not already processing
      if (!this.isProcessingQueue) {
        this.processQueue();
      }
    });
  }

  /**
   * Process the call queue
   */
  async processQueue() {
    if (this.isProcessingQueue || this.callQueue.length === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    while (this.callQueue.length > 0) {
      const call = this.callQueue.shift();
      
      // Check if call is too old (older than 5 minutes)
      if (Date.now() - call.timestamp > 300000) {
        call.reject(new Error('Call expired'));
        continue;
      }
      
      // Wait for rate limiter to allow the call
      const delay = this.rateLimiter.getRecommendedDelay();
      await new Promise(resolve => setTimeout(resolve, delay));
      
      try {
        const result = await this.makeCall(call.operation, ...call.args);
        call.resolve(result);
      } catch (error) {
        call.reject(error);
      }
    }
    
    this.isProcessingQueue = false;
  }

  /**
   * Wrapped Supabase methods
   */
  get from() {
    return (table) => {
      const originalFrom = this.supabase.from(table);
      
      return {
        select: (...args) => {
          const selectQuery = originalFrom.select(...args);
          return {
            limit: (...limitArgs) => this.makeCall(selectQuery.limit.bind(selectQuery), ...limitArgs),
            eq: (...eqArgs) => this.makeCall(selectQuery.eq.bind(selectQuery), ...eqArgs),
            order: (...orderArgs) => this.makeCall(selectQuery.order.bind(selectQuery), ...orderArgs),
            range: (...rangeArgs) => this.makeCall(selectQuery.range.bind(selectQuery), ...rangeArgs),
            single: () => this.makeCall(selectQuery.single.bind(selectQuery)),
            maybeSingle: () => this.makeCall(selectQuery.maybeSingle.bind(selectQuery))
          };
        },
        insert: (...args) => {
          const insertQuery = originalFrom.insert(...args);
          return {
            select: (...selectArgs) => this.makeCall(insertQuery.select.bind(insertQuery), ...selectArgs)
          };
        },
        update: (...args) => {
          const updateQuery = originalFrom.update(...args);
          return {
            eq: (...eqArgs) => this.makeCall(updateQuery.eq.bind(updateQuery), ...eqArgs),
            neq: (...neqArgs) => this.makeCall(updateQuery.neq.bind(updateQuery), ...neqArgs),
            gt: (...gtArgs) => this.makeCall(updateQuery.gt.bind(updateQuery), ...gtArgs),
            gte: (...gteArgs) => this.makeCall(updateQuery.gte.bind(updateQuery), ...gteArgs),
            lt: (...ltArgs) => this.makeCall(updateQuery.lt.bind(updateQuery), ...ltArgs),
            lte: (...lteArgs) => this.makeCall(updateQuery.lte.bind(updateQuery), ...lteArgs),
            like: (...likeArgs) => this.makeCall(updateQuery.like.bind(updateQuery), ...likeArgs),
            ilike: (...ilikeArgs) => this.makeCall(updateQuery.ilike.bind(updateQuery), ...ilikeArgs),
            is: (...isArgs) => this.makeCall(updateQuery.is.bind(updateQuery), ...isArgs),
            in: (...inArgs) => this.makeCall(updateQuery.in.bind(updateQuery), ...inArgs),
            contains: (...containsArgs) => this.makeCall(updateQuery.contains.bind(updateQuery), ...containsArgs),
            containedBy: (...containedByArgs) => this.makeCall(updateQuery.containedBy.bind(updateQuery), ...containedByArgs),
            rangeGt: (...rangeGtArgs) => this.makeCall(updateQuery.rangeGt.bind(updateQuery), ...rangeGtArgs),
            rangeGte: (...rangeGteArgs) => this.makeCall(updateQuery.rangeGte.bind(updateQuery), ...rangeGteArgs),
            rangeLt: (...rangeLtArgs) => this.makeCall(updateQuery.rangeLt.bind(updateQuery), ...rangeLtArgs),
            rangeLte: (...rangeLteArgs) => this.makeCall(updateQuery.rangeLte.bind(updateQuery), ...rangeLteArgs),
            rangeAdjacent: (...rangeAdjacentArgs) => this.makeCall(updateQuery.rangeAdjacent.bind(updateQuery), ...rangeAdjacentArgs),
            overlaps: (...overlapsArgs) => this.makeCall(updateQuery.overlaps.bind(updateQuery), ...overlapsArgs),
            textSearch: (...textSearchArgs) => this.makeCall(updateQuery.textSearch.bind(updateQuery), ...textSearchArgs),
            match: (...matchArgs) => this.makeCall(updateQuery.match.bind(updateQuery), ...matchArgs),
            not: (...notArgs) => this.makeCall(updateQuery.not.bind(updateQuery), ...notArgs),
            or: (...orArgs) => this.makeCall(updateQuery.or.bind(updateQuery), ...orArgs),
            filter: (...filterArgs) => this.makeCall(updateQuery.filter.bind(updateQuery), ...filterArgs),
            select: (...selectArgs) => this.makeCall(updateQuery.select.bind(updateQuery), ...selectArgs),
            order: (...orderArgs) => this.makeCall(updateQuery.order.bind(updateQuery), ...orderArgs),
            limit: (...limitArgs) => this.makeCall(updateQuery.limit.bind(updateQuery), ...limitArgs),
            range: (...rangeArgs) => this.makeCall(updateQuery.range.bind(updateQuery), ...rangeArgs),
            abortSignal: (...abortSignalArgs) => this.makeCall(updateQuery.abortSignal.bind(updateQuery), ...abortSignalArgs),
            single: () => this.makeCall(updateQuery.single.bind(updateQuery)),
            maybeSingle: () => this.makeCall(updateQuery.maybeSingle.bind(updateQuery))
          };
        },
        delete: (...args) => {
          const deleteQuery = originalFrom.delete(...args);
          return {
            eq: (...eqArgs) => this.makeCall(deleteQuery.eq.bind(deleteQuery), ...eqArgs),
            neq: (...neqArgs) => this.makeCall(deleteQuery.neq.bind(deleteQuery), ...neqArgs),
            gt: (...gtArgs) => this.makeCall(deleteQuery.gt.bind(deleteQuery), ...gtArgs),
            gte: (...gteArgs) => this.makeCall(deleteQuery.gte.bind(deleteQuery), ...gteArgs),
            lt: (...ltArgs) => this.makeCall(deleteQuery.lt.bind(deleteQuery), ...ltArgs),
            lte: (...lteArgs) => this.makeCall(deleteQuery.lte.bind(deleteQuery), ...lteArgs),
            like: (...likeArgs) => this.makeCall(deleteQuery.like.bind(deleteQuery), ...likeArgs),
            ilike: (...ilikeArgs) => this.makeCall(deleteQuery.ilike.bind(deleteQuery), ...ilikeArgs),
            is: (...isArgs) => this.makeCall(deleteQuery.is.bind(deleteQuery), ...isArgs),
            in: (...inArgs) => this.makeCall(deleteQuery.in.bind(deleteQuery), ...inArgs),
            contains: (...containsArgs) => this.makeCall(deleteQuery.contains.bind(deleteQuery), ...containsArgs),
            containedBy: (...containedByArgs) => this.makeCall(deleteQuery.containedBy.bind(deleteQuery), ...containedByArgs),
            rangeGt: (...rangeGtArgs) => this.makeCall(deleteQuery.rangeGt.bind(deleteQuery), ...rangeGtArgs),
            rangeGte: (...rangeGteArgs) => this.makeCall(deleteQuery.rangeGte.bind(deleteQuery), ...rangeGteArgs),
            rangeLt: (...rangeLtArgs) => this.makeCall(deleteQuery.rangeLt.bind(deleteQuery), ...rangeLtArgs),
            rangeLte: (...rangeLteArgs) => this.makeCall(deleteQuery.rangeLte.bind(deleteQuery), ...rangeLteArgs),
            rangeAdjacent: (...rangeAdjacentArgs) => this.makeCall(deleteQuery.rangeAdjacent.bind(deleteQuery), ...rangeAdjacentArgs),
            overlaps: (...overlapsArgs) => this.makeCall(deleteQuery.overlaps.bind(deleteQuery), ...overlapsArgs),
            textSearch: (...textSearchArgs) => this.makeCall(deleteQuery.textSearch.bind(deleteQuery), ...textSearchArgs),
            match: (...matchArgs) => this.makeCall(deleteQuery.match.bind(deleteQuery), ...matchArgs),
            not: (...notArgs) => this.makeCall(deleteQuery.not.bind(deleteQuery), ...notArgs),
            or: (...orArgs) => this.makeCall(deleteQuery.or.bind(deleteQuery), ...orArgs),
            filter: (...filterArgs) => this.makeCall(deleteQuery.filter.bind(deleteQuery), ...filterArgs),
            select: (...selectArgs) => this.makeCall(deleteQuery.select.bind(deleteQuery), ...selectArgs),
            order: (...orderArgs) => this.makeCall(deleteQuery.order.bind(deleteQuery), ...orderArgs),
            limit: (...limitArgs) => this.makeCall(deleteQuery.limit.bind(deleteQuery), ...limitArgs),
            range: (...rangeArgs) => this.makeCall(deleteQuery.range.bind(deleteQuery), ...rangeArgs),
            abortSignal: (...abortSignalArgs) => this.makeCall(deleteQuery.abortSignal.bind(deleteQuery), ...abortSignalArgs),
            single: () => this.makeCall(deleteQuery.single.bind(deleteQuery)),
            maybeSingle: () => this.makeCall(deleteQuery.maybeSingle.bind(deleteQuery))
          };
        },
        upsert: (...args) => this.makeCall(originalFrom.upsert.bind(originalFrom), ...args)
      };
    };
  }

  get channel() {
    return (...args) => this.supabase.channel(...args);
  }

  get auth() {
    return this.supabase.auth;
  }

  get realtime() {
    return this.supabase.realtime;
  }

  /**
   * Get usage statistics
   */
  getUsageStats() {
    return this.rateLimiter.getUsageStats();
  }

  /**
   * Reset rate limiter
   */
  resetRateLimiter() {
    this.rateLimiter.resetCounters();
  }

  /**
   * Get queue status
   */
  getQueueStatus() {
    return {
      queueLength: this.callQueue.length,
      isProcessing: this.isProcessingQueue,
      oldestCall: this.callQueue.length > 0 ? 
        new Date(this.callQueue[0].timestamp).toLocaleTimeString() : null
    };
  }
}

// Export for use
window.SupabaseWrapper = SupabaseWrapper;

console.log('✅ SupabaseWrapper: Wrapper loaded');
console.log('📋 SupabaseWrapper: Use new SupabaseWrapper(supabaseClient) to create rate-limited client');
