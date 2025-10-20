/**
 * UI Real-time Extensions - Handle visibility, reactions, and auras
 * Follows the same pattern as ui-realtime-bindings.js for messages
 */

(function() {
  'use strict';

  console.log('🔗 UI REALTIME EXTENSIONS: initializing...');

  /**
   * VISIBILITY REAL-TIME UI BINDINGS
   * Handle real-time visibility updates
   */
  function handleVisibilityUpdate(event) {
    console.log('👁️ UI REALTIME: Visibility update received:', event.detail);
    
    const { type, data, pageId } = event.detail;
    
    if (!data) {
      console.log('⚠️ UI REALTIME: No visibility data provided');
      return;
    }

    try {
      switch (type) {
        case 'INSERT':
          handleUserJoined(data);
          break;
        case 'UPDATE':
          handleUserUpdated(data);
          break;
        case 'DELETE':
          handleUserLeft(data);
          break;
        default:
          console.log('⚠️ UI REALTIME: Unknown visibility event type:', type);
      }
    } catch (error) {
      console.error('❌ UI REALTIME: Error handling visibility update:', error);
    }
  }

  function handleUserJoined(userData) {
    console.log('👋 UI REALTIME: User joined:', userData.user_email);
    
    // Add user to visibility list
    if (typeof addUserToVisibilityList === 'function') {
      addUserToVisibilityList(userData);
    } else {
      // Fallback: refresh visibility
      if (typeof refreshVisibility === 'function') {
        refreshVisibility();
      }
    }
  }

  function handleUserUpdated(userData) {
    console.log('🔄 UI REALTIME: User updated:', userData.user_email);
    
    // Update user in visibility list
    if (typeof updateUserInVisibilityList === 'function') {
      updateUserInVisibilityList(userData);
    } else {
      // Fallback: refresh visibility
      if (typeof refreshVisibility === 'function') {
        refreshVisibility();
      }
    }
  }

  function handleUserLeft(userData) {
    console.log('👋 UI REALTIME: User left:', userData.user_email);
    
    // Remove user from visibility list
    if (typeof removeUserFromVisibilityList === 'function') {
      removeUserFromVisibilityList(userData.user_email);
    } else {
      // Fallback: refresh visibility
      if (typeof refreshVisibility === 'function') {
        refreshVisibility();
      }
    }
  }

  /**
   * REACTIONS REAL-TIME UI BINDINGS
   * Handle real-time reaction updates
   */
  function handleReactionUpdate(event) {
    console.log('👍 UI REALTIME: Reaction update received:', event.detail);
    
    const { type, data, messageId, pageId } = event.detail;
    
    if (!data || !messageId) {
      console.log('⚠️ UI REALTIME: No reaction data or messageId provided');
      return;
    }

    try {
      switch (type) {
        case 'INSERT':
          handleReactionAdded(data, messageId);
          break;
        case 'UPDATE':
          handleReactionUpdated(data, messageId);
          break;
        case 'DELETE':
          handleReactionRemoved(data, messageId);
          break;
        default:
          console.log('⚠️ UI REALTIME: Unknown reaction event type:', type);
      }
    } catch (error) {
      console.error('❌ UI REALTIME: Error handling reaction update:', error);
    }
  }

  function handleReactionAdded(reactionData, messageId) {
    console.log('👍 UI REALTIME: Reaction added:', reactionData.emoji, 'to message:', messageId);
    
    // Add reaction to message UI
    if (typeof addReactionToMessage === 'function') {
      addReactionToMessage(messageId, reactionData);
    } else {
      // Fallback: refresh message reactions
      if (typeof refreshMessageReactions === 'function') {
        refreshMessageReactions(messageId);
      }
    }
  }

  function handleReactionUpdated(reactionData, messageId) {
    console.log('🔄 UI REALTIME: Reaction updated:', reactionData.emoji, 'to message:', messageId);
    
    // Update reaction in message UI
    if (typeof updateReactionInMessage === 'function') {
      updateReactionInMessage(messageId, reactionData);
    } else {
      // Fallback: refresh message reactions
      if (typeof refreshMessageReactions === 'function') {
        refreshMessageReactions(messageId);
      }
    }
  }

  function handleReactionRemoved(reactionData, messageId) {
    console.log('👎 UI REALTIME: Reaction removed:', reactionData.emoji, 'from message:', messageId);
    
    // Remove reaction from message UI
    if (typeof removeReactionFromMessage === 'function') {
      removeReactionFromMessage(messageId, reactionData);
    } else {
      // Fallback: refresh message reactions
      if (typeof refreshMessageReactions === 'function') {
        refreshMessageReactions(messageId);
      }
    }
  }

  /**
   * AURAS REAL-TIME UI BINDINGS
   * Handle real-time aura color updates
   */
  function handleAuraUpdate(event) {
    console.log('🎨 UI REALTIME: Aura update received:', event.detail);
    
    const { type, data, userEmail, pageId } = event.detail;
    
    if (!data || !userEmail) {
      console.log('⚠️ UI REALTIME: No aura data or userEmail provided');
      return;
    }

    try {
      switch (type) {
        case 'INSERT':
        case 'UPDATE':
          handleAuraColorChanged(userEmail, data.aura_color);
          break;
        case 'DELETE':
          handleAuraColorRemoved(userEmail);
          break;
        default:
          console.log('⚠️ UI REALTIME: Unknown aura event type:', type);
      }
    } catch (error) {
      console.error('❌ UI REALTIME: Error handling aura update:', error);
    }
  }

  function handleAuraColorChanged(userEmail, auraColor) {
    console.log('🎨 UI REALTIME: Aura color changed for user:', userEmail, 'to color:', auraColor);
    
    // Update aura color in UI
    if (typeof updateUserAuraInUI === 'function') {
      updateUserAuraInUI(userEmail, auraColor);
    } else {
      // Fallback: refresh visibility to update all auras
      if (typeof refreshVisibility === 'function') {
        refreshVisibility();
      }
    }
  }

  function handleAuraColorRemoved(userEmail) {
    console.log('🎨 UI REALTIME: Aura color removed for user:', userEmail);
    
    // Reset aura color to default
    if (typeof updateUserAuraInUI === 'function') {
      updateUserAuraInUI(userEmail, '#aaaaaa'); // Default color
    } else {
      // Fallback: refresh visibility
      if (typeof refreshVisibility === 'function') {
        refreshVisibility();
      }
    }
  }

  /**
   * SETUP EVENT LISTENERS
   * Bind all real-time extension events to UI handlers
   */
  function setupRealtimeExtensions() {
    console.log('🔗 UI REALTIME EXTENSIONS: Setting up event listeners...');

    // Visibility real-time events
    window.addEventListener('realtime-visibility-update', handleVisibilityUpdate);
    console.log('👁️ UI REALTIME: Visibility event listener added');

    // Reactions real-time events
    window.addEventListener('realtime-reaction-update', handleReactionUpdate);
    console.log('👍 UI REALTIME: Reactions event listener added');

    // Auras real-time events
    window.addEventListener('realtime-aura-update', handleAuraUpdate);
    console.log('🎨 UI REALTIME: Auras event listener added');

    console.log('✅ UI REALTIME EXTENSIONS: All event listeners setup complete');
  }

  /**
   * INITIALIZE
   * Setup all real-time extension UI bindings
   */
  function initialize() {
    console.log('🚀 UI REALTIME EXTENSIONS: Starting initialization...');
    
    try {
      setupRealtimeExtensions();
      console.log('✅ UI REALTIME EXTENSIONS: Initialization complete');
      return true;
    } catch (error) {
      console.error('❌ UI REALTIME EXTENSIONS: Initialization failed:', error);
      return false;
    }
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // Export for manual initialization if needed
  window.UIRealtimeExtensions = {
    initialize,
    handleVisibilityUpdate,
    handleReactionUpdate,
    handleAuraUpdate
  };

})();
