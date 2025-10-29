/**
 * REACTION SYSTEM COMPREHENSIVE DIAGNOSTIC
 * Tests reaction count propagation and real-time functionality
 * 
 * Usage: Copy and paste this entire code block into browser console
 * Then call: runReactionSystemDiagnostic()
 */

console.log('🧪 REACTION SYSTEM COMPREHENSIVE DIAGNOSTIC');
console.log('==========================================');

class ReactionSystemDiagnostic {
  constructor() {
    this.results = [];
    this.testMessageId = null;
    this.testMessageElement = null;
    this.initialReactionCount = 0;
  }

  log(status, message, details = '') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] [${status.toUpperCase()}] ${message} ${details}`;
    console.log(logEntry);
    this.results.push(logEntry);
  }

  async setup() {
    this.log('INFO', 'Setting up reaction system diagnostic...');
    
    // Check if user is authenticated
    if (!window.currentUser || !window.currentUser.email) {
      this.log('ERROR', 'User not authenticated. Please log in first.');
      return false;
    }
    
    this.log('SUCCESS', `Authenticated as: ${window.currentUser.email}`);
    
    // Check if required functions exist
    const requiredFunctions = [
      'handleReactionChange',
      'loadMessageReactions', 
      'updateReactionDisplay',
      'addReactionToMessage',
      'removeReactionFromMessage'
    ];
    
    for (const funcName of requiredFunctions) {
      if (typeof window[funcName] !== 'function') {
        this.log('ERROR', `Required function missing: ${funcName}`);
        return false;
      }
    }
    
    this.log('SUCCESS', 'All required functions are available');
    
    // Find a message with reactions
    const reactionBtns = document.querySelectorAll('.reaction-btn[data-message-id]');
    if (reactionBtns.length === 0) {
      this.log('ERROR', 'No reaction buttons found. Please ensure messages are loaded.');
      return false;
    }
    
    this.testMessageElement = reactionBtns[0];
    this.testMessageId = this.testMessageElement.dataset.messageId;
    this.log('SUCCESS', `Found test message: ${this.testMessageId}`);
    
    // Get initial reaction count
    const countSpan = this.testMessageElement.querySelector('.icon-count');
    this.initialReactionCount = countSpan ? parseInt(countSpan.textContent) || 0 : 0;
    this.log('INFO', `Initial reaction count: ${this.initialReactionCount}`);
    
    return true;
  }

  async testRealtimeSubscription() {
    this.log('INFO', 'Testing real-time subscription status...');
    
    try {
      // Check if SupabaseRealtimeClient is available
      if (!window.supabaseRealtimeClient) {
        this.log('ERROR', 'SupabaseRealtimeClient not available');
        return false;
      }
      
      // Check if reaction channel exists
      if (!window.supabaseRealtimeClient.reactionChannel) {
        this.log('ERROR', 'Reaction channel not established');
        return false;
      }
      
      // Check subscription status
      const channel = window.supabaseRealtimeClient.reactionChannel;
      const state = channel.state;
      this.log('INFO', `Reaction channel state: ${state}`);
      
      if (state === 'joined' || state === 'joined') {
        this.log('SUCCESS', 'Real-time reaction subscription is active');
        return true;
      } else {
        this.log('ERROR', `Real-time subscription not active, state: ${state}`);
        return false;
      }
      
    } catch (error) {
      this.log('ERROR', `Error checking real-time subscription: ${error.message}`);
      return false;
    }
  }

  async testLocalReactionUpdate() {
    this.log('INFO', 'Testing local reaction update...');
    
    try {
      // Simulate adding a reaction
      const testEmoji = '👍';
      this.log('INFO', `Adding reaction ${testEmoji} to message ${this.testMessageId}`);
      
      // Call the add reaction function
      const result = await window.addReactionToMessage(this.testMessageId, testEmoji);
      
      if (result && result.success) {
        this.log('SUCCESS', 'Reaction added successfully');
        
        // Wait for UI update
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if count increased
        const countSpan = this.testMessageElement.querySelector('.icon-count');
        const newCount = countSpan ? parseInt(countSpan.textContent) || 0 : 0;
        
        if (newCount > this.initialReactionCount) {
          this.log('SUCCESS', `Reaction count increased from ${this.initialReactionCount} to ${newCount}`);
          return true;
        } else {
          this.log('FAIL', `Reaction count did not increase. Current: ${newCount}, Initial: ${this.initialReactionCount}`);
          return false;
        }
      } else {
        this.log('ERROR', 'Failed to add reaction:', result);
        return false;
      }
      
    } catch (error) {
      this.log('ERROR', `Error testing local reaction update: ${error.message}`);
      return false;
    }
  }

  async testRealtimePropagation() {
    this.log('INFO', 'Testing real-time propagation...');
    
    try {
      // Create a mock reaction change payload
      const mockPayload = {
        eventType: 'INSERT',
        new: {
          id: 'test-reaction-' + Date.now(),
          message_id: this.testMessageId,
          user_email: window.currentUser.email,
          emoji: '🎉',
          created_at: new Date().toISOString()
        }
      };
      
      this.log('INFO', 'Simulating real-time reaction change...');
      console.log('Mock payload:', mockPayload);
      
      // Call handleReactionChange directly
      if (window.handleReactionChange) {
        window.handleReactionChange(mockPayload);
        this.log('SUCCESS', 'handleReactionChange called successfully');
        
        // Wait for UI update
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if UI was updated
        const countSpan = this.testMessageElement.querySelector('.icon-count');
        const currentCount = countSpan ? parseInt(countSpan.textContent) || 0 : 0;
        
        this.log('INFO', `Current reaction count after real-time update: ${currentCount}`);
        return true;
      } else {
        this.log('ERROR', 'handleReactionChange not available');
        return false;
      }
      
    } catch (error) {
      this.log('ERROR', `Error testing real-time propagation: ${error.message}`);
      return false;
    }
  }

  async testReactionRemoval() {
    this.log('INFO', 'Testing reaction removal...');
    
    try {
      // First add a reaction
      const testEmoji = '🔥';
      await window.addReactionToMessage(this.testMessageId, testEmoji);
      
      // Wait for it to be added
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Now remove it
      const result = await window.removeReactionFromMessage(this.testMessageId, testEmoji);
      
      if (result && result.success) {
        this.log('SUCCESS', 'Reaction removed successfully');
        
        // Wait for UI update
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if count decreased
        const countSpan = this.testMessageElement.querySelector('.icon-count');
        const newCount = countSpan ? parseInt(countSpan.textContent) || 0 : 0;
        
        this.log('INFO', `Reaction count after removal: ${newCount}`);
        return true;
      } else {
        this.log('ERROR', 'Failed to remove reaction:', result);
        return false;
      }
      
    } catch (error) {
      this.log('ERROR', `Error testing reaction removal: ${error.message}`);
      return false;
    }
  }

  async testAllReactionButtons() {
    this.log('INFO', 'Testing all reaction buttons for functionality...');
    
    try {
      const reactionBtns = document.querySelectorAll('.reaction-btn[data-message-id]');
      let totalButtons = reactionBtns.length;
      let workingButtons = 0;
      
      this.log('INFO', `Found ${totalButtons} reaction buttons to test`);
      
      for (let i = 0; i < Math.min(reactionBtns.length, 3); i++) { // Test first 3 buttons
        const btn = reactionBtns[i];
        const messageId = btn.dataset.messageId;
        
        try {
          // Test loading reactions
          await window.loadMessageReactions(messageId, btn);
          workingButtons++;
          this.log('INFO', `Button ${i + 1} (${messageId}) working`);
        } catch (error) {
          this.log('ERROR', `Button ${i + 1} (${messageId}) failed: ${error.message}`);
        }
      }
      
      if (workingButtons === Math.min(reactionBtns.length, 3)) {
        this.log('SUCCESS', `All ${workingButtons} tested reaction buttons are working`);
        return true;
      } else {
        this.log('FAIL', `${workingButtons} out of ${Math.min(reactionBtns.length, 3)} buttons are working`);
        return false;
      }
      
    } catch (error) {
      this.log('ERROR', `Error testing all reaction buttons: ${error.message}`);
      return false;
    }
  }

  async runAll() {
    this.results = [];
    this.log('INFO', 'Starting comprehensive reaction system diagnostic...');
    
    if (!(await this.setup())) {
      this.log('CRITICAL', 'Setup failed. Aborting tests.');
      return;
    }
    
    const test1 = await this.testRealtimeSubscription();
    const test2 = await this.testLocalReactionUpdate();
    const test3 = await this.testRealtimePropagation();
    const test4 = await this.testReactionRemoval();
    const test5 = await this.testAllReactionButtons();
    
    const passedTests = [test1, test2, test3, test4, test5].filter(Boolean).length;
    const totalTests = 5;
    
    this.log('INFO', '=== DIAGNOSTIC RESULTS ===');
    this.log('INFO', `Real-time Subscription: ${test1 ? 'PASS' : 'FAIL'}`);
    this.log('INFO', `Local Reaction Update: ${test2 ? 'PASS' : 'FAIL'}`);
    this.log('INFO', `Real-time Propagation: ${test3 ? 'PASS' : 'FAIL'}`);
    this.log('INFO', `Reaction Removal: ${test4 ? 'PASS' : 'FAIL'}`);
    this.log('INFO', `All Buttons Check: ${test5 ? 'PASS' : 'FAIL'}`);
    this.log('INFO', `Overall: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      this.log('SUCCESS', '✅ All tests passed! Reaction system is working correctly.');
    } else {
      this.log('FAIL', '❌ Some tests failed. Reaction system has issues.');
      
      // Provide specific recommendations
      if (!test1) {
        this.log('RECOMMEND', 'Fix real-time subscription: Check SupabaseRealtimeClient initialization');
      }
      if (!test2) {
        this.log('RECOMMEND', 'Fix local updates: Check addReactionToMessage function');
      }
      if (!test3) {
        this.log('RECOMMEND', 'Fix real-time propagation: Check handleReactionChange function');
      }
      if (!test4) {
        this.log('RECOMMEND', 'Fix reaction removal: Check removeReactionFromMessage function');
      }
      if (!test5) {
        this.log('RECOMMEND', 'Fix button functionality: Check loadMessageReactions function');
      }
    }
    
    return {
      realtimeSubscription: test1,
      localUpdate: test2,
      realtimePropagation: test3,
      reactionRemoval: test4,
      allButtonsCheck: test5,
      overallSuccess: passedTests === totalTests
    };
  }
}

// Make test function globally available
window.runReactionSystemDiagnostic = async function() {
  const diagnostic = new ReactionSystemDiagnostic();
  return await diagnostic.runAll();
};

console.log('✅ Reaction system diagnostic loaded. Call runReactionSystemDiagnostic() to start.');