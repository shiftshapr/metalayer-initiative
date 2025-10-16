/**
 * SD1 ERROR HANDLER
 * 
 * Centralized error handling system.
 * Abstracts repeated error handling patterns throughout the codebase.
 */

class ErrorHandler {
  /**
   * Handle errors with consistent logging and fallback
   * @param {Error|string} error - Error object or message
   * @param {string} context - Context where error occurred
   * @param {*} fallback - Fallback value to return
   * @param {Object} options - Additional options
   * @returns {*} Fallback value or null
   */
  static handle(error, context, fallback = null, options = {}) {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : null;
    
    Logger.error(`Error in ${context}: ${errorMessage}`, {
      context,
      error: errorMessage,
      stack: errorStack,
      fallback: fallback,
      options
    }, 'error');

    // Store error for debugging
    this.storeError({
      context,
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
      fallback
    });

    return fallback;
  }

  /**
   * Handle async operations with error catching
   * @param {Function} asyncFn - Async function to execute
   * @param {string} context - Context
   * @param {*} fallback - Fallback value
   * @returns {Promise} Promise with error handling
   */
  static async handleAsync(asyncFn, context, fallback = null) {
    try {
      return await asyncFn();
    } catch (error) {
      return this.handle(error, context, fallback);
    }
  }

  /**
   * Handle promise with error catching
   * @param {Promise} promise - Promise to handle
   * @param {string} context - Context
   * @param {*} fallback - Fallback value
   * @returns {Promise} Promise with error handling
   */
  static handlePromise(promise, context, fallback = null) {
    return promise
      .catch(error => {
        this.handle(error, context, fallback);
        return fallback;
      });
  }

  /**
   * Wrap function with error handling
   * @param {Function} fn - Function to wrap
   * @param {string} context - Context
   * @param {*} fallback - Fallback value
   * @returns {Function} Wrapped function
   */
  static wrap(fn, context, fallback = null) {
    return (...args) => {
      try {
        return fn(...args);
      } catch (error) {
        return this.handle(error, context, fallback);
      }
    };
  }

  /**
   * Wrap async function with error handling
   * @param {Function} asyncFn - Async function to wrap
   * @param {string} context - Context
   * @param {*} fallback - Fallback value
   * @returns {Function} Wrapped async function
   */
  static wrapAsync(asyncFn, context, fallback = null) {
    return async (...args) => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        return this.handle(error, context, fallback);
      }
    };
  }

  /**
   * Store error for debugging
   * @param {Object} errorData - Error data to store
   */
  static storeError(errorData) {
    if (!window.errorHistory) {
      window.errorHistory = [];
    }
    
    window.errorHistory.push(errorData);
    
    // Keep only last 100 errors
    if (window.errorHistory.length > 100) {
      window.errorHistory.shift();
    }
  }

  /**
   * Get error history
   * @param {string} context - Filter by context
   * @param {number} limit - Limit number of errors
   * @returns {Array} Error history
   */
  static getErrorHistory(context = null, limit = 50) {
    if (!window.errorHistory) return [];
    
    let errors = window.errorHistory;
    
    if (context) {
      errors = errors.filter(error => error.context === context);
    }
    
    return errors.slice(-limit);
  }

  /**
   * Clear error history
   */
  static clearErrorHistory() {
    window.errorHistory = [];
    Logger.info('Error history cleared');
  }

  /**
   * Get error statistics
   * @returns {Object} Error statistics
   */
  static getErrorStats() {
    if (!window.errorHistory) {
      return { total: 0, byContext: {}, recent: 0 };
    }
    
    const errors = window.errorHistory;
    const stats = {
      total: errors.length,
      byContext: {},
      recent: errors.filter(e => {
        const errorTime = new Date(e.timestamp);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return errorTime > oneHourAgo;
      }).length
    };
    
    errors.forEach(error => {
      stats.byContext[error.context] = (stats.byContext[error.context] || 0) + 1;
    });
    
    return stats;
  }

  /**
   * Export error history
   * @returns {string} JSON string of error history
   */
  static exportErrors() {
    return JSON.stringify(window.errorHistory || [], null, 2);
  }

  /**
   * Handle Supabase errors specifically
   * @param {Object} error - Supabase error
   * @param {string} context - Context
   * @param {*} fallback - Fallback value
   * @returns {*} Fallback value
   */
  static handleSupabaseError(error, context, fallback = null) {
    const errorMessage = error.message || 'Unknown Supabase error';
    const errorCode = error.code || 'UNKNOWN';
    
    Logger.error(`Supabase error in ${context}: ${errorMessage} (Code: ${errorCode})`, {
      context,
      error: errorMessage,
      code: errorCode,
      details: error.details,
      hint: error.hint
    }, 'supabase');

    this.storeError({
      context,
      message: errorMessage,
      code: errorCode,
      type: 'supabase',
      timestamp: new Date().toISOString(),
      fallback
    });

    return fallback;
  }

  /**
   * Handle network errors specifically
   * @param {Object} error - Network error
   * @param {string} context - Context
   * @param {*} fallback - Fallback value
   * @returns {*} Fallback value
   */
  static handleNetworkError(error, context, fallback = null) {
    const errorMessage = error.message || 'Network error';
    const status = error.status || 'UNKNOWN';
    
    Logger.error(`Network error in ${context}: ${errorMessage} (Status: ${status})`, {
      context,
      error: errorMessage,
      status,
      url: error.url
    }, 'network');

    this.storeError({
      context,
      message: errorMessage,
      status,
      type: 'network',
      timestamp: new Date().toISOString(),
      fallback
    });

    return fallback;
  }

  /**
   * Create error boundary for DOM operations
   * @param {Function} domOperation - DOM operation to execute
   * @param {string} context - Context
   * @param {*} fallback - Fallback value
   * @returns {*} Result or fallback
   */
  static handleDOMOperation(domOperation, context, fallback = null) {
    try {
      return domOperation();
    } catch (error) {
      Logger.error(`DOM operation failed in ${context}: ${error.message}`, {
        context,
        error: error.message,
        stack: error.stack
      }, 'dom');
      
      return this.handle(error, context, fallback);
    }
  }
}

// Make available globally
window.ErrorHandler = ErrorHandler;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorHandler;
}

Logger.success('ErrorHandler initialized');
