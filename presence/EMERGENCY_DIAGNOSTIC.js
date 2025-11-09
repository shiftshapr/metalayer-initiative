/**
 * EMERGENCY DIAGNOSTIC SCRIPT
 * Run this in the console to diagnose the issue
 */

(async function emergencyDiagnostic() {
  console.log('🚨 EMERGENCY DIAGNOSTIC STARTING...');
  console.log('═══════════════════════════════════════════════════════════');
  
  const results = {
    timestamp: new Date().toISOString(),
    issues: [],
    critical: [],
    warnings: []
  };
  
  // 1. CHECK CHROME PROFILE
  console.log('\n1️⃣ CHECKING CHROME PROFILE...');
  try {
    if (typeof chrome !== 'undefined' && chrome.identity && chrome.identity.getProfileUserInfo) {
      const profileInfo = await new Promise((resolve) => {
        chrome.identity.getProfileUserInfo({ accountStatus: 'ANY' }, (info) => {
          resolve(info);
        });
      });
      
      console.log('✅ Chrome identity API available');
      console.log('📧 Profile email:', profileInfo?.email || 'NONE');
      console.log('🆔 Profile ID:', profileInfo?.id || 'NONE');
      
      if (!profileInfo || !profileInfo.email) {
        results.critical.push('NO CHROME PROFILE EMAIL - User not signed into Chrome browser');
        console.error('❌ CRITICAL: No Chrome profile email found!');
        console.error('   → User must be signed into Chrome browser');
      } else {
        console.log('✅ Chrome profile found:', profileInfo.email);
      }
    } else {
      results.critical.push('Chrome identity API not available');
      console.error('❌ CRITICAL: Chrome identity API not available');
    }
  } catch (error) {
    results.critical.push('Error checking Chrome profile: ' + error.message);
    console.error('❌ Error checking Chrome profile:', error);
  }
  
  // 2. CHECK WINDOW.CURRENTUSER
  console.log('\n2️⃣ CHECKING WINDOW.CURRENTUSER...');
  if (window.currentUser) {
    console.log('✅ window.currentUser exists:', window.currentUser);
    console.log('   - email:', window.currentUser.email);
    console.log('   - id:', window.currentUser.id);
    console.log('   - name:', window.currentUser.name);
    console.log('   - auraColor:', window.currentUser.auraColor);
    console.log('   - avatarUrl:', window.currentUser.avatarUrl);
  } else {
    results.critical.push('window.currentUser is NULL');
    console.error('❌ CRITICAL: window.currentUser is NULL');
  }
  
  // 3. CHECK PROFILE AVATAR CONTAINER
  console.log('\n3️⃣ CHECKING PROFILE AVATAR CONTAINER...');
  const avatarContainer = document.querySelector('.user-avatar-container');
  if (avatarContainer) {
    console.log('✅ Avatar container found');
    console.log('   - innerHTML length:', avatarContainer.innerHTML.length);
    console.log('   - innerHTML:', avatarContainer.innerHTML.substring(0, 200));
    
    if (avatarContainer.innerHTML.length === 0) {
      results.critical.push('Avatar container is EMPTY');
      console.error('❌ CRITICAL: Avatar container is EMPTY');
    }
  } else {
    results.critical.push('Avatar container NOT FOUND');
    console.error('❌ CRITICAL: Avatar container not found');
  }
  
  // 4. CHECK PROFILEMANAGER
  console.log('\n4️⃣ CHECKING PROFILEMANAGER...');
  if (window.ProfileManager) {
    console.log('✅ ProfileManager class exists');
    
    if (window.profileManager) {
      console.log('✅ profileManager instance exists');
      console.log('   - isInitialized:', window.profileManager.isInitialized);
    } else {
      results.warnings.push('profileManager instance not created');
      console.warn('⚠️ profileManager instance not created');
    }
  } else {
    results.critical.push('ProfileManager class NOT FOUND');
    console.error('❌ CRITICAL: ProfileManager class not found');
  }
  
  // 5. CHECK VISIBILITY TAB
  console.log('\n5️⃣ CHECKING VISIBILITY TAB...');
  const visibilityTab = document.getElementById('visibility-tab');
  if (visibilityTab) {
    console.log('✅ Visibility tab found');
    const avatars = visibilityTab.querySelectorAll('.avatar-item');
    console.log('   - Avatar count:', avatars.length);
    
    if (avatars.length === 0) {
      results.warnings.push('No avatars in visibility tab');
      console.warn('⚠️ No avatars in visibility tab');
    }
  } else {
    results.warnings.push('Visibility tab not found');
    console.warn('⚠️ Visibility tab not found');
  }
  
  // 6. CHECK MESSAGES
  console.log('\n6️⃣ CHECKING MESSAGES...');
  const discussTab = document.getElementById('discuss-tab');
  if (discussTab) {
    console.log('✅ Discuss tab found');
    const messages = discussTab.querySelectorAll('.message-item');
    console.log('   - Message count:', messages.length);
    
    if (messages.length === 0) {
      results.warnings.push('No messages in discuss tab');
      console.warn('⚠️ No messages in discuss tab');
    }
  } else {
    results.warnings.push('Discuss tab not found');
    console.warn('⚠️ Discuss tab not found');
  }
  
  // 7. CHECK API
  console.log('\n7️⃣ CHECKING API...');
  if (window.api) {
    console.log('✅ API available');
    console.log('   - Type:', typeof window.api);
  } else {
    results.critical.push('window.api is NULL');
    console.error('❌ CRITICAL: window.api is NULL');
  }
  
  // 8. CHECK AVATARUTILS
  console.log('\n8️⃣ CHECKING AVATARUTILS...');
  if (window.AvatarUtils) {
    console.log('✅ AvatarUtils available');
    console.log('   - createUnifiedAvatar:', typeof window.AvatarUtils.createUnifiedAvatar);
  } else {
    results.critical.push('AvatarUtils NOT FOUND');
    console.error('❌ CRITICAL: AvatarUtils not found');
  }
  
  // FINAL SUMMARY
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🚨 EMERGENCY DIAGNOSTIC COMPLETE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n📊 SUMMARY:');
  console.log('   - Critical issues:', results.critical.length);
  console.log('   - Warnings:', results.warnings.length);
  
  if (results.critical.length > 0) {
    console.log('\n🔴 CRITICAL ISSUES:');
    results.critical.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️ WARNINGS:');
    results.warnings.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
  }
  
  console.log('\n💡 NEXT STEPS:');
  if (results.critical.includes('NO CHROME PROFILE EMAIL - User not signed into Chrome browser')) {
    console.log('   1. ❗ SIGN INTO CHROME BROWSER');
    console.log('      → Click Chrome profile icon (top right)');
    console.log('      → Sign in with Google account');
    console.log('      → Reload extension');
  } else if (results.critical.length > 0) {
    console.log('   1. Check critical issues above');
    console.log('   2. Check console for errors');
    console.log('   3. Reload extension');
  } else {
    console.log('   1. No critical issues found');
    console.log('   2. Check warnings if any');
  }
  
  console.log('\n═══════════════════════════════════════════════════════════');
  
  // Store results globally
  window.emergencyDiagnosticResults = results;
  console.log('📋 Results stored in window.emergencyDiagnosticResults');
  
  return results;
})();

