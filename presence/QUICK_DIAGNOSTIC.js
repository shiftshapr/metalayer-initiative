// QUICK DIAGNOSTIC - Run this in console
console.log('🔍 QUICK DIAGNOSTIC STARTING...');
console.log('═══════════════════════════════════════');

// 1. Check Chrome profile
console.log('\n1️⃣ CHROME PROFILE:');
chrome.identity.getProfileUserInfo((info) => {
  console.log('   Email:', info?.email || '❌ NONE');
  console.log('   ID:', info?.id || '❌ NONE');
  if (!info || !info.email) {
    console.log('   ⚠️ ISSUE: No Chrome profile email');
  }
});

// 2. Check window.currentUser
console.log('\n2️⃣ WINDOW.CURRENTUSER:');
console.log('   Exists:', !!window.currentUser);
if (window.currentUser) {
  console.log('   Email:', window.currentUser.email);
  console.log('   ID:', window.currentUser.id);
} else {
  console.log('   ⚠️ ISSUE: window.currentUser is NULL');
}

// 3. Check PreRenderInitializer
console.log('\n3️⃣ PRERENDERINITIALIZER:');
console.log('   Exists:', !!window.preRenderInitializer);
if (window.preRenderInitializer) {
  const data = window.preRenderInitializer.getPreRenderData();
  console.log('   Initialized:', data?.isInitialized);
  console.log('   Has Aura:', !!data?.auraColor);
  console.log('   Has Avatar:', !!data?.avatarUrl);
} else {
  console.log('   ⚠️ ISSUE: PreRenderInitializer not found');
}

// 4. Check Profile Avatar
console.log('\n4️⃣ PROFILE AVATAR:');
const avatar = document.querySelector('.user-avatar-container');
console.log('   Container exists:', !!avatar);
if (avatar) {
  console.log('   Has content:', avatar.innerHTML.length > 0);
  console.log('   Content length:', avatar.innerHTML.length);
} else {
  console.log('   ⚠️ ISSUE: Avatar container not found');
}

// 5. Check Messages
console.log('\n5️⃣ MESSAGES:');
const discussTab = document.getElementById('discuss-tab');
if (discussTab) {
  const messages = discussTab.querySelectorAll('.message-item');
  console.log('   Message count:', messages.length);
  if (messages.length === 0) {
    console.log('   ⚠️ ISSUE: No messages found');
  }
} else {
  console.log('   ⚠️ ISSUE: Discuss tab not found');
}

// 6. Check API
console.log('\n6️⃣ API:');
console.log('   Exists:', !!window.api);
console.log('   Type:', typeof window.api);

console.log('\n═══════════════════════════════════════');
console.log('✅ DIAGNOSTIC COMPLETE');
console.log('═══════════════════════════════════════');

