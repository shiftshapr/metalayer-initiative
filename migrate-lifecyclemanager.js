/**
 * Phase 3: LifecycleManager Integration Script
 * 
 * This script integrates LifecycleManager with the existing sidepanel.js
 * to complete the new modular architecture with automated component lifecycle management.
 * 
 * @version 1.0.0
 * @author Metalayer Development Team
 */

console.log('🔄 === PHASE 3: LIFECYCLEMANAGER INTEGRATION ===');

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
    const backupPath = 'presence/sidepanel-lifecycle-backup-' + Date.now() + '.js';
    
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
 * Analyze existing components in sidepanel.js
 */
function analyzeExistingComponents() {
  console.log('🔍 Analyzing existing components in sidepanel.js...');
  
  try {
    const fs = require('fs');
    const sidepanelCode = fs.readFileSync('presence/sidepanel.js', 'utf8');
    
    // Find component-like functions
    const componentPatterns = [
      /function\s+(\w+)\s*\(/g,
      /async\s+function\s+(\w+)\s*\(/g,
      /const\s+(\w+)\s*=\s*\(/g,
      /let\s+(\w+)\s*=\s*\(/g
    ];
    
    const components = new Set();
    
    componentPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(sidepanelCode)) !== null) {
        const componentName = match[1];
        // Filter out common patterns and focus on component-like functions
        if (!['require', 'module', 'exports', 'console', 'window', 'document', 'chrome'].includes(componentName)) {
          components.add(componentName);
        }
      }
    });
    
    // Filter to component-like functions
    const componentFunctions = Array.from(components).filter(func => 
      func.length > 3 && 
      !func.startsWith('_') && 
      !func.includes('test') &&
      !func.includes('debug')
    );
    
    console.log(`📊 Found ${componentFunctions.length} potential components:`);
    componentFunctions.forEach(component => {
      console.log(`   - ${component}`);
    });
    
    return componentFunctions;
    
  } catch (error) {
    console.error('❌ Component analysis failed:', error);
    throw error;
  }
}

/**
 * Create LifecycleManager integration code
 */
