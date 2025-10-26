/**
 * AURA COLOR MODAL - Aura Color Management
 * Handles all aura color modal functionality
 */

class AuraColorModal {
  constructor() {
    this.logLevel = 'INFO';
    this.isInitialized = false;
  }

  /**
   * Initialize AuraColorModal
   */
  async initialize() {
    if (this.isInitialized) {
      this.log('WARN', 'AuraColorModal already initialized');
      return;
    }

    this.log('INFO', 'Initializing AuraColorModal...');
    
    try {
      // TODO: Initialize aura color systems here
      
      this.isInitialized = true;
      this.log('INFO', 'AuraColorModal initialized successfully');
    } catch (error) {
      this.log('ERROR', 'Failed to initialize AuraColorModal:', error);
      throw error;
    }
  }

  /**
   * Logging utility
   */
  log(level, message, ...args) {
    if (this.logLevel === 'SILENT') return;
    
    const levels = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
    if (levels[level] <= levels[this.logLevel]) {
      console.log(`[AuraColorModal] [${level}] ${message}`, ...args);
    }
  }
}

// ===== AURA COLOR FUNCTIONS (Move from sidepanel.js) =====
// TODO: Move these functions from sidepanel.js:

function showColorPickerModal() {
  console.log('🎨 COMP METHOD: Opening color picker modal...');
  
  // Check if modal already exists and is visible
  const existingModal = document.getElementById('color-picker-modal');
  if (existingModal) {
    console.log('🎨 COMP METHOD: Modal already exists, showing it');
    existingModal.style.display = 'flex';
    return;
  }
  
  // Create modal HTML
  const modalHTML = `
    <div class="color-picker-modal" id="color-picker-modal" style="display: flex;">
      <div class="color-picker-content">
        <div class="color-picker-header">
          <h3 class="color-picker-title">Change Aura Color</h3>
          <button class="color-picker-close" id="color-picker-close">&times;</button>
        </div>
        <div class="color-picker-input-group">
          <label class="color-picker-label" for="color-input">Hex Color (without #):</label>
          <input type="text" class="color-picker-input" id="color-input" placeholder="45B7D1" maxlength="6">
        </div>
        <div class="color-picker-preview">
          <div class="color-picker-preview-circle" id="color-preview-circle">D</div>
          <div class="color-picker-preview-text" id="color-preview-text">Preview</div>
        </div>
        <div class="color-picker-buttons">
          <button class="color-picker-btn" id="color-picker-reset">Reset to Default</button>
          <button class="color-picker-btn primary" id="color-picker-save">Save Color</button>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Wait for DOM to be ready before attaching event listeners
  setTimeout(() => {
    const modal = document.getElementById('color-picker-modal');
    const colorInput = document.getElementById('color-input');
    const previewCircle = document.getElementById('color-preview-circle');
    const previewText = document.getElementById('color-preview-text');
    const closeBtn = document.getElementById('color-picker-close');
    const resetBtn = document.getElementById('color-picker-reset');
    const saveBtn = document.getElementById('color-picker-save');
    
    if (!modal || !colorInput || !previewCircle || !previewText || !closeBtn || !resetBtn || !saveBtn) {
      console.error('❌ Modal elements not found after creation');
      return;
    }
    
    // Get current color and set initial values
    const currentColor = getCurrentUserAvatarBgColor();
    const currentHex = currentColor.replace('#', '');
    colorInput.value = currentHex;
    updateColorPreview(currentHex);
    
    // Remove any existing event listeners to prevent duplicates
    const newColorInput = colorInput.cloneNode(true);
    colorInput.parentNode.replaceChild(newColorInput, colorInput);
    
    // Event listeners
    newColorInput.addEventListener('input', (e) => {
      const hex = e.target.value.replace('#', '');
      updateColorPreview(hex);
    });
    
    closeBtn.addEventListener('click', closeColorPickerModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeColorPickerModal();
    });
    
    resetBtn.addEventListener('click', () => {
      // Get the dynamic default color (based on user's name) - use window.currentUser
      let defaultColor = '#45B7D1'; // Fallback
      const user = window.currentUser;
      if (user) {
        const name = user.user_metadata?.full_name || user.name || user.email || 'User';
        defaultColor = getAvatarColor(name);
      }
      const defaultHex = defaultColor.replace('#', '');
      newColorInput.value = defaultHex;
      updateColorPreview(defaultHex);
    });
    
    saveBtn.addEventListener('click', async () => {
      const hex = newColorInput.value.replace('#', '');
      if (isValidHex(hex)) {
        console.log('🎨 Saving aura color:', '#' + hex);
        // Use aura color directly - no separate background color function needed
        const auraColor = '#' + hex;
        console.log('🎨 Setting aura color:', auraColor);
        
        // Apply aura color to profile avatar using unified system
        if (window.currentUser) {
          window.currentUser.auraColor = auraColor;
          updateUI(window.currentUser);
          
          // Update all message avatars with new aura color
          console.log('🔍 AURA DEBUG: Updating all message avatars with new aura color');
          updateAllMessageAvatars(window.currentUser.email, auraColor);
          
          // Update all visibility avatars with new aura color
          console.log('🔍 AURA DEBUG: Updating all visibility avatars with new aura color');
          updateAllVisibilityAvatars(window.currentUser.email, auraColor);
          
          // Send aura change via real-time system
          if (window.aurasIntegration && window.aurasIntegration.isInitialized) {
            window.aurasIntegration.setAura(window.currentUser.email, auraColor);
          }
        }
        
        // Save aura color to storage and database
        if (typeof window.setState === 'function') {
          window.setState('userAvatarBgColor', auraColor);
        }
        
        // Update UI with new aura color
        updateUserAuraInUI(auraColor);
        
        // Broadcast aura change via WebSocket
        broadcastAuraChange(auraColor);
        
        closeColorPickerModal();
      } else {
        alert('Please enter a valid 6-digit hex color (e.g., 45B7D1)');
      }
    });
    
    // Add click outside to close modal
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeColorPickerModal();
      }
    });
    
    // Add escape key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        closeColorPickerModal();
      }
    });
    
    // Focus the input
    newColorInput.focus();
    newColorInput.select();
    
    console.log('🎨 Modal setup complete');
  }, 50);
}

function closeColorPickerModal() {
  const modal = document.getElementById('color-picker-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}


// Global functions for user avatar background color configuration (accessible from browser console)
// REMOVED - No separate background color functions needed
// window.setUserAvatarBgColor = setUserAvatarBgColor;
// window.resetUserAvatarBgColor = resetUserAvatarBgColor;
window.getCurrentUserAvatarBgColor = getCurrentUserAvatarBgColor;

// Color Picker Modal Functions
// Global function for updating color preview
function updateColorPreview(hex) {
  console.log('🔍 Updating preview with hex:', hex);
  const previewCircle = document.getElementById('color-preview-circle');
  const previewText = document.getElementById('color-preview-text');
  
  if (!previewCircle) {
    console.error('❌ Preview circle not found');
    return;
  }
  
  if (!previewText) {
    console.error('❌ Preview text not found');
    return;
  }
  
  if (isValidHex(hex)) {
    const color = '#' + hex;
    previewCircle.style.backgroundColor = color;
    previewText.textContent = color;
    console.log('✅ Preview updated with color:', color);
  } else {
    previewCircle.style.backgroundColor = '#cccccc';
    previewText.textContent = 'Invalid color';
    console.log('❌ Invalid hex color:', hex);
  }
}


// Global function to set custom avatar color for the current user
async function setCustomAvatarColor(color) {
  if (!color || !color.startsWith('#')) {
    console.error('❌ Invalid color. Please provide a hex color (e.g., #45B7D1)');
    return;
  }
  
  console.log('🎨 SD1 FIX: Setting aura color via Supabase real-time:', color);
  
  // SD1 FIX: Save to Supabase database and broadcast via real-time
  if (window.supabaseRealtimeClient && window.supabaseRealtimeClient.isInitialized) {
    try {
      // Update user's aura color in Supabase database
      await window.supabaseRealtimeClient.broadcastAuraColorChange(color);
      console.log('✅ SD1 FIX: Aura color saved to Supabase and broadcasted');
      
      // Update local state
      await setState('customAvatarColor', color);
      
      // Refresh all avatars
      await refreshAllAvatars();
    } catch (error) {
      console.error('❌ SD1 FIX: Failed to save aura color to Supabase:', error);
    }
  } else {
    console.warn('⚠️ SD1 FIX: Supabase client not available, using local storage only');
    // Fallback to local storage
    await setState('customAvatarColor', color);
    await refreshAllAvatars();
  }
}


async function resetUserAvatarBgColor() {
  // Reset to default aura color (no custom background color needed)
  if (window.currentUser) {
    window.currentUser.auraColor = '#aaaaaa'; // Default gray
  }
  
  // Remove from chrome storage
  removeStateMultiple(['userAvatarBgColor']);
  
  // Refresh all avatars (profile, message, and visibility)
  await refreshAllAvatars();
  
  // Broadcast aura color reset to other profiles
  try {
    chrome.runtime.sendMessage({
      type: 'AURA_COLOR_CHANGED',
      color: 'reset',
      timestamp: Date.now()
    });
    console.log('📡 AURA: Broadcasted aura color reset to other profiles');
  } catch (error) {
    console.log('📡 AURA: Could not broadcast to other profiles:', error);
  }
}

async function broadcastAuraColorChange(color) {
  if (supabaseRealtimeClient) {
    await supabaseRealtimeClient.broadcastAuraColorChange(color);
    console.log('🎨 SUPABASE: Aura color change broadcasted');
  }
}


function updateUserAuraInUI(userEmail, auraColor) {
  try {
    const timer = Date.now();
    console.log('Starting aura color UI update:', {
      userEmail,
      auraColor,
      isCurrentUser: window.currentUser?.email === userEmail
    });
    
    // Update message avatars for this user
    console.log('Updating message avatars');
    const messageContainers = document.querySelectorAll('.message');
    let messageAvatarsUpdated = 0;
    
    console.log('Found message containers:', { count: messageContainers.length });
    
    messageContainers.forEach((messageContainer, index) => {
      const avatarContainer = messageContainer.querySelector('.avatar-container');
      if (avatarContainer) {
        const messageId = messageContainer.getAttribute('data-message-id');
        if (messageId) {
          const messageData = window.currentChatData?.find(msg => msg.id === messageId);
          if (messageData && messageData.author && messageData.author.email === userEmail) {
            // Update the author's aura color
            messageData.author.auraColor = auraColor;
            
            // Re-render the avatar
            const newAvatarHTML = getSenderAvatar(messageData.author);
            avatarContainer.innerHTML = newAvatarHTML;
            
            messageAvatarsUpdated++;
            console.log('Updated message avatar:', {
              messageId,
              userEmail,
              auraColor,
              avatarIndex: index
            });
          }
        }
      }
    });
    
    console.log('Message avatars update complete:', {
      totalContainers: messageContainers.length,
      avatarsUpdated: messageAvatarsUpdated
    });
    
    // Update visibility avatars
    console.log('Refreshing visibility avatars');
    refreshVisibilityAvatars();
    
    // Update profile avatar if it's the current user
    const currentUser = window.currentUser || {};
    if (currentUser.email === userEmail) {
      console.log('Updating profile avatar for current user');
      const profileAvatarContainer = document.getElementById('user-avatar-container');
      if (profileAvatarContainer) {
        // Update profile avatar with new aura color
        const newProfileAvatarHTML = AvatarUtils.createUnifiedAvatar({
          id: currentUser.id || currentUser.email,
          userId: currentUser.id || currentUser.email,
          name: currentUser.name || currentUser.email,
          email: currentUser.email,
          avatarUrl: currentUser.avatarUrl,
          auraColor: auraColor,
        }, {
          size: 24,
          showAura: true,
          showStatus: false,
          context: 'profile'
        });
        
        // Set the HTML directly on the container
        profileAvatarContainer.innerHTML = newProfileAvatarHTML;
        console.log('Profile avatar updated using unified avatar:', {
          userEmail,
          auraColor
        });
        console.log('🎨 Updated profile avatar for current user with aura ' + auraColor);
      }
    }
    
    console.log('Aura UI update completed successfully');
  } catch (error) {
    console.error('❌ AURA_UI_UPDATE: Error updating aura in UI:', error);
    console.error('AURA_UI_UPDATE: Error updating aura in UI:', error);
    console.error('Aura UI update failed:', error.message);
  }
}

// Get the latest aura color from presence data for any user
function getLatestAuraColorFromPresence(userEmail) {
  try {
    // Check if we have presence data stored
    const presenceData = window.currentPresenceData || window.presenceData;
    if (presenceData && presenceData.active) {
      const user = presenceData.active.find(u => u.email === userEmail || u.id === userEmail || u.userId === userEmail);
      if (user && user.auraColor) {
        return user.auraColor;
      }
    }
    
    // Fallback: try to get from current visibility data
    const visibilityData = window.currentVisibilityData;
    if (visibilityData && visibilityData.active) {
      const user = visibilityData.active.find(u => u.email === userEmail || u.id === userEmail || u.userId === userEmail);
      if (user && user.auraColor) {
        return user.auraColor;
      }
    }
    
    // Additional fallback: check if this is the current user and get from stored aura color
    if (window.currentUser && window.currentUser.email === userEmail) {
      const storedAuraColor = window.currentUser.auraColor;
      if (storedAuraColor && storedAuraColor !== null && storedAuraColor !== 'null') {
        return storedAuraColor;
      }
    }
    
    return null;
  } catch (error) {
    console.error(`❌ GET_LATEST_AURA: Error getting latest aura color for ${userEmail}:`, error);
    return null;
  }
}

// ===== UNIFIED AVATAR SYSTEM =====
// This system ensures consistent avatar rendering across all contexts:
// - Profile header avatars
// - Message avatars  
// - Visibility list avatars

function getAvatarColor(name) {
  // Generate a consistent color based on the name (for message avatars)
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}


// Function to update all message avatars with new aura color
function updateAllMessageAvatars(userEmail, auraColor) {
  console.log('🔍 AURA DEBUG: Updating message avatars for user:', userEmail, 'with color:', auraColor);
  
  // Find all message avatars for this user - try multiple selectors
  const messageAvatars = document.querySelectorAll(`
    .message-avatar[data-user-email="${userEmail}"],
    .message-avatar[data-user-id="${userEmail}"],
    .avatar[data-user-email="${userEmail}"],
    .avatar[data-user-id="${userEmail}"],
    .message[data-author-id="${userEmail}"] .message-avatar,
    .message[data-author-id="${userEmail}"] .avatar,
    .message[data-author-id="${userEmail}"] img[src*="googleusercontent.com"]
  `);
  console.log('🔍 AURA DEBUG: Found message avatars:', messageAvatars.length);
  
  // Also try to find avatars in messages by user email
  const allMessages = document.querySelectorAll('.message');
  let foundInMessages = 0;
  
  allMessages.forEach(message => {
    const authorEmail = message.dataset.authorId || message.querySelector('[data-user-email]')?.dataset.userEmail;
    if (authorEmail === userEmail) {
      const avatar = message.querySelector('.message-avatar, .avatar');
      if (avatar) {
        foundInMessages++;
        console.log('🔍 AURA DEBUG: Found avatar in message:', avatar);
        updateAvatarAura(avatar, auraColor);
      }
    }
  });
  
  console.log('🔍 AURA DEBUG: Found avatars in messages:', foundInMessages);
  
  messageAvatars.forEach(avatar => {
    console.log('🔍 AURA DEBUG: Updating message avatar:', avatar);
    updateAvatarAura(avatar, auraColor);
  });
}

// Helper function to update a single avatar's aura
function updateAvatarAura(avatar, auraColor) {
  // Update the aura color in the avatar's data attribute
  avatar.setAttribute('data-aura-color', auraColor);
  
  // Update the avatar's aura visual effect
  const auraElement = avatar.querySelector('.aura-effect');
  if (auraElement) {
    auraElement.style.boxShadow = `0 0 10px 3px ${auraColor}`;
  } else {
    // Create aura effect if it doesn't exist
    const aura = document.createElement('div');
    aura.className = 'aura-effect';
    aura.style.cssText = `
      position: absolute;
      top: -3px;
      left: -3px;
      right: -3px;
      bottom: -3px;
      border-radius: 50%;
      box-shadow: 0 0 10px 3px ${auraColor};
      pointer-events: none;
      z-index: -1;
    `;
    avatar.style.position = 'relative';
    avatar.appendChild(aura);
  }
}

// Function to update all visibility avatars with new aura color
function updateAllVisibilityAvatars(userEmail, auraColor) {
  console.log('🔍 AURA DEBUG: Updating visibility avatars for user:', userEmail, 'with color:', auraColor);
  
  // Find all visibility avatars for this user - try multiple selectors
  const visibilityAvatars = document.querySelectorAll(`
    .avatar[data-user-email="${userEmail}"],
    .user-avatar[data-user-email="${userEmail}"],
    .avatar[data-user-id="${userEmail}"],
    .user-avatar[data-user-id="${userEmail}"]
  `);
  console.log('🔍 AURA DEBUG: Found visibility avatars:', visibilityAvatars.length);
  
  // Also try to find avatars in visibility containers
  const visibilityContainers = document.querySelectorAll('.visibility-container, .avatars-container, #canopi-visible');
  let foundInVisibility = 0;
  
  visibilityContainers.forEach(container => {
    const avatars = container.querySelectorAll('.avatar, .user-avatar');
    avatars.forEach(avatar => {
      const avatarEmail = avatar.dataset.userEmail || avatar.dataset.userId;
      if (avatarEmail === userEmail) {
        foundInVisibility++;
        console.log('🔍 AURA DEBUG: Found avatar in visibility container:', avatar);
        updateAvatarAura(avatar, auraColor);
      }
    });
  });
  
  console.log('🔍 AURA DEBUG: Found avatars in visibility containers:', foundInVisibility);
  
  visibilityAvatars.forEach(avatar => {
    console.log('🔍 AURA DEBUG: Updating visibility avatar:', avatar);
    updateAvatarAura(avatar, auraColor);
  });
}

// Broadcast aura color change to all users on the same page
async function broadcastAuraChange(auraColor) {
  try {
    console.log('[WEBSOCKET] Broadcasting aura color change:', auraColor);
    
    const user = window.currentUser;
    if (!user) {
      console.warn('[WEBSOCKET] No user found, cannot broadcast aura change');
      return;
    }
    
    // Get current page info
    const urlData = await normalizeCurrentUrl();
    
    // Send aura change message
    await sendSupabaseMessage({
      type: 'AURA_COLOR_CHANGED',
      userEmail: user.email,
      userId: user.id || user.email,
      auraColor: auraColor,
      pageId: urlData.pageId,
      url: urlData.normalizedUrl,
      timestamp: Date.now()
    });
    
    console.log('[WEBSOCKET] Aura color change broadcast sent');
  } catch (error) {
    console.error('[WEBSOCKET] Error broadcasting aura change:', error);
  }
}

function isValidHex(hex) {
  return /^[A-Fa-f0-9]{6}$/.test(hex);
}

// Export for global access
window.AuraColorModal = AuraColorModal;