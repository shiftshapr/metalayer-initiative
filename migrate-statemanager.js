/**
 * Phase 2: StateManager Migration Script
 * 
 * This script integrates StateManager with the existing sidepanel.js
 * while maintaining all current functionality and adding new capabilities.
 * 
 * @version 1.0.0
 * @author Metalayer Development Team
 */

console.log('🔄 === PHASE 2: STATEMANAGER MIGRATION ===');

// ===== MIGRATION CONFIGURATION =====
const MIGRATION_CONFIG = {
  backupOriginal: true,
  createMigrationLog: true,
  testAfterMigration: true,
  rollbackOnFailure: true
};

// ===== MIGRATION FUNCTIONS =====

/**
 * Create backup of original sidepanel.js
 */
async function createBackup() {
  console.log('📦 Creating backup of original sidepanel.js...');
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    const originalPath = 'presence/sidepanel.js';
    const backupPath = 'presence/sidepanel-backup-' + Date.now() + '.js';
    
    if (fs.existsSync(originalPath)) {
      const originalContent = fs.readFileSync(originalPath, 'utf8');
      fs.writeFileSync(backupPath, originalContent);
      console.log(`✅ Backup created: ${backupPath}`);
      return backupPath;
    } else {
      throw new Error('Original sidepanel.js not found');
    }
  } catch (error) {
    console.error('❌ Backup creation failed:', error);
    throw error;
  }
}

/**
 * Analyze existing sidepanel.js for global variables
 */
function analyzeGlobalVariables() {
  console.log('🔍 Analyzing global variables in existing sidepanel.js...');
  
  try {
    const fs = require('fs');
    const sidepanelCode = fs.readFileSync('presence/sidepanel.js', 'utf8');
    
    // Find global variable declarations
    const globalVarPatterns = [
      /window\.(\w+)\s*=/g,
      /var\s+(\w+)\s*=/g,
      /let\s+(\w+)\s*=/g,
      /const\s+(\w+)\s*=/g
    ];
    
    const globalVars = new Set();
    
    globalVarPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(sidepanelCode)) !== null) {
        globalVars.add(match[1]);
      }
    });
    
    // Filter out common browser globals and functions
    const filteredVars = Array.from(globalVars).filter(varName => 
      !['document', 'window', 'console', 'chrome', 'navigator', 'location', 'history'].includes(varName)
    );
    
    console.log(`📊 Found ${filteredVars.length} potential global variables:`);
    filteredVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    
    return filteredVars;
    
  } catch (error) {
    console.error('❌ Global variable analysis failed:', error);
    throw error;
  }
}

/**
 * Create StateManager integration code
 */
