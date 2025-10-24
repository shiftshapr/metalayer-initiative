// DIAGNOSTIC FUNCTIONS - Run in browser console for debugging
window.debugAvatar = function() {
    console.log("=== AVATAR DIAGNOSTIC ===", null, 'general');
    console.log("Current user:", window.currentUser, 'general');
    console.log("User avatar_url:", window.currentUser?.user_metadata?.avatar_url, 'general');
    console.log("Profile avatar container:", document.getElementById("user-avatar-container"), 'general');
    console.log("Profile avatar HTML:", document.getElementById("user-avatar-container")?.innerHTML, 'general');
    console.log("AuthManager user:", authManager.getCurrentUser(), 'general');
  };
  
  window.debugVisibility = function() {
    console.log("=== VISIBILITY DIAGNOSTIC ===", null, 'general');
    console.log("Current visibility data:", window.currentVisibilityData, 'general');
    console.log("Visibility timer:", window.visibilityUpdateTimer, 'general');
    console.log("User elements:", document.querySelectorAll(".user-item"), 'general');
    console.log("Status elements:", document.querySelectorAll(".user-status"), 'general');
    console.log("Status texts:", Array.from(document.querySelectorAll(".user-status")).map(el => el.textContent), 'general');
  };
  
  window.testTimeUpdate = function() {
    console.log("=== MANUAL TIME UPDATE TEST ===", null, 'general');
    updateVisibilityTimes();
    console.log("Time update triggered manually", null, 'general');
  };
  
  window.forceAvatarRefresh = function() {
    console.log("=== FORCE AVATAR REFRESH ===", null, 'general');
    const user = window.currentUser;
    if (user) {
      updateUI(user);
      console.log("Avatar refresh triggered", null, 'general');
    } else {
      console.log("No current user found", null, 'general');
    }
  };
  
  window.restartVisibilityTimer = function() {
    console.log("=== RESTART VISIBILITY TIMER ===", null, 'general');
    if (window.visibilityUpdateTimer) {
      clearInterval(window.visibilityUpdateTimer);
    }
    // NO POLLING - Use Supabase real-time instead
    console.log("Timer restarted", null, 'general');
  };
  
  
  
  console.log("🔧 Debug functions loaded: debugAgentTab(), debugAgent()", null, 'general');
  
  // Immediate debug function that works even if script isn't fully loaded
  window.quickDebug = function() {
    console.log("Quick Debug - Agent Tab Status:", null, 'general');
    console.log("Document ready:", document.readyState, 'general');
    console.log("Agent tab button:", document.querySelector('[data-tab="agent-tab"]'), 'general');
    console.log("Agent tab content:", document.getElementById('agent-tab'), 'general');
    console.log("Active tab:", document.querySelector('.main-nav-tab.active')?.textContent, 'general');
    
    // Check if we can find the agent tab button and click it
    const agentButton = document.querySelector('[data-tab="agent-tab"]');
    if (agentButton) {
      console.log("Agent button found, attempting click...", null, 'general');
      agentButton.click();
    } else {
      console.error("❌ Agent button not found!");
    }
  };
  
  // Auto-run quick debug when script loads
  setTimeout(() => {
    console.log("🔧 Auto-running quick debug...", null, 'general');
    if (typeof window.quickDebug === 'function') {
      window.quickDebug();
    }
  }, 1000);
  
  // ===== ADDITIONAL TESTING FUNCTIONS =====
  window.quickStatus = function() {
    console.log("=== QUICK STATUS ===", null, 'general');
    console.log("Current user:", window.currentUser?.email || 'Not logged in', 'general');
    console.log("Current page:", window.currentUrlData?.pageId || 'Unknown', 'general');
    console.log("Visibility data:", window.currentVisibilityData?.active?.length || 0, 'users', 'general');
    console.log("Supabase client:", !!window.supabase, 'general');
    console.log("Realtime client:", !!window.supabaseRealtimeClient, 'general');
  };
  
  window.testMessage = function() {
    console.log("=== TEST MESSAGE ===", null, 'general');
    const testMessage = `Test message ${Date.now()}`;
    if (typeof window.sendMessageViaSupabase === 'function') {
      window.sendMessageViaSupabase(testMessage);
      console.log("Test message sent:", testMessage, 'general');
    } else {
      console.log("sendMessageViaSupabase function not available", null, 'general');
    }
  };
  
  window.testAura = function() {
    console.log("=== TEST AURA ===", null, 'general');
    const testColor = '#ff0000';
    if (typeof window.setCustomAvatarColor === 'function') {
      window.setCustomAvatarColor(testColor);
      console.log("Test aura color set:", testColor, 'general');
    } else {
      console.log("setCustomAvatarColor function not available", null, 'general');
    }
  };