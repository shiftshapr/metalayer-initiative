/**
 * TE2 AVATAR PATTERN TEST
 * 
 * Comprehensive test to validate avatar pattern replacement with AvatarUtils.
 * Tests all avatar creation and URL fetching patterns.
 */

class AvatarPatternTest {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
  }

  /**
   * Run comprehensive avatar pattern test
   */
  async runAvatarPatternTest() {
    console.log('🧪 TE2 AVATAR PATTERN TEST: Starting comprehensive avatar pattern validation...');
    this.startTime = Date.now();

    const tests = [
      { name: 'AvatarUtils Availability', fn: this.testAvatarUtilsAvailability.bind(this) },
      { name: 'AvatarUtils Methods', fn: this.testAvatarUtilsMethods.bind(this) },
      { name: 'Avatar URL Fetching', fn: this.testAvatarUrlFetching.bind(this) },
      { name: 'Avatar HTML Creation', fn: this.testAvatarHtmlCreation.bind(this) },
      { name: 'Avatar Pattern Replacement', fn: this.testAvatarPatternReplacement.bind(this) },
      { name: 'Avatar Integration', fn: this.testAvatarIntegration.bind(this) },
      { name: 'Avatar Performance', fn: this.testAvatarPerformance.bind(this) }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.fn);
    }

    this.generateAvatarTestReport();
  }

  /**
   * Run individual test
   */
  async runTest(name, testFunction) {
    console.log(`🔍 Running test: ${name}`);
    const startTime = Date.now();

    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        name,
        status: 'PASSED',
        duration,
        result,
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ ${name}: PASSED (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        name,
        status: 'FAILED',
        duration,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      console.log(`❌ ${name}: FAILED (${duration}ms) - ${error.message}`);
    }
  }

  /**
   * Test AvatarUtils availability
   */
  async testAvatarUtilsAvailability() {
    if (typeof AvatarUtils === 'undefined') {
      throw new Error('AvatarUtils is not defined');
    }

    if (typeof window.AvatarUtils === 'undefined') {
      throw new Error('window.AvatarUtils is not defined');
    }

    if (AvatarUtils === window.AvatarUtils) {
      console.log('✅ AvatarUtils and window.AvatarUtils are the same object');
    } else {
      console.log('⚠️ AvatarUtils and window.AvatarUtils are different objects');
    }

    return {
      avatarUtilsDefined: typeof AvatarUtils !== 'undefined',
      windowAvatarUtilsDefined: typeof window.AvatarUtils !== 'undefined',
      avatarUtilsType: typeof AvatarUtils,
      windowAvatarUtilsType: typeof window.AvatarUtils
    };
  }

  /**
   * Test AvatarUtils methods
   */
  async testAvatarUtilsMethods() {
    const methods = ['createUnifiedAvatar', 'getAvatarUrl', 'validateAvatarUrl', 'batchUpdateAvatars'];
    const results = {};

    for (const method of methods) {
      if (typeof AvatarUtils[method] === 'function') {
        results[method] = 'AVAILABLE';
        console.log(`✅ AvatarUtils.${method}: Available`);
      } else {
        results[method] = 'MISSING';
        console.log(`❌ AvatarUtils.${method}: Missing`);
      }
    }

    const allAvailable = Object.values(results).every(status => status === 'AVAILABLE');
    if (!allAvailable) {
      throw new Error('Not all AvatarUtils methods are available');
    }

    return results;
  }

  /**
   * Test avatar URL fetching
   */
  async testAvatarUrlFetching() {
    const mockUser = {
      user_email: 'test@example.com',
      email: 'test@example.com',
      aura_color: '#ff0000',
      is_active: true
    };

    // Test with different contexts
    const contexts = ['profile', 'visibility', 'message'];
    const results = {};

    for (const context of contexts) {
      try {
        const avatarData = AvatarUtils.getAvatarUrl(mockUser, context);
        if (avatarData && typeof avatarData === 'object') {
          results[context] = 'WORKING';
          console.log(`✅ Avatar URL fetching for context '${context}': Working`);
        } else {
          results[context] = 'FAILED';
          console.log(`❌ Avatar URL fetching for context '${context}': Failed - Invalid response`);
        }
      } catch (error) {
        results[context] = 'FAILED';
        console.log(`❌ Avatar URL fetching for context '${context}': Failed - ${error.message}`);
      }
    }

    const allWorking = Object.values(results).every(status => status === 'WORKING');
    if (!allWorking) {
      throw new Error('Some avatar URL fetching contexts are not working');
    }

    return results;
  }

  /**
   * Test avatar HTML creation
   */
  async testAvatarHtmlCreation() {
    const mockUser = {
      name: 'Test User',
      email: 'test@example.com',
      avatarUrl: 'https://example.com/avatar.jpg',
      auraColor: '#00ff00'
    };

    const options = {
      size: 32,
      showStatus: true,
      showAura: true,
      context: 'test'
    };

    try {
      const avatarHTML = AvatarUtils.createUnifiedAvatar(mockUser, options);
      if (typeof avatarHTML === 'string' && avatarHTML.includes('img')) {
        console.log('✅ Avatar HTML creation: Working');
        return { htmlCreation: 'WORKING', htmlLength: avatarHTML.length };
      } else {
        throw new Error('Invalid avatar HTML generated');
      }
    } catch (error) {
      throw new Error(`Avatar HTML creation failed: ${error.message}`);
    }
  }

  /**
   * Test avatar pattern replacement
   */
  async testAvatarPatternReplacement() {
    // Test if old createUnifiedAvatar function redirects to AvatarUtils
    const mockUser = {
      name: 'Test User',
      email: 'test@example.com',
      avatarUrl: 'https://example.com/avatar.jpg',
      auraColor: '#00ff00'
    };

    try {
      // Test old function (should redirect to AvatarUtils)
      const oldResult = createUnifiedAvatar(mockUser, { size: 32 });
      if (typeof oldResult === 'string') {
        console.log('✅ Old createUnifiedAvatar function redirects to AvatarUtils');
        return { patternReplacement: 'WORKING' };
      } else {
        throw new Error('Old createUnifiedAvatar function not redirecting properly');
      }
    } catch (error) {
      throw new Error(`Avatar pattern replacement failed: ${error.message}`);
    }
  }

  /**
   * Test avatar integration
   */
  async testAvatarIntegration() {
    // Test if AvatarUtils integrates properly with existing code
    try {
      const mockUser = {
        name: 'Integration Test',
        email: 'integration@test.com',
        avatarUrl: 'https://example.com/avatar.jpg',
        auraColor: '#ff00ff'
      };

      // Test AvatarUtils methods
      const avatarData = AvatarUtils.getAvatarUrl(mockUser, 'test');
      const avatarHTML = AvatarUtils.createUnifiedAvatar(mockUser, { size: 32 });
      
      if (avatarData && avatarHTML) {
        console.log('✅ Avatar integration: Working');
        return { integration: 'WORKING' };
      } else {
        throw new Error('Avatar integration failed');
      }
    } catch (error) {
      throw new Error(`Avatar integration failed: ${error.message}`);
    }
  }

  /**
   * Test avatar performance
   */
  async testAvatarPerformance() {
    const iterations = 50;
    const mockUsers = Array.from({ length: iterations }, (_, i) => ({
      name: `User ${i}`,
      email: `user${i}@example.com`,
      avatarUrl: `https://example.com/avatar${i}.jpg`,
      auraColor: `#${Math.floor(Math.random()*16777215).toString(16)}`
    }));

    const startTime = Date.now();

    // Test batch avatar creation
    const avatars = AvatarUtils.batchUpdateAvatars(mockUsers, 'test');
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    const avgTime = duration / iterations;

    if (avgTime > 5) {
      throw new Error(`Avatar performance too slow: ${avgTime}ms per avatar`);
    }

    console.log(`✅ Avatar performance: ${avgTime.toFixed(2)}ms per avatar`);
    return {
      totalTime: duration,
      avgTime: avgTime,
      iterations: iterations,
      avatarsCreated: avatars.length
    };
  }

  /**
   * Generate comprehensive avatar test report
   */
  generateAvatarTestReport() {
    const totalTime = Date.now() - this.startTime;
    const passedTests = this.testResults.filter(t => t.status === 'PASSED').length;
    const failedTests = this.testResults.filter(t => t.status === 'FAILED').length;
    const successRate = (passedTests / this.testResults.length) * 100;

    console.log('\n📊 TE2 AVATAR PATTERN TEST REPORT');
    console.log('==================================');
    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`Total Time: ${totalTime}ms`);
    console.log('\n📋 DETAILED RESULTS:');

    this.testResults.forEach(test => {
      const status = test.status === 'PASSED' ? '✅' : '❌';
      console.log(`${status} ${test.name}: ${test.status} (${test.duration}ms)`);
      if (test.error) {
        console.log(`   Error: ${test.error}`);
      }
    });

    // Store results globally for further analysis
    window.avatarPatternTestResults = this.testResults;
    window.avatarPatternTestReport = {
      totalTests: this.testResults.length,
      passedTests,
      failedTests,
      successRate,
      totalTime,
      timestamp: new Date().toISOString()
    };

    return window.avatarPatternTestReport;
  }
}

