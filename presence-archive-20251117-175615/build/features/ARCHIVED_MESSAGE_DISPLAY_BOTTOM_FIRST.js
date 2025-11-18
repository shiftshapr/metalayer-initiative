// ARCHIVED: Previous Message Display Implementation
// Date Archived: 2025-01-24
// Reason: Restructured to move input to top and display messages latest-first
// 
// This file contains the archived implementation of:
// - Message input at bottom (fixed position)
// - Messages displayed oldest-first (chronological order)
// - Messages appended using appendChild
//
// Original location: CanopiModule.js - addMessageToChat function
// Original behavior:
// - chatMessages.appendChild(messageDiv) - appended to end
// - Scroll to bottom after adding messages
// - Input area fixed at bottom of viewport
//
// Archived for potential future reference or rollback if needed.

// ===== ARCHIVED: Original appendChild Implementation =====
/*
  console.log('🔍 ADD_MESSAGE: Adding message to DOM:', message.id);
  chatMessages.appendChild(messageDiv);
  console.log('✅ ADD_MESSAGE: Message added to DOM successfully');
  
  // Scroll to bottom after adding message
  setTimeout(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 0);
*/
// ===== END ARCHIVED =====

// ===== ARCHIVED: Original HTML Structure =====
/*
<!-- Chat Input Area - Fixed at bottom -->
<div class="chat-input-area" style="position: fixed; bottom: 0; left: 0; right: 0; ...">
  <textarea id="chat-textarea" placeholder="Start thread in Public Square" ...></textarea>
</div>
*/
// ===== END ARCHIVED =====





