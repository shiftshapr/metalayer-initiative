/**
 * MESSAGE DIAGNOSTIC MANAGER
 * Architecture-first approach to diagnose message persistence and propagation issues
 * 
 * This module provides comprehensive logging and diagnostics for:
 * - Message sending process
 * - Database persistence
 * - Real-time propagation
 * - Avatar resolution
 */

class MessageDiagnosticManager {
  constructor() {
    this.moduleName = 'MessageDiagnostic';
    this.isEnabled = true;
    this.messageHistory = [];
    this.avatarHistory = [];
    this.realtimeHistory = [];
  }

  /**
   * Enable/disable diagnostics
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    Logger.info(this.moduleName, `Message diagnostics ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Log message sending process
   */
  logMessageSend(messageData) {
    if (!this.isEnabled) return;
    
    const entry = {
      timestamp: new Date().toISOString(),
      type: 'MESSAGE_SEND',
      data: {
        content: messageData.content,
        user: messageData.user?.email,
        community: messageData.community,
        url: messageData.url
      }
    };
    
    this.messageHistory.push(entry);
    Logger.info(this.moduleName, '📤 MESSAGE_SEND:', entry);
  }

  /**
   * Log message persistence result
   */
  logMessagePersist(messageId, success, error = null) {
    if (!this.isEnabled) return;
    
    const entry = {
      timestamp: new Date().toISOString(),
      type: 'MESSAGE_PERSIST',
      data: {
        messageId,
        success,
        error: error?.message || null
      }
    };
    
    this.messageHistory.push(entry);
    Logger.info(this.moduleName, `📝 MESSAGE_PERSIST: ${success ? 'SUCCESS' : 'FAILED'}`, entry);
  }

  /**
   * Log avatar resolution
   */
  logAvatarResolution(userEmail, avatarUrl, source) {
    if (!this.isEnabled) return;
    
    const entry = {
      timestamp: new Date().toISOString(),
      type: 'AVATAR_RESOLUTION',
      data: {
        userEmail,
        avatarUrl,
        source,
        isReal: !avatarUrl?.includes('default-user')
      }
    };
    
    this.avatarHistory.push(entry);
    Logger.info(this.moduleName, '🖼️ AVATAR_RESOLUTION:', entry);
  }

  /**
   * Log real-time propagation
   */
  logRealtimePropagation(eventType, data) {
    if (!this.isEnabled) return;
    
    const entry = {
      timestamp: new Date().toISOString(),
      type: 'REALTIME_PROPAGATION',
      data: {
        eventType,
        messageId: data?.messageId || data?.id,
        content: data?.content || data?.body
      }
    };
    
    this.realtimeHistory.push(entry);
    Logger.info(this.moduleName, '🔄 REALTIME_PROPAGATION:', entry);
  }

  /**
   * Get comprehensive diagnostic report
   */
  getDiagnosticReport() {
    const report = {
      timestamp: new Date().toISOString(),
      messageStats: {
        total: this.messageHistory.length,
        sent: this.messageHistory.filter(m => m.type === 'MESSAGE_SEND').length,
        persisted: this.messageHistory.filter(m => m.type === 'MESSAGE_PERSIST' && m.data.success).length,
        failed: this.messageHistory.filter(m => m.type === 'MESSAGE_PERSIST' && !m.data.success).length
      },
      avatarStats: {
        total: this.avatarHistory.length,
        real: this.avatarHistory.filter(a => a.data.isReal).length,
        generic: this.avatarHistory.filter(a => !a.data.isReal).length
      },
      realtimeStats: {
        total: this.realtimeHistory.length,
        events: this.realtimeHistory.length
      },
      recentMessages: this.messageHistory.slice(-5),
      recentAvatars: this.avatarHistory.slice(-5),
      recentRealtime: this.realtimeHistory.slice(-5)
    };

    Logger.info(this.moduleName, '📊 DIAGNOSTIC_REPORT:', report);
    return report;
  }

  /**
   * Clear all diagnostic data
   */
  clearHistory() {
    this.messageHistory = [];
    this.avatarHistory = [];
    this.realtimeHistory = [];
    Logger.info(this.moduleName, '🧹 Diagnostic history cleared');
  }
}

// Global instance
window.messageDiagnostic = new MessageDiagnosticManager();
