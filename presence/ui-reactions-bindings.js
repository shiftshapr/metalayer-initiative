/**
 * UI REACTIONS BINDINGS - Following Working Message Pattern
 * Handles UI updates for reaction changes
 * 
 * PATTERN:
 * - Same structure as ui-realtime-bindings.js
 * - Same event handling approach
 * - Same DOM manipulation patterns
 * - Incremental, not revolutionary
 */

(function() {
  'use strict';

  console.log('🔗 UI REACTIONS BINDINGS: initializing');

  // Initialize reactions UI bindings
  function initializeReactionsBindings() {
    console.log('✅ UI REACTIONS BINDINGS: ready');
    
    // Listen for reaction real-time events
    if (typeof window.realtimeFoundation !== 'undefined') {
      window.realtimeFoundation.on('reaction-realtime-update', handleReactionUpdate);
      console.log('✅ UI REACTIONS: Event listener registered');
    } else {
      console.warn('⚠️ UI REACTIONS: RealtimeFoundation not available');
    }
  }

  /**
   * Handle reaction real-time updates
   */
  function handleReactionUpdate(event) {
    const { type, data, pageId, timestamp } = event.detail;
    
    console.log('🔍 UI REACTIONS: Received reaction update:', { type, data, pageId, timestamp });
    
    try {
      switch (type) {
        case 'INSERT':
          handleReactionAdded(data);
          break;
        case 'UPDATE':
          handleReactionUpdated(data);
          break;
        case 'DELETE':
          handleReactionRemoved(data);
          break;
        default:
          console.warn('⚠️ UI REACTIONS: Unknown event type:', type);
      }
    } catch (error) {
      console.error('❌ UI REACTIONS: Error handling reaction update:', error);
    }
  }

  /**
   * Handle reaction added
   */
  function handleReactionAdded(reactionData) {
    console.log('👍 UI REACTIONS: Reaction added:', reactionData);
    
    // Update message reactions UI
    updateMessageReactions(reactionData.message_id);
    
    // Update reaction counts
    updateReactionCounts();
  }

  /**
   * Handle reaction updated
   */
  function handleReactionUpdated(reactionData) {
    console.log('🔄 UI REACTIONS: Reaction updated:', reactionData);
    
    // Update message reactions UI
    updateMessageReactions(reactionData.message_id);
    
    // Update reaction counts
    updateReactionCounts();
  }

  /**
   * Handle reaction removed
   */
  function handleReactionRemoved(reactionData) {
    console.log('👎 UI REACTIONS: Reaction removed:', reactionData);
    
    // Update message reactions UI
    updateMessageReactions(reactionData.message_id);
    
    // Update reaction counts
    updateReactionCounts();
  }

  /**
   * Update message reactions UI
   */
  function updateMessageReactions(messageId) {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!messageElement) {
      console.warn('⚠️ UI REACTIONS: Message element not found:', messageId);
      return;
    }

    // Get or create reactions container
    const reactionsContainer = getOrCreateReactionsContainer(messageElement);
    
    // Load current reactions for this message
    loadMessageReactions(messageId, reactionsContainer);
  }

  /**
   * Get or create reactions container for a message
   */
  function getOrCreateReactionsContainer(messageElement) {
    let container = messageElement.querySelector('.message-reactions');
    
    if (!container) {
      // Create reactions container
      container = document.createElement('div');
      container.className = 'message-reactions';
      container.innerHTML = '<div class="reactions-list"></div>';
      
      // Add to message element
      messageElement.appendChild(container);
      
      console.log('✅ UI REACTIONS: Reactions container created for message');
    }
    
    return container;
  }

  /**
   * Load reactions for a specific message
   */
  async function loadMessageReactions(messageId, container) {
    try {
      // Get reactions from the reactions manager
      if (window.reactionsIntegration && window.reactionsIntegration.reactionsManager) {
        const reactions = await window.reactionsIntegration.reactionsManager.getReactions(messageId);
        
        if (reactions) {
          updateReactionsDisplay(container, reactions);
        }
      }
    } catch (error) {
      console.error('❌ UI REACTIONS: Error loading reactions:', error);
    }
  }

  /**
   * Update reactions display
   */
  function updateReactionsDisplay(container, reactions) {
    const reactionsList = container.querySelector('.reactions-list');
    if (!reactionsList) return;

    // Group reactions by type
    const reactionGroups = {};
    reactions.forEach(reaction => {
      if (!reactionGroups[reaction.reaction_type]) {
        reactionGroups[reaction.reaction_type] = [];
      }
      reactionGroups[reaction.reaction_type].push(reaction);
    });

    // Clear existing reactions
    reactionsList.innerHTML = '';

    // Add reaction buttons
    Object.keys(reactionGroups).forEach(reactionType => {
      const reactionGroup = reactionGroups[reactionType];
      const reactionButton = createReactionButton(reactionType, reactionGroup);
      reactionsList.appendChild(reactionButton);
    });

    console.log('✅ UI REACTIONS: Reactions display updated');
  }

  /**
   * Create a reaction button
   */
  function createReactionButton(reactionType, reactions) {
    const button = document.createElement('button');
    button.className = 'reaction-button';
    button.setAttribute('data-reaction-type', reactionType);
    button.setAttribute('data-message-id', reactions[0].message_id);
    
    // Set button content
    button.innerHTML = `
      <span class="reaction-emoji">${getReactionEmoji(reactionType)}</span>
      <span class="reaction-count">${reactions.length}</span>
    `;
    
    // Add click handler
    button.addEventListener('click', () => {
      handleReactionClick(reactions[0].message_id, reactionType);
    });
    
    return button;
  }

  /**
   * Get emoji for reaction type
   */
  function getReactionEmoji(reactionType) {
    const emojiMap = {
      'like': '👍',
      'love': '❤️',
      'laugh': '😂',
      'wow': '😮',
      'sad': '😢',
      'angry': '😠',
      'thumbs_up': '👍',
      'thumbs_down': '👎',
      'heart': '❤️',
      'fire': '🔥'
    };
    
    return emojiMap[reactionType] || '👍';
  }

  /**
   * Handle reaction button click
   */
  async function handleReactionClick(messageId, reactionType) {
    try {
      if (window.reactionsIntegration) {
        // Check if user already reacted with this type
        const existingReactions = await window.reactionsIntegration.reactionsManager.getReactions(messageId);
        const userReaction = existingReactions.find(r => 
          r.user_email === window.currentUser?.email && r.reaction_type === reactionType
        );
        
        if (userReaction) {
          // Remove reaction
          await window.reactionsIntegration.removeReaction(messageId, reactionType);
        } else {
          // Add reaction
          await window.reactionsIntegration.addReaction(messageId, reactionType);
        }
      }
    } catch (error) {
      console.error('❌ UI REACTIONS: Error handling reaction click:', error);
    }
  }

  /**
   * Update reaction counts
   */
  function updateReactionCounts() {
    // Update any global reaction counters
    const counters = document.querySelectorAll('.reaction-count');
    counters.forEach(counter => {
      // Trigger a refresh of the counter
      counter.style.opacity = '0.5';
      setTimeout(() => {
        counter.style.opacity = '1';
      }, 100);
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeReactionsBindings);
  } else {
    initializeReactionsBindings();
  }

})();