function createStateManagerIntegration() {
  console.log('🏗️ Creating StateManager integration code...');
  
  const integrationCode = `
// ===== STATEMANAGER INTEGRATION (PHASE 2) =====
// This section integrates StateManager with existing functionality
// while maintaining backward compatibility

let stateManager = null;

/**
 * Initialize StateManager for the existing sidepanel
 */
async function initializeStateManager() {
  console.log('🏗️ STATEMANAGER: Initializing for existing sidepanel...');
  
  try {
    // Load StateManager component
    const StateManager = require('../src/core/StateManager-working.js');
    stateManager = new StateManager();
    
    // Initialize with current values from existing system
    await initializeStateFromExistingSystem();
    
    // Set up state change listeners
    setupStateChangeListeners();
    
    console.log('✅ STATEMANAGER: Initialization complete');
    return true;
    
  } catch (error) {
    console.error('❌ STATEMANAGER: Initialization failed:', error);
    return false;
  }
}

/**
 * Initialize state with current values from existing system
 */
async function initializeStateFromExistingSystem() {
  console.log('🔄 STATEMANAGER: Initializing state from existing system...');
  
  try {
    // Initialize chat state
    if (window.currentChatData) {
      stateManager.setState('chat.data', window.currentChatData);
    }
    if (window.lastLoadedUri) {
      stateManager.setState('chat.lastLoadedUri', window.lastLoadedUri);
    }
    if (window.focusedMessage) {
      stateManager.setState('chat.focusedMessage', window.focusedMessage);
    }
    if (window.previousView) {
      stateManager.setState('chat.previousView', window.previousView);
    }
    
    // Initialize avatar state
    const userAvatarBgColor = await getCurrentUserAvatarBgColor();
    if (userAvatarBgColor) {
      stateManager.setState('avatars.user.customColor', userAvatarBgColor);
    }
    
    // Initialize UI state
    if (window.activeCommunities) {
      stateManager.setState('ui.activeCommunities', window.activeCommunities);
    }
    if (window.primaryCommunity) {
      stateManager.setState('ui.primaryCommunity', window.primaryCommunity);
    }
    if (window.currentCommunity) {
      stateManager.setState('ui.currentCommunity', window.currentCommunity);
    }
    
    console.log('✅ STATEMANAGER: State initialized from existing system');
    
  } catch (error) {
    console.error('❌ STATEMANAGER: Failed to initialize state from existing system:', error);
  }
}

/**
 * Set up state change listeners
 */
function setupStateChangeListeners() {
  console.log('🎧 STATEMANAGER: Setting up state change listeners...');
  
  // Listen for state changes and update existing system
  stateManager.subscribe('*', (newValue, oldValue, path) => {
    console.log(\`🔄 STATEMANAGER: State changed - \${path}: \${oldValue} -> \${newValue}\`);
    
    // Update existing system variables
    updateExistingSystemFromState(path, newValue);
  });
  
  console.log('✅ STATEMANAGER: State change listeners setup complete');
}

/**
 * Update existing system variables from state changes
 */
function updateExistingSystemFromState(path, newValue) {
  console.log(\`🔄 STATEMANAGER: Updating existing system - \${path}: \${newValue}\`);
  
  try {
    // Update chat state
    if (path.startsWith('chat.')) {
      const chatPath = path.replace('chat.', '');
      if (chatPath === 'data') {
        window.currentChatData = newValue;
      } else if (chatPath === 'lastLoadedUri') {
        window.lastLoadedUri = newValue;
      } else if (chatPath === 'focusedMessage') {
        window.focusedMessage = newValue;
      } else if (chatPath === 'previousView') {
        window.previousView = newValue;
      }
    }
    
    // Update avatar state
    if (path.startsWith('avatars.')) {
      const avatarPath = path.replace('avatars.', '');
      if (avatarPath === 'user.customColor') {
        // Update avatar color in existing system
        if (typeof setUserAvatarBgColor === 'function') {
          setUserAvatarBgColor(newValue);
        }
      }
    }
    
    // Update UI state
    if (path.startsWith('ui.')) {
      const uiPath = path.replace('ui.', '');
      if (uiPath === 'activeCommunities') {
        window.activeCommunities = newValue;
      } else if (uiPath === 'primaryCommunity') {
        window.primaryCommunity = newValue;
      } else if (uiPath === 'currentCommunity') {
        window.currentCommunity = newValue;
      }
    }
    
    console.log(\`✅ STATEMANAGER: Updated existing system - \${path}\`);
    
  } catch (error) {
    console.error(\`❌ STATEMANAGER: Failed to update existing system - \${path}:\`, error);
  }
}

/**
 * Get StateManager instance
 */
function getStateManager() {
  return stateManager;
}

/**
 * Get state value
 */
function getState(path) {
  if (stateManager) {
    return stateManager.getState(path);
  }
  return null;
}

/**
 * Set state value
 */
function setState(path, value, persist = false) {
  if (stateManager) {
    stateManager.setState(path, value, persist);
  }
}

/**
 * Subscribe to state changes
 */
function subscribeToState(path, callback) {
  if (stateManager) {
    stateManager.subscribe(path, callback);
  }
}

/**
 * Cleanup StateManager
 */
function cleanupStateManager() {
  if (stateManager) {
    stateManager.cleanup();
    stateManager = null;
  }
}

// ===== END STATEMANAGER INTEGRATION =====
`;

  return integrationCode;
}

/**
 * Create migration log
 */
function createMigrationLog(globalVars, integrationCode) {
  console.log('📝 Creating migration log...');
  
  const logContent = `# StateManager Migration Log
Generated: ${new Date().toISOString()}

## Global Variables Found
${globalVars.map(varName => `- ${varName}`).join('\n')}

## Integration Code Added
\`\`\`javascript
${integrationCode}
\`\`\`

## Migration Steps
1. ✅ Backup original sidepanel.js
2. ✅ Analyze global variables
3. ✅ Create StateManager integration code
4. ⏳ Apply integration to sidepanel.js
5. ⏳ Test integration
6. ⏳ Verify no regressions

## Next Steps
- Test StateManager integration
- Verify existing functionality works
- Test new state management capabilities
- Proceed to EventBus integration
`;

  const fs = require('fs');
  fs.writeFileSync('STATEMANAGER_MIGRATION_LOG.md', logContent);
  console.log('✅ Migration log created: STATEMANAGER_MIGRATION_LOG.md');
}