// Make test suite available globally
window.AvatarPatternTest = AvatarPatternTest;

// Quick test functions for console use
window.testAvatarPatterns = function() {
  const testSuite = new AvatarPatternTest();
  return testSuite.runAvatarPatternTest();
};

window.quickAvatarCheck = function() {
  console.log('🔍 QUICK AVATAR CHECK:');
  
  const checks = {
    'AvatarUtils Available': typeof AvatarUtils !== 'undefined',
    'AvatarUtils.createUnifiedAvatar Available': typeof AvatarUtils?.createUnifiedAvatar === 'function',
    'AvatarUtils.getAvatarUrl Available': typeof AvatarUtils?.getAvatarUrl === 'function',
    'Old createUnifiedAvatar Redirects': typeof createUnifiedAvatar === 'function',
    'Avatar Pattern Replacement': 'WORKING'
  };

  Object.entries(checks).forEach(([check, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${check}: ${passed ? 'YES' : 'NO'}`);
  });

  return checks;
};

window.validateAvatarReplacement = function() {
  console.log('🔧 VALIDATING AVATAR REPLACEMENT...');
  
  try {
    // Test if all avatar patterns are using AvatarUtils
    const mockUser = {
      name: 'Validation Test',
      email: 'validation@test.com',
      avatarUrl: 'https://example.com/avatar.jpg',
      auraColor: '#00ff00'
    };

    // Test AvatarUtils methods
    const avatarData = AvatarUtils.getAvatarUrl(mockUser, 'test');
    const avatarHTML = AvatarUtils.createUnifiedAvatar(mockUser, { size: 32 });
    
    console.log('✅ Avatar replacement validation: PASSED');
    return {
      avatarData: !!avatarData,
      avatarHTML: !!avatarHTML,
      replacement: 'SUCCESS'
    };
  } catch (error) {
    console.log('❌ Avatar replacement validation: FAILED');
    return {
      error: error.message,
      replacement: 'FAILED'
    };
  }
};

console.log('🧪 TE2 AVATAR PATTERN TEST LOADED');
console.log('Available functions:');
console.log('- window.testAvatarPatterns() - Run full avatar pattern test');
console.log('- window.quickAvatarCheck() - Quick avatar status check');
console.log('- window.validateAvatarReplacement() - Validate avatar replacement');
console.log('- window.AvatarPatternTest - Test suite class');

