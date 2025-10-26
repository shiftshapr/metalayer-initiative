// SD1 DIAGNOSTIC CODE - Run this in the browser console to trace themetalayer source
// Copy and paste this entire code block into the browser console

console.log('🔍 SD1 DIAGNOSTIC: Starting comprehensive themetalayer trace...');

// Function 1: Check all window objects for themetalayer
function checkWindowObjects() {
  console.log('🔍 SD1 DIAGNOSTIC: === CHECKING WINDOW OBJECTS ===');
  
  const windowObjects = [
    'window.currentUser',
    'window.authManager', 
    'window.stateManager',
    'window.api',
    'window.supabase',
    'window.supabaseRealtimeClient'
  ];
  
  windowObjects.forEach(objName => {
    try {
      const obj = eval(objName);
      if (obj && typeof obj === 'object') {
        const objStr = JSON.stringify(obj, null, 2);
        if (objStr.includes('themetalayer')) {
          console.error(`❌ SD1 DIAGNOSTIC: FOUND THEMETALAYER in ${objName}!`);
          console.error(`❌ SD1 DIAGNOSTIC: ${objName} content:`, obj);
        } else {
          console.log(`✅ SD1 DIAGNOSTIC: ${objName} clean - no themetalayer found`);
        }
      } else {
        console.log(`⚠️ SD1 DIAGNOSTIC: ${objName} is null/undefined`);
      }
    } catch (error) {
      console.log(`❌ SD1 DIAGNOSTIC: Error checking ${objName}:`, error.message);
    }
  });
}

// Function 2: Check all DOM elements for themetalayer text
function checkDOMForThemetalayer() {
  console.log('🔍 SD1 DIAGNOSTIC: === CHECKING DOM FOR THEMETALAYER ===');
  
  const allElements = document.querySelectorAll('*');
  let foundCount = 0;
  
  allElements.forEach((element, index) => {
    if (element.textContent && element.textContent.includes('themetalayer')) {
      console.error(`❌ SD1 DIAGNOSTIC: FOUND THEMETALAYER in DOM element ${index}!`);
      console.error(`❌ SD1 DIAGNOSTIC: Element tag: ${element.tagName}`);
      console.error(`❌ SD1 DIAGNOSTIC: Element text: ${element.textContent}`);
      console.error(`❌ SD1 DIAGNOSTIC: Element classes: ${element.className}`);
      foundCount++;
    }
  });
  
  if (foundCount === 0) {
    console.log('✅ SD1 DIAGNOSTIC: No themetalayer found in DOM elements');
  } else {
    console.error(`❌ SD1 DIAGNOSTIC: Found ${foundCount} DOM elements containing themetalayer!`);
  }
}

// Function 3: Check localStorage and sessionStorage
function checkStorage() {
  console.log('🔍 SD1 DIAGNOSTIC: === CHECKING STORAGE ===');
  
  // Check localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    if (value && value.includes('themetalayer')) {
      console.error(`❌ SD1 DIAGNOSTIC: FOUND THEMETALAYER in localStorage key: ${key}`);
      console.error(`❌ SD1 DIAGNOSTIC: Value: ${value}`);
    }
  }
  
  // Check sessionStorage
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    const value = sessionStorage.getItem(key);
    if (value && value.includes('themetalayer')) {
      console.error(`❌ SD1 DIAGNOSTIC: FOUND THEMETALAYER in sessionStorage key: ${key}`);
      console.error(`❌ SD1 DIAGNOSTIC: Value: ${value}`);
    }
  }
}

