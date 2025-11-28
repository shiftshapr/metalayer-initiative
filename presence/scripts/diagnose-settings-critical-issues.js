/**
 * DIAGNOSTIC SCRIPT: Settings Page Critical Issues
 * 
 * Identifies root causes for:
 * 1. Spacing issue between Settings tab label and content
 * 2. Theme toggle affecting visibility on first click
 * 3. Visibility toggle requiring two clicks initially
 * 4. Visibility toggle not updating isVisible in AppUser
 */

const diagnostics = [];

function addResult(test, passed, message, details = null) {
  diagnostics.push({ test, passed, message, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${test}: ${message}`, details || '');
}

/**
 * Test 1: Check spacing between Settings tab label and content
 */
function testSpacing() {
  const settingsTab = document.getElementById('settings-tab');
  const otherTabs = ['discuss-tab', 'visibility-tab', 'rooms-tab', 'people-tab'];
  
  if (!settingsTab) {
    addResult('Spacing Check', false, 'Settings tab not found');
    return;
  }

  // Get first settings section
  const firstSection = settingsTab.querySelector('.settings-section');
  if (!firstSection) {
    addResult('Spacing Check', false, 'No settings sections found');
    return;
  }

  // Compare with other tabs
  const settingsSpacing = {
    marginTop: parseFloat(window.getComputedStyle(firstSection).marginTop),
    paddingTop: parseFloat(window.getComputedStyle(firstSection).paddingTop),
    marginBottom: parseFloat(window.getComputedStyle(settingsTab).marginBottom),
    paddingTopTab: parseFloat(window.getComputedStyle(settingsTab).paddingTop)
  };

  // Check other tabs for comparison
  let otherTabSpacing = null;
  for (const tabId of otherTabs) {
    const tab = document.getElementById(tabId);
    if (tab && tab.classList.contains('active')) {
      const computed = window.getComputedStyle(tab);
      otherTabSpacing = {
        paddingTop: parseFloat(computed.paddingTop),
        marginTop: parseFloat(computed.marginTop)
      };
      break;
    }
  }

  // Check if settings tab has padding: 0 (which would cause spacing issue)
  const hasPadding = settingsSpacing.paddingTopTab > 0 || settingsSpacing.marginTop > 0;
  
  addResult(
    'Spacing Check',
    hasPadding,
    hasPadding 
      ? `Settings tab has spacing (padding-top: ${settingsSpacing.paddingTopTab}px)`
      : `Settings tab has NO spacing (padding-top: ${settingsSpacing.paddingTopTab}px) - THIS IS THE ISSUE`,
    { settingsSpacing, otherTabSpacing, hasPadding }
  );
}

/**
 * Test 2: Check if theme toggle event handler affects visibility
 */
function testThemeToggleHandler() {
  const themeToggle = document.getElementById('theme-toggle');
  const visibilityToggle = document.getElementById('visibility-toggle');
  
  if (!themeToggle || !visibilityToggle) {
    addResult('Theme Toggle Handler', false, 'Toggles not found');
    return;
  }

  // Check if toggles are siblings or nested
  const themeParent = themeToggle.closest('.setting-item, .settings-section');
  const visibilityParent = visibilityToggle.closest('.setting-item, .settings-section');
  
  // Check event listeners
  const themeHasHandler = themeToggle.getAttribute('data-handler-attached') === 'true';
  const visibilityHasHandler = visibilityToggle.getAttribute('data-handler-attached') === 'true';
  
  // Check if they share a parent that might cause event bubbling
  const shareParent = themeParent === visibilityParent;
  
  // Check initial states
  const themeInitial = themeToggle.checked;
  const visibilityInitial = visibilityToggle.checked;
  
  addResult(
    'Theme Toggle Handler',
    !shareParent && themeHasHandler && visibilityHasHandler,
    shareParent 
      ? 'Theme and Visibility toggles share parent - event bubbling possible'
      : 'Toggles are in separate containers',
    { 
      themeHasHandler, 
      visibilityHasHandler, 
      shareParent,
      themeInitial,
      visibilityInitial
    }
  );
}

/**
 * Test 3: Check visibility toggle initial state
 */
async function testVisibilityToggleInitialState() {
  const visibilityToggle = document.getElementById('visibility-toggle');
  
  if (!visibilityToggle) {
    addResult('Visibility Toggle Initial State', false, 'Visibility toggle not found');
    return;
  }

  const win = window;
  const userPrefsMgr = win.userPreferencesManager;
  const stateManager = win.stateManagerInstance;
  
  // Get current states
  const toggleState = visibilityToggle.checked;
  const prefState = userPrefsMgr?.isInitialized 
    ? await userPrefsMgr.getPreference('isVisible')
    : null;
  const currentUser = stateManager?.getState('currentUser');
  const currentUserVisible = currentUser?.isVisible || currentUser?.visibilityEnabled;
  
  // Check if states match
  const statesMatch = toggleState === (prefState === true) && 
                     toggleState === (currentUserVisible === true);
  
  addResult(
    'Visibility Toggle Initial State',
    statesMatch,
    statesMatch
      ? 'All states match correctly'
      : `States MISMATCH - Toggle: ${toggleState}, Pref: ${prefState}, CurrentUser: ${currentUserVisible}`,
    { toggleState, prefState, currentUserVisible, statesMatch }
  );
}

/**
 * Test 4: Check if visibility toggle updates AppUser
 */
async function testVisibilityToggleUpdatesAppUser() {
  const visibilityToggle = document.getElementById('visibility-toggle');
  
  if (!visibilityToggle) {
    addResult('Visibility Toggle Updates AppUser', false, 'Visibility toggle not found');
    return;
  }

  const stateManager = window.stateManagerInstance;
  if (!stateManager) {
    addResult('Visibility Toggle Updates AppUser', false, 'StateManager not found');
    return;
  }

  // Get initial state
  const initialToggleState = visibilityToggle.checked;
  const initialCurrentUser = stateManager.getState('currentUser');
  const initialAppUserVisible = initialCurrentUser?.isVisible;
  
  // Simulate toggle change
  const testValue = !initialToggleState;
  visibilityToggle.checked = testValue;
  visibilityToggle.dispatchEvent(new Event('change'));
  
  // Wait for async operations
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check if AppUser was updated
  const updatedCurrentUser = stateManager.getState('currentUser');
  const updatedAppUserVisible = updatedCurrentUser?.isVisible;
  
  // Restore original state
  visibilityToggle.checked = initialToggleState;
  visibilityToggle.dispatchEvent(new Event('change'));
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const wasUpdated = updatedAppUserVisible === testValue;
  
  addResult(
    'Visibility Toggle Updates AppUser',
    wasUpdated,
    wasUpdated
      ? 'Visibility toggle correctly updates AppUser.isVisible'
      : `Visibility toggle did NOT update AppUser - Initial: ${initialAppUserVisible}, After toggle: ${updatedAppUserVisible}, Expected: ${testValue}`,
    { 
      initialAppUserVisible, 
      updatedAppUserVisible, 
      testValue, 
      wasUpdated 
    }
  );
}

/**
 * Test 5: Check event handler attachment order
 */
function testEventHandlerAttachment() {
  const themeToggle = document.getElementById('theme-toggle');
  const visibilityToggle = document.getElementById('visibility-toggle');
  
  if (!themeToggle || !visibilityToggle) {
    addResult('Event Handler Attachment', false, 'Toggles not found');
    return;
  }

  // Check if handlers are attached
  const themeHandlerAttached = themeToggle.getAttribute('data-handler-attached') === 'true';
  const visibilityHandlerAttached = visibilityToggle.getAttribute('data-handler-attached') === 'true';
  
  // Check if VisibilitySettingsManager is initialized
  const visibilitySettingsManager = window.visibilitySettingsManager;
  const isInitialized = visibilitySettingsManager?.isInitialized;
  
  addResult(
    'Event Handler Attachment',
    themeHandlerAttached && visibilityHandlerAttached && isInitialized,
    themeHandlerAttached && visibilityHandlerAttached && isInitialized
      ? 'All handlers attached and manager initialized'
      : `Theme: ${themeHandlerAttached}, Visibility: ${visibilityHandlerAttached}, Manager initialized: ${isInitialized}`,
    { themeHandlerAttached, visibilityHandlerAttached, isInitialized }
  );
}

/**
 * Run all diagnostics
 */
async function runSettingsCriticalDiagnostics() {
  console.log('🔍 SETTINGS_CRITICAL_DIAGNOSTICS: Starting diagnostics...');
  diagnostics.length = 0;
  
  testSpacing();
  testThemeToggleHandler();
  await testVisibilityToggleInitialState();
  await testVisibilityToggleUpdatesAppUser();
  testEventHandlerAttachment();
  
  const passed = diagnostics.filter(d => d.passed).length;
  const total = diagnostics.length;
  
  console.log(`\n✅ SETTINGS_CRITICAL_DIAGNOSTICS: Completed (${passed}/${total} passed)\n`);
  console.table(diagnostics);
  
  // Summary
  console.log('\n📊 SUMMARY:');
  diagnostics.forEach(d => {
    const icon = d.passed ? '✅' : '❌';
    console.log(`${icon} ${d.test}: ${d.message}`);
  });
  
  return diagnostics;
}

// Export for console access
if (typeof window !== 'undefined') {
  window.runSettingsCriticalDiagnostics = runSettingsCriticalDiagnostics;
  console.log('✅ SETTINGS_CRITICAL_DIAGNOSTICS: Available as window.runSettingsCriticalDiagnostics()');
}




