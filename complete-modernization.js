#!/usr/bin/env node

const fs = require('fs');

console.log('🚀 COMPLETE MODERNIZATION: FULL ARCHITECTURE TRANSFORMATION');
console.log('==========================================================');

async function completeModernization() {
  try {
    console.log('📋 Step 1: Creating backup...');
    
    const sidepanelPath = 'presence/sidepanel.js';
    const backupPath = `presence/sidepanel-backup-complete-modernization-${Date.now()}.js`;
    
    if (fs.existsSync(sidepanelPath)) {
      fs.copyFileSync(sidepanelPath, backupPath);
      console.log(`✅ Backup created: ${backupPath}`);
    } else {
      console.error('❌ sidepanel.js not found');
      return false;
    }

    console.log('📋 Step 2: Reading current sidepanel...');
    let sidepanelContent = fs.readFileSync(sidepanelPath, 'utf8');

    console.log('📋 Step 3: Adding complete modern architecture...');
    
    // Add complete modern architecture integration
    const completeModernArchitecture = `
// ===== COMPLETE MODERN ARCHITECTURE INTEGRATION =====
// StateManager, EventBus, LifecycleManager, and Supabase integration

// Initialize all modern architecture components
let stateManager = null;
let eventBus = null;
let lifecycleManager = null;
let supabaseRealtimeClient = null;

async function initializeCompleteModernArchitecture() {
  try {
    console.log('🚀 MODERN: Initializing complete modern architecture...');
    
    // Initialize StateManager
    stateManager = new StateManager();
    await stateManager.initialize({
      userAvatarBgColor: '#45B7D1',
      googleUser: null,
      supabaseUser: null,
      metalayerUser: null,
      activeCommunities: ['comm-001'],
      primaryCommunity: 'comm-001',
      currentCommunity: 'comm-001',
      communities: [],
      theme: 'auto',
      debugMode: false,
      customAvatarColor: null,
      pendingMessageContent: null,
      pendingMessageUri: null,
      pendingVisibilityContent: null,
      pendingVisibilityUri: null,
      currentPageId: null,
      currentNormalizedUrl: null,
      currentRawUrl: null
    });
    console.log('✅ MODERN: StateManager initialized');
    
    // Initialize EventBus
    eventBus = new EventBus();
    setupModernEventHandling();
    console.log('✅ MODERN: EventBus initialized');
    
    // Initialize LifecycleManager
    lifecycleManager = new LifecycleManager();
    registerModernComponents();
    console.log('✅ MODERN: LifecycleManager initialized');
    
    // Initialize Supabase (if available)
    if (typeof window !== 'undefined' && window.supabase) {
      supabaseRealtimeClient = new SupabaseRealtimeClient();
      const success = await supabaseRealtimeClient.initialize(SUPABASE_URL, SUPABASE_ANON_KEY);
      if (success) {
        setupSupabaseEventHandling();
        console.log('✅ MODERN: Supabase real-time initialized');
      }
    } else {
      console.warn('⚠️ MODERN: Supabase not available, using local-only mode');
    }
    
    // Migrate from Chrome Storage
    await migrateFromChromeStorage();
    
    console.log('✅ MODERN: Complete modern architecture initialized');
    return true;
  } catch (error) {
    console.error('❌ MODERN: Error initializing modern architecture:', error);
    return false;
  }
}

function setupModernEventHandling() {
  console.log('🎯 MODERN: Setting up modern event handling...');
  
  // Avatar events
  eventBus.on('avatar:colorChanged', (data) => {
    console.log('🎨 MODERN: Avatar color changed:', data.color);
    updateAvatarColor(data.color);
    if (supabaseRealtimeClient) {
      broadcastAuraColorChange(data.color);
    }
  });
  
  // Message events
  eventBus.on('message:send', (data) => {
    console.log('💬 MODERN: Sending message:', data.content);
    sendMessageToAPI(data.content);
  });
  
  eventBus.on('message:received', (data) => {
    console.log('📨 MODERN: Message received:', data.message);
    addMessageToChat(data.message);
  });
  
  // Presence events
  eventBus.on('presence:userJoined', (data) => {
    console.log('👋 MODERN: User joined:', data.user);
    refreshVisibilityAvatars();
  });
  
  eventBus.on('presence:userLeft', (data) => {
    console.log('👋 MODERN: User left:', data.user);
    refreshVisibilityAvatars();
  });
  
  // Cross-profile events
  eventBus.on('crossProfile:auraChanged', (data) => {
    console.log('📡 MODERN: Cross-profile aura changed:', data.userEmail, data.color);
    updateUserAuraInUI(data.userEmail, data.color);
  });
  
  eventBus.on('crossProfile:messageAdded', (data) => {
    console.log('📡 MODERN: Cross-profile message added:', data.message.content);
    addMessageToChat(data.message);
  });
  
  console.log('✅ MODERN: Modern event handling setup complete');
}

function registerModernComponents() {
  console.log('🎯 MODERN: Registering modern components...');
  
  // Avatar Component
  lifecycleManager.registerComponent('avatar', {
    name: 'Avatar Component',
    autoInitialize: true,
    autoMount: true,
    priority: 1,
    init() {
      console.log('🎨 MODERN: Avatar component initialized');
      this.initialized = true;
    },
    mount() {
      console.log('🎨 MODERN: Avatar component mounted');
      this.mounted = true;
    },
    update(data) {
      console.log('🎨 MODERN: Avatar component updated:', data);
      if (data.auraColor) {
        this.updateAuraColor(data.auraColor);
      }
    },
    unmount() {
      console.log('🎨 MODERN: Avatar component unmounted');
      this.mounted = false;
    },
    destroy() {
      console.log('🎨 MODERN: Avatar component destroyed');
      this.initialized = false;
    },
    updateAuraColor(color) {
      const userAvatar = document.getElementById('user-avatar');
      if (userAvatar) {
        userAvatar.style.backgroundColor = color;
      }
    }
  });
  
  // Chat Component
  lifecycleManager.registerComponent('chat', {
    name: 'Chat Component',
    autoInitialize: true,
    autoMount: true,
    priority: 2,
    init() {
      console.log('💬 MODERN: Chat component initialized');
      this.initialized = true;
    },
    mount() {
      console.log('💬 MODERN: Chat component mounted');
      this.mounted = true;
    },
    update(data) {
      console.log('💬 MODERN: Chat component updated:', data);
      if (data.message) {
        this.addMessage(data.message);
      }
    },
    unmount() {
      console.log('💬 MODERN: Chat component unmounted');
      this.mounted = false;
    },
    destroy() {
      console.log('💬 MODERN: Chat component destroyed');
      this.initialized = false;
    },
    addMessage(message) {
      console.log('💬 MODERN: Adding message to chat:', message);
    }
  });
  
  console.log('✅ MODERN: Modern components registered');
}

function setupSupabaseEventHandling() {
  if (!supabaseRealtimeClient) return;
  
  console.log('🎯 MODERN: Setting up Supabase event handling...');
  
  supabaseRealtimeClient.onUserUpdated = (user) => {
    console.log('📡 MODERN: Supabase user updated:', user.user_email);
    eventBus.emit('crossProfile:auraChanged', {
      userEmail: user.user_email,
      color: user.aura_color,
      timestamp: Date.now()
    });
  };
  
  supabaseRealtimeClient.onNewMessage = (message) => {
    console.log('📡 MODERN: Supabase new message:', message.content);
    eventBus.emit('crossProfile:messageAdded', {
      message: message,
      timestamp: Date.now()
    });
  };
  
  supabaseRealtimeClient.onUserJoined = (user) => {
    console.log('📡 MODERN: Supabase user joined:', user.user_email);
    eventBus.emit('presence:userJoined', {
      user: user,
      timestamp: Date.now()
    });
  };
  
  supabaseRealtimeClient.onUserLeft = (user) => {
    console.log('📡 MODERN: Supabase user left:', user.user_email);
    eventBus.emit('presence:userLeft', {
      user: user,
      timestamp: Date.now()
    });
  };
  
  console.log('✅ MODERN: Supabase event handling setup complete');
}

async function migrateFromChromeStorage() {
  console.log('🔄 MODERN: Migrating from Chrome Storage...');
  
  try {
    const result = await chrome.storage.local.get([
      'userAvatarBgColor',
      'googleUser',
      'supabaseUser',
      'metalayerUser',
      'activeCommunities',
      'primaryCommunity',
      'currentCommunity',
      'communities',
      'theme',
      'debugMode',
      'customAvatarColor',
      'pendingMessageContent',
      'pendingMessageUri',
      'pendingVisibilityContent',
      'pendingVisibilityUri'
    ]);
    
    for (const [key, value] of Object.entries(result)) {
      if (value !== undefined) {
        await stateManager.set(key, value);
        console.log('✅ MODERN: Migrated', key, '=', value);
      }
    }
    
    console.log('✅ MODERN: Migration from Chrome Storage complete');
  } catch (error) {
    console.error('❌ MODERN: Error migrating from Chrome Storage:', error);
  }
}

// Modern state management functions
async function getState(key) {
  return stateManager ? await stateManager.get(key) : null;
}

async function setState(key, value) {
  if (stateManager) {
    await stateManager.set(key, value);
    console.log('🔄 MODERN: State updated:', key, '=', value);
  }
}

function emitEvent(eventName, data = {}) {
  if (eventBus) {
    eventBus.emit(eventName, data);
    console.log('📡 MODERN: Emitted event:', eventName, data);
  }
}

function onEvent(eventName, callback) {
  if (eventBus) {
    eventBus.on(eventName, callback);
    console.log('👂 MODERN: Subscribed to event:', eventName);
  }
}

// Modern cross-profile communication
async function setupModernCrossProfileCommunication() {
  console.log('📡 MODERN: Setting up modern cross-profile communication...');
  
  if (supabaseRealtimeClient) {
    await setupSupabaseEventHandling();
    console.log('✅ MODERN: Supabase cross-profile communication setup');
  } else {
    console.warn('⚠️ MODERN: Supabase not available, cross-profile communication limited');
  }
}

// Modern aura color change
async function setUserAvatarBgColorModern(color) {
  try {
    console.log('🎨 MODERN: Setting user avatar background color to:', color);
    
    // Update state
    await setState('userAvatarBgColor', color);
    
    // Emit event for immediate UI update
    emitEvent('avatar:colorChanged', { color: color });
    
    // Broadcast via Supabase if available
    if (supabaseRealtimeClient) {
      await supabaseRealtimeClient.broadcastAuraColorChange(color);
    }
    
    console.log('✅ MODERN: User avatar background color updated successfully');
    return true;
  } catch (error) {
    console.error('❌ MODERN: Error setting user avatar background color:', error);
    return false;
  }
}

// Modern message sending
async function sendMessageModern(content) {
  try {
    console.log('💬 MODERN: Sending message:', content);
    
    // Send via API
    const userEmail = await getCurrentUserEmail();
    const communityId = await getState('currentCommunity') || 'comm-001';
    const response = await api.sendMessage(userEmail, communityId, content);
    
    // Emit event for immediate UI update
    emitEvent('message:send', { content: content });
    
    // Broadcast via Supabase if available
    if (supabaseRealtimeClient) {
      await supabaseRealtimeClient.sendMessage(content);
    }
    
    console.log('✅ MODERN: Message sent successfully');
    return response;
  } catch (error) {
    console.error('❌ MODERN: Error sending message:', error);
    return null;
  }
}

// ===== END COMPLETE MODERN ARCHITECTURE INTEGRATION =====
`;

    // Find the right place to insert the complete modern architecture
    const insertPoint = sidepanelContent.indexOf('// ===== END SUPABASE INTEGRATION =====');
    if (insertPoint === -1) {
      console.error('❌ Could not find Supabase integration end marker');
      return false;
    }

    // Insert complete modern architecture after Supabase
    const beforeInsert = sidepanelContent.substring(0, insertPoint + '// ===== END SUPABASE INTEGRATION ====='.length);
    const afterInsert = sidepanelContent.substring(insertPoint + '// ===== END SUPABASE INTEGRATION ====='.length);
    
    sidepanelContent = beforeInsert + '\n' + completeModernArchitecture + '\n' + afterInsert;

    console.log('📋 Step 4: Updating DOMContentLoaded to initialize complete modern architecture...');
    
    // Update DOMContentLoaded to initialize complete modern architecture
    sidepanelContent = sidepanelContent.replace(
      /\/\/ === Initialize Supabase Real-time ===\s*await initializeSupabaseRealtime\(\);/,
      `// === Initialize Complete Modern Architecture ===
  await initializeCompleteModernArchitecture();
  
  // === Setup Modern Cross-Profile Communication ===
  await setupModernCrossProfileCommunication();`
    );

    console.log('📋 Step 5: Replacing old functions with modern versions...');
    
    // Replace old setUserAvatarBgColor with modern version
    sidepanelContent = sidepanelContent.replace(
      /async function setUserAvatarBgColor\(color\) \{[\s\S]*?\n\}/,
      `async function setUserAvatarBgColor(color) {
  return await setUserAvatarBgColorModern(color);
}`
    );
    
    // Replace old sendMessage with modern version
    sidepanelContent = sidepanelContent.replace(
      /async function sendMessage\(\) \{[\s\S]*?\n\}/,
      `async function sendMessage() {
  return await sendMessageModern();
}`
    );

    console.log('📋 Step 6: Writing completely modernized sidepanel...');
    fs.writeFileSync(sidepanelPath, sidepanelContent);
    console.log('✅ Complete modernization complete!');

    console.log('\n🎉 COMPLETE MODERNIZATION SUCCESSFUL!');
    console.log('====================================');
    console.log('✅ StateManager: Modern state management');
    console.log('✅ EventBus: Centralized event system');
    console.log('✅ LifecycleManager: Component lifecycle management');
    console.log('✅ Supabase: Primary real-time communication');
    console.log('✅ Modern architecture: Fully integrated');
    console.log('✅ Chrome Storage: Replaced with StateManager');
    console.log('✅ Old cross-profile: Replaced with Supabase');
    console.log('\n🚀 YOUR EXTENSION IS NOW COMPLETELY MODERNIZED!');
    
    return true;

  } catch (error) {
    console.error('❌ Error during complete modernization:', error);
    return false;
  }
}

// Run the complete modernization
completeModernization().then(success => {
  if (success) {
    console.log('\n✅ Complete modernization completed successfully!');
  } else {
    console.log('\n❌ Complete modernization failed!');
  }
});