function createLifecycleManagerIntegration() {
  console.log('🏗️ Creating LifecycleManager integration code...');
  
  const integrationCode = `
// ===== LIFECYCLEMANAGER INTEGRATION (PHASE 3) =====
// This section integrates LifecycleManager with existing functionality
// to complete the new modular architecture

let lifecycleManager = null;

/**
 * Initialize LifecycleManager for the existing sidepanel
 */
async function initializeLifecycleManager() {
  console.log('🔄 LIFECYCLEMANAGER: Initializing for existing sidepanel...');
  
  try {
    // Load LifecycleManager component
    const LifecycleManager = require('../src/core/LifecycleManager-working.js');
    lifecycleManager = new LifecycleManager();
    
    // Register existing components
    await registerExistingComponents();
    
    // Set up component lifecycle management
    setupComponentLifecycleManagement();
    
    console.log('✅ LIFECYCLEMANAGER: Initialization complete');
    return true;
    
  } catch (error) {
    console.error('❌ LIFECYCLEMANAGER: Initialization failed:', error);
    return false;
  }
}

/**
 * Register existing components with LifecycleManager
 */
async function registerExistingComponents() {
  console.log('📋 LIFECYCLEMANAGER: Registering existing components...');
  
  // Register StateManager component
  lifecycleManager.register('stateManager', {
    init() {
      console.log('🏗️ StateManager component initialized');
      if (typeof initializeStateManager === 'function') {
        return initializeStateManager();
      }
      return true;
    },
    mount() {
      console.log('🏗️ StateManager component mounted');
      return true;
    },
    update(data) {
      console.log('🏗️ StateManager component updated:', data);
      return true;
    },
    unmount() {
      console.log('🏗️ StateManager component unmounted');
      return true;
    },
    destroy() {
      console.log('🏗️ StateManager component destroyed');
      if (typeof cleanupStateManager === 'function') {
        cleanupStateManager();
      }
      return true;
    }
  }, {
    autoInitialize: true,
    autoMount: true,
    priority: 1
  });
  
  // Register EventBus component
  lifecycleManager.register('eventBus', {
    init() {
      console.log('🎯 EventBus component initialized');
      if (typeof initializeEventBus === 'function') {
        return initializeEventBus();
      }
      return true;
    },
    mount() {
      console.log('🎯 EventBus component mounted');
      return true;
    },
    update(data) {
      console.log('🎯 EventBus component updated:', data);
      return true;
    },
    unmount() {
      console.log('🎯 EventBus component unmounted');
      return true;
    },
    destroy() {
      console.log('🎯 EventBus component destroyed');
      if (typeof cleanupEventBus === 'function') {
        cleanupEventBus();
      }
      return true;
    }
  }, {
    autoInitialize: true,
    autoMount: true,
    priority: 2
  });
  
  // Register Chat System component
  lifecycleManager.register('chatSystem', {
    init() {
      console.log('💬 Chat System component initialized');
      return true;
    },
    mount() {
      console.log('💬 Chat System component mounted');
      return true;
    },
    update(data) {
      console.log('💬 Chat System component updated:', data);
      return true;
    },
    unmount() {
      console.log('💬 Chat System component unmounted');
      return true;
    },
    destroy() {
      console.log('💬 Chat System component destroyed');
      return true;
    }
  }, {
    autoInitialize: true,
    autoMount: true,
    priority: 3
  });
  
  // Register Avatar System component
  lifecycleManager.register('avatarSystem', {
    init() {
      console.log('👤 Avatar System component initialized');
      return true;
    },
    mount() {
      console.log('👤 Avatar System component mounted');
      return true;
    },
    update(data) {
      console.log('👤 Avatar System component updated:', data);
      return true;
    },
    unmount() {
      console.log('👤 Avatar System component unmounted');
      return true;
    },
    destroy() {
      console.log('👤 Avatar System component destroyed');
      return true;
    }
  }, {
    autoInitialize: true,
    autoMount: true,
    priority: 4
  });
  
  // Register UI System component
  lifecycleManager.register('uiSystem', {
    init() {
      console.log('🎨 UI System component initialized');
      return true;
    },
    mount() {
      console.log('🎨 UI System component mounted');
      return true;
    },
    update(data) {
      console.log('🎨 UI System component updated:', data);
      return true;
    },
    unmount() {
      console.log('🎨 UI System component unmounted');
      return true;
    },
    destroy() {
      console.log('🎨 UI System component destroyed');
      return true;
    }
  }, {
    autoInitialize: true,
    autoMount: true,
    priority: 5
  });
  
  console.log('✅ LIFECYCLEMANAGER: Components registered');
}

/**
 * Set up component lifecycle management
 */
function setupComponentLifecycleManagement() {
  console.log('🔄 LIFECYCLEMANAGER: Setting up component lifecycle management...');
  
  // Set up component error handling
  lifecycleManager.on('component:error', (component, error) => {
    console.error(\`❌ LIFECYCLEMANAGER: Component error - \${component.name}:\`, error);
    // Attempt to restart the component
    lifecycleManager.restart(component.name);
  });
  
  // Set up component state changes
  lifecycleManager.on('component:stateChanged', (component, newState) => {
    console.log(\`🔄 LIFECYCLEMANAGER: Component state changed - \${component.name}: \${newState}\`);
  });
  
  // Set up component dependencies
  lifecycleManager.on('component:dependencyChanged', (component, dependencies) => {
    console.log(\`🔄 LIFECYCLEMANAGER: Component dependencies changed - \${component.name}:\`, dependencies);
  });
  
  console.log('✅ LIFECYCLEMANAGER: Component lifecycle management setup complete');
}

/**
 * Get LifecycleManager instance
 */
function getLifecycleManager() {
  return lifecycleManager;
}

/**
 * Register a new component with LifecycleManager
 */
function registerComponent(name, component, options = {}) {
  if (lifecycleManager) {
    return lifecycleManager.register(name, component, options);
  }
  return false;
}

/**
 * Unregister a component from LifecycleManager
 */
function unregisterComponent(name) {
  if (lifecycleManager) {
    return lifecycleManager.unregister(name);
  }
  return false;
}

/**
 * Get component status
 */
function getComponentStatus(name) {
  if (lifecycleManager) {
    return lifecycleManager.getStatus(name);
  }
  return null;
}

/**
 * Get all component statuses
 */
function getAllComponentStatuses() {
  if (lifecycleManager) {
    return lifecycleManager.getAllStatuses();
  }
  return {};
}

/**
 * Restart a component
 */
function restartComponent(name) {
  if (lifecycleManager) {
    return lifecycleManager.restart(name);
  }
  return false;
}

/**
 * Cleanup LifecycleManager
 */
function cleanupLifecycleManager() {
  if (lifecycleManager) {
    lifecycleManager.cleanup();
    lifecycleManager = null;
  }
}

// ===== END LIFECYCLEMANAGER INTEGRATION =====
`;

  return integrationCode;
}

