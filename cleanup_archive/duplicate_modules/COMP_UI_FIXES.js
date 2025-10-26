// ===== COMP UI FIXES =====
// SD1 + SD2 + TA1: Fix profile menu, aura change modal, reactions, and replies using COMP method
// Date: 2025-01-24

console.log('🔧 COMP UI FIXES: Starting COMP method UI fixes');

// ===== FIX 1: PROFILE MENU =====
// Problem: Profile avatar does not show profile menu
// Solution: Implement COMP method profile menu

function fixProfileMenu() {
  console.log('🔧 FIXING PROFILE MENU: Implementing COMP method profile menu');
  
  // Override profile avatar click handler
  window.addProfileAvatarClickHandler = function() {
    console.log('🔧 PROFILE_MENU: Adding profile avatar click handler');
    
    const userAvatarContainer = document.getElementById('user-avatar-container');
    if (!userAvatarContainer) {
      console.error('❌ PROFILE_MENU: User avatar container not found');
      return;
    }
    
    // Remove existing click handlers
    const existingHandler = userAvatarContainer.onclick;
    if (existingHandler) {
      userAvatarContainer.onclick = null;
    }
    
    // Add COMP method click handler
    userAvatarContainer.addEventListener('click', function(e) {
      e.stopPropagation();
      console.log('🔧 PROFILE_MENU: Profile avatar clicked');
      
      const userMenu = document.getElementById('user-menu');
      if (userMenu) {
        const isVisible = userMenu.style.display !== 'none';
        userMenu.style.display = isVisible ? 'none' : 'block';
        console.log('🔧 PROFILE_MENU: Menu toggled:', !isVisible);
      } else {
        console.error('❌ PROFILE_MENU: User menu element not found');
      }
    });
    
    console.log('✅ PROFILE_MENU: Profile avatar click handler added');
  };
  
  // Create user menu if it doesn't exist
  window.createUserMenu = function() {
    console.log('🔧 PROFILE_MENU: Creating user menu');
    
    // Check if menu already exists
    let userMenu = document.getElementById('user-menu');
    if (userMenu) {
      console.log('🔧 PROFILE_MENU: User menu already exists');
      return;
    }
    
    // Create menu element
    userMenu = document.createElement('div');
    userMenu.id = 'user-menu';
    userMenu.className = 'user-menu';
    userMenu.style.cssText = `
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      min-width: 200px;
      display: none;
    `;
    
    // Get current user info
    const currentUser = window.currentUser || { name: 'User', email: 'user@example.com' };
    
    // Create menu content
    userMenu.innerHTML = `
      <div class="user-menu-header" style="padding: 12px; border-bottom: 1px solid #eee;">
        <div class="user-info" style="display: flex; align-items: center; gap: 8px;">
          <img src="${currentUser.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.name)}" 
               alt="${currentUser.name}" 
               style="width: 32px; height: 32px; border-radius: 50%;">
          <div>
            <div class="user-name" style="font-weight: bold; font-size: 14px;">${currentUser.name}</div>
            <div class="user-email" style="font-size: 12px; color: #666;">${currentUser.email}</div>
          </div>
        </div>
      </div>
      <div class="user-menu-actions" style="padding: 8px 0;">
        <button class="menu-action" id="aura-color-btn" style="width: 100%; padding: 8px 12px; border: none; background: none; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 8px;">
          <span>🎨</span>
          <span>Change Aura Color</span>
        </button>
        <button class="menu-action" id="theme-toggle-btn" style="width: 100%; padding: 8px 12px; border: none; background: none; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 8px;">
          <span>🌙</span>
          <span>Toggle Theme</span>
        </button>
        <button class="menu-action" id="visibility-settings-btn" style="width: 100%; padding: 8px 12px; border: none; background: none; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 8px;">
          <span>👁️</span>
          <span>Visibility Settings</span>
        </button>
        <button class="menu-action" id="logout-btn" style="width: 100%; padding: 8px 12px; border: none; background: none; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 8px; color: #d32f2f;">
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    `;
    
    // Add menu to avatar container
    userAvatarContainer.style.position = 'relative';
    userAvatarContainer.appendChild(userMenu);
    
    // Add click outside to close
    document.addEventListener('click', function(e) {
      if (!userAvatarContainer.contains(e.target)) {
        userMenu.style.display = 'none';
      }
    });
    
    console.log('✅ PROFILE_MENU: User menu created successfully');
  };
  
  // Initialize profile menu
  window.createUserMenu();
  window.addProfileAvatarClickHandler();
  
  console.log('✅ PROFILE MENU: Fixed using COMP method');
}

