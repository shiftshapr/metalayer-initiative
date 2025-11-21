/**
 * COMPREHENSIVE DIAGNOSTIC: All Issues
 * 
 * This script diagnoses:
 * 1. Avatar black circle border
 * 2. Messages not displaying (messageLoader.loadDefault error)
 * 3. Settings toggles not shifting
 * 4. Headline 20 char limit preventing save
 * 
 * Run in browser console on extension sidepanel
 */

async function diagnoseAllIssues() {
  console.log('🔍 ===== COMPREHENSIVE DIAGNOSTIC: ALL ISSUES =====');
  const results = {
    timestamp: new Date().toISOString(),
    issues: {},
    rootCauses: [],
    recommendations: []
  };

  // ISSUE 1: Avatar Black Circle Border
  console.log('\n1️⃣ Checking Avatar Black Circle Border...');
  const avatarImg = document.querySelector('.avatar-img, #user-avatar-container img');
  results.issues.avatarBorder = {
    avatarFound: !!avatarImg,
    borderStyle: null,
    borderWidth: null,
    borderColor: null,
    computedBorder: null
  };

  if (avatarImg) {
    const style = window.getComputedStyle(avatarImg);
    results.issues.avatarBorder.borderStyle = style.borderStyle;
    results.issues.avatarBorder.borderWidth = style.borderWidth;
    results.issues.avatarBorder.borderColor = style.borderColor;
    results.issues.avatarBorder.computedBorder = `${style.borderWidth} ${style.borderStyle} ${style.borderColor}`;
    
    console.log(`   ${avatarImg ? '✅' : '❌'} Avatar image: ${avatarImg ? 'Found' : 'Missing'}`);
    console.log(`   📋 Border style: ${results.issues.avatarBorder.borderStyle}`);
    console.log(`   📋 Border width: ${results.issues.avatarBorder.borderWidth}`);
    console.log(`   📋 Border color: ${results.issues.avatarBorder.borderColor}`);
    console.log(`   📋 Computed border: ${results.issues.avatarBorder.computedBorder}`);
    
    if (results.issues.avatarBorder.borderWidth !== '0px' && results.issues.avatarBorder.borderWidth !== '0') {
      results.rootCauses.push(`Avatar has border: ${results.issues.avatarBorder.computedBorder} - CSS may be overriding inline style`);
    }
  } else {
    console.log('   ❌ Avatar image not found');
    results.rootCauses.push('Avatar image element not found in DOM');
  }

  // ISSUE 2: Messages Not Displaying
  console.log('\n2️⃣ Checking Messages Not Displaying...');
  results.issues.messages = {
    messageSystemIntegration: null,
    messageLoader: null,
    loadDefaultAvailable: false,
    unifiedMessageDisplay: null,
    chatContainer: null,
    messagesInDOM: 0
  };

  const messageSystemIntegration = getWindowFunction('messageSystemIntegration');
  const messageLoader = getWindowFunction('MessageLoader');
  const unifiedMessageDisplay = getWindowFunction('unifiedMessageDisplay');
  const chatContainer = document.querySelector('.chat-messages, #chat-messages, .messages-container');
  const messagesInDOM = document.querySelectorAll('.message, [data-message-id]').length;

  results.issues.messages.messageSystemIntegration = !!messageSystemIntegration;
  results.issues.messages.messageLoader = !!messageLoader;
  results.issues.messages.unifiedMessageDisplay = !!unifiedMessageDisplay;
  results.issues.messages.chatContainer = !!chatContainer;
  results.issues.messages.messagesInDOM = messagesInDOM;

  if (messageSystemIntegration) {
    results.issues.messages.loadDefaultAvailable = typeof messageSystemIntegration.messageLoader?.loadDefault === 'function';
  }

  console.log(`   ${results.issues.messages.messageSystemIntegration ? '✅' : '❌'} messageSystemIntegration: ${results.issues.messages.messageSystemIntegration ? 'Available' : 'Not available'}`);
  console.log(`   ${results.issues.messages.messageLoader ? '✅' : '❌'} MessageLoader class: ${results.issues.messages.messageLoader ? 'Available' : 'Not available'}`);
  console.log(`   ${results.issues.messages.loadDefaultAvailable ? '✅' : '❌'} messageLoader.loadDefault: ${results.issues.messages.loadDefaultAvailable ? 'Available' : 'Not available'}`);
  console.log(`   ${results.issues.messages.unifiedMessageDisplay ? '✅' : '❌'} unifiedMessageDisplay: ${results.issues.messages.unifiedMessageDisplay ? 'Available' : 'Not available'}`);
  console.log(`   ${results.issues.messages.chatContainer ? '✅' : '❌'} Chat container: ${results.issues.messages.chatContainer ? 'Found' : 'Missing'}`);
  console.log(`   📋 Messages in DOM: ${results.issues.messages.messagesInDOM}`);

  if (!results.issues.messages.messageLoader) {
    results.rootCauses.push('MessageLoader class not available on window - MessageLoader.js may not be exported');
  }
  if (!results.issues.messages.loadDefaultAvailable) {
    results.rootCauses.push('messageSystemIntegration.messageLoader.loadDefault is not a function - MessageLoader not passed to initializeMessageSystemIntegration');
  }
  if (results.issues.messages.messagesInDOM === 0) {
    results.rootCauses.push('No messages found in DOM - messages may not be loading or rendering');
  }

  // ISSUE 3: Settings Toggles Not Shifting
  console.log('\n3️⃣ Checking Settings Toggles...');
  const themeToggle = document.getElementById('theme-toggle');
  const visibilityToggle = document.getElementById('visibility-toggle');
  
  results.issues.toggles = {
    themeToggle: !!themeToggle,
    visibilityToggle: !!visibilityToggle,
    themeToggleChecked: false,
    visibilityToggleChecked: false,
    themeToggleHandlerAttached: false,
    visibilityToggleHandlerAttached: false
  };

  if (themeToggle) {
    results.issues.toggles.themeToggleChecked = themeToggle.checked;
    results.issues.toggles.themeToggleHandlerAttached = themeToggle.getAttribute('data-handler-attached') === 'true';
  }
  if (visibilityToggle) {
    results.issues.toggles.visibilityToggleChecked = visibilityToggle.checked;
    results.issues.toggles.visibilityToggleHandlerAttached = visibilityToggle.getAttribute('data-handler-attached') === 'true';
  }

  console.log(`   ${results.issues.toggles.themeToggle ? '✅' : '❌'} Theme toggle: ${results.issues.toggles.themeToggle ? 'Found' : 'Missing'}`);
  console.log(`   📋 Theme toggle checked: ${results.issues.toggles.themeToggleChecked}`);
  console.log(`   📋 Theme toggle handler attached: ${results.issues.toggles.themeToggleHandlerAttached}`);
  console.log(`   ${results.issues.toggles.visibilityToggle ? '✅' : '❌'} Visibility toggle: ${results.issues.toggles.visibilityToggle ? 'Found' : 'Missing'}`);
  console.log(`   📋 Visibility toggle checked: ${results.issues.toggles.visibilityToggleChecked}`);
  console.log(`   📋 Visibility toggle handler attached: ${results.issues.toggles.visibilityToggleHandlerAttached}`);

  if (!results.issues.toggles.themeToggleHandlerAttached) {
    results.rootCauses.push('Theme toggle event handler not attached - setupEventListeners may not be called');
  }
  if (!results.issues.toggles.visibilityToggleHandlerAttached) {
    results.rootCauses.push('Visibility toggle event handler not attached - setupEventListeners may not be called');
  }

  // ISSUE 4: Headline 20 Char Limit
  console.log('\n4️⃣ Checking Headline 20 Char Limit...');
  const headlineInput = document.getElementById('settings-headline-input');
  const headlineSaveBtn = document.getElementById('headline-save-btn');
  
  results.issues.headline = {
    headlineInput: !!headlineInput,
    headlineSaveBtn: !!headlineSaveBtn,
    currentLength: 0,
    maxLength: null,
    minLength: null,
    canSave: false
  };

  if (headlineInput) {
    results.issues.headline.currentLength = headlineInput.value.length;
    results.issues.headline.maxLength = headlineInput.getAttribute('maxlength');
    results.issues.headline.minLength = headlineInput.getAttribute('minlength');
    
    // Check if there's a validation preventing save
    const headlineManager = getWindowFunction('settingsHeadlineManager');
    if (headlineManager) {
      results.issues.headline.maxLength = headlineManager.maxLength || results.issues.headline.maxLength;
    }
  }

  console.log(`   ${results.issues.headline.headlineInput ? '✅' : '❌'} Headline input: ${results.issues.headline.headlineInput ? 'Found' : 'Missing'}`);
  console.log(`   📋 Current length: ${results.issues.headline.currentLength}`);
  console.log(`   📋 Max length (attribute): ${results.issues.headline.maxLength || 'Not set'}`);
  console.log(`   📋 Min length (attribute): ${results.issues.headline.minLength || 'Not set'}`);
  console.log(`   ${results.issues.headline.headlineSaveBtn ? '✅' : '❌'} Save button: ${results.issues.headline.headlineSaveBtn ? 'Found' : 'Missing'}`);

  if (results.issues.headline.maxLength && parseInt(results.issues.headline.maxLength) === 20) {
    results.rootCauses.push('Headline has maxLength=20 attribute preventing input beyond 20 chars');
  }
  if (results.issues.headline.currentLength > 20 && !results.issues.headline.canSave) {
    results.rootCauses.push('Headline validation may be preventing save after 20 chars - check saveHeadline validation logic');
  }

  // ROOT CAUSE ANALYSIS
  console.log('\n🔍 ===== ROOT CAUSE ANALYSIS =====');
  if (results.rootCauses.length === 0) {
    console.log('   ✅ No obvious root causes identified');
  } else {
    results.rootCauses.forEach((cause, i) => {
      console.log(`\n   ${i + 1}. ${cause}`);
    });
  }

  // RECOMMENDATIONS
  console.log('\n💡 ===== RECOMMENDATIONS =====');
  if (results.rootCauses.some(c => c.includes('border'))) {
    results.recommendations.push('Fix avatar border: Add !important to border: none in AvatarUtils.ts or check CSS overrides');
  }
  if (results.rootCauses.some(c => c.includes('MessageLoader'))) {
    results.recommendations.push('Fix MessageLoader: Ensure MessageLoader is exported to window and passed to initializeMessageSystemIntegration');
  }
  if (results.rootCauses.some(c => c.includes('toggle') && c.includes('handler'))) {
    results.recommendations.push('Fix toggles: Ensure setupEventListeners is called when settings tab opens');
  }
  if (results.rootCauses.some(c => c.includes('headline') && c.includes('20'))) {
    results.recommendations.push('Fix headline limit: Remove maxLength=20 attribute or update validation logic in saveHeadline');
  }

  results.recommendations.forEach((rec, i) => {
    console.log(`\n   ${i + 1}. ${rec}`);
  });

  console.log('\n✅ ===== DIAGNOSTIC COMPLETE =====');
  return results;
}

// Helper function
function getWindowFunction(name) {
  if (typeof window === 'undefined') return undefined;
  const win = window as Window & Record<string, unknown>;
  return win[name];
}

// Export for use
if (typeof window !== 'undefined') {
  window.diagnoseAllIssues = diagnoseAllIssues;
  console.log('✅ Comprehensive Diagnostic loaded! Run: window.diagnoseAllIssues()');
}


