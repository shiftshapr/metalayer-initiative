/**
 * Phase 2: EventBus Integration Script
 * 
 * This script integrates EventBus with the existing sidepanel.js
 * while maintaining all current functionality and adding centralized event handling.
 * 
 * @version 1.0.0
 * @author Metalayer Development Team
 */

console.log('🔄 === PHASE 2: EVENTBUS INTEGRATION ===');

// ===== INTEGRATION CONFIGURATION =====
const INTEGRATION_CONFIG = {
  backupOriginal: true,
  createIntegrationLog: true,
  testAfterIntegration: true,
  rollbackOnFailure: true
};

// ===== INTEGRATION FUNCTIONS =====

/**
 * Create backup of current sidepanel.js
 */
async function createBackup() {
  console.log('📦 Creating backup of current sidepanel.js...');
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    const originalPath = 'presence/sidepanel.js';
    const backupPath = 'presence/sidepanel-eventbus-backup-' + Date.now() + '.js';
    
    if (fs.existsSync(originalPath)) {
      const originalContent = fs.readFileSync(originalPath, 'utf8');
      fs.writeFileSync(backupPath, originalContent);
      console.log(`✅ Backup created: ${backupPath}`);
      return backupPath;
    } else {
      throw new Error('Current sidepanel.js not found');
    }
  } catch (error) {
    console.error('❌ Backup creation failed:', error);
    throw error;
  }
}

/**
 * Analyze existing event handling in sidepanel.js
 */
function analyzeEventHandling() {
  console.log('🔍 Analyzing event handling in existing sidepanel.js...');
  
  try {
    const fs = require('fs');
    const sidepanelCode = fs.readFileSync('presence/sidepanel.js', 'utf8');
    
    // Find event listener patterns
    const eventPatterns = [
      /addEventListener\s*\(\s*['"]([^'"]+)['"]/g,
      /on\s*\(\s*['"]([^'"]+)['"]/g,
      /chrome\.runtime\.onMessage\.addListener/g,
      /chrome\.runtime\.sendMessage/g
    ];
    
    const events = new Set();
    
    eventPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(sidepanelCode)) !== null) {
        if (match[1]) {
          events.add(match[1]);
        } else {
          events.add('chrome.runtime');
        }
      }
    });
    
    console.log(`📊 Found ${events.size} event handling patterns:`);
    Array.from(events).forEach(event => {
      console.log(`   - ${event}`);
    });
    
    return Array.from(events);
    
  } catch (error) {
    console.error('❌ Event handling analysis failed:', error);
    throw error;
  }
}

/**
 * Create EventBus integration code
 */