// Function 4: Check API responses
async function checkAPIResponses() {
  console.log('🔍 SD1 DIAGNOSTIC: === CHECKING API RESPONSES ===');
  
  try {
    // Check communities API
    if (window.api && window.api.getCommunities) {
      console.log('🔍 SD1 DIAGNOSTIC: Testing communities API...');
      const communitiesResponse = await window.api.getCommunities();
      console.log('🔍 SD1 DIAGNOSTIC: Communities API response:', communitiesResponse);
      
      if (JSON.stringify(communitiesResponse).includes('themetalayer')) {
        console.error('❌ SD1 DIAGNOSTIC: FOUND THEMETALAYER in communities API response!');
        console.error('❌ SD1 DIAGNOSTIC: Full communities response:', JSON.stringify(communitiesResponse, null, 2));
      }
    }
    
    // Check chat history API
    if (window.api && window.api.getChatHistory) {
      console.log('🔍 SD1 DIAGNOSTIC: Testing chat history API...');
      const chatResponse = await window.api.getChatHistory();
      console.log('🔍 SD1 DIAGNOSTIC: Chat history API response:', chatResponse);
      
      if (JSON.stringify(chatResponse).includes('themetalayer')) {
        console.error('❌ SD1 DIAGNOSTIC: FOUND THEMETALAYER in chat history API response!');
      }
    }
  } catch (error) {
    console.error('❌ SD1 DIAGNOSTIC: Error checking API responses:', error);
  }
}

// Function 5: Check StateManager data
function checkStateManager() {
  console.log('🔍 SD1 DIAGNOSTIC: === CHECKING STATEMANAGER ===');
  
  if (window.stateManager) {
    try {
      const allState = window.stateManager.getAllState();
      console.log('🔍 SD1 DIAGNOSTIC: All StateManager data:', allState);
      
      if (JSON.stringify(allState).includes('themetalayer')) {
        console.error('❌ SD1 DIAGNOSTIC: FOUND THEMETALAYER in StateManager!');
      }
    } catch (error) {
      console.error('❌ SD1 DIAGNOSTIC: Error checking StateManager:', error);
    }
  } else {
    console.log('⚠️ SD1 DIAGNOSTIC: StateManager not available');
  }
}

// Function 6: Check specific UI elements
function checkSpecificUIElements() {
  console.log('🔍 SD1 DIAGNOSTIC: === CHECKING SPECIFIC UI ELEMENTS ===');
  
  const selectors = [
    '.community-name',
    '.community-description', 
    '.user-menu-name',
    '.user-info',
    '#community-dropdown',
    '.chat-messages',
    '.user-avatar',
    '.profile-menu'
  ];
  
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element, index) => {
      if (element.textContent && element.textContent.includes('themetalayer')) {
        console.error(`❌ SD1 DIAGNOSTIC: FOUND THEMETALAYER in ${selector}[${index}]!`);
        console.error(`❌ SD1 DIAGNOSTIC: Text content: ${element.textContent}`);
      }
    });
  });
}

// Run all diagnostic functions
async function runFullDiagnostic() {
  console.log('🚀 SD1 DIAGNOSTIC: Starting full diagnostic...');
  
  checkWindowObjects();
  checkDOMForThemetalayer();
  checkStorage();
  await checkAPIResponses();
  checkStateManager();
  checkSpecificUIElements();
  
  console.log('✅ SD1 DIAGNOSTIC: Full diagnostic complete!');
}

// Make functions available globally
window.sd1CheckWindowObjects = checkWindowObjects;
window.sd1CheckDOMForThemetalayer = checkDOMForThemetalayer;
window.sd1CheckStorage = checkStorage;
window.sd1CheckAPIResponses = checkAPIResponses;
window.sd1CheckStateManager = checkStateManager;
window.sd1CheckSpecificUIElements = checkSpecificUIElements;
window.sd1RunFullDiagnostic = runFullDiagnostic;

console.log('🔍 SD1 DIAGNOSTIC: Functions loaded! Available commands:');
console.log('🔍 SD1 DIAGNOSTIC: - sd1RunFullDiagnostic() - Run all checks');
console.log('🔍 SD1 DIAGNOSTIC: - sd1CheckWindowObjects() - Check window objects');
console.log('🔍 SD1 DIAGNOSTIC: - sd1CheckDOMForThemetalayer() - Check DOM');
console.log('🔍 SD1 DIAGNOSTIC: - sd1CheckAPIResponses() - Check API responses');

// Auto-run the full diagnostic
runFullDiagnostic();
