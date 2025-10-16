/**
 * TE2 COMPREHENSIVE TEST INFRASTRUCTURE
 * 
 * Advanced testing system for refactoring validation.
 * Provides comprehensive test functions that can be run in the console.
 */

class RefactoringTestSuite {
  constructor() {
    this.testResults = [];
    this.testStartTime = null;
    this.currentTest = null;
  }

  /**
   * Run comprehensive test suite for refactoring validation
   */
  async runComprehensiveTests() {
    console.log('🧪 TE2 COMPREHENSIVE TEST SUITE: Starting refactoring validation...');
    this.testStartTime = Date.now();
    this.testResults = [];

    const tests = [
      { name: 'Utility Loading', fn: this.testUtilityLoading.bind(this) },
      { name: 'Logging System', fn: this.testLoggingSystem.bind(this) },
      { name: 'Avatar System', fn: this.testAvatarSystem.bind(this) },
      { name: 'Error Handling', fn: this.testErrorHandling.bind(this) },
      { name: 'Core Functionality', fn: this.testCoreFunctionality.bind(this) },
      { name: 'Performance', fn: this.testPerformance.bind(this) },
      { name: 'Integration', fn: this.testIntegration.bind(this) }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.fn);
    }

    this.generateTestReport();
  }

  /**
   * Run individual test
   */
  async runTest(name, testFunction) {
    console.log(`🔍 Running test: ${name}`);
    this.currentTest = name;
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
   * Test utility loading
   */
  async testUtilityLoading() {
    const utilities = ['Logger', 'AvatarUtils', 'ErrorHandler'];
    const results = {};

    for (const util of utilities) {
      if (window[util]) {
        results[util] = 'LOADED';
        console.log(`✅ ${util}: Available`);
      } else {
        results[util] = 'MISSING';
        console.log(`❌ ${util}: Not available`);
      }
    }

    const allLoaded = Object.values(results).every(status => status === 'LOADED');
    if (!allLoaded) {
      throw new Error('Not all utilities loaded');
    }

    return results;
  }

  /**
   * Test logging system
   */
  async testLoggingSystem() {
    if (!window.Logger) {
      throw new Error('Logger not available');
    }

    // Test different log levels
    Logger.debug('Test debug message', { test: true });
    Logger.info('Test info message', { test: true });
    Logger.warn('Test warn message', { test: true });
    Logger.error('Test error message', { test: true });
    Logger.success('Test success message', { test: true });

    // Test context-specific logging
    Logger.avatar('Test avatar message', { test: true });
    Logger.presence('Test presence message', { test: true });
    Logger.auth('Test auth message', { test: true });

    // Test log history
    const history = Logger.getHistory();
    if (history.length === 0) {
      throw new Error('Log history not working');
    }

    return {
      logLevels: ['debug', 'info', 'warn', 'error', 'success'],
      contexts: ['avatar', 'presence', 'auth'],
      historyLength: history.length
    };
  }

  /**
   * Test avatar system
   */
  async testAvatarSystem() {
    if (!window.AvatarUtils) {
      throw new Error('AvatarUtils not available');
    }

    // Test with mock user data
    const mockUser = {
      user_email: 'test@example.com',
      email: 'test@example.com',
      aura_color: '#ff0000',
      is_active: true
    };

    // Test avatar URL fetching
    const avatarData = AvatarUtils.getAvatarUrl(mockUser, 'test');
    if (!avatarData.avatarUrl) {
      throw new Error('Avatar URL not generated');
    }

    // Test avatar HTML creation
    const avatarHTML = AvatarUtils.createUnifiedAvatar(mockUser, 'test');
    if (!avatarHTML.includes('img')) {
      throw new Error('Avatar HTML not generated');
    }

    // Test avatar validation
    const validation = AvatarUtils.validateAvatarUrl(avatarData.avatarUrl);
    if (!validation.valid) {
      throw new Error('Avatar URL validation failed');
    }

    return {
      avatarUrl: avatarData.avatarUrl,
      source: avatarData.source,
      htmlGenerated: true,
      validation: validation
    };
  }

  /**
   * Test error handling
   */
  async testErrorHandling() {
    if (!window.ErrorHandler) {
      throw new Error('ErrorHandler not available');
    }

    // Test error handling
    const result = ErrorHandler.handle(new Error('Test error'), 'test', 'fallback');
    if (result !== 'fallback') {
      throw new Error('Error handling not working');
    }

    // Test async error handling
    const asyncResult = await ErrorHandler.handleAsync(
      async () => { throw new Error('Async test error'); },
      'test',
      'async-fallback'
    );
    if (asyncResult !== 'async-fallback') {
      throw new Error('Async error handling not working');
    }

    // Test error history
    const errorHistory = ErrorHandler.getErrorHistory();
    if (errorHistory.length === 0) {
      throw new Error('Error history not working');
    }

    return {
      syncErrorHandling: true,
      asyncErrorHandling: true,
      errorHistory: errorHistory.length
    };
  }

  /**
   * Test core functionality
   */
  async testCoreFunctionality() {
    // Test if main functions still work
    const functions = [
      'refreshVisibilityAvatars',
      'updateVisibleTab',
      'loadCombinedAvatars',
      'normalizeUrl'
    ];

    const results = {};
    for (const funcName of functions) {
      if (typeof window[funcName] === 'function') {
        results[funcName] = 'AVAILABLE';
      } else {
        results[funcName] = 'MISSING';
      }
    }

    const allAvailable = Object.values(results).every(status => status === 'AVAILABLE');
    if (!allAvailable) {
      throw new Error('Some core functions missing');
    }

    return results;
  }

  /**
   * Test performance
   */
  async testPerformance() {
    const startTime = Date.now();
    
    // Test avatar creation performance
    const mockUsers = Array.from({ length: 10 }, (_, i) => ({
      user_email: `test${i}@example.com`,
      email: `test${i}@example.com`,
      aura_color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      is_active: Math.random() > 0.5
    }));

    const avatarStart = Date.now();
    const avatars = AvatarUtils.batchUpdateAvatars(mockUsers, 'test');
    const avatarTime = Date.now() - avatarStart;

    if (avatarTime > 1000) {
      throw new Error(`Avatar creation too slow: ${avatarTime}ms`);
    }

    const totalTime = Date.now() - startTime;
    
    return {
      avatarCreationTime: avatarTime,
      totalTestTime: totalTime,
      avatarsCreated: avatars.length
    };
  }

  /**
   * Test integration
   */
  async testIntegration() {
    // Test if utilities work together
    try {
      // Test logging in avatar creation
      const mockUser = {
        user_email: 'integration@test.com',
        email: 'integration@test.com',
        aura_color: '#00ff00'
      };

      const avatarData = AvatarUtils.getAvatarUrl(mockUser, 'integration');
      Logger.avatar('Integration test avatar created', avatarData);

      // Test error handling in avatar creation
      const errorResult = ErrorHandler.handle(
        new Error('Integration test error'),
        'avatar',
        'fallback-avatar'
      );

      return {
        avatarLogging: true,
        errorHandling: true,
        integration: 'WORKING'
      };
    } catch (error) {
      throw new Error(`Integration test failed: ${error.message}`);
    }
  }

  /**
   * Generate comprehensive test report
   */
  generateTestReport() {
    const totalTime = Date.now() - this.testStartTime;
    const passedTests = this.testResults.filter(t => t.status === 'PASSED').length;
    const failedTests = this.testResults.filter(t => t.status === 'FAILED').length;
    const successRate = (passedTests / this.testResults.length) * 100;

    console.log('\n📊 TE2 COMPREHENSIVE TEST REPORT');
    console.log('================================');
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
    window.testResults = this.testResults;
    window.testReport = {
      totalTests: this.testResults.length,
      passedTests,
      failedTests,
      successRate,
      totalTime,
      timestamp: new Date().toISOString()
    };

    return window.testReport;
  }
}

// Make test suite available globally
window.RefactoringTestSuite = RefactoringTestSuite;

// Quick test functions for console use
window.runRefactoringTests = function() {
  const testSuite = new RefactoringTestSuite();
  return testSuite.runComprehensiveTests();
};

window.quickRefactoringCheck = function() {
  console.log('🔍 QUICK REFACTORING CHECK:');
  
  const checks = {
    'Logger Available': !!window.Logger,
    'AvatarUtils Available': !!window.AvatarUtils,
    'ErrorHandler Available': !!window.ErrorHandler,
    'Core Functions Available': typeof window.refreshVisibilityAvatars === 'function',
    'Test Suite Available': !!window.RefactoringTestSuite
  };

  Object.entries(checks).forEach(([check, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${check}: ${passed ? 'YES' : 'NO'}`);
  });

  return checks;
};

console.log('🧪 TE2 COMPREHENSIVE TEST INFRASTRUCTURE LOADED');
console.log('Available functions:');
console.log('- window.runRefactoringTests() - Run full test suite');
console.log('- window.quickRefactoringCheck() - Quick status check');
console.log('- window.RefactoringTestSuite - Test suite class');