function createEventBusIntegration() {
  console.log('🏗️ Creating EventBus integration code...');
  
  const integrationCode = `
// ===== EVENTBUS INTEGRATION (PHASE 2) =====
// This section integrates EventBus with existing functionality
// while maintaining backward compatibility

let eventBus = null;

/**
 * Initialize EventBus for the existing sidepanel
 */
async function initializeEventBus() {
  console.log('🎯 EVENTBUS: Initializing for existing sidepanel...');
  
  try {
    // Load EventBus component
    const EventBus = require('../src/core/EventBus-working.js');
    eventBus = new EventBus();
    
    // Set up event handling
    setupEventHandling();
    
    // Set up cross-profile communication
    setupCrossProfileEventHandling();
    
    console.log('✅ EVENTBUS: Initialization complete');
    return true;
    
  } catch (error) {
    console.error('❌ EVENTBUS: Initialization failed:', error);
    return false;
  }
}

/**
 * Set up centralized event handling
 */
function setupEventHandling() {
  console.log('🎧 EVENTBUS: Setting up centralized event handling...');
  
  // DOM events
  eventBus.on('dom:ready', () => {
    console.log('🎯 EVENTBUS: DOM ready event received');
    // Trigger existing DOM ready functionality
    if (typeof setupCrossProfileCommunication === 'function') {
      setupCrossProfileCommunication();
    }
  });
  
  // Aura color events
  eventBus.on('aura:colorChanged', (data) => {
    console.log('🎯 EVENTBUS: Aura color changed:', data.color);
    // Trigger existing aura color functionality
    if (typeof setUserAvatarBgColor === 'function') {
      setUserAvatarBgColor(data.color);
    }
  });
  
  // Message events
  eventBus.on('message:added', (data) => {
    console.log('🎯 EVENTBUS: Message added:', data.messageId);
    // Trigger existing message functionality
    if (typeof addMessageToChat === 'function') {
      addMessageToChat(data.message);
    }
  });
  
  eventBus.on('message:deleted', (data) => {
    console.log('🎯 EVENTBUS: Message deleted:', data.messageId);
    // Trigger existing message deletion functionality
    if (typeof handleDeleteMessage === 'function') {
      handleDeleteMessage(data.message);
    }
  });
  
  // Chat events
  eventBus.on('chat:historyLoaded', (data) => {
    console.log('🎯 EVENTBUS: Chat history loaded:', data.messageCount);
    // Trigger existing chat functionality
    if (typeof loadChatHistory === 'function') {
      loadChatHistory(data.communityId);
    }
  });
  
  // Avatar events
  eventBus.on('avatar:updated', (data) => {
    console.log('🎯 EVENTBUS: Avatar updated:', data.userEmail);
    // Trigger existing avatar functionality
    if (typeof refreshMessageAvatarsWithCurrentPresence === 'function') {
      refreshMessageAvatarsWithCurrentPresence();
    }
  });
  
  console.log('✅ EVENTBUS: Centralized event handling setup complete');
}

/**
 * Set up cross-profile event handling
 */
function setupCrossProfileEventHandling() {
  console.log('🔗 EVENTBUS: Setting up cross-profile event handling...');
  
  // Cross-profile message deletion
  eventBus.on('crossProfile:messageDeleted', (data) => {
    console.log('🎯 EVENTBUS: Cross-profile message deleted:', data.messageId);
    // Trigger existing cross-profile functionality
    if (typeof loadChatHistory === 'function') {
      loadChatHistory();
    }
  });
  
  // Cross-profile aura color changes
  eventBus.on('crossProfile:auraColorChanged', (data) => {
    console.log('🎯 EVENTBUS: Cross-profile aura color changed:', data.color);
    // Trigger existing cross-profile functionality
    if (typeof refreshMessageAvatarsWithCurrentPresence === 'function') {
      refreshMessageAvatarsWithCurrentPresence();
    }
  });
  
  // Cross-profile new messages
  eventBus.on('crossProfile:newMessageAdded', (data) => {
    console.log('🎯 EVENTBUS: Cross-profile new message:', data.messageId);
    // Trigger existing cross-profile functionality
    if (typeof addMessageToChat === 'function') {
      addMessageToChat(data.message);
    }
  });
  
  console.log('✅ EVENTBUS: Cross-profile event handling setup complete');
}

/**
 * Emit event through EventBus
 */
function emitEvent(eventName, data) {
  if (eventBus) {
    eventBus.emit(eventName, data);
  }
}

/**
 * Listen to event through EventBus
 */
function listenToEvent(eventName, callback) {
  if (eventBus) {
    eventBus.on(eventName, callback);
  }
}

/**
 * Remove event listener through EventBus
 */
function removeEventListener(eventName, callback) {
  if (eventBus) {
    eventBus.off(eventName, callback);
  }
}

/**
 * Get EventBus instance
 */
function getEventBus() {
  return eventBus;
}

/**
 * Cleanup EventBus
 */
function cleanupEventBus() {
  if (eventBus) {
    eventBus.cleanup();
    eventBus = null;
  }
}

// ===== END EVENTBUS INTEGRATION =====
`;

  return integrationCode;
}

/**
 * Apply EventBus integration to sidepanel.js
 */