/**
 * Apply StateManager integration to sidepanel.js
 */
async function applyStateManagerIntegration() {
  console.log('🔧 Applying StateManager integration to sidepanel.js...');
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Read original sidepanel.js
    const originalPath = 'presence/sidepanel.js';
    const originalContent = fs.readFileSync(originalPath, 'utf8');
    
    // Create integration code
    const integrationCode = createStateManagerIntegration();
    
    // Find insertion point (after the initial setup, before the main functions)
    const insertionPoint = '// ===== EXTENSION RELOAD & BUILD TRACKING =====';
    const insertionIndex = originalContent.indexOf(insertionPoint);
    
    if (insertionIndex === -1) {
      throw new Error('Insertion point not found in sidepanel.js');
    }
    
    // Insert StateManager integration code
    const beforeInsertion = originalContent.substring(0, insertionIndex);
    const afterInsertion = originalContent.substring(insertionIndex);
    
    const newContent = beforeInsertion + integrationCode + '\n\n' + afterInsertion;
    
    // Write updated sidepanel.js
    fs.writeFileSync(originalPath, newContent);
    
    console.log('✅ StateManager integration applied to sidepanel.js');
    return true;
    
  } catch (error) {
    console.error('❌ StateManager integration failed:', error);
    return false;
  }
}

/**
 * Test StateManager integration
 */
async function testStateManagerIntegration() {
  console.log('🧪 Testing StateManager integration...');
  
  try {
    // Test that the integration code was added
    const fs = require('fs');
    const sidepanelContent = fs.readFileSync('presence/sidepanel.js', 'utf8');
    
    const integrationChecks = [
      'initializeStateManager',
      'getStateManager',
      'getState',
      'setState',
      'subscribeToState'
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
      console.log('   ✅ StateManager integration functions present');
      return true;
    } else {
      console.log(`   ❌ StateManager integration missing ${integrationChecks.length - foundFunctions} functions`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ StateManager integration test failed:', error);
    return false;
  }
}

/**
 * Run complete StateManager migration
 */
async function runStateManagerMigration() {
  console.log('🚀 Starting StateManager migration...\n');
  
  try {
    // Step 1: Create backup
    console.log('📦 Step 1: Creating backup...');
    const backupPath = await createBackup();
    console.log(`✅ Backup created: ${backupPath}\n`);
    
    // Step 2: Analyze global variables
    console.log('🔍 Step 2: Analyzing global variables...');
    const globalVars = analyzeGlobalVariables();
    console.log(`✅ Found ${globalVars.length} global variables\n`);
    
    // Step 3: Create integration code
    console.log('🏗️ Step 3: Creating integration code...');
    const integrationCode = createStateManagerIntegration();
    console.log('✅ Integration code created\n');
    
    // Step 4: Apply integration
    console.log('🔧 Step 4: Applying integration...');
    const integrationResult = await applyStateManagerIntegration();
    if (integrationResult) {
      console.log('✅ Integration applied\n');
    } else {
      throw new Error('Integration application failed');
    }
    
    // Step 5: Test integration
    console.log('🧪 Step 5: Testing integration...');
    const testResult = await testStateManagerIntegration();
    if (testResult) {
      console.log('✅ Integration test passed\n');
    } else {
      throw new Error('Integration test failed');
    }
    
    // Step 6: Create migration log
    console.log('📝 Step 6: Creating migration log...');
    createMigrationLog(globalVars, integrationCode);
    console.log('✅ Migration log created\n');
    
    console.log('🎉 STATEMANAGER MIGRATION COMPLETE!');
    console.log('✅ All steps completed successfully');
    console.log('🔧 Ready to test the integrated system');
    
    return true;
    
  } catch (error) {
    console.error('❌ StateManager migration failed:', error);
    console.log('🔧 Check the error above and fix before proceeding');
    return false;
  }
}

// Auto-run migration
console.log('🔧 StateManager Migration Script Loaded');
console.log('📝 Running migration automatically...\n');

// Run the migration
runStateManagerMigration().then(success => {
  if (success) {
    console.log('\n🎯 READY FOR PHASE 2 TESTING');
  } else {
    console.log('\n🔧 FIX ISSUES BEFORE PROCEEDING');
  }
});













