// DIAGNOSTIC FUNCTIONS - Run in browser console for debugging
window.debugAvatar = function() {
    Logger.info("=== AVATAR DIAGNOSTIC ===", null, 'general');
    Logger.info("Current user:", window.currentUser, 'general');
    Logger.info("User avatar_url:", window.currentUser?.user_metadata?.avatar_url, 'general');
    Logger.info("Profile avatar container:", document.getElementById("user-avatar-container"), 'general');
    Logger.info("Profile avatar HTML:", document.getElementById("user-avatar-container")?.innerHTML, 'general');
    Logger.info("AuthManager user:", authManager.getCurrentUser(), 'general');
  };
  
  window.debugVisibility = function() {
    Logger.info("=== VISIBILITY DIAGNOSTIC ===", null, 'general');
    Logger.info("Current visibility data:", window.currentVisibilityData, 'general');
    Logger.info("Visibility timer:", window.visibilityUpdateTimer, 'general');
    Logger.info("User elements:", document.querySelectorAll(".user-item"), 'general');
    Logger.info("Status elements:", document.querySelectorAll(".user-status"), 'general');
    Logger.info("Status texts:", Array.from(document.querySelectorAll(".user-status")).map(el => el.textContent), 'general');
  };
  
  window.testTimeUpdate = function() {
    Logger.info("=== MANUAL TIME UPDATE TEST ===", null, 'general');
    updateVisibilityTimes();
    Logger.info("Time update triggered manually", null, 'general');
  };
  
  window.forceAvatarRefresh = function() {
    Logger.info("=== FORCE AVATAR REFRESH ===", null, 'general');
    const user = window.currentUser;
    if (user) {
      updateUI(user);
      Logger.info("Avatar refresh triggered", null, 'general');
    } else {
      Logger.info("No current user found", null, 'general');
    }
  };
  
  window.restartVisibilityTimer = function() {
    Logger.info("=== RESTART VISIBILITY TIMER ===", null, 'general');
    if (window.visibilityUpdateTimer) {
      clearInterval(window.visibilityUpdateTimer);
    }
    // NO POLLING - Use Supabase real-time instead
    Logger.info("Timer restarted", null, 'general');
  };
  
  
  
  Logger.info("🔧 Debug functions loaded: debugAgentTab(), debugAgent()", null, 'general');
  
  // Immediate debug function that works even if script isn't fully loaded
  window.quickDebug = function() {
    Logger.info("Quick Debug - Agent Tab Status:", null, 'general');
    Logger.info("Document ready:", document.readyState, 'general');
    Logger.info("Agent tab button:", document.querySelector('[data-tab="agent-tab"]'), 'general');
    Logger.info("Agent tab content:", document.getElementById('agent-tab'), 'general');
    Logger.info("Active tab:", document.querySelector('.main-nav-tab.active')?.textContent, 'general');
    
    // Check if we can find the agent tab button and click it
    const agentButton = document.querySelector('[data-tab="agent-tab"]');
    if (agentButton) {
      Logger.success("Agent button found, attempting click...", null, 'general');
      agentButton.click();
    } else {
      console.error("❌ Agent button not found!");
    }
  };
  
  // Auto-run quick debug when script loads
  setTimeout(() => {
    Logger.info("🔧 Auto-running quick debug...", null, 'general');
    if (typeof window.quickDebug === 'function') {
      window.quickDebug();
    }
  }, 1000);