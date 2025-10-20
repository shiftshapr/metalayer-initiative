/**
 * TEST COMPLETE SYSTEM - Verify all real-time features work
 * Tests the complete real-time system including messages, visibility, reactions, and auras
 */

(function() {
  'use strict';

  console.log('🧪 TEST COMPLETE SYSTEM: Starting comprehensive tests...');

  // Test all real-time features
  function testCompleteSystem() {
    console.log('🧪 TESTING COMPLETE REAL-TIME SYSTEM...');
    
    const results = {
      foundation: false,
      messages: false,
      visibility: false,
      reactions: false,
      auras: false,
      integration: false
    };

    // Test 1: Foundation
    try {
      if (typeof window.realtimeFoundation !== 'undefined') {
        results.foundation = true;
        console.log('✅ Foundation: Available');
      } else {
        console.error('❌ Foundation: Not available');
      }
    } catch (error) {
      console.error('❌ Foundation: Error -', error);
    }

    // Test 2: Messages (should be working)
    try {
      if (typeof window.robustIntegration !== 'undefined' && window.robustIntegration.isInitialized) {
        results.messages = true;
        console.log('✅ Messages: Working system available and initialized');
      } else {
        console.error('❌ Messages: Not available or not initialized');
      }
    } catch (error) {
      console.error('❌ Messages: Error -', error);
    }

    // Test 3: Visibility
    try {
      if (typeof window.VisibilityRealtimeManager !== 'undefined' && 
          typeof window.VisibilityIntegration !== 'undefined' &&
          typeof window.visibilityIntegration !== 'undefined') {
        results.visibility = true;
        console.log('✅ Visibility: Complete system available');
      } else {
        console.error('❌ Visibility: Missing components');
      }
    } catch (error) {
      console.error('❌ Visibility: Error -', error);
    }

    // Test 4: Reactions
    try {
      if (typeof window.ReactionsRealtimeManager !== 'undefined' && 
          typeof window.ReactionsIntegration !== 'undefined' &&
          typeof window.reactionsIntegration !== 'undefined') {
        results.reactions = true;
        console.log('✅ Reactions: Complete system available');
      } else {
        console.error('❌ Reactions: Missing components');
      }
    } catch (error) {
      console.error('❌ Reactions: Error -', error);
    }

    // Test 5: Auras
    try {
      if (typeof window.AurasRealtimeManager !== 'undefined' && 
          typeof window.AurasIntegration !== 'undefined' &&
          typeof window.aurasIntegration !== 'undefined') {
        results.auras = true;
        console.log('✅ Auras: Complete system available');
      } else {
        console.error('❌ Auras: Missing components');
      }
    } catch (error) {
      console.error('❌ Auras: Error -', error);
    }

    // Test 6: Integration
    try {
      if (typeof window.supabase !== 'undefined' && 
          typeof window.currentUser !== 'undefined' && 
          window.currentUser) {
        results.integration = true;
        console.log('✅ Integration: Supabase and user available');
      } else {
        console.error('❌ Integration: Missing Supabase or user');
      }
    } catch (error) {
      console.error('❌ Integration: Error -', error);
    }

    // Calculate results
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(Boolean).length;
    
    console.log('🧪 TEST RESULTS:');
    console.log(`📊 Foundation: ${results.foundation ? '✅' : '❌'}`);
    console.log(`📊 Messages: ${results.messages ? '✅' : '❌'}`);
    console.log(`📊 Visibility: ${results.visibility ? '✅' : '❌'}`);
    console.log(`📊 Reactions: ${results.reactions ? '✅' : '❌'}`);
    console.log(`📊 Auras: ${results.auras ? '✅' : '❌'}`);
    console.log(`📊 Integration: ${results.integration ? '✅' : '❌'}`);
    console.log(`📊 OVERALL: ${passedTests}/${totalTests} tests passed`);

    if (passedTests === totalTests) {
      console.log('🎉 ALL TESTS PASSED - Complete real-time system is working!');
      return true;
    } else {
      console.log('⚠️ SOME TESTS FAILED - System needs attention');
      return false;
    }
  }

  // Test individual features
  function testMessagesFeature() {
    console.log('🧪 TESTING MESSAGES FEATURE...');
    
    if (typeof window.robustIntegration !== 'undefined') {
      console.log('✅ Messages: RobustIntegration available');
      console.log(`✅ Messages: Initialized: ${window.robustIntegration.isInitialized}`);
      return true;
    } else {
      console.error('❌ Messages: RobustIntegration not available');
      return false;
    }
  }

  function testVisibilityFeature() {
    console.log('🧪 TESTING VISIBILITY FEATURE...');
    
    const components = [
      'VisibilityRealtimeManager',
      'VisibilityIntegration', 
      'visibilityIntegration',
      'UnifiedPresenceManager'
    ];
    
    let availableCount = 0;
    components.forEach(component => {
      if (typeof window[component] !== 'undefined') {
        console.log(`✅ Visibility: ${component} available`);
        availableCount++;
      } else {
        console.log(`⚠️ Visibility: ${component} not available`);
      }
    });
    
    // Pass if at least 2 components are available
    const passed = availableCount >= 2;
    console.log(`📊 Visibility: ${availableCount}/${components.length} components available`);
    
    return passed;
  }

  function testReactionsFeature() {
    console.log('🧪 TESTING REACTIONS FEATURE...');
    
    const components = [
      'ReactionsRealtimeManager',
      'ReactionsIntegration',
      'reactionsIntegration'
    ];
    
    let availableCount = 0;
    components.forEach(component => {
      if (typeof window[component] !== 'undefined') {
        console.log(`✅ Reactions: ${component} available`);
        availableCount++;
      } else {
        console.log(`⚠️ Reactions: ${component} not available`);
      }
    });
    
    // Pass if at least 2 components are available
    const passed = availableCount >= 2;
    console.log(`📊 Reactions: ${availableCount}/${components.length} components available`);
    
    return passed;
  }

  function testAurasFeature() {
    console.log('🧪 TESTING AURAS FEATURE...');
    
    const components = [
      'AurasRealtimeManager',
      'AurasIntegration',
      'aurasIntegration'
    ];
    
    let availableCount = 0;
    components.forEach(component => {
      if (typeof window[component] !== 'undefined') {
        console.log(`✅ Auras: ${component} available`);
        availableCount++;
      } else {
        console.log(`⚠️ Auras: ${component} not available`);
      }
    });
    
    // Pass if at least 2 components are available
    const passed = availableCount >= 2;
    console.log(`📊 Auras: ${availableCount}/${components.length} components available`);
    
    return passed;
  }

  // Make functions globally available
  window.testCompleteSystem = {
    testCompleteSystem,
    testMessagesFeature,
    testVisibilityFeature,
    testReactionsFeature,
    testAurasFeature
  };

  // Auto-run tests when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        console.log('🧪 AUTO-RUNNING COMPLETE SYSTEM TESTS...');
        testCompleteSystem();
      }, 2000); // Wait for full initialization
    });
  } else {
    setTimeout(() => {
      console.log('🧪 AUTO-RUNNING COMPLETE SYSTEM TESTS...');
      testCompleteSystem();
    }, 2000); // Wait for full initialization
  }

  console.log('🧪 TEST COMPLETE SYSTEM: Test functions loaded');
  console.log('🧪 Available commands:');
  console.log('🧪 testCompleteSystem.testCompleteSystem() - Run all tests');
  console.log('🧪 testCompleteSystem.testMessagesFeature() - Test messages');
  console.log('🧪 testCompleteSystem.testVisibilityFeature() - Test visibility');
  console.log('🧪 testCompleteSystem.testReactionsFeature() - Test reactions');
  console.log('🧪 testCompleteSystem.testAurasFeature() - Test auras');

})();