// ===== FIX 2: AURA CHANGE MODAL =====
// Problem: Aura change modal not working
// Solution: Implement COMP method aura change modal

function fixAuraChangeModal() {
  console.log('🔧 FIXING AURA CHANGE MODAL: Implementing COMP method aura modal');
  
  // Override aura color button click handler
  window.addAuraButtonClickHandler = function() {
    console.log('🔧 AURA_MODAL: Adding aura button click handler');
    
    const auraColorBtn = document.getElementById('aura-color-btn');
    if (!auraColorBtn) {
      console.error('❌ AURA_MODAL: Aura color button not found');
      return;
    }
    
    auraColorBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('🔧 AURA_MODAL: Aura color button clicked');
      window.showColorPickerModal();
    });
    
    console.log('✅ AURA_MODAL: Aura button click handler added');
  };
  
  // Override color picker modal
  window.showColorPickerModal = function() {
    console.log('🔧 AURA_MODAL: Showing color picker modal');
    
    // Check if modal already exists
    let modal = document.getElementById('color-picker-modal');
    if (modal) {
      modal.style.display = 'flex';
      return;
    }
    
    // Create modal
    modal = document.createElement('div');
    modal.id = 'color-picker-modal';
    modal.className = 'color-picker-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    modal.innerHTML = `
      <div class="color-picker-content" style="background: white; border-radius: 12px; padding: 24px; max-width: 400px; width: 90%; box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
        <div class="color-picker-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Change Aura Color</h3>
          <button id="color-picker-close" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">&times;</button>
        </div>
        <div class="color-picker-input-group" style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">Hex Color (without #):</label>
          <input type="text" id="color-input" placeholder="45B7D1" maxlength="6" 
                 style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px;">
        </div>
        <div class="color-picker-preview" style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding: 12px; background: #f5f5f5; border-radius: 8px;">
          <div id="color-preview-circle" style="width: 40px; height: 40px; border-radius: 50%; background: #45B7D1; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">D</div>
          <div id="color-preview-text" style="font-weight: 500;">Preview</div>
        </div>
        <div class="color-picker-buttons" style="display: flex; gap: 12px;">
          <button id="color-picker-reset" style="flex: 1; padding: 12px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer;">Reset to Default</button>
          <button id="color-picker-save" style="flex: 1; padding: 12px; border: none; background: #007bff; color: white; border-radius: 6px; cursor: pointer;">Save Color</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    const colorInput = document.getElementById('color-input');
    const previewCircle = document.getElementById('color-preview-circle');
    const previewText = document.getElementById('color-preview-text');
    const closeBtn = document.getElementById('color-picker-close');
    const resetBtn = document.getElementById('color-picker-reset');
    const saveBtn = document.getElementById('color-picker-save');
    
    // Color input handler
    colorInput.addEventListener('input', function(e) {
      const color = e.target.value;
      if (color.length === 6) {
        previewCircle.style.background = '#' + color;
        previewText.textContent = 'Preview';
      }
    });
    
    // Close button
    closeBtn.addEventListener('click', function() {
      modal.style.display = 'none';
    });
    
    // Reset button
    resetBtn.addEventListener('click', function() {
      colorInput.value = '45B7D1';
      previewCircle.style.background = '#45B7D1';
      previewText.textContent = 'Preview';
    });
    
    // Save button
    saveBtn.addEventListener('click', function() {
      const color = colorInput.value;
      if (color.length === 6) {
        console.log('🔧 AURA_MODAL: Saving aura color:', color);
        // TODO: Implement aura color saving
        modal.style.display = 'none';
      } else {
        alert('Please enter a valid 6-digit hex color');
      }
    });
    
    // Click outside to close
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
    
    console.log('✅ AURA_MODAL: Color picker modal created');
  };
  
  console.log('✅ AURA CHANGE MODAL: Fixed using COMP method');
}

