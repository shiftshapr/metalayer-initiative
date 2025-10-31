// DIAGNOSTIC: Run this in console to diagnose message author attribution issues
window.diagnoseMessageAuthors = async function() {
  console.log('🔍 === MESSAGE AUTHOR DIAGNOSTIC ===');
  
  // 1. Current user info
  console.log('1️⃣ Current User:');
  console.log('   ID:', window.currentUser?.id);
  console.log('   Email:', window.currentUser?.email);
  console.log('   Name:', window.currentUser?.name);
  
  // 2. Get all messages from DOM
  const messages = document.querySelectorAll('.message');
  console.log(`2️⃣ Found ${messages.length} messages in DOM`);
  
  // 3. Analyze each message
  const issues = [];
  messages.forEach((msgEl, idx) => {
    const messageId = msgEl.dataset.messageId;
    const authorEl = msgEl.querySelector('.message-author');
    const authorName = authorEl?.textContent?.trim();
    const avatarEl = msgEl.querySelector('.avatar-container img');
    const avatarSrc = avatarEl?.src;
    const messageBodyEl = msgEl.querySelector('.message-body, .message-content');
    const messageBody = messageBodyEl?.textContent?.trim();
    
    console.log(`3️⃣ Message ${idx + 1}:`);
    console.log('   Message ID:', messageId);
    console.log('   Author Name:', authorName);
    console.log('   Avatar:', avatarSrc);
    console.log('   Body:', messageBody?.substring(0, 50));
    
    // Check if author matches current user incorrectly
    if (authorName && window.currentUser?.email && authorName.includes(window.currentUser.email)) {
      // Check if message body suggests different author
      if (messageBody && (messageBody.toLowerCase().includes('from daveroom') || messageBody.toLowerCase().includes('from '))) {
        issues.push({
          messageId,
          authorName,
          messageBody,
          issue: 'Author name matches current user but message content suggests different author'
        });
      }
    }
  });
  
  // 4. Fetch raw messages from backend
  console.log('4️⃣ Fetching messages from backend...');
  try {
    const pageId = window.currentUrlData?.pageId || 'google_com_';
    const response = await window.api.request(`/v1/messages?pageId=${encodeURIComponent(pageId)}`, { method: 'GET' });
    
    if (response && response.length > 0) {
      console.log(`   Backend returned ${response.length} messages`);
      response.forEach((msg, idx) => {
        console.log(`   Message ${idx + 1} from backend:`);
        console.log('     ID:', msg.id);
        console.log('     user_id:', msg.user_id);
        console.log('     body:', msg.body?.substring(0, 50));
        console.log('     AppUser name:', msg.AppUser?.name);
        console.log('     AppUser id:', msg.AppUser?.id);
        
        // Compare with DOM
        const domMsg = Array.from(messages).find(m => m.dataset.messageId === msg.id);
        if (domMsg) {
          const domAuthor = domMsg.querySelector('.message-author')?.textContent?.trim();
          const backendAuthor = msg.AppUser?.name || msg.user_id;
          
          if (domAuthor !== backendAuthor) {
            issues.push({
              messageId: msg.id,
              backendAuthor,
              domAuthor,
              issue: 'DOM author does not match backend author',
              backendUserId: msg.user_id,
              currentUserId: window.currentUser?.id,
              match: msg.user_id === window.currentUser?.id ? 'YES (might cause wrong attribution)' : 'NO'
            });
          }
        }
      });
    }
  } catch (error) {
    console.error('   ❌ Error fetching from backend:', error);
  }
  
  // 5. Report issues
  if (issues.length > 0) {
    console.error('🚨 === ISSUES FOUND ===');
    issues.forEach((issue, idx) => {
      console.error(`   Issue ${idx + 1}:`, issue);
    });
  } else {
    console.log('✅ No author attribution issues found');
  }
  
  return { messages: messages.length, issues };
};

console.log('✅ Diagnostic function loaded: window.diagnoseMessageAuthors()');

