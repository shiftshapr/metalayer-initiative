#!/usr/bin/env node

const fs = require('fs');

console.log('🔄 COMPLETE MODERNIZATION: REMOVE OLD CROSS-PROFILE COMMUNICATION');
console.log('================================================================');

async function removeOldCrossProfile() {
  try {
    console.log('📋 Step 1: Creating backup...');
    
    const sidepanelPath = 'presence/sidepanel.js';
    const backupPath = `presence/sidepanel-backup-remove-old-${Date.now()}.js`;
    
    if (fs.existsSync(sidepanelPath)) {
      fs.copyFileSync(sidepanelPath, backupPath);
      console.log(`✅ Backup created: ${backupPath}`);
    } else {
      console.error('❌ sidepanel.js not found');
      return false;
    }

    console.log('📋 Step 2: Reading current sidepanel...');
    let sidepanelContent = fs.readFileSync(sidepanelPath, 'utf8');

    console.log('📋 Step 3: Removing old Chrome Storage cross-profile communication...');
    
    // Remove old setupCrossProfileCommunication function
    const oldCrossProfilePattern = /function setupCrossProfileCommunication\(\) \{[\s\S]*?\n\}/;
    sidepanelContent = sidepanelContent.replace(oldCrossProfilePattern, '');
    
    // Remove old chrome.runtime.sendMessage calls
    sidepanelContent = sidepanelContent.replace(
      /chrome\.runtime\.sendMessage\(\{[\s\S]*?\}\);/g,
      '// Removed: Old cross-profile communication'
    );
    
    // Remove old chrome.storage.onChanged listeners
    sidepanelContent = sidepanelContent.replace(
      /chrome\.storage\.onChanged\.addListener\([\s\S]*?\}\);/g,
      '// Removed: Old Chrome Storage cross-profile communication'
    );
    
    // Remove old chrome.runtime.onMessage listeners
    sidepanelContent = sidepanelContent.replace(
      /chrome\.runtime\.onMessage\.addListener\([\s\S]*?\}\);/g,
      '// Removed: Old Chrome runtime cross-profile communication'
    );

    console.log('📋 Step 4: Adding modern Supabase-only cross-profile communication...');
    
    // Add modern cross-profile communication using Supabase only
    const modernCrossProfileIntegration = `
// ===== MODERN CROSS-PROFILE COMMUNICATION (SUPABASE ONLY) =====
// Modern cross-profile communication using Supabase real-time only
async function setupModernCrossProfileCommunication() {
  console.log('📡 MODERN: Setting up Supabase-only cross-profile communication...');
  
  if (!supabaseRealtimeClient) {
    console.warn('⚠️ MODERN: Supabase real-time client not available, skipping cross-profile setup');
    return;
  }
  
  // Set up Supabase real-time event handlers for cross-profile communication
  supabaseRealtimeClient.onUserUpdated = (user) => {
    console.log('📡 MODERN: Cross-profile user updated via Supabase:', user.user_email);
    emitEvent('crossProfile:auraChanged', {
      userEmail: user.user_email,
      color: user.aura_color,
      timestamp: Date.now()
    });
  };
  
  supabaseRealtimeClient.onNewMessage = (message) => {
    console.log('📡 MODERN: Cross-profile new message via Supabase:', message.content);
    emitEvent('crossProfile:messageAdded', {
      message: message,
      timestamp: Date.now()
    });
  };
  
  // Handle user presence changes
  supabaseRealtimeClient.onUserJoined = (user) => {
    console.log('📡 MODERN: Cross-profile user joined via Supabase:', user.user_email);
    emitEvent('crossProfile:userJoined', {
      user: user,
      timestamp: Date.now()
    });
  };
  
  supabaseRealtimeClient.onUserLeft = (user) => {
    console.log('📡 MODERN: Cross-profile user left via Supabase:', user.user_email);
    emitEvent('crossProfile:userLeft', {
      user: user,
      timestamp: Date.now()
    });
  };
  
  console.log('✅ MODERN: Supabase-only cross-profile communication setup complete');
}

// Modern cross-profile event handlers
function setupModernCrossProfileEventHandling() {
  console.log('🎯 MODERN: Setting up modern cross-profile event handling...');
  
  // Handle cross-profile aura changes
  onEvent('crossProfile:auraChanged', (data) => {
    console.log('🎨 MODERN: Cross-profile aura changed:', data.userEmail, data.color);
    updateUserAuraInUI(data.userEmail, data.color);
  });
  
  // Handle cross-profile new messages
  onEvent('crossProfile:messageAdded', (data) => {
    console.log('💬 MODERN: Cross-profile message added:', data.message.content);
    addMessageToChat(data.message);
  });
  
  // Handle cross-profile user presence
  onEvent('crossProfile:userJoined', (data) => {
    console.log('👋 MODERN: Cross-profile user joined:', data.user.user_email);
    refreshVisibilityAvatars();
  });
  
  onEvent('crossProfile:userLeft', (data) => {
    console.log('👋 MODERN: Cross-profile user left:', data.user.user_email);
    refreshVisibilityAvatars();
  });
  
  console.log('✅ MODERN: Cross-profile event handling setup complete');
}

// ===== END MODERN CROSS-PROFILE COMMUNICATION =====
`;

    // Find the right place to insert modern cross-profile communication
    const insertPoint = sidepanelContent.indexOf('// ===== END LIFECYCLEMANAGER INTEGRATION =====');
    if (insertPoint === -1) {
      console.error('❌ Could not find LifecycleManager integration end marker');
      return false;
    }

    // Insert modern cross-profile communication after LifecycleManager
    const beforeInsert = sidepanelContent.substring(0, insertPoint + '// ===== END LIFECYCLEMANAGER INTEGRATION ====='.length);
    const afterInsert = sidepanelContent.substring(insertPoint + '// ===== END LIFECYCLEMANAGER INTEGRATION ====='.length);
    
    sidepanelContent = beforeInsert + '\n' + modernCrossProfileIntegration + '\n' + afterInsert;

    console.log('📋 Step 5: Updating DOMContentLoaded to use modern cross-profile communication...');
    
    // Replace old cross-profile communication with modern version
    sidepanelContent = sidepanelContent.replace(
      /\/\/ === Initialize Cross-Profile Communication ===\s*setupCrossProfileCommunication\(\);/,
      `// === Initialize Modern Cross-Profile Communication ===
  await setupModernCrossProfileCommunication();
  setupModernCrossProfileEventHandling();`
    );

    console.log('📋 Step 6: Making Supabase the primary real-time system...');
    
    // Update aura color change to use Supabase as primary
    sidepanelContent = sidepanelContent.replace(
      /\/\/ Broadcast aura color change via Supabase real-time\s*await broadcastAuraColorChange\(color\);/,
      `// Broadcast aura color change via Supabase real-time (PRIMARY)
  await broadcastAuraColorChange(color);
  
  // Emit local event for immediate UI update
  emitEvent('avatar:colorChanged', { color: color });`
    );
    
    // Update message sending to use Supabase as primary
    sidepanelContent = sidepanelContent.replace(
      /\/\/ Send message via Supabase real-time\s*await sendMessageViaSupabase\(message\);/,
      `// Send message via Supabase real-time (PRIMARY)
  await sendMessageViaSupabase(message);
  
  // Emit local event for immediate UI update
  emitEvent('message:send', { content: message });`
    );

    console.log('📋 Step 7: Writing modernized sidepanel...');
    fs.writeFileSync(sidepanelPath, sidepanelContent);
    console.log('✅ Old cross-profile communication removal complete!');

    console.log('\n🎉 OLD CROSS-PROFILE COMMUNICATION REMOVAL COMPLETE!');
    console.log('==================================================');
    console.log('✅ Removed old Chrome Storage cross-profile communication');
    console.log('✅ Removed old chrome.runtime cross-profile communication');
    console.log('✅ Added modern Supabase-only cross-profile communication');
    console.log('✅ Made Supabase the primary real-time system');
    console.log('\nNext: Test the completely modernized system...');
    
    return true;

  } catch (error) {
    console.error('❌ Error during old cross-profile communication removal:', error);
    return false;
  }
}

// Run the migration
removeOldCrossProfile().then(success => {
  if (success) {
    console.log('\n✅ Old cross-profile communication removal completed successfully!');
  } else {
    console.log('\n❌ Old cross-profile communication removal failed!');
  }
});