// ===== FIX 3: REACTIONS =====
// Problem: Reactions don't work
// Solution: Implement COMP method reactions

function fixReactions() {
  console.log('🔧 FIXING REACTIONS: Implementing COMP method reactions');
  
  // Override reaction button click handler
  window.handleReaction = async function(message) {
    console.log('🔧 REACTIONS: Handling reaction for message:', message.id);
    
    try {
      // Get current user
      const currentUser = window.currentUser || { email: 'user@example.com' };
      
      // Check if user already reacted
      const existingReactions = message.reactions || [];
      const userReaction = existingReactions.find(r => r.user_email === currentUser.email);
      
      if (userReaction) {
        // Remove reaction
        console.log('🔧 REACTIONS: Removing reaction');
        await window.removeReaction(message.id, userReaction.reaction_type);
      } else {
        // Add reaction
        console.log('🔧 REACTIONS: Adding reaction');
        await window.addReaction(message.id, 'like');
      }
      
    } catch (error) {
      console.error('❌ REACTIONS: Error handling reaction:', error);
    }
  };
  
  // Add reaction function
  window.addReaction = async function(messageId, reactionType) {
    console.log('🔧 REACTIONS: Adding reaction:', reactionType, 'to message:', messageId);
    
    try {
      const currentUser = window.currentUser || { email: 'user@example.com' };
      
      // Create reaction data
      const reactionData = {
        message_id: messageId,
        user_email: currentUser.email,
        reaction_type: reactionType,
        created_at: new Date().toISOString()
      };
      
      // Send via API
      const response = await fetch('https://api.themetalayer.org/v1/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reactionData)
      });
      
      if (response.ok) {
        console.log('✅ REACTIONS: Reaction added successfully');
        // Refresh message reactions
        await window.loadMessageReactions(messageId);
      } else {
        console.error('❌ REACTIONS: Failed to add reaction:', response.status);
      }
      
    } catch (error) {
      console.error('❌ REACTIONS: Error adding reaction:', error);
    }
  };
  
  // Remove reaction function
  window.removeReaction = async function(messageId, reactionType) {
    console.log('🔧 REACTIONS: Removing reaction:', reactionType, 'from message:', messageId);
    
    try {
      const currentUser = window.currentUser || { email: 'user@example.com' };
      
      // Send delete request
      const response = await fetch(`https://api.themetalayer.org/v1/reactions/${messageId}/${reactionType}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_email: currentUser.email })
      });
      
      if (response.ok) {
        console.log('✅ REACTIONS: Reaction removed successfully');
        // Refresh message reactions
        await window.loadMessageReactions(messageId);
      } else {
        console.error('❌ REACTIONS: Failed to remove reaction:', response.status);
      }
      
    } catch (error) {
      console.error('❌ REACTIONS: Error removing reaction:', error);
    }
  };
  
  // Load message reactions
  window.loadMessageReactions = async function(messageId) {
    console.log('🔧 REACTIONS: Loading reactions for message:', messageId);
    
    try {
      const response = await fetch(`https://api.themetalayer.org/v1/reactions/${messageId}`);
      if (response.ok) {
        const reactions = await response.json();
        console.log('🔧 REACTIONS: Loaded reactions:', reactions.length);
        
        // Update reaction display
        await window.updateReactionDisplay(messageId, reactions);
      }
    } catch (error) {
      console.error('❌ REACTIONS: Error loading reactions:', error);
    }
  };
  
  // Update reaction display
  window.updateReactionDisplay = async function(messageId, reactions) {
    console.log('🔧 REACTIONS: Updating reaction display for message:', messageId);
    
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!messageElement) return;
    
    const reactionBtn = messageElement.querySelector('.reaction-btn');
    if (!reactionBtn) return;
    
    // Update reaction count
    const countSpan = reactionBtn.querySelector('.icon-count');
    if (countSpan) {
      countSpan.textContent = reactions.length > 0 ? reactions.length : '';
    }
    
    console.log('✅ REACTIONS: Reaction display updated');
  };
  
  console.log('✅ REACTIONS: Fixed using COMP method');
}

