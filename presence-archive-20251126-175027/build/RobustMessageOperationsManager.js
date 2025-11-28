/**
 * ROBUST MESSAGE OPERATIONS MANAGER
 * Architecture-first approach with comprehensive persistence and propagation
 * 
 * This module provides a single, robust solution for all message operations
 * (add, edit, delete) with proper persistence, real-time propagation,
 * and configurable logging.
 */

class RobustMessageOperationsManager {
  constructor() {
    this.isInitialized = false;
    this.supabase = null;
    this.realtimeManager = null;
    this.operationCallCount = 0;
    this.lastOperationCall = 0;
    this.rateLimitDelay = 100; // 100ms between operations
    
    // Logging configuration
    this.logLevel = 'INFO'; // DEBUG, INFO, WARN, ERROR, SILENT
    this.logPrefix = '[RobustMessageOperationsManager]';
    
    this.log('INFO', 'RobustMessageOperationsManager initialized');
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
    } else {
      this.log('WARN', `Invalid log level: ${level}. Valid levels: ${validLevels.join(', ')}`);
    }
  }

  /**
   * Initialize the message operations manager
   */
  async initialize(supabaseClient, realtimeManager) {
    if (this.isInitialized) {
      this.log('DEBUG', 'Already initialized');
      return true;
    }

    try {
      this.log('INFO', 'Initializing robust message operations manager...');
      
      // Validate dependencies
      if (!supabaseClient) {
        throw new Error('Supabase client is required');
      }
      
      if (!realtimeManager) {
        throw new Error('Realtime manager is required');
      }

      this.supabase = supabaseClient;
      this.realtimeManager = realtimeManager;
      
      // Test database connection
      this.log('DEBUG', 'Testing database connection...');
      const { data, error } = await this.supabase
        .from('messages')
        .select('count')
        .limit(1);
      
      if (error) {
        throw new Error(`Database connection failed: ${error.message}`);
      }
      
      this.isInitialized = true;
      this.log('INFO', 'Robust message operations manager initialized successfully');
      return true;
      
    } catch (error) {
      this.log('ERROR', 'Initialization failed', error);
      return false;
    }
  }

  /**
   * Rate limiting for operations
   */
  async _rateLimit() {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastOperationCall;
    
    if (timeSinceLastCall < this.rateLimitDelay) {
      const delay = this.rateLimitDelay - timeSinceLastCall;
      this.log('DEBUG', `Rate limiting: waiting ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastOperationCall = Date.now();
    this.operationCallCount++;
  }

  /**
   * ADD MESSAGE - Create new message with persistence and propagation
   */
  async addMessage(content, pageId, communityId = 'comm-001') {
    if (!this.isInitialized) {
      this.log('ERROR', 'Manager not initialized');
      return { success: false, error: 'Manager not initialized' };
    }

    try {
      await this._rateLimit();
      this.log('DEBUG', 'Adding new message', { content, pageId, communityId });
      
      const currentUser = window.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      // Create message data
      const messageData = {
        content: content,
        user_email: currentUser.email,
        page_id: pageId,
        community_id: communityId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // PERSIST: Save to database
      this.log('DEBUG', 'Persisting message to database...');
      const { data: insertData, error: insertError } = await this.supabase
        .from('messages')
        .insert([messageData])
        .select();

      if (insertError) {
        throw new Error(`Database insert failed: ${insertError.message}`);
      }

      const message = insertData[0];
      this.log('INFO', 'Message persisted successfully', { id: message.id });

      // PROPAGATE: Send real-time update
      this.log('DEBUG', 'Propagating message via real-time...');
      await this._propagateMessageOperation('add', message);
      
      this.log('INFO', 'Message added successfully with persistence and propagation', { id: message.id });
      return { success: true, message: message };
      
    } catch (error) {
      this.log('ERROR', 'Failed to add message', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * EDIT MESSAGE - Update existing message with persistence and propagation
   */
  async editMessage(messageId, newContent) {
    if (!this.isInitialized) {
      this.log('ERROR', 'Manager not initialized');
      return { success: false, error: 'Manager not initialized' };
    }

    try {
      await this._rateLimit();
      this.log('DEBUG', 'Editing message', { messageId, newContent });
      
      const currentUser = window.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      // Verify message exists and user owns it
      const { data: existingMessage, error: fetchError } = await this.supabase
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .single();

      if (fetchError) {
        throw new Error(`Message not found: ${fetchError.message}`);
      }

      if (existingMessage.user_email !== currentUser.email) {
        throw new Error('You can only edit your own messages');
      }

      // PERSIST: Update in database
      this.log('DEBUG', 'Persisting message edit to database...');
      const { data: updateData, error: updateError } = await this.supabase
        .from('messages')
        .update({
          content: newContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .select();

      if (updateError) {
        throw new Error(`Database update failed: ${updateError.message}`);
      }

      const updatedMessage = updateData[0];
      this.log('INFO', 'Message edit persisted successfully', { id: messageId });

      // PROPAGATE: Send real-time update
      this.log('DEBUG', 'Propagating message edit via real-time...');
      await this._propagateMessageOperation('edit', updatedMessage);
      
      this.log('INFO', 'Message edited successfully with persistence and propagation', { id: messageId });
      return { success: true, message: updatedMessage };
      
    } catch (error) {
      this.log('ERROR', 'Failed to edit message', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * DELETE MESSAGE - Remove message with persistence and propagation
   */
  async deleteMessage(messageId) {
    if (!this.isInitialized) {
      this.log('ERROR', 'Manager not initialized');
      return { success: false, error: 'Manager not initialized' };
    }

    try {
      await this._rateLimit();
      this.log('DEBUG', 'Deleting message', { messageId });
      
      const currentUser = window.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      // Verify message exists and user owns it
      const { data: existingMessage, error: fetchError } = await this.supabase
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .single();

      if (fetchError) {
        throw new Error(`Message not found: ${fetchError.message}`);
      }

      if (existingMessage.user_email !== currentUser.email) {
        throw new Error('You can only delete your own messages');
      }

      // PERSIST: Mark as deleted in database (soft delete)
      this.log('DEBUG', 'Persisting message deletion to database...');
      const { data: deleteData, error: deleteError } = await this.supabase
        .from('messages')
        .update({
          content: '[Deleted]',
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .select();

      if (deleteError) {
        throw new Error(`Database delete failed: ${deleteError.message}`);
      }

      const deletedMessage = deleteData[0];
      this.log('INFO', 'Message deletion persisted successfully', { id: messageId });

      // PROPAGATE: Send real-time update
      this.log('DEBUG', 'Propagating message deletion via real-time...');
      await this._propagateMessageOperation('delete', deletedMessage);
      
      this.log('INFO', 'Message deleted successfully with persistence and propagation', { id: messageId });
      return { success: true, message: deletedMessage };
      
    } catch (error) {
      this.log('ERROR', 'Failed to delete message', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * PROPAGATE: Send real-time updates for message operations
   */
  async _propagateMessageOperation(operation, message) {
    try {
      this.log('DEBUG', `🔍 PROPAGATE: Starting ${operation} operation propagation`);
      this.log('DEBUG', `🔍 PROPAGATE: Message ID: ${message.id}`);
      this.log('DEBUG', `🔍 PROPAGATE: Realtime manager available: ${!!this.realtimeManager}`);
      this.log('DEBUG', `🔍 PROPAGATE: Broadcast method available: ${!!(this.realtimeManager && this.realtimeManager.broadcastMessageOperation)}`);
      
      // Use the realtime manager to broadcast the operation
      if (this.realtimeManager && this.realtimeManager.broadcastMessageOperation) {
        this.log('DEBUG', `🔍 PROPAGATE: Calling broadcastMessageOperation for ${operation}`);
        const result = await this.realtimeManager.broadcastMessageOperation(operation, message);
        this.log('DEBUG', `🔍 PROPAGATE: Broadcast result: ${result}`);
        this.log('DEBUG', `🔍 PROPAGATE: Real-time ${operation} broadcast ${result ? 'sent successfully' : 'failed'}`);
      } else {
        this.log('WARN', 'Realtime manager not available for propagation');
        this.log('DEBUG', `🔍 PROPAGATE: Realtime manager details:`, this.realtimeManager);
      }
      
    } catch (error) {
      this.log('ERROR', `Failed to propagate ${operation} operation`, error);
      this.log('DEBUG', `🔍 PROPAGATE: Exception details:`, error);
      // Don't throw - propagation failure shouldn't break the operation
    }
  }

  /**
   * Get operation statistics
   */
  getStats() {
    return {
      isInitialized: this.isInitialized,
      operationCallCount: this.operationCallCount,
      lastOperationCall: this.lastOperationCall,
      logLevel: this.logLevel
    };
  }
}

// Create global instance
window.robustMessageOperations = new RobustMessageOperationsManager();

// Make it globally accessible
window.RobustMessageOperationsManager = RobustMessageOperationsManager;

console.log('✅ RobustMessageOperationsManager loaded');
console.log('📋 Use window.robustMessageOperations.initialize(supabase, realtimeManager) to start');
console.log('📋 Use window.robustMessageOperations.setLogLevel("DEBUG") to enable debug logging');
