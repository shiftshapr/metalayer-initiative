// DIAGNOSTIC: What is actually broken?
// Run this in console to see what's working and what's not

console.log('🔍 DIAGNOSTIC: What is actually broken?');
console.log('═══════════════════════════════════════');

// 1. Check profile avatar container
console.log('\n1️⃣ PROFILE AVATAR:');
const avatarContainer = document.querySelector('.user-avatar-container');
if (avatarContainer) {
  console.log('   ✅ Container exists');
  console.log('   📏 InnerHTML length:', avatarContainer.innerHTML.length);
  console.log('   👁️ Visible:', window.getComputedStyle(avatarContainer).display !== 'none');
  console.log('   📄 Content preview:', avatarContainer.innerHTML.substring(0, 200));
  
  if (avatarContainer.innerHTML.length === 0) {
    console.log('   ❌ ISSUE: Container is EMPTY');
  } else if (window.getComputedStyle(avatarContainer).display === 'none') {
    console.log('   ❌ ISSUE: Container is HIDDEN (display: none)');
  } else {
    console.log('   ✅ Container has content and is visible');
  }
} else {
  console.log('   ❌ ISSUE: Container NOT FOUND');
}

// 2. Check messages
console.log('\n2️⃣ MESSAGES:');
const discussTab = document.getElementById('discuss-tab');
if (discussTab) {
  const messages = discussTab.querySelectorAll('.message-item');
  console.log('   ✅ Discuss tab found');
  console.log('   📊 Message count:', messages.length);
  
  if (messages.length === 0) {
    console.log('   ⚠️ No messages (this is expected for chrome://extensions page)');
    console.log('   💡 Try navigating to a regular website to see messages');
  }
} else {
  console.log('   ❌ ISSUE: Discuss tab NOT FOUND');
}

// 3. Check visibility tab
console.log('\n3️⃣ VISIBILITY TAB:');
const visibilityTab = document.getElementById('visibility-tab');
if (visibilityTab) {
  const isActive = visibilityTab.classList.contains('active') || 
                  window.getComputedStyle(visibilityTab).display !== 'none';
  console.log('   ✅ Visibility tab found');
  console.log('   👁️ Is active:', isActive);
  
  if (!isActive) {
    console.log('   ⚠️ Tab is not active - click on "Visibility" tab to see avatars');
  }
  
  const avatars = visibilityTab.querySelectorAll('.avatar-item');
  console.log('   📊 Avatar count:', avatars.length);
} else {
  console.log('   ❌ ISSUE: Visibility tab NOT FOUND');
}

// 4. Check window.currentUser
console.log('\n4️⃣ WINDOW.CURRENTUSER:');
if (window.currentUser) {
  console.log('   ✅ window.currentUser exists');
  console.log('   📧 Email:', window.currentUser.email);
  console.log('   🆔 ID:', window.currentUser.id);
  console.log('   🖼️ Avatar URL:', window.currentUser.avatarUrl);
} else {
  console.log('   ❌ ISSUE: window.currentUser is NULL');
}

// 5. Check user info display
console.log('\n5️⃣ USER INFO DISPLAY:');
const userInfoDiv = document.querySelector('.user-info');
if (userInfoDiv) {
  const display = window.getComputedStyle(userInfoDiv).display;
  console.log('   ✅ User info div found');
  console.log('   👁️ Display:', display);
  
  if (display === 'none') {
    console.log('   ❌ ISSUE: User info is HIDDEN');
  } else {
    console.log('   ✅ User info is visible');
  }
} else {
  console.log('   ❌ ISSUE: User info div NOT FOUND');
}

console.log('\n═══════════════════════════════════════');
console.log('✅ DIAGNOSTIC COMPLETE');
console.log('═══════════════════════════════════════');

