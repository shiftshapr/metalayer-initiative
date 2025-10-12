#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 SUPABASE INTEGRATION SCRIPT');
console.log('==============================');

// Configuration
const SUPABASE_CONFIG = {
  // You'll need to replace these with your actual Supabase project details
  url: 'YOUR_SUPABASE_URL_HERE',
  anonKey: 'YOUR_SUPABASE_ANON_KEY_HERE'
};

async function integrateSupabase() {
  try {
    console.log('📋 Step 1: Creating backup...');
    
    // Create backup
    const sidepanelPath = 'presence/sidepanel.js';
    const backupPath = `presence/sidepanel-backup-${Date.now()}.js`;
    
    if (fs.existsSync(sidepanelPath)) {
      fs.copyFileSync(sidepanelPath, backupPath);
      console.log(`✅ Backup created: ${backupPath}`);
    } else {
      console.error('❌ sidepanel.js not found');
      return false;
    }

    console.log('📋 Step 2: Reading current sidepanel...');
    let sidepanelContent = fs.readFileSync(sidepanelPath, 'utf8');

    console.log('📋 Step 3: Adding Supabase integration...');
    
    // Add Supabase client import and initialization
    const supabaseIntegration = `
// ===== SUPABASE REAL-TIME INTEGRATION =====
// Add this after the existing imports at the top of the file

// Supabase configuration (replace with your actual values)
const SUPABASE_URL = '${SUPABASE_CONFIG.url}';
const SUPABASE_ANON_KEY = '${SUPABASE_CONFIG.anonKey}';

// Initialize Supabase real-time client
let supabaseRealtimeClient = null;

async function initializeSupabaseRealtime() {
  try {
    console.log('🚀 SUPABASE: Initializing real-time client...');
    
    // Load Supabase client (you'll need to add the CDN script to your HTML)
    if (typeof window !== 'undefined' && window.supabase) {
      supabaseRealtimeClient = new SupabaseRealtimeClient();
      const success = await supabaseRealtimeClient.initialize(SUPABASE_URL, SUPABASE_ANON_KEY);
      
      if (success) {
        console.log('✅ SUPABASE: Real-time client initialized');
        
        // Set up event handlers
        supabaseRealtimeClient.onUserJoined = (user) => {
          console.log('👋 SUPABASE: User joined:', user.user_email);
          // Refresh visibility avatars
          refreshVisibilityAvatars();
        };
        
        supabaseRealtimeClient.onUserUpdated = (user) => {
          console.log('🔄 SUPABASE: User updated:', user.user_email);
          // Update user's aura color in real-time
          if (user.aura_color) {
            updateUserAuraInUI(user.user_email, user.aura_color);
          }
        };
        
        supabaseRealtimeClient.onUserLeft = (user) => {
          console.log('👋 SUPABASE: User left:', user.user_email);
          // Refresh visibility avatars
          refreshVisibilityAvatars();
        };
        
        supabaseRealtimeClient.onNewMessage = (message) => {
          console.log('💬 SUPABASE: New message:', message.content);
          // Add message to chat
          addMessageToChat(message);
        };
        
        return true;
      } else {
        console.error('❌ SUPABASE: Failed to initialize real-time client');
        return false;
      }
    } else {
      console.warn('⚠️ SUPABASE: Supabase client not available, skipping real-time features');
      return false;
    }
  } catch (error) {
    console.error('❌ SUPABASE: Error initializing real-time client:', error);
    return false;
  }
}

async function joinPageWithSupabase(pageId, pageUrl) {
  if (supabaseRealtimeClient) {
    const userEmail = await getCurrentUserEmail();
    const userId = await getCurrentUserId();
    
    await supabaseRealtimeClient.setCurrentUser(userEmail, userId);
    await supabaseRealtimeClient.joinPage(pageId, pageUrl);
    console.log('🌐 SUPABASE: Joined page with real-time updates');
  }
}

async function broadcastAuraColorChange(color) {
  if (supabaseRealtimeClient) {
    await supabaseRealtimeClient.broadcastAuraColorChange(color);
    console.log('🎨 SUPABASE: Aura color change broadcasted');
  }
}

async function sendMessageViaSupabase(content) {
  if (supabaseRealtimeClient) {
    await supabaseRealtimeClient.sendMessage(content);
    console.log('💬 SUPABASE: Message sent via real-time');
  }
}

function updateUserAuraInUI(userEmail, auraColor) {
  // Update message avatars for this user
  const messageContainers = document.querySelectorAll('.message');
  messageContainers.forEach(messageContainer => {
    const avatarContainer = messageContainer.querySelector('.message-avatar');
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
          
          console.log('🎨 SUPABASE: Updated message avatar for ' + userEmail + ' with aura ' + auraColor);
        }
      }
    }
  });
  
  // Update visibility avatars
  refreshVisibilityAvatars();
}

async function refreshVisibilityAvatars() {
  if (supabaseRealtimeClient && currentPageId) {
    const users = await supabaseRealtimeClient.getPageUsers(currentPageId);
    console.log('👁️ SUPABASE: Refreshing visibility with real-time users:', users.length);
    
    // Update combined avatars with real-time data
    const activeCommunities = await chrome.storage.local.get(['activeCommunities']);
    const communities = activeCommunities.activeCommunities || ['comm-001'];
    await loadCombinedAvatars(communities);
  }
}

// ===== END SUPABASE INTEGRATION =====
`;

    // Find the right place to insert the Supabase integration
    const insertPoint = sidepanelContent.indexOf('// ===== EXTENSION RELOAD & BUILD TRACKING =====');
    if (insertPoint === -1) {
      console.error('❌ Could not find insertion point in sidepanel.js');
      return false;
    }

    // Insert Supabase integration
    const beforeInsert = sidepanelContent.substring(0, insertPoint);
    const afterInsert = sidepanelContent.substring(insertPoint);
    
    sidepanelContent = beforeInsert + supabaseIntegration + '\n' + afterInsert;

    console.log('📋 Step 4: Updating existing functions...');
    
    // Update startPresenceTracking to use Supabase
    sidepanelContent = sidepanelContent.replace(
      /async function startPresenceTracking\(\) \{[\s\S]*?\}/,
      `async function startPresenceTracking() {
        try {
          // Clear any existing heartbeat interval to prevent duplicates
          if (presenceHeartbeatInterval) {
            clearInterval(presenceHeartbeatInterval);
            presenceHeartbeatInterval = null;
          }

          // Get normalized URL data - SAME AS MESSAGES AND VISIBILITY
          const urlData = await normalizeCurrentUrl();
          currentPageId = urlData.pageId;

          console.log('🔍 PRESENCE: Starting presence tracking for normalized page:', urlData.normalizedUrl, 'pageId:', currentPageId, '(from raw:', urlData.rawUrl, ')');
          console.log('🔍 PRESENCE: Current user email:', await getCurrentUserEmail());
          console.log('🔍 PRESENCE: Current user ID:', await getCurrentUserId());

          // Join page with Supabase real-time
          await joinPageWithSupabase(currentPageId, urlData.normalizedUrl);

          // Send initial ENTER event
          console.log('🔍 PRESENCE: Sending initial ENTER event...');
          await sendPresenceEvent('ENTER');
          console.log('🔍 PRESENCE: ENTER event sent successfully');

          // Start heartbeat (every 30 seconds to reduce server load)
          presenceHeartbeatInterval = setInterval(async () => {
            try {
              // Get normalized URL data for heartbeat - SAME AS MESSAGES AND VISIBILITY
              const urlData = await normalizeCurrentUrl();
              const currentPageId = urlData.pageId;
              console.log('💓 HEARTBEAT: Sending heartbeat for normalized page:', urlData.normalizedUrl, 'pageId:', currentPageId, '(from raw:', urlData.rawUrl, ')');

              // Send heartbeat with current page info
              await sendPresenceEvent('HEARTBEAT');
              console.log('💓 HEARTBEAT: Heartbeat sent successfully');
            } catch (error) {
              console.error('❌ HEARTBEAT: Error sending heartbeat:', error);
            }
          }, 30000); // Every 30 seconds

          console.log('✅ PRESENCE: Presence tracking started');
        } catch (error) {
          console.error('❌ PRESENCE: Error starting presence tracking:', error);
        }
      }`
    );

    // Update setUserAvatarBgColor to use Supabase
    sidepanelContent = sidepanelContent.replace(
      /async function setUserAvatarBgColor\(color\) \{[\s\S]*?\}/,
      `async function setUserAvatarBgColor(color) {
        try {
          console.log('🎨 Setting user avatar background color to:', color);
          
          // Update local storage
          await chrome.storage.local.set({ userAvatarBgColor: color });
          console.log('✅ User avatar background color saved to storage');

          // Update profile avatar immediately
          refreshUserAvatar();

          // Broadcast aura color change via Supabase real-time
          await broadcastAuraColorChange(color);

          // Refresh all avatars
          await refreshAllAvatars();

          console.log('✅ User avatar background color updated successfully');
        } catch (error) {
          console.error('❌ Error setting user avatar background color:', error);
        }
      }`
    );

    // Update message sending to use Supabase
    const sendMessagePattern = /async function sendMessage\(\) \{[\s\S]*?\}/;
    const sendMessageMatch = sidepanelContent.match(sendMessagePattern);
    if (sendMessageMatch) {
      const originalSendMessage = sendMessageMatch[0];
      const updatedSendMessage = originalSendMessage.replace(
        /console\.log\('✅ Message sent successfully'\);/,
        `console.log('✅ Message sent successfully');
          
          // Send message via Supabase real-time
          await sendMessageViaSupabase(messageContent);`
      );
      sidepanelContent = sidepanelContent.replace(originalSendMessage, updatedSendMessage);
    }

    // Update DOMContentLoaded to initialize Supabase
    sidepanelContent = sidepanelContent.replace(
      /document\.addEventListener\('DOMContentLoaded', async function\(\) \{/,
      `document.addEventListener('DOMContentLoaded', async function() {
        // Initialize Supabase real-time
        await initializeSupabaseRealtime();`
    );

    console.log('📋 Step 5: Writing updated sidepanel...');
    fs.writeFileSync(sidepanelPath, sidepanelContent);
    console.log('✅ Supabase integration complete!');

    console.log('📋 Step 6: Creating HTML update script...');
    
    // Create script to add Supabase CDN to HTML
    const htmlUpdateScript = `
// Add this script tag to your sidepanel.html <head> section:
// <script src="https://cdn.skypack.dev/@supabase/supabase-js"></script>
// <script src="supabase-client.js"></script>

console.log('📋 HTML Update Required:');
console.log('1. Add Supabase CDN to sidepanel.html:');
console.log('   <script src="https://cdn.skypack.dev/@supabase/supabase-js"></script>');
console.log('2. Add Supabase client script:');
console.log('   <script src="supabase-client.js"></script>');
console.log('3. Replace YOUR_SUPABASE_URL_HERE and YOUR_SUPABASE_ANON_KEY_HERE with your actual values');
`;

    fs.writeFileSync('supabase-html-update.js', htmlUpdateScript);
    console.log('✅ HTML update script created: supabase-html-update.js');

    console.log('\\n🎉 SUPABASE INTEGRATION COMPLETE!');
    console.log('=====================================');
    console.log('Next steps:');
    console.log('1. Set up your Supabase project at supabase.com');
    console.log('2. Replace YOUR_SUPABASE_URL_HERE and YOUR_SUPABASE_ANON_KEY_HERE in sidepanel.js');
    console.log('3. Add the Supabase CDN script to your sidepanel.html');
    console.log('4. Test the real-time features!');
    
    return true;

  } catch (error) {
    console.error('❌ Error during Supabase integration:', error);
    return false;
  }
}

// Run the integration
integrateSupabase().then(success => {
  if (success) {
    console.log('\\n✅ Supabase integration completed successfully!');
  } else {
    console.log('\\n❌ Supabase integration failed!');
  }
});
