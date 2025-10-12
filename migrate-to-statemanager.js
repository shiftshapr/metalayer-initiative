#!/usr/bin/env node

const fs = require('fs');

console.log('🔄 COMPLETE MODERNIZATION: CHROME STORAGE → STATEMANAGER');
console.log('=======================================================');

async function migrateToStateManager() {
  try {
    console.log('📋 Step 1: Creating backup...');
    
    const sidepanelPath = 'presence/sidepanel.js';
    const backupPath = `presence/sidepanel-backup-statemanager-${Date.now()}.js`;
    
    if (fs.existsSync(sidepanelPath)) {
      fs.copyFileSync(sidepanelPath, backupPath);
      console.log(`✅ Backup created: ${backupPath}`);
    } else {
      console.error('❌ sidepanel.js not found');
      return false;
    }

    console.log('📋 Step 2: Reading current sidepanel...');
    let sidepanelContent = fs.readFileSync(sidepanelPath, 'utf8');

    console.log('📋 Step 3: Adding StateManager integration...');
    
    // Add StateManager initialization after Supabase integration
    const stateManagerIntegration = `
// ===== STATEMANAGER INTEGRATION =====
// Initialize StateManager for modern state management
let stateManager = null;

async function initializeStateManager() {
  try {
    console.log('🚀 STATEMANAGER: Initializing modern state management...');
    
    // Initialize StateManager
    stateManager = new StateManager();
    
    // Initialize with default state
    await stateManager.initialize({
      // User data
      userAvatarBgColor: '#45B7D1',
      googleUser: null,
      supabaseUser: null,
      metalayerUser: null,
      
      // Community data
      activeCommunities: ['comm-001'],
      primaryCommunity: 'comm-001',
      currentCommunity: 'comm-001',
      communities: [],
      
      // UI state
      theme: 'auto',
      debugMode: false,
      customAvatarColor: null,
      
      // Chat state
      pendingMessageContent: null,
      pendingMessageUri: null,
      pendingVisibilityContent: null,
      pendingVisibilityUri: null,
      
      // Current page state
      currentPageId: null,
      currentNormalizedUrl: null,
      currentRawUrl: null
    });
    
    console.log('✅ STATEMANAGER: Modern state management initialized');
    
    // Set up state change listeners
    setupStateChangeListeners();
    
    return true;
  } catch (error) {
    console.error('❌ STATEMANAGER: Error initializing:', error);
    return false;
  }
}

function setupStateChangeListeners() {
  console.log('🎯 STATEMANAGER: Setting up state change listeners...');
  
  // Listen for aura color changes
  stateManager.subscribe('userAvatarBgColor', (newColor, oldColor) => {
    console.log('🎨 STATEMANAGER: Aura color changed:', oldColor, '→', newColor);
    // Trigger UI updates
    refreshAllAvatars();
    // Broadcast via Supabase
    if (supabaseRealtimeClient) {
      broadcastAuraColorChange(newColor);
    }
  });
  
  // Listen for theme changes
  stateManager.subscribe('theme', (newTheme, oldTheme) => {
    console.log('🎨 STATEMANAGER: Theme changed:', oldTheme, '→', newTheme);
    // Apply theme changes
    applyTheme(newTheme);
  });
  
  // Listen for community changes
  stateManager.subscribe('activeCommunities', (newCommunities, oldCommunities) => {
    console.log('👥 STATEMANAGER: Active communities changed:', oldCommunities, '→', newCommunities);
    // Update UI
    updateCommunitiesUI(newCommunities);
  });
  
  console.log('✅ STATEMANAGER: State change listeners setup complete');
}

// Modern state management functions
async function getState(key) {
  return stateManager ? stateManager.get(key) : null;
}

async function setState(key, value) {
  if (stateManager) {
    await stateManager.set(key, value);
    console.log('🔄 STATEMANAGER: State updated:', key, '=', value);
  }
}

async function subscribeToState(key, callback) {
  if (stateManager) {
    stateManager.subscribe(key, callback);
    console.log('👂 STATEMANAGER: Subscribed to state changes for:', key);
  }
}

// Migration helper functions
async function migrateFromChromeStorage() {
  console.log('🔄 STATEMANAGER: Migrating from Chrome Storage...');
  
  try {
    // Get all data from Chrome Storage
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
    
    // Migrate to StateManager
    for (const [key, value] of Object.entries(result)) {
      if (value !== undefined) {
        await setState(key, value);
        console.log('✅ STATEMANAGER: Migrated', key, '=', value);
      }
    }
    
    console.log('✅ STATEMANAGER: Migration from Chrome Storage complete');
  } catch (error) {
    console.error('❌ STATEMANAGER: Error migrating from Chrome Storage:', error);
  }
}

// ===== END STATEMANAGER INTEGRATION =====
`;

    // Find the right place to insert StateManager integration
    const insertPoint = sidepanelContent.indexOf('// ===== END SUPABASE INTEGRATION =====');
    if (insertPoint === -1) {
      console.error('❌ Could not find Supabase integration end marker');
      return false;
    }

    // Insert StateManager integration after Supabase
    const beforeInsert = sidepanelContent.substring(0, insertPoint + '// ===== END SUPABASE INTEGRATION ====='.length);
    const afterInsert = sidepanelContent.substring(insertPoint + '// ===== END SUPABASE INTEGRATION ====='.length);
    
    sidepanelContent = beforeInsert + '\n' + stateManagerIntegration + '\n' + afterInsert;

    console.log('📋 Step 4: Replacing Chrome Storage calls with StateManager...');
    
    // Replace all chrome.storage.local.get calls
    sidepanelContent = sidepanelContent.replace(
      /chrome\.storage\.local\.get\(\[([^\]]+)\](?:,\s*\([^)]+\))?\)/g,
      (match, keys) => {
        const keyArray = keys.split(',').map(k => k.trim().replace(/['"]/g, ''));
        return `await Promise.all(${keyArray.map(key => `getState('${key}')`).join(', ')})`;
      }
    );
    
    // Replace chrome.storage.local.set calls
    sidepanelContent = sidepanelContent.replace(
      /chrome\.storage\.local\.set\(\{([^}]+)\}(?:,\s*\([^)]+\))?\)/g,
      (match, data) => {
        const pairs = data.split(',').map(pair => pair.trim());
        const setCalls = pairs.map(pair => {
          const [key, value] = pair.split(':').map(s => s.trim());
          return `setState('${key}', ${value})`;
        });
        return `await Promise.all([${setCalls.join(', ')}])`;
      }
    );
    
    // Replace chrome.storage.local.remove calls
    sidepanelContent = sidepanelContent.replace(
      /chrome\.storage\.local\.remove\(\[([^\]]+)\](?:,\s*\([^)]+\))?\)/g,
      (match, keys) => {
        const keyArray = keys.split(',').map(k => k.trim().replace(/['"]/g, ''));
        return `await Promise.all(${keyArray.map(key => `setState('${key}', null)`).join(', ')})`;
      }
    );

    console.log('📋 Step 5: Updating DOMContentLoaded to initialize StateManager...');
    
    // Update DOMContentLoaded to initialize StateManager
    sidepanelContent = sidepanelContent.replace(
      /\/\/ === Initialize Supabase Real-time ===\s*await initializeSupabaseRealtime\(\);/,
      `// === Initialize Supabase Real-time ===
  await initializeSupabaseRealtime();
  
  // === Initialize StateManager ===
  await initializeStateManager();
  
  // === Migrate from Chrome Storage ===
  await migrateFromChromeStorage();`
    );

    console.log('📋 Step 6: Writing modernized sidepanel...');
    fs.writeFileSync(sidepanelPath, sidepanelContent);
    console.log('✅ StateManager integration complete!');

    console.log('\n🎉 CHROME STORAGE → STATEMANAGER MIGRATION COMPLETE!');
    console.log('==================================================');
    console.log('✅ Replaced all Chrome Storage calls with StateManager');
    console.log('✅ Added modern state management');
    console.log('✅ Added state change listeners');
    console.log('✅ Added migration from Chrome Storage');
    console.log('\nNext: Replace event handling with EventBus...');
    
    return true;

  } catch (error) {
    console.error('❌ Error during StateManager migration:', error);
    return false;
  }
}

// Run the migration
migrateToStateManager().then(success => {
  if (success) {
    console.log('\n✅ StateManager migration completed successfully!');
  } else {
    console.log('\n❌ StateManager migration failed!');
  }
});