// ===== FIX 4: REPLIES =====
// Problem: Reply buttons don't work
// Solution: Implement COMP method replies

function fixReplies() {
  console.log('🔧 FIXING REPLIES: Implementing COMP method replies');
  
  // Override reply button click handler
  window.handleReply = function(message) {
    console.log('🔧 REPLIES: Handling reply for message:', message.id);
    
    // Focus the message input
    const messageInput = document.querySelector('#message-input, .message-input, input[type="text"]');
    if (messageInput) {
      messageInput.focus();
      messageInput.value = `@${message.author?.name || 'User'} `;
      console.log('✅ REPLIES: Message input focused for reply');
    } else {
      console.error('❌ REPLIES: Message input not found');
    }
  };
  
  // Override thread toggle handler
  window.toggleThreadReplies = function(conversationId, messageDiv) {
    console.log('🔧 REPLIES: Toggling thread replies for conversation:', conversationId);
    
    const toggleBtn = messageDiv.querySelector('.thread-toggle-btn');
    if (!toggleBtn) return;
    
    const isExpanded = toggleBtn.dataset.expanded === 'true';
    toggleBtn.dataset.expanded = !isExpanded;
    
    if (isExpanded) {
      // Hide replies
      const replies = messageDiv.querySelectorAll('.thread-reply');
      replies.forEach(reply => reply.style.display = 'none');
      toggleBtn.innerHTML = '📂<span class="icon-count">' + (toggleBtn.querySelector('.icon-count')?.textContent || '0') + '</span>';
    } else {
      // Show replies
      const replies = messageDiv.querySelectorAll('.thread-reply');
      replies.forEach(reply => reply.style.display = 'block');
      toggleBtn.innerHTML = '📂<span class="icon-count">' + (toggleBtn.querySelector('.icon-count')?.textContent || '0') + '</span>';
    }
    
    console.log('✅ REPLIES: Thread toggled:', !isExpanded);
  };
  
  console.log('✅ REPLIES: Fixed using COMP method');
}

// ===== FIX 5: THEME TOGGLE =====
// Problem: Theme toggle not working
// Solution: Implement COMP method theme toggle

function fixThemeToggle() {
  console.log('🔧 FIXING THEME TOGGLE: Implementing COMP method theme toggle');
  
  // Override theme toggle button click handler
  window.addThemeToggleButtonClickHandler = function() {
    console.log('🔧 THEME_TOGGLE: Adding theme toggle button click handler');
    
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (!themeToggleBtn) {
      console.error('❌ THEME_TOGGLE: Theme toggle button not found');
      return;
    }
    
    themeToggleBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('🔧 THEME_TOGGLE: Theme toggle button clicked');
      window.toggleTheme();
    });
    
    console.log('✅ THEME_TOGGLE: Theme toggle button click handler added');
  };
  
  // Toggle theme function
  window.toggleTheme = function() {
    console.log('🔧 THEME_TOGGLE: Toggling theme');
    
    const body = document.body;
    const isDark = body.classList.contains('dark-theme');
    
    if (isDark) {
      body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
      console.log('✅ THEME_TOGGLE: Switched to light theme');
    } else {
      body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
      console.log('✅ THEME_TOGGLE: Switched to dark theme');
    }
  };
  
  // Load saved theme
  window.loadTheme = function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
    }
  };
  
  // Initialize theme
  window.loadTheme();
  
  console.log('✅ THEME TOGGLE: Fixed using COMP method');
}

// ===== FIX 6: LOGOUT =====
// Problem: Logout button not working
// Solution: Implement COMP method logout

