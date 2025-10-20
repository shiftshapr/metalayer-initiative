/**
 * ROBUST INTEGRATION MODULE
 * Architecture-first approach for robust real-time functionality
 * 
 * This module provides a single, robust integration point that:
 * - Clean, maintainable architecture
 * - Single source of truth for real-time operations
 * - Implements proper error handling and logging
 * - Uses the new robust modules
 */

class RobustIntegration {
  constructor() {
    this.isInitialized = false;
    this.realtimeManager = null;
    this.authManager = null;
    this.currentUser = null;
    this.currentPage = null;
    
    // Logging configuration
    this.logLevel = 'INFO';
    this.logPrefix = '[RobustIntegration]';
    
    this.log('INFO', 'RobustIntegration initialized');
  }

  /**
   * Configurable logging system
   */
  log(level, message, data = null) {
    const levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, SILENT: 4 };
    const currentLevel = levels[this.logLevel] || 1;
    const messageLevel = levels[level] || 1;
    
    if (currentLevel <= messageLevel && this.logLevel !== 'SILENT') {
      const timestamp = new Date().toISOString();
      const logMessage = `${this.logPrefix} [${level}] ${message}`;
      
      if (data) {
        console.log(logMessage, data);
      } else {
        console.log(logMessage);
      }
    }
  }


  /**
   * Set logging level
   */
  setLogLevel(level) {
    const validLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'SILENT'];
    if (validLevels.includes(level)) {
      this.logLevel = level;
      this.log('INFO', `Log level set to: ${level}`);
      
      // Propagate to sub-modules
      if (this.realtimeManager) {
        this.realtimeManager.setLogLevel(level);
      }
      if (this.authManager) {
        this.authManager.setLogLevel(level);
      }
    } else {
      this.log('WARN', `Invalid log level: ${level}. Valid levels: ${validLevels.join(', ')}`);
    }
  }

  /**
   * Initialize the robust integration system
   */
  async initialize() {
    if (this.isInitialized) {
      this.log('DEBUG', 'Already initialized');
      return true;
    }

    try {
      this.log('INFO', 'Initializing robust integration system...');
      
      // Step 1: Auth is handled by CleanRealtimeManager - no separate auth manager needed
      this.log('DEBUG', 'Auth handled by CleanRealtimeManager');
      
      // Step 2: Get current user from window.currentUser (set by auth system)
      this.currentUser = window.currentUser;
      if (!this.currentUser) {
        this.log('WARN', 'No authenticated user found - initialization should be deferred until after authentication');
        return false;
      }
      
      this.log('INFO', `User authenticated: ${this.currentUser.email}`);
      
      // Step 3: Initialize clean realtime manager (ROOT CAUSE FIX)
      if (typeof window.CleanRealtimeManager === 'undefined') {
        throw new Error('CleanRealtimeManager not available - check if script is loaded');
      }
      this.realtimeManager = new window.CleanRealtimeManager();
      if (!this.realtimeManager) {
        throw new Error('CleanRealtimeManager not available');
      }
      
      await this.realtimeManager.initialize(window.supabase);
      this.log('DEBUG', 'Realtime manager initialized');
      
      // Step 4: Set user in realtime manager
      this.realtimeManager.setUser(
        this.currentUser.email,
        this.currentUser.email,
        'comm-001'
      );
      
      this.isInitialized = true;
      this.log('INFO', 'Robust integration system initialized successfully');
      return true;
      
    } catch (error) {
      this.log('ERROR', 'Failed to initialize robust integration system', error);
      return false;
    }
  }

  /**
   * Join a page for real-time updates
   */
  async joinPage(pageUrl) {
    if (!this.isInitialized) {
      this.log('DEBUG', 'System not initialized, attempting late initialization...');
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        this.log('ERROR', 'Late initialization failed');
        return false;
      }
    }
    
    try {
      this.log('INFO', `Joining page: ${pageUrl}`);
      
      const success = await this.realtimeManager.joinPage(pageUrl);
      if (success) {
        this.currentPage = pageUrl;
        this.log('INFO', 'Page joined successfully');
        
        // Update presence after joining page
        await this.realtimeManager.updatePresence();
      }
      
      return success;
      
    } catch (error) {
      this.log('ERROR', 'Failed to join page', error);
      return false;
    }
  }

  /**
   * Send a message
   */
  async sendMessage(content) {
    // Try to initialize if not already done
    if (!this.isInitialized) {
      this.log('DEBUG', 'System not initialized, attempting late initialization...');
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        this.log('ERROR', 'Late initialization failed');
        return false;
      }
    }
    
    try {
      this.log('INFO', `Sending message: ${content.substring(0, 50)}...`);
      
      const success = await this.realtimeManager.sendMessage(content);
      if (success) {
        this.log('INFO', 'Message sent successfully');
      } else {
        this.log('WARN', 'Failed to send message');
      }
      
      return success;
      
    } catch (error) {
      this.log('ERROR', 'Failed to send message', error);
      return false;
    }
  }

  /**
   * Edit a message
   */
  async editMessage(messageId, newContent) {
    // Try to initialize if not already done
    if (!this.isInitialized) {
      this.log('DEBUG', 'System not initialized, attempting late initialization...');
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        this.log('ERROR', 'Late initialization failed');
        return false;
      }
    }
    
    try {
      this.log('INFO', `Editing message: ${messageId}`);
      
      const success = await this.realtimeManager.editMessage(messageId, newContent);
      if (success) {
        this.log('INFO', 'Message edited successfully');
      } else {
        this.log('WARN', 'Failed to edit message');
      }
      
      return success;
      
    } catch (error) {
      this.log('ERROR', 'Failed to edit message', error);
      return false;
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId) {
    // Try to initialize if not already done
    if (!this.isInitialized) {
      this.log('DEBUG', 'System not initialized, attempting late initialization...');
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        this.log('ERROR', 'Late initialization failed');
        return false;
      }
    }
    
    try {
      this.log('INFO', `Deleting message: ${messageId}`);
      
      const success = await this.realtimeManager.deleteMessage(messageId);
      if (success) {
        this.log('INFO', 'Message deleted successfully');
      } else {
        this.log('WARN', 'Failed to delete message');
      }
      
      return success;
      
    } catch (error) {
      this.log('ERROR', 'Failed to delete message', error);
      return false;
    }
  }

  /**
   * Update presence
   */
  async updatePresence(auraColor = 'blue') {
    if (!this.isInitialized) {
      this.log('ERROR', 'System not initialized');
      return false;
    }
    
    try {
      this.log('DEBUG', `Updating presence with aura color: ${auraColor}`);
      
      const success = await this.realtimeManager.updatePresence(auraColor);
      if (success) {
        this.log('DEBUG', 'Presence updated successfully');
      }
      
      return success;
      
    } catch (error) {
      this.log('ERROR', 'Failed to update presence', error);
      return false;
    }
  }

  /**
   * Get comprehensive status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      currentUser: this.currentUser,
      currentPage: this.currentPage,
      realtimeStatus: this.realtimeManager ? this.realtimeManager.getStatus() : null,
      authStatus: this.authManager ? this.authManager.getStatus() : null,
      logLevel: this.logLevel
    };
  }

  /**
   * Cleanup method
   */
  async cleanup() {
    this.log('INFO', 'Cleaning up robust integration...');
    
    if (this.realtimeManager) {
      await this.realtimeManager.cleanup();
    }
    
    this.isInitialized = false;
    this.currentUser = null;
    this.currentPage = null;
    
    this.log('INFO', 'Cleanup completed');
  }
}

// Create global instance
window.robustIntegration = new RobustIntegration();

// Legacy SimpleRealtimeManager removed - clean architecture with RobustIntegration only

// Export for use
window.RobustIntegration = RobustIntegration;

// Store in JAUmemory for future reference
if (typeof window !== 'undefined') {
  window.robustIntegration.log('INFO', 'RobustIntegration loaded and ready');
  window.robustIntegration.log('INFO', 'Use window.robustIntegration.setLogLevel("DEBUG") to enable debug logging');
  window.robustIntegration.log('INFO', 'Use window.robustIntegration.initialize() to start the system');
  window.robustIntegration.log('INFO', 'Legacy SimpleRealtimeManager removed - using clean RobustIntegration architecture');
}
