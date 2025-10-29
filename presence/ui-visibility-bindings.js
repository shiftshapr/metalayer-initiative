/**
 * UI VISIBILITY BINDINGS - Following Working Message Pattern
 * Handles UI updates for visibility changes
 * 
 * PATTERN:
 * - Same structure as ui-realtime-bindings.js
 * - Same event handling approach
 * - Same DOM manipulation patterns
 * - Incremental, not revolutionary
 */

(function() {
  'use strict';

  console.log('🔗 UI VISIBILITY BINDINGS: initializing');

  // Initialize visibility UI bindings
  function initializeVisibilityBindings() {
    console.log('✅ UI VISIBILITY BINDINGS: ready');
    
    // Listen for visibility real-time events
    if (typeof window.realtimeFoundation !== 'undefined') {
      window.realtimeFoundation.on('visibility-realtime-update', handleVisibilityUpdate);
      console.log('✅ UI VISIBILITY: Event listener registered');
    } else {
      console.warn('⚠️ UI VISIBILITY: RealtimeFoundation not available');
    }
  }

  /**
   * Handle visibility real-time updates
   */
  function handleVisibilityUpdate(event) {
    const { type, data, pageId, timestamp } = event.detail;
    
    console.log('🔍 UI VISIBILITY: Received visibility update:', { type, data, pageId, timestamp });
    
    try {
      switch (type) {
        case 'INSERT':
          handleUserJoined(data);
          break;
        case 'UPDATE':
          handleUserVisibilityChanged(data);
          break;
        case 'DELETE':
          handleUserLeft(data);
          break;
        default:
          console.warn('⚠️ UI VISIBILITY: Unknown event type:', type);
      }
    } catch (error) {
      console.error('❌ UI VISIBILITY: Error handling visibility update:', error);
    }
  }

  /**
   * Handle user joined
   */
  function handleUserJoined(userData) {
    console.log('👤 UI VISIBILITY: User joined:', userData);
    
    // Add user to visibility list
    addUserToVisibilityList(userData);
    
    // Update presence indicators
    updatePresenceIndicators();
  }

  /**
   * Handle user visibility changed
   */
  function handleUserVisibilityChanged(userData) {
    console.log('👁️ UI VISIBILITY: User visibility changed:', userData);
    
    // Update user in visibility list
    updateUserInVisibilityList(userData);
    
    // Update presence indicators
    updatePresenceIndicators();
  }

  /**
   * Handle user left
   */
  function handleUserLeft(userData) {
    console.log('👋 UI VISIBILITY: User left:', userData);
    
    // Remove user from visibility list
    removeUserFromVisibilityList(userData);
    
    // Update presence indicators
    updatePresenceIndicators();
  }

  /**
   * Add user to visibility list
   */
  function addUserToVisibilityList(userData) {
    // Find or create visibility container
    const visibilityContainer = getOrCreateVisibilityContainer();
    
    // Check if user already exists
    const existingUser = visibilityContainer.querySelector(`[data-user-id="${userData.user_email}"]`);
    if (existingUser) {
      console.log('👤 UI VISIBILITY: User already in visibility list');
      return;
    }
    
    // Create user element
    const userElement = createUserElement(userData);
    visibilityContainer.appendChild(userElement);
    
    console.log('✅ UI VISIBILITY: User added to visibility list');
  }

  /**
   * Update user in visibility list
   */
  function updateUserInVisibilityList(userData) {
    const visibilityContainer = getOrCreateVisibilityContainer();
    const userElement = visibilityContainer.querySelector(`[data-user-id="${userData.user_email}"]`);
    
    if (userElement) {
      // Update user element
      updateUserElement(userElement, userData);
      console.log('✅ UI VISIBILITY: User updated in visibility list');
    } else {
      // User not found, add them
      addUserToVisibilityList(userData);
    }
  }

  /**
   * Remove user from visibility list
   */
  function removeUserFromVisibilityList(userData) {
    const visibilityContainer = getOrCreateVisibilityContainer();
    const userElement = visibilityContainer.querySelector(`[data-user-id="${userData.user_email}"]`);
    
    if (userElement) {
      userElement.remove();
      console.log('✅ UI VISIBILITY: User removed from visibility list');
    }
  }

  /**
   * Get or create visibility container
   */
  function getOrCreateVisibilityContainer() {
    let container = document.querySelector('.visibility-list');
    
    if (!container) {
      // Create visibility container
      container = document.createElement('div');
      container.className = 'visibility-list';
      container.innerHTML = '<h3>Active Users</h3>';
      
      // Add to sidebar
      const sidebar = document.querySelector('.sidebar-content') || document.body;
      sidebar.appendChild(container);
      
      console.log('✅ UI VISIBILITY: Visibility container created');
    }
    
    return container;
  }

  /**
   * Create user element
   */
  function createUserElement(userData) {
    const userElement = document.createElement('div');
    userElement.className = 'visibility-user';
    userElement.setAttribute('data-user-id', userData.user_email);
    userElement.setAttribute('data-user-email', userData.user_email);
    userElement.setAttribute('data-is-visible', userData.is_visible);
    
    // Create user content
    userElement.innerHTML = `
      <div class="user-avatar">
        <img src="${getUserAvatar(userData.user_email)}" alt="${userData.user_email}" />
      </div>
      <div class="user-info">
        <div class="user-name">${getUserDisplayName(userData.user_email)}</div>
        <div class="user-status ${userData.is_visible ? 'visible' : 'hidden'}">
          ${userData.is_visible ? 'Visible' : 'Hidden'}
        </div>
      </div>
    `;
    
    return userElement;
  }

  /**
   * Update user element
   */
  function updateUserElement(userElement, userData) {
    userElement.setAttribute('data-is-visible', userData.is_visible);
    
    const statusElement = userElement.querySelector('.user-status');
    if (statusElement) {
      statusElement.textContent = userData.is_visible ? 'Visible' : 'Hidden';
      statusElement.className = `user-status ${userData.is_visible ? 'visible' : 'hidden'}`;
    }
  }

  /**
   * Update presence indicators
   */
  function updatePresenceIndicators() {
    // Update any presence indicators in the UI
    const indicators = document.querySelectorAll('.presence-indicator');
    indicators.forEach(indicator => {
      // Update indicator based on current visibility state
      const isVisible = indicator.dataset.isVisible === 'true';
      indicator.className = `presence-indicator ${isVisible ? 'visible' : 'hidden'}`;
    });
  }

  /**
   * Get user avatar
   */
  function getUserAvatar(userEmail) {
    // Use the same avatar system as messages
    if (typeof window.createUnifiedAvatar === 'function') {
      // This would need to be adapted for visibility
      return 'https://lh3.googleusercontent.com/a/default-user=s96-c';
    }
    return 'https://lh3.googleusercontent.com/a/default-user=s96-c';
  }

  /**
   * Get user display name
   */
  function getUserDisplayName(userEmail) {
    // Extract name from email
    return userEmail.split('@')[0];
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeVisibilityBindings);
  } else {
    initializeVisibilityBindings();
  }

})();