async function applyEventBusIntegration() {
  console.log('🔧 Applying EventBus integration to sidepanel.js...');
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Read current sidepanel.js
    const originalPath = 'presence/sidepanel.js';
    const originalContent = fs.readFileSync(originalPath, 'utf8');
    
    // Create integration code
    const integrationCode = createEventBusIntegration();
    
    // Find insertion point (after StateManager integration)
    const insertionPoint = '// ===== END STATEMANAGER INTEGRATION =====';
    const insertionIndex = originalContent.indexOf(insertionPoint);
    
    if (insertionIndex === -1) {
      throw new Error('StateManager integration not found in sidepanel.js');
    }
    
    // Insert EventBus integration code
    const beforeInsertion = originalContent.substring(0, insertionIndex);
    const afterInsertion = originalContent.substring(insertionIndex);
    
    const newContent = beforeInsertion + integrationCode + '\n\n' + afterInsertion;
    
    // Write updated sidepanel.js
    fs.writeFileSync(originalPath, newContent);
    
    console.log('✅ EventBus integration applied to sidepanel.js');
    return true;
    
  } catch (error) {
    console.error('❌ EventBus integration failed:', error);
    return false;
  }
}

/**
 * Test EventBus integration
 */
async function testEventBusIntegration() {
  console.log('🧪 Testing EventBus integration...');
  
  try {
    // Test that the integration code was added
    const fs = require('fs');
    const sidepanelContent = fs.readFileSync('presence/sidepanel.js', 'utf8');
    
    const integrationChecks = [
      'initializeEventBus',
      'getEventBus',
      'emitEvent',
      'listenToEvent',
      'removeEventListener',
      'EVENTBUS INTEGRATION'
    ];
    
    let foundFunctions = 0;
    integrationChecks.forEach(func => {
      if (sidepanelContent.includes(func)) {
        foundFunctions++;
        console.log(`   ✅ Found function: ${func}`);
      } else {
        console.log(`   ❌ Missing function: ${func}`);
      }
    });
    
    if (foundFunctions === integrationChecks.length) {
      console.log('   ✅ EventBus integration functions present');
      return true;
    } else {
      console.log(`   ❌ EventBus integration missing ${integrationChecks.length - foundFunctions} functions`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ EventBus integration test failed:', error);
    return false;
  }
}

/**
 * Run complete EventBus integration
 */
async function runEventBusIntegration() {
  console.log('🚀 Starting EventBus integration...\n');
  
  try {
    // Step 1: Create backup
    console.log('📦 Step 1: Creating backup...');
    const backupPath = await createBackup();
    console.log(`✅ Backup created: ${backupPath}\n`);
    
    // Step 2: Analyze event handling
    console.log('🔍 Step 2: Analyzing event handling...');
    const events = analyzeEventHandling();
    console.log(`✅ Found ${events.length} event handling patterns\n`);
    
    // Step 3: Create integration code
    console.log('🏗️ Step 3: Creating integration code...');
    const integrationCode = createEventBusIntegration();
    console.log('✅ Integration code created\n');
    
    // Step 4: Apply integration
    console.log('🔧 Step 4: Applying integration...');
    const integrationResult = await applyEventBusIntegration();
    if (integrationResult) {
      console.log('✅ Integration applied\n');
    } else {
      throw new Error('Integration application failed');
    }
    
    // Step 5: Test integration
    console.log('🧪 Step 5: Testing integration...');
    const testResult = await testEventBusIntegration();
    if (testResult) {
      console.log('✅ Integration test passed\n');
    } else {
      throw new Error('Integration test failed');
    }
    
    console.log('🎉 EVENTBUS INTEGRATION COMPLETE!');
    console.log('✅ All steps completed successfully');
    console.log('🔧 Ready to test the integrated system');
    
    return true;
    
  } catch (error) {
    console.error('❌ EventBus integration failed:', error);
    console.log('🔧 Check the error above and fix before proceeding');
    return false;
  }
}

// Auto-run integration
console.log('🔧 EventBus Integration Script Loaded');
console.log('📝 Running integration automatically...\n');

// Run the integration
runEventBusIntegration().then(success => {
  if (success) {
    console.log('\n🎯 READY FOR EVENTBUS TESTING');
  } else {
    console.log('\n🔧 FIX ISSUES BEFORE PROCEEDING');
  }
});













