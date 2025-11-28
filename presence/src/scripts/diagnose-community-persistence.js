/**
 * DIAGNOSTIC SCRIPT: Community Persistence and UI Issues
 * Pure JavaScript for browser console
 * 
 * Diagnoses:
 * 1. Image flash in top row (check initial src attribute)
 * 2. Action menu visibility (check CSS and HTML structure)
 * 3. Checkbox persistence (check local storage and database)
 */

(function() {
  'use strict';
  
  console.log('🔍 === COMMUNITY PERSISTENCE & UI DIAGNOSTIC ===');
  
  // 1️⃣ Check primary logo initial state
  console.log('\n1️⃣ Checking primary logo initial state...');
  const primaryLogo = document.getElementById('primary-community-logo');
  if (primaryLogo) {
    console.log('  ✅ Primary logo element found');
    console.log('  Initial src attribute:', primaryLogo.getAttribute('src'));
    console.log('  Current src property:', primaryLogo.src);
    console.log('  Display:', window.getComputedStyle(primaryLogo).display);
    console.log('  Visibility:', window.getComputedStyle(primaryLogo).visibility);
    console.log('  Opacity:', window.getComputedStyle(primaryLogo).opacity);
    
    // Check if empty src causes flash
    if (primaryLogo.getAttribute('src') === '' || primaryLogo.src === window.location.href) {
      console.log('  ❌ ISSUE: Empty src attribute causes broken image flash');
      console.log('  💡 Fix: Remove src attribute or set to data URI placeholder');
    } else {
      console.log('  ✅ src attribute is set correctly');
    }
  } else {
    console.log('  ❌ Primary logo element not found');
  }
  
  // 2️⃣ Check action menu visibility
  console.log('\n2️⃣ Checking action menu visibility...');
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
      console.log('      position:', menuBtnStyles.position);
      console.log('      z-index:', menuBtnStyles.zIndex);
      
      // Check if button is actually visible
      const isVisible = menuBtnStyles.display !== 'none' && 
                       menuBtnStyles.visibility !== 'hidden' && 
                       menuBtnStyles.opacity !== '0';
      console.log('    Button is visible:', isVisible ? '✅' : '❌');
      
      if (!isVisible) {
        console.log('    ❌ ISSUE: Menu button is not visible');
      }
    }
    
    if (menuDropdown) {
      const dropdownStyles = window.getComputedStyle(menuDropdown);
      console.log('    Menu Dropdown Styles:');
      console.log('      display:', dropdownStyles.display);
      console.log('      visibility:', dropdownStyles.visibility);
      console.log('      opacity:', dropdownStyles.opacity);
      console.log('      position:', dropdownStyles.position);
      console.log('      z-index:', dropdownStyles.zIndex);
      console.log('      top:', dropdownStyles.top);
      console.log('      right:', dropdownStyles.right);
      
      // Check parent positioning
      const parent = menuDropdown.parentElement;
      if (parent) {
        const parentStyles = window.getComputedStyle(parent);
        console.log('    Parent Styles:');
        console.log('      position:', parentStyles.position);
        console.log('      overflow:', parentStyles.overflow);
      }
    }
  });
  
  // 3️⃣ Check checkbox persistence
  console.log('\n3️⃣ Checking checkbox persistence...');
  const checkboxes = document.querySelectorAll('.community-checkbox');
  console.log('  Total checkboxes:', checkboxes.length);
  
  // Check Chrome local storage
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(null, (items) => {
      console.log('  Chrome Local Storage:');
      const activeCommunitiesKey = Object.keys(items).find(key => key.includes('activeCommunities') || key.includes('active_communities'));
      if (activeCommunitiesKey) {
        console.log(`    ✅ Found: ${activeCommunitiesKey}`, items[activeCommunitiesKey]);
      } else {
        console.log('    ⚠️ No activeCommunities found in Chrome storage');
        console.log('    Available keys:', Object.keys(items).filter(k => k.includes('community') || k.includes('preference')));
      }
    });
  }
  
  // Check StateManager state
  if (typeof window !== 'undefined' && window.stateManagerInstance) {
    try {
      const activeCommunities = window.stateManagerInstance.getState('ui.activeCommunities');
      console.log('  StateManager activeCommunities:', activeCommunities);
    } catch (e) {
      console.log('  ⚠️ Could not read StateManager state:', e);
    }
  }
  
  // Check UserPreferencesManager
  if (typeof window !== 'undefined' && window.userPreferencesManager) {
    try {
      window.userPreferencesManager.getPreference('activeCommunities').then((value) => {
        console.log('  UserPreferencesManager activeCommunities:', value);
      }).catch((e) => {
        console.log('  ⚠️ Could not read from UserPreferencesManager:', e);
      });
    } catch (e) {
      console.log('  ⚠️ UserPreferencesManager not available:', e);
    }
  }
  
  checkboxes.forEach((checkbox, index) => {
    const communityId = checkbox.dataset.communityId;
    console.log(`\n  Checkbox ${index + 1}:`);
    console.log('    Community ID:', communityId);
    console.log('    Checked:', checkbox.checked);
  });
  
  // 4️⃣ Manual test functions
  console.log('\n4️⃣ Manual test functions available:');
  
  window.testImageFlash = function() {
    const logo = document.getElementById('primary-community-logo');
    if (logo) {
      console.log('Testing image flash fix...');
      console.log('  Current src:', logo.src);
      console.log('  src attribute:', logo.getAttribute('src'));
      
      // Remove src attribute to prevent flash
      logo.removeAttribute('src');
      console.log('  ✅ Removed src attribute');
      console.log('  New src attribute:', logo.getAttribute('src'));
    }
  };
  
  window.testActionMenu = function(communityId) {
    const item = document.querySelector(`[data-community-id="${communityId}"]`);
    if (item) {
      const menuBtn = item.querySelector('.community-menu-btn');
      const menuDropdown = item.querySelector('.community-menu-dropdown');
      
      console.log('Testing action menu for:', communityId);
      
      if (menuBtn) {
        console.log('  Menu button found');
        console.log('  Clicking menu button...');
        menuBtn.click();
        
        setTimeout(() => {
          const dropdownDisplay = window.getComputedStyle(menuDropdown).display;
          const dropdownVisibility = window.getComputedStyle(menuDropdown).visibility;
          const dropdownOpacity = window.getComputedStyle(menuDropdown).opacity;
          console.log('  Dropdown after click:');
          console.log('    display:', dropdownDisplay);
          console.log('    visibility:', dropdownVisibility);
          console.log('    opacity:', dropdownOpacity);
          
          if (dropdownDisplay === 'block' && dropdownVisibility === 'visible' && dropdownOpacity !== '0') {
            console.log('  ✅ Dropdown is visible');
          } else {
            console.log('  ❌ Dropdown is not visible');
            console.log('  💡 Fix: Check CSS for .community-menu-dropdown');
          }
        }, 100);
      } else {
        console.log('  ❌ Menu button not found');
      }
    } else {
      console.log('Community not found:', communityId);
    }
  };
  
  window.testCheckboxPersistence = async function(communityId) {
    const checkbox = document.querySelector(`.community-checkbox[data-community-id="${communityId}"]`);
    if (!checkbox) {
      console.log('Checkbox not found for:', communityId);
      return;
    }
    
    console.log('Testing checkbox persistence for:', communityId);
    const wasChecked = checkbox.checked;
    console.log('  Initial checked state:', wasChecked);
    
    // Toggle checkbox
    checkbox.checked = !wasChecked;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    
    console.log('  New checked state:', checkbox.checked);
    console.log('  Waiting 2 seconds for persistence...');
    
    setTimeout(async () => {
      // Check Chrome storage
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(null, (items) => {
          console.log('  Chrome Local Storage after change:');
          const activeCommunitiesKey = Object.keys(items).find(key => key.includes('activeCommunities') || key.includes('active_communities'));
          if (activeCommunitiesKey) {
            console.log(`    ✅ Found: ${activeCommunitiesKey}`, items[activeCommunitiesKey]);
          } else {
            console.log('    ❌ Not found in Chrome storage');
          }
        });
      }
      
      // Check StateManager
      if (typeof window !== 'undefined' && window.stateManagerInstance) {
        try {
          const activeCommunities = window.stateManagerInstance.getState('ui.activeCommunities');
          console.log('  StateManager activeCommunities:', activeCommunities);
          const hasCommunity = activeCommunities && activeCommunities.includes(communityId);
          console.log('  Community in activeCommunities:', hasCommunity ? '✅' : '❌');
        } catch (e) {
          console.log('  ⚠️ Could not read StateManager:', e);
        }
      }
    }, 2000);
  };
  
  console.log('  Run: testImageFlash() - to test image flash fix');
  console.log('  Run: testActionMenu("community-id") - to test action menu');
  console.log('  Run: testCheckboxPersistence("community-id") - to test checkbox persistence');
  
  // Summary
  console.log('\n📊 === DIAGNOSTIC SUMMARY ===');
  console.log('Issues to check:');
  console.log('  1. Image flash - check if src="" causes flash');
  console.log('  2. Action menu visibility - check CSS display/visibility/opacity');
  console.log('  3. Checkbox persistence - verify saves to Chrome storage and database');
  
  return {
    primaryLogo: primaryLogo ? {
      exists: true,
      srcAttribute: primaryLogo.getAttribute('src'),
      srcProperty: primaryLogo.src,
      hasEmptySrc: primaryLogo.getAttribute('src') === '' || primaryLogo.src === window.location.href
    } : { exists: false },
    communityItems: Array.from(communityItems).map(item => ({
      id: item.dataset.communityId,
      hasMenuBtn: !!item.querySelector('.community-menu-btn'),
      hasMenuDropdown: !!item.querySelector('.community-menu-dropdown')
    })),
    checkboxes: Array.from(checkboxes).map(cb => ({
      id: cb.dataset.communityId,
      checked: cb.checked
    }))
  };
})();

