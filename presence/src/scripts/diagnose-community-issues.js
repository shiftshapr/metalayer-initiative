/**
 * DIAGNOSTIC SCRIPT: Community Issues
 * Pure JavaScript for browser console
 * 
 * Diagnoses:
 * 1. Broken image flash in top row
 * 2. Actions menu not displaying for non-primary communities
 * 3. Checkbox click error (null pageId)
 * 4. loadChatHistory being called with empty pageId
 */

(function() {
  'use strict';
  
  console.log('🔍 === COMMUNITY ISSUES DIAGNOSTIC ===');
  
  // 1️⃣ Check primary logo element
  console.log('\n1️⃣ Checking primary logo element...');
  const primaryLogo = document.getElementById('primary-community-logo');
  if (primaryLogo) {
    console.log('  ✅ Primary logo element found');
    console.log('  Current src:', primaryLogo.src);
    console.log('  Display:', window.getComputedStyle(primaryLogo).display);
    console.log('  Visibility:', window.getComputedStyle(primaryLogo).visibility);
    console.log('  Opacity:', window.getComputedStyle(primaryLogo).opacity);
    console.log('  Complete:', primaryLogo.complete);
    console.log('  Natural width:', primaryLogo.naturalWidth);
    console.log('  Natural height:', primaryLogo.naturalHeight);
    
    // Check if image is broken
    if (primaryLogo.complete && primaryLogo.naturalWidth === 0) {
      console.log('  ❌ Image is broken (naturalWidth = 0)');
    } else if (!primaryLogo.complete) {
      console.log('  ⚠️ Image still loading');
    } else {
      console.log('  ✅ Image loaded successfully');
    }
  } else {
    console.log('  ❌ Primary logo element not found');
  }
  
  // 2️⃣ Check actions menu for non-primary communities
  console.log('\n2️⃣ Checking actions menu for non-primary communities...');
  const communityItems = document.querySelectorAll('.community-item');
  console.log('  Total community items:', communityItems.length);
  
  communityItems.forEach((item, index) => {
    const communityId = item.dataset.communityId;
    const isPrimary = item.querySelector('.primary-tag') !== null;
    const menuBtn = item.querySelector('.community-menu-btn');
    const menuDropdown = item.querySelector('.community-menu-dropdown');
    
    console.log(`\n  Community ${index + 1}:`);
    console.log('    ID:', communityId);
    console.log('    Is Primary:', isPrimary);
    console.log('    Menu Button:', menuBtn ? '✅ Found' : '❌ Missing');
    console.log('    Menu Dropdown:', menuDropdown ? '✅ Found' : '❌ Missing');
    
    if (menuBtn) {
      const menuBtnStyles = window.getComputedStyle(menuBtn);
      console.log('    Menu Button Styles:');
      console.log('      display:', menuBtnStyles.display);
      console.log('      visibility:', menuBtnStyles.visibility);
      console.log('      opacity:', menuBtnStyles.opacity);
      console.log('      width:', menuBtnStyles.width);
      console.log('      height:', menuBtnStyles.height);
      
      if (isPrimary && menuBtn) {
        console.log('    ⚠️ WARNING: Primary community has menu button (should not)');
      } else if (!isPrimary && !menuBtn) {
        console.log('    ❌ ERROR: Non-primary community missing menu button');
      }
    }
    
    if (menuDropdown) {
      const dropdownStyles = window.getComputedStyle(menuDropdown);
      console.log('    Menu Dropdown Styles:');
      console.log('      display:', dropdownStyles.display);
      console.log('      visibility:', dropdownStyles.visibility);
    }
  });
  
  // 3️⃣ Check checkbox event handlers
  console.log('\n3️⃣ Checking checkbox event handlers...');
  const checkboxes = document.querySelectorAll('.community-checkbox');
  console.log('  Total checkboxes:', checkboxes.length);
  
  checkboxes.forEach((checkbox, index) => {
    const communityId = checkbox.dataset.communityId;
    console.log(`\n  Checkbox ${index + 1}:`);
    console.log('    Community ID:', communityId);
    console.log('    Checked:', checkbox.checked);
    
    // Check for event listeners (can't directly access, but can test)
    console.log('    ⚠️ Cannot directly inspect event listeners');
    console.log('    💡 Test by clicking checkbox and watching console for errors');
  });
  
  // 4️⃣ Check loadChatHistory calls
  console.log('\n4️⃣ Checking loadChatHistory usage...');
  if (typeof window.loadChatHistory === 'function') {
    console.log('  ✅ loadChatHistory function available');
    
    // Check if it's being called with empty pageId
    console.log('  💡 Check console logs for:');
    console.log('    - "loadChatHistory called with: {pageIdOrRawUrl: \'\'}"');
    console.log('    - "Invalid pageId (sidepanel or chrome URL)"');
  } else {
    console.log('  ⚠️ loadChatHistory function not available on window');
  }
  
  // 5️⃣ Check current URL context
  console.log('\n5️⃣ Checking current URL context...');
  const currentUrl = window.location.href;
  console.log('  Current URL:', currentUrl);
  console.log('  Is sidepanel:', currentUrl.includes('sidepanel.html'));
  console.log('  Is chrome-extension:', currentUrl.startsWith('chrome-extension://'));
  
  if (currentUrl.includes('sidepanel.html')) {
    console.log('  ⚠️ WARNING: In sidepanel - loadChatHistory should not be called with empty pageId');
  }
  
  // 6️⃣ Manual test functions
  console.log('\n6️⃣ Manual test functions available:');
  
  window.testPrimaryLogo = function() {
    const logo = document.getElementById('primary-community-logo');
    if (logo) {
      console.log('Testing primary logo...');
      console.log('  src:', logo.src);
      console.log('  complete:', logo.complete);
      console.log('  naturalWidth:', logo.naturalWidth);
      
      // Force reload
      const originalSrc = logo.src;
      logo.src = '';
      setTimeout(() => {
        logo.src = originalSrc;
        console.log('  Logo src reset, checking in 1 second...');
        setTimeout(() => {
          console.log('  After reload - complete:', logo.complete);
          console.log('  After reload - naturalWidth:', logo.naturalWidth);
        }, 1000);
      }, 100);
    }
  };
  
  window.testActionsMenu = function(communityId) {
    const item = document.querySelector(`[data-community-id="${communityId}"]`);
    if (item) {
      const menuBtn = item.querySelector('.community-menu-btn');
      const menuDropdown = item.querySelector('.community-menu-dropdown');
      
      console.log('Testing actions menu for:', communityId);
      console.log('  Menu button:', menuBtn);
      console.log('  Menu dropdown:', menuDropdown);
      
      if (menuBtn) {
        console.log('  Clicking menu button...');
        menuBtn.click();
        
        setTimeout(() => {
          const dropdownDisplay = window.getComputedStyle(menuDropdown).display;
          console.log('  Dropdown display after click:', dropdownDisplay);
        }, 100);
      }
    } else {
      console.log('Community not found:', communityId);
    }
  };
  
  window.testCheckbox = function(communityId) {
    const checkbox = document.querySelector(`.community-checkbox[data-community-id="${communityId}"]`);
    if (checkbox) {
      console.log('Testing checkbox for:', communityId);
      console.log('  Current checked state:', checkbox.checked);
      console.log('  Clicking checkbox...');
      
      try {
        checkbox.click();
        console.log('  ✅ Checkbox clicked without error');
        console.log('  New checked state:', checkbox.checked);
      } catch (error) {
        console.error('  ❌ Error clicking checkbox:', error);
      }
    } else {
      console.log('Checkbox not found for:', communityId);
    }
  };
  
  console.log('  Run: testPrimaryLogo() - to test primary logo loading');
  console.log('  Run: testActionsMenu("community-id") - to test actions menu');
  console.log('  Run: testCheckbox("community-id") - to test checkbox click');
  
  // Summary
  console.log('\n📊 === DIAGNOSTIC SUMMARY ===');
  console.log('Issues to check:');
  console.log('  1. Primary logo flash - check if image loads before display');
  console.log('  2. Actions menu visibility - check CSS and HTML structure');
  console.log('  3. Checkbox error - check loadChatHistory call with empty pageId');
  console.log('  4. Null pageId - should not call loadChatHistory in sidepanel');
  
  console.log('\n💡 Use test functions above to manually test each issue');
  
  return {
    primaryLogo: primaryLogo ? {
      exists: true,
      src: primaryLogo.src,
      complete: primaryLogo.complete,
      naturalWidth: primaryLogo.naturalWidth
    } : { exists: false },
    communityItems: Array.from(communityItems).map(item => ({
      id: item.dataset.communityId,
      hasMenuBtn: !!item.querySelector('.community-menu-btn'),
      hasMenuDropdown: !!item.querySelector('.community-menu-dropdown')
    })),
    checkboxes: Array.from(checkboxes).map(cb => ({
      id: cb.dataset.communityId,
      checked: cb.checked
    })),
    isSidepanel: currentUrl.includes('sidepanel.html')
  };
})();

