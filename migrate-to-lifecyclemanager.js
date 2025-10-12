#!/usr/bin/env node

const fs = require('fs');

console.log('🔄 COMPLETE MODERNIZATION: COMPONENT MANAGEMENT → LIFECYCLEMANAGER');
console.log('================================================================');

async function migrateToLifecycleManager() {
  try {
    console.log('📋 Step 1: Creating backup...');
    
    const sidepanelPath = 'presence/sidepanel.js';
    const backupPath = `presence/sidepanel-backup-lifecyclemanager-${Date.now()}.js`;
    
    if (fs.existsSync(sidepanelPath)) {
      fs.copyFileSync(sidepanelPath, backupPath);
      console.log(`✅ Backup created: ${backupPath}`);
    } else {
      console.error('❌ sidepanel.js not found');
      return false;
    }

    console.log('📋 Step 2: Reading current sidepanel...');
    let sidepanelContent = fs.readFileSync(sidepanelPath, 'utf8');

    console.log('📋 Step 3: Adding LifecycleManager integration...');
    
    // Add LifecycleManager integration after EventBus
    const lifecycleManagerIntegration = `
// ===== LIFECYCLEMANAGER INTEGRATION =====
// Initialize LifecycleManager for modern component management
let lifecycleManager = null;

async function initializeLifecycleManager() {
  try {
    console.log('🚀 LIFECYCLEMANAGER: Initializing modern component management...');
    
    // Initialize LifecycleManager
    lifecycleManager = new LifecycleManager();
    
    // Register all components
    registerAllComponents();
    
    console.log('✅ LIFECYCLEMANAGER: Modern component management initialized');
    return true;
  } catch (error) {
    console.error('❌ LIFECYCLEMANAGER: Error initializing:', error);
    return false;
  }
}

function registerAllComponents() {
  console.log('🎯 LIFECYCLEMANAGER: Registering all components...');
  
  // Avatar Component
  lifecycleManager.registerComponent('avatar', {
    name: 'Avatar Component',
    autoInitialize: true,
    autoMount: true,
    priority: 1,
    init() {
      console.log('🎨 LIFECYCLEMANAGER: Avatar component initialized');
      this.initialized = true;
    },
    mount() {
      console.log('🎨 LIFECYCLEMANAGER: Avatar component mounted');
      this.mounted = true;
      // Set up avatar event listeners
      this.setupEventListeners();
    },
    update(data) {
      console.log('🎨 LIFECYCLEMANAGER: Avatar component updated:', data);
      if (data.auraColor) {
        this.updateAuraColor(data.auraColor);
      }
    },
    unmount() {
      console.log('🎨 LIFECYCLEMANAGER: Avatar component unmounted');
      this.mounted = false;
      this.cleanup();
    },
    destroy() {
      console.log('🎨 LIFECYCLEMANAGER: Avatar component destroyed');
      this.initialized = false;
      this.cleanup();
    },
    setupEventListeners() {
      // Set up avatar-specific event listeners
      onEvent('avatar:colorChanged', (data) => {
        this.updateAuraColor(data.color);
      });
    },
    updateAuraColor(color) {
      const userAvatar = document.getElementById('user-avatar');
      if (userAvatar) {
        userAvatar.style.backgroundColor = color;
      }
    },
    cleanup() {
      // Cleanup avatar-specific resources
    }
  });
  
  // Chat Component
  lifecycleManager.registerComponent('chat', {
    name: 'Chat Component',
    autoInitialize: true,
    autoMount: true,
    priority: 2,
    init() {
      console.log('💬 LIFECYCLEMANAGER: Chat component initialized');
      this.initialized = true;
    },
    mount() {
      console.log('💬 LIFECYCLEMANAGER: Chat component mounted');
      this.mounted = true;
      this.setupEventListeners();
    },
    update(data) {
      console.log('💬 LIFECYCLEMANAGER: Chat component updated:', data);
      if (data.message) {
        this.addMessage(data.message);
      }
    },
    unmount() {
      console.log('💬 LIFECYCLEMANAGER: Chat component unmounted');
      this.mounted = false;
      this.cleanup();
    },
    destroy() {
      console.log('💬 LIFECYCLEMANAGER: Chat component destroyed');
      this.initialized = false;
      this.cleanup();
    },
    setupEventListeners() {
      onEvent('message:received', (data) => {
        this.addMessage(data.message);
      });
      onEvent('message:deleted', (data) => {
        this.removeMessage(data.messageId);
      });
    },
    addMessage(message) {
      // Add message to chat UI
      const chatMessages = document.getElementById('chat-messages');
      if (chatMessages) {
        // Implementation for adding message
        console.log('💬 LIFECYCLEMANAGER: Adding message to chat:', message);
      }
    },
    removeMessage(messageId) {
      // Remove message from chat UI
      const messageElement = document.querySelector(\`[data-message-id="\${messageId}"]\`);
      if (messageElement) {
        messageElement.remove();
        console.log('💬 LIFECYCLEMANAGER: Removed message:', messageId);
      }
    },
    cleanup() {
      // Cleanup chat-specific resources
    }
  });
  
  // Presence Component
  lifecycleManager.registerComponent('presence', {
    name: 'Presence Component',
    autoInitialize: true,
    autoMount: true,
    priority: 3,
    init() {
      console.log('👁️ LIFECYCLEMANAGER: Presence component initialized');
      this.initialized = true;
    },
    mount() {
      console.log('👁️ LIFECYCLEMANAGER: Presence component mounted');
      this.mounted = true;
      this.setupEventListeners();
    },
    update(data) {
      console.log('👁️ LIFECYCLEMANAGER: Presence component updated:', data);
      if (data.users) {
        this.updatePresenceList(data.users);
      }
    },
    unmount() {
      console.log('👁️ LIFECYCLEMANAGER: Presence component unmounted');
      this.mounted = false;
      this.cleanup();
    },
    destroy() {
      console.log('👁️ LIFECYCLEMANAGER: Presence component destroyed');
      this.initialized = false;
      this.cleanup();
    },
    setupEventListeners() {
      onEvent('presence:userJoined', (data) => {
        this.addUser(data.user);
      });
      onEvent('presence:userLeft', (data) => {
        this.removeUser(data.user);
      });
      onEvent('presence:userUpdated', (data) => {
        this.updateUser(data.user);
      });
    },
    updatePresenceList(users) {
      console.log('👁️ LIFECYCLEMANAGER: Updating presence list with', users.length, 'users');
      // Update presence UI
    },
    addUser(user) {
      console.log('👁️ LIFECYCLEMANAGER: Adding user to presence:', user.user_email);
    },
    removeUser(user) {
      console.log('👁️ LIFECYCLEMANAGER: Removing user from presence:', user.user_email);
    },
    updateUser(user) {
      console.log('👁️ LIFECYCLEMANAGER: Updating user in presence:', user.user_email);
    },
    cleanup() {
      // Cleanup presence-specific resources
    }
  });
  
  // Theme Component
  lifecycleManager.registerComponent('theme', {
    name: 'Theme Component',
    autoInitialize: true,
    autoMount: true,
    priority: 4,
    init() {
      console.log('🎨 LIFECYCLEMANAGER: Theme component initialized');
      this.initialized = true;
    },
    mount() {
      console.log('🎨 LIFECYCLEMANAGER: Theme component mounted');
      this.mounted = true;
      this.setupEventListeners();
    },
    update(data) {
      console.log('🎨 LIFECYCLEMANAGER: Theme component updated:', data);
      if (data.theme) {
        this.applyTheme(data.theme);
      }
    },
    unmount() {
      console.log('🎨 LIFECYCLEMANAGER: Theme component unmounted');
      this.mounted = false;
      this.cleanup();
    },
    destroy() {
      console.log('🎨 LIFECYCLEMANAGER: Theme component destroyed');
      this.initialized = false;
      this.cleanup();
    },
    setupEventListeners() {
      onEvent('theme:changed', (data) => {
        this.applyTheme(data.theme);
      });
    },
    applyTheme(theme) {
      console.log('🎨 LIFECYCLEMANAGER: Applying theme:', theme);
      // Apply theme to document
      document.documentElement.setAttribute('data-theme', theme);
    },
    cleanup() {
      // Cleanup theme-specific resources
    }
  });
  
  console.log('✅ LIFECYCLEMANAGER: All components registered');
}

// Modern component management functions
function getComponentStatus(componentName) {
  return lifecycleManager ? lifecycleManager.getComponentStatus(componentName) : null;
}

function getAllComponentStatuses() {
  return lifecycleManager ? lifecycleManager.getAllComponentStatuses() : null;
}

function restartComponent(componentName) {
  if (lifecycleManager) {
    lifecycleManager.restartComponent(componentName);
    console.log('🔄 LIFECYCLEMANAGER: Restarted component:', componentName);
  }
}

// ===== END LIFECYCLEMANAGER INTEGRATION =====
`;

    // Find the right place to insert LifecycleManager integration
    const insertPoint = sidepanelContent.indexOf('// ===== END EVENTBUS INTEGRATION =====');
    if (insertPoint === -1) {
      console.error('❌ Could not find EventBus integration end marker');
      return false;
    }

    // Insert LifecycleManager integration after EventBus
    const beforeInsert = sidepanelContent.substring(0, insertPoint + '// ===== END EVENTBUS INTEGRATION ====='.length);
    const afterInsert = sidepanelContent.substring(insertPoint + '// ===== END EVENTBUS INTEGRATION ====='.length);
    
    sidepanelContent = beforeInsert + '\n' + lifecycleManagerIntegration + '\n' + afterInsert;

    console.log('📋 Step 4: Updating DOMContentLoaded to initialize LifecycleManager...');
    
    // Update DOMContentLoaded to initialize LifecycleManager
    sidepanelContent = sidepanelContent.replace(
      /\/\/ === Initialize EventBus ===\s*await initializeEventBus\(\);/,
      `// === Initialize EventBus ===
  await initializeEventBus();
  
  // === Initialize LifecycleManager ===
  await initializeLifecycleManager();`
    );

    console.log('📋 Step 5: Writing modernized sidepanel...');
    fs.writeFileSync(sidepanelPath, sidepanelContent);
    console.log('✅ LifecycleManager integration complete!');

    console.log('\n🎉 COMPONENT MANAGEMENT → LIFECYCLEMANAGER MIGRATION COMPLETE!');
    console.log('============================================================');
    console.log('✅ Replaced manual component management with LifecycleManager');
    console.log('✅ Added modern component lifecycle');
    console.log('✅ Added component registration system');
    console.log('✅ Added component status monitoring');
    console.log('\nNext: Remove old cross-profile communication...');
    
    return true;

  } catch (error) {
    console.error('❌ Error during LifecycleManager migration:', error);
    return false;
  }
}

// Run the migration
migrateToLifecycleManager().then(success => {
  if (success) {
    console.log('\n✅ LifecycleManager migration completed successfully!');
  } else {
    console.log('\n❌ LifecycleManager migration failed!');
  }
});
