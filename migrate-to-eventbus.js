#!/usr/bin/env node

const fs = require('fs');

console.log('🔄 COMPLETE MODERNIZATION: EVENT HANDLING → EVENTBUS');
console.log('====================================================');

async function migrateToEventBus() {
  try {
    console.log('📋 Step 1: Creating backup...');
    
    const sidepanelPath = 'presence/sidepanel.js';
    const backupPath = `presence/sidepanel-backup-eventbus-${Date.now()}.js`;
    
    if (fs.existsSync(sidepanelPath)) {
      fs.copyFileSync(sidepanelPath, backupPath);
      console.log(`✅ Backup created: ${backupPath}`);
    } else {
      console.error('❌ sidepanel.js not found');
      return false;
    }

    console.log('📋 Step 2: Reading current sidepanel...');
    let sidepanelContent = fs.readFileSync(sidepanelPath, 'utf8');

    console.log('📋 Step 3: Adding EventBus integration...');
    
    // Add EventBus integration after StateManager
    const eventBusIntegration = `
// ===== EVENTBUS INTEGRATION =====
// Initialize EventBus for modern event handling
let eventBus = null;

async function initializeEventBus() {
  try {
    console.log('🚀 EVENTBUS: Initializing modern event system...');
    
    // Initialize EventBus
    eventBus = new EventBus();
    
    // Set up centralized event handling
    setupCentralizedEventHandling();
    
    console.log('✅ EVENTBUS: Modern event system initialized');
    return true;
  } catch (error) {
    console.error('❌ EVENTBUS: Error initializing:', error);
    return false;
  }
}

function setupCentralizedEventHandling() {
  console.log('🎯 EVENTBUS: Setting up centralized event handling...');
  
  // Avatar events
  eventBus.on('avatar:colorChanged', (data) => {
    console.log('🎨 EVENTBUS: Avatar color changed:', data.color);
    refreshAllAvatars();
    if (supabaseRealtimeClient) {
      broadcastAuraColorChange(data.color);
    }
  });
  
  eventBus.on('avatar:reset', () => {
    console.log('🔄 EVENTBUS: Avatar reset');
    resetUserAvatarBgColor();
  });
  
  // Message events
  eventBus.on('message:send', (data) => {
    console.log('💬 EVENTBUS: Sending message:', data.content);
    sendMessageToAPI(data.content);
  });
  
  eventBus.on('message:received', (data) => {
    console.log('📨 EVENTBUS: Message received:', data.message);
    addMessageToChat(data.message);
  });
  
  eventBus.on('message:deleted', (data) => {
    console.log('🗑️ EVENTBUS: Message deleted:', data.messageId);
    handleDeleteMessage(data.message);
  });
  
  // Presence events
  eventBus.on('presence:userJoined', (data) => {
    console.log('👋 EVENTBUS: User joined:', data.user);
    refreshVisibilityAvatars();
  });
  
  eventBus.on('presence:userLeft', (data) => {
    console.log('👋 EVENTBUS: User left:', data.user);
    refreshVisibilityAvatars();
  });
  
  eventBus.on('presence:userUpdated', (data) => {
    console.log('🔄 EVENTBUS: User updated:', data.user);
    updateUserAuraInUI(data.user.user_email, data.user.aura_color);
  });
  
  // Theme events
  eventBus.on('theme:changed', (data) => {
    console.log('🎨 EVENTBUS: Theme changed:', data.theme);
    applyTheme(data.theme);
  });
  
  // Community events
  eventBus.on('community:changed', (data) => {
    console.log('👥 EVENTBUS: Community changed:', data.community);
    updateCommunitiesUI(data.community);
  });
  
  // UI events
  eventBus.on('ui:modal:show', (data) => {
    console.log('📱 EVENTBUS: Show modal:', data.modal);
    showModal(data.modal);
  });
  
  eventBus.on('ui:modal:hide', (data) => {
    console.log('📱 EVENTBUS: Hide modal:', data.modal);
    hideModal(data.modal);
  });
  
  // Cross-profile events (replacing Chrome Storage)
  eventBus.on('crossProfile:auraChanged', (data) => {
    console.log('📡 EVENTBUS: Cross-profile aura changed:', data.color);
    updateUserAuraInUI(data.userEmail, data.color);
  });
  
  eventBus.on('crossProfile:messageAdded', (data) => {
    console.log('📡 EVENTBUS: Cross-profile message added:', data.message);
    addMessageToChat(data.message);
  });
  
  eventBus.on('crossProfile:messageDeleted', (data) => {
    console.log('📡 EVENTBUS: Cross-profile message deleted:', data.messageId);
    removeMessageFromUI(data.messageId);
  });
  
  console.log('✅ EVENTBUS: Centralized event handling setup complete');
}

// Modern event functions
function emitEvent(eventName, data = {}) {
  if (eventBus) {
    eventBus.emit(eventName, data);
    console.log('📡 EVENTBUS: Emitted event:', eventName, data);
  }
}

function onEvent(eventName, callback) {
  if (eventBus) {
    eventBus.on(eventName, callback);
    console.log('👂 EVENTBUS: Subscribed to event:', eventName);
  }
}

function offEvent(eventName, callback) {
  if (eventBus) {
    eventBus.off(eventName, callback);
    console.log('🔇 EVENTBUS: Unsubscribed from event:', eventName);
  }
}

// ===== END EVENTBUS INTEGRATION =====
`;

    // Find the right place to insert EventBus integration
    const insertPoint = sidepanelContent.indexOf('// ===== END STATEMANAGER INTEGRATION =====');
    if (insertPoint === -1) {
      console.error('❌ Could not find StateManager integration end marker');
      return false;
    }

    // Insert EventBus integration after StateManager
    const beforeInsert = sidepanelContent.substring(0, insertPoint + '// ===== END STATEMANAGER INTEGRATION ====='.length);
    const afterInsert = sidepanelContent.substring(insertPoint + '// ===== END STATEMANAGER INTEGRATION ====='.length);
    
    sidepanelContent = beforeInsert + '\n' + eventBusIntegration + '\n' + afterInsert;

    console.log('📋 Step 4: Replacing direct event handling with EventBus...');
    
    // Replace addEventListener calls with EventBus
    sidepanelContent = sidepanelContent.replace(
      /(\w+)\.addEventListener\(['"]([^'"]+)['"],\s*([^)]+)\)/g,
      (match, element, event, handler) => {
        return `// Modernized: ${element}.addEventListener('${event}', ${handler})\n  onEvent('${element}:${event}', ${handler})`;
      }
    );
    
    // Replace direct function calls with EventBus emissions
    sidepanelContent = sidepanelContent.replace(
      /refreshAllAvatars\(\)/g,
      'emitEvent("avatar:refresh")'
    );
    
    sidepanelContent = sidepanelContent.replace(
      /refreshUserAvatar\(\)/g,
      'emitEvent("avatar:userRefresh")'
    );
    
    sidepanelContent = sidepanelContent.replace(
      /loadChatHistory\(\)/g,
      'emitEvent("chat:loadHistory")'
    );
    
    sidepanelContent = sidepanelContent.replace(
      /addMessageToChat\(([^)]+)\)/g,
      'emitEvent("message:add", { message: $1 })'
    );

    console.log('📋 Step 5: Updating DOMContentLoaded to initialize EventBus...');
    
    // Update DOMContentLoaded to initialize EventBus
    sidepanelContent = sidepanelContent.replace(
      /\/\/ === Migrate from Chrome Storage ===\s*await migrateFromChromeStorage\(\);/,
      `// === Migrate from Chrome Storage ===
  await migrateFromChromeStorage();
  
  // === Initialize EventBus ===
  await initializeEventBus();`
    );

    console.log('📋 Step 6: Writing modernized sidepanel...');
    fs.writeFileSync(sidepanelPath, sidepanelContent);
    console.log('✅ EventBus integration complete!');

    console.log('\n🎉 EVENT HANDLING → EVENTBUS MIGRATION COMPLETE!');
    console.log('===============================================');
    console.log('✅ Replaced direct event handling with EventBus');
    console.log('✅ Added centralized event system');
    console.log('✅ Added modern event emissions');
    console.log('✅ Added event subscriptions');
    console.log('\nNext: Replace component management with LifecycleManager...');
    
    return true;

  } catch (error) {
    console.error('❌ Error during EventBus migration:', error);
    return false;
  }
}

// Run the migration
migrateToEventBus().then(success => {
  if (success) {
    console.log('\n✅ EventBus migration completed successfully!');
  } else {
    console.log('\n❌ EventBus migration failed!');
  }
});
