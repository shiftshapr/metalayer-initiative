// ADVANCED DIAGNOSTIC CONSOLE CODE
// Run this in browser console to identify the source of invalid UUIDs

console.log('🔍 ADVANCED DIAGNOSTIC CONSOLE CODE');
console.log('=====================================');

async function advancedDiagnose() {
  try {
    const invalidUUIDs = ['18ad77cb-222e-4485-a720-db39981a4099', '41266409-84e9-439e-b1b3-df44d0797581', '60524d7d-da7d-4216-ba3b-475becaa2527', '6c89ce15-c4a4-45b7-82f8-9dae06418f00'];
    
    console.log('\n📋 Step 1: Check all global variables for invalid UUIDs');
    
    // Check window object for invalid UUIDs
    const windowKeys = Object.keys(window);
    const windowValues = Object.values(window);
    let foundInWindow = false;
    
    windowValues.forEach((value, index) => {
      if (typeof value === 'string' && invalidUUIDs.some(uuid => value.includes(uuid))) {
        console.log(`❌ Found invalid UUID in window.${windowKeys[index]}:`, value);
        foundInWindow = true;
      }
      if (typeof value === 'object' && value !== null) {
        const valueStr = JSON.stringify(value);
        if (invalidUUIDs.some(uuid => valueStr.includes(uuid))) {
          console.log(`❌ Found invalid UUID in window.${windowKeys[index]}:`, value);
          foundInWindow = true;
        }
      }
    });
    
    if (!foundInWindow) {
      console.log('✅ No invalid UUIDs found in window object');
    }
    
    console.log('\n📋 Step 2: Check visibility data sources');
    
    // Check currentVisibilityDataUnfiltered
    if (window.currentVisibilityDataUnfiltered) {
      console.log('Checking currentVisibilityDataUnfiltered...');
      const unfilteredData = JSON.stringify(window.currentVisibilityDataUnfiltered);
      const foundInUnfiltered = invalidUUIDs.filter(uuid => unfilteredData.includes(uuid));
      if (foundInUnfiltered.length > 0) {
        console.log('❌ Found invalid UUIDs in currentVisibilityDataUnfiltered:', foundInUnfiltered);
        
        // Show the specific users
        window.currentVisibilityDataUnfiltered.active?.forEach((user, index) => {
          const id = user.id || user.userId || user.user_id;
          if (invalidUUIDs.includes(id)) {
            console.log(`  User ${index}:`, user);
          }
        });
      } else {
        console.log('✅ No invalid UUIDs in currentVisibilityDataUnfiltered');
      }
    } else {
      console.log('ℹ️ currentVisibilityDataUnfiltered not available');
    }
    
    // Check currentVisibilityData
    if (window.currentVisibilityData) {
      console.log('Checking currentVisibilityData...');
      const filteredData = JSON.stringify(window.currentVisibilityData);
      const foundInFiltered = invalidUUIDs.filter(uuid => filteredData.includes(uuid));
      if (foundInFiltered.length > 0) {
        console.log('❌ Found invalid UUIDs in currentVisibilityData:', foundInFiltered);
      } else {
        console.log('✅ No invalid UUIDs in currentVisibilityData');
      }
    } else {
      console.log('ℹ️ currentVisibilityData not available');
    }
    
    console.log('\n📋 Step 3: Check browser storage');
    
    try {
      const storageData = await new Promise((resolve) => {
        chrome.storage.local.get(null, resolve);
      });
      
      const storageKeys = Object.keys(storageData);
      let foundInStorage = false;
      
      storageKeys.forEach(key => {
        const value = storageData[key];
        if (typeof value === 'string' && invalidUUIDs.some(uuid => value.includes(uuid))) {
          console.log(`❌ Found invalid UUID in storage key "${key}":`, value);
          foundInStorage = true;
        }
        if (typeof value === 'object' && value !== null) {
          const valueStr = JSON.stringify(value);
          if (invalidUUIDs.some(uuid => valueStr.includes(uuid))) {
            console.log(`❌ Found invalid UUID in storage key "${key}":`, value);
            foundInStorage = true;
          }
        }
      });
      
      if (!foundInStorage) {
        console.log('✅ No invalid UUIDs found in browser storage');
      }
    } catch (error) {
      console.log('❌ Storage check failed:', error.message);
    }
    
    console.log('\n📋 Step 4: Check DOM elements');
    
    // Check all elements with data attributes
    const elementsWithData = document.querySelectorAll('[data-user-id], [data-user-email], [data-userid]');
    let foundInDOM = false;
    
    elementsWithData.forEach((element, index) => {
      const userId = element.getAttribute('data-user-id') || element.getAttribute('data-user-email') || element.getAttribute('data-userid');
      if (userId && invalidUUIDs.includes(userId)) {
        console.log(`❌ Found invalid UUID in DOM element ${index}:`, userId);
        console.log('  Element:', element);
        foundInDOM = true;
      }
    });
    
    if (!foundInDOM) {
      console.log('✅ No invalid UUIDs found in DOM elements');
    }
    
    console.log('\n📋 Step 5: Check network requests');
    
    // Override fetch to monitor API calls
    const originalFetch = window.fetch;
    let apiCallCount = 0;
    
    window.fetch = function(...args) {
      const url = args[0];
      if (typeof url === 'string' && url.includes('/v1/users/')) {
        apiCallCount++;
        const userId = url.split('/v1/users/')[1];
        if (invalidUUIDs.includes(userId)) {
          console.log(`❌ API call detected for invalid UUID: ${userId}`);
          console.log('  URL:', url);
          console.log('  Stack trace:', new Error().stack);
        }
      }
      return originalFetch.apply(this, args);
    };
    
    console.log('🔍 Monitoring API calls for invalid UUIDs...');
    console.log('  (This will show any new API calls to /v1/users/ with invalid UUIDs)');
    
    // Restore original fetch after 10 seconds
    setTimeout(() => {
      window.fetch = originalFetch;
      console.log(`📊 API monitoring complete. Total calls monitored: ${apiCallCount}`);
    }, 10000);
    
    console.log('\n📋 Step 6: Check for hardcoded test data');
    
    // Check if there are any hardcoded test users or mock data
    const testPatterns = [
      'test-user',
      'mock-user', 
      'fake-user',
      'dummy-user',
      'example-user'
    ];
    
    let foundTestData = false;
    testPatterns.forEach(pattern => {
      if (window.currentVisibilityDataUnfiltered && JSON.stringify(window.currentVisibilityDataUnfiltered).includes(pattern)) {
        console.log(`⚠️ Found test pattern "${pattern}" in visibility data`);
        foundTestData = true;
      }
    });
    
    if (!foundTestData) {
      console.log('✅ No obvious test data patterns found');
    }
    
    console.log('\n✅ ADVANCED DIAGNOSTIC COMPLETED');
    console.log('=====================================');
    console.log('Monitor the console for any new API calls with invalid UUIDs');
    console.log('The fetch override will show stack traces for invalid UUID API calls');

  } catch (error) {
    console.error('❌ Advanced diagnostic error:', error);
  }
}

// Run advanced diagnostics
advancedDiagnose();