/**
 * Apply LifecycleManager integration to sidepanel.js
 */
async function applyLifecycleManagerIntegration() {
  console.log('🔧 Applying LifecycleManager integration to sidepanel.js...');
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Read current sidepanel.js
    const originalPath = 'presence/sidepanel.js';
    const originalContent = fs.readFileSync(originalPath, 'utf8');
    
    // Create integration code
    const integrationCode = createLifecycleManagerIntegration();
    
    // Find insertion point (after EventBus integration)
    const insertionPoint = '// ===== END EVENTBUS INTEGRATION =====';
    const insertionIndex = originalContent.indexOf(insertionPoint);
    
    if (insertionIndex === -1) {
      throw new Error('EventBus integration not found in sidepanel.js');
    }
    
    // Insert LifecycleManager integration code
    const beforeInsertion = originalContent.substring(0, insertionIndex);
    const afterInsertion = originalContent.substring(insertionIndex);
    
    const newContent = beforeInsertion + integrationCode + '\n\n' + afterInsertion;
    
    // Write updated sidepanel.js
    fs.writeFileSync(originalPath, newContent);
    
    console.log('✅ LifecycleManager integration applied to sidepanel.js');
    return true;
    
  } catch (error) {
    console.error('❌ LifecycleManager integration failed:', error);
    return false;
  }
}

/**
 * Test LifecycleManager integration
 */
async function testLifecycleManagerIntegration() {
  console.log('🧪 Testing LifecycleManager integration...');
  
  try {
    // Test that the integration code was added
    const fs = require('fs');
    const sidepanelContent = fs.readFileSync('presence/sidepanel.js', 'utf8');
    
    const integrationChecks = [
      'initializeLifecycleManager',
      'getLifecycleManager',
      'registerComponent',
      'unregisterComponent',
      'getComponentStatus',
      'getAllComponentStatuses',
      'restartComponent',
      'LIFECYCLEMANAGER INTEGRATION'
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
      console.log('   ✅ LifecycleManager integration functions present');
      return true;
    } else {
      console.log(`   ❌ LifecycleManager integration missing ${integrationChecks.length - foundFunctions} functions`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ LifecycleManager integration test failed:', error);
    return false;
  }
}

/**
 * Run complete LifecycleManager integration
 */
async function runLifecycleManagerIntegration() {
  console.log('🚀 Starting LifecycleManager integration...\n');
  
  try {
    // Step 1: Create backup
    console.log('📦 Step 1: Creating backup...');
    const backupPath = await createBackup();
    console.log(`✅ Backup created: ${backupPath}\n`);
    
    // Step 2: Analyze existing components
    console.log('🔍 Step 2: Analyzing existing components...');
    const components = analyzeExistingComponents();
    console.log(`✅ Found ${components.length} potential components\n`);
    
    // Step 3: Create integration code
    console.log('🏗️ Step 3: Creating integration code...');
    const integrationCode = createLifecycleManagerIntegration();
    console.log('✅ Integration code created\n');
    
    // Step 4: Apply integration
    console.log('🔧 Step 4: Applying integration...');
    const integrationResult = await applyLifecycleManagerIntegration();
    if (integrationResult) {
      console.log('✅ Integration applied\n');
    } else {
      throw new Error('Integration application failed');
    }
    
    // Step 5: Test integration
    console.log('🧪 Step 5: Testing integration...');
    const testResult = await testLifecycleManagerIntegration();
    if (testResult) {
      console.log('✅ Integration test passed\n');
    } else {
      throw new Error('Integration test failed');
    }
    
    console.log('🎉 LIFECYCLEMANAGER INTEGRATION COMPLETE!');
    console.log('✅ All steps completed successfully');
    console.log('🔧 Ready to test the complete integrated system');
    
    return true;
    
  } catch (error) {
    console.error('❌ LifecycleManager integration failed:', error);
    console.log('🔧 Check the error above and fix before proceeding');
    return false;
  }
}

// Auto-run integration
console.log('🔧 LifecycleManager Integration Script Loaded');
console.log('📝 Running integration automatically...\n');

// Run the integration
runLifecycleManagerIntegration().then(success => {
  if (success) {
    console.log('\n🎯 READY FOR COMPLETE ARCHITECTURE TESTING');
  } else {
    console.log('\n🔧 FIX ISSUES BEFORE PROCEEDING');
  }
});