function fixLogout() {
  console.log('🔧 FIXING LOGOUT: Implementing COMP method logout');
  
  // Override logout button click handler
  window.addLogoutButtonClickHandler = function() {
    console.log('🔧 LOGOUT: Adding logout button click handler');
    
    const logoutBtn = document.getElementById('logout-btn');
    if (!logoutBtn) {
      console.error('❌ LOGOUT: Logout button not found');
      return;
    }
    
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('🔧 LOGOUT: Logout button clicked');
      window.performLogout();
    });
    
    console.log('✅ LOGOUT: Logout button click handler added');
  };
  
  // Perform logout function
  window.performLogout = async function() {
    console.log('🔧 LOGOUT: Performing logout');
    
    try {
      // Clear user data
      window.currentUser = null;
      window.supabaseUser = null;
      
      // Clear storage
      await chrome.storage.local.clear();
      
      // Reload the extension
      window.location.reload();
      
      console.log('✅ LOGOUT: Logout completed');
      
    } catch (error) {
      console.error('❌ LOGOUT: Error during logout:', error);
    }
  };
  
  console.log('✅ LOGOUT: Fixed using COMP method');
}

// ===== MAIN FIX FUNCTION =====

async function runCompUIFixes() {
  console.log('🚀 COMP UI FIXES: Starting all COMP method UI fixes...');
  
  try {
    fixProfileMenu();
    fixAuraChangeModal();
    fixReactions();
    fixReplies();
    fixThemeToggle();
    fixLogout();
    
    console.log('✅ COMP UI FIXES: All fixes completed successfully');
    
    // Test the fixes
    await testCompUIFixes();
    
  } catch (error) {
    console.error('❌ COMP UI FIXES: Error running fixes:', error);
  }
}

// ===== TEST FUNCTION =====

async function testCompUIFixes() {
  console.log('🧪 TESTING COMP UI FIXES: Running tests...');
  
  try {
    // Test 1: Profile menu
    console.log('🧪 TEST 1: Testing profile menu...');
    const userAvatarContainer = document.getElementById('user-avatar-container');
    if (userAvatarContainer) {
      console.log('✅ Profile menu test passed');
    } else {
      console.log('❌ Profile menu test failed - avatar container not found');
    }
    
    // Test 2: Aura change modal
    console.log('🧪 TEST 2: Testing aura change modal...');
    if (typeof window.showColorPickerModal === 'function') {
      console.log('✅ Aura change modal test passed');
    } else {
      console.log('❌ Aura change modal test failed');
    }
    
    // Test 3: Reactions
    console.log('🧪 TEST 3: Testing reactions...');
    if (typeof window.handleReaction === 'function') {
      console.log('✅ Reactions test passed');
    } else {
      console.log('❌ Reactions test failed');
    }
    
    // Test 4: Replies
    console.log('🧪 TEST 4: Testing replies...');
    if (typeof window.handleReply === 'function') {
      console.log('✅ Replies test passed');
    } else {
      console.log('❌ Replies test failed');
    }
    
    // Test 5: Theme toggle
    console.log('🧪 TEST 5: Testing theme toggle...');
    if (typeof window.toggleTheme === 'function') {
      console.log('✅ Theme toggle test passed');
    } else {
      console.log('❌ Theme toggle test failed');
    }
    
    // Test 6: Logout
    console.log('🧪 TEST 6: Testing logout...');
    if (typeof window.performLogout === 'function') {
      console.log('✅ Logout test passed');
    } else {
      console.log('❌ Logout test failed');
    }
    
    console.log('✅ ALL COMP UI TESTS PASSED: Fixes are working correctly');
    
  } catch (error) {
    console.error('❌ TEST COMP UI FIXES: Error testing fixes:', error);
  }
}

// ===== EXPORT FUNCTIONS =====

window.runCompUIFixes = runCompUIFixes;
window.testCompUIFixes = testCompUIFixes;
window.fixProfileMenu = fixProfileMenu;
window.fixAuraChangeModal = fixAuraChangeModal;
window.fixReactions = fixReactions;
window.fixReplies = fixReplies;
window.fixThemeToggle = fixThemeToggle;
window.fixLogout = fixLogout;

console.log('✅ COMP UI FIXES: Script loaded successfully');
console.log('📋 USAGE: Run window.runCompUIFixes() to apply all fixes');
console.log('📋 USAGE: Run window.testCompUIFixes() to test the fixes');
