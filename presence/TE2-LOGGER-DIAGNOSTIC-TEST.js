/**
 * TE2 LOGGER DIAGNOSTIC TEST
 * 
 * Comprehensive test to diagnose and fix Logger loading issues.
 * Run this in the console to test Logger functionality.
 */

class LoggerDiagnosticTest {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
  }

  /**
   * Run comprehensive Logger diagnostic test
   */
  async runDiagnosticTest() {
    console.log('🔧 TE2 LOGGER DIAGNOSTIC: Starting comprehensive Logger test...');
    this.startTime = Date.now();

    const tests = [
      { name: 'Logger Availability', fn: this.testLoggerAvailability.bind(this) },
      { name: 'Logger Methods', fn: this.testLoggerMethods.bind(this) },
      { name: 'Logger Context', fn: this.testLoggerContext.bind(this) },
      { name: 'Logger History', fn: this.testLoggerHistory.bind(this) },
      { name: 'Logger Performance', fn: this.testLoggerPerformance.bind(this) },
      { name: 'Logger Integration', fn: this.testLoggerIntegration.bind(this) }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.fn);
    }

    this.generateDiagnosticReport();
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
   * Test Logger availability
   */
  async testLoggerAvailability() {
    if (typeof Logger === 'undefined') {
      throw new Error('Logger is not defined');
    }

    if (typeof window.Logger === 'undefined') {
      throw new Error('window.Logger is not defined');
    }

    if (Logger === window.Logger) {
      console.log('✅ Logger and window.Logger are the same object');
    } else {
      console.log('⚠️ Logger and window.Logger are different objects');
    }

    return {
      loggerDefined: typeof Logger !== 'undefined',
      windowLoggerDefined: typeof window.Logger !== 'undefined',
      loggerType: typeof Logger,
      windowLoggerType: typeof window.Logger
    };
  }

  /**
   * Test Logger methods
   */
  async testLoggerMethods() {
    const methods = ['debug', 'info', 'warn', 'error', 'success'];
    const results = {};

    for (const method of methods) {
      if (typeof Logger[method] === 'function') {
        results[method] = 'AVAILABLE';
        console.log(`✅ Logger.${method}: Available`);
      } else {
        results[method] = 'MISSING';
        console.log(`❌ Logger.${method}: Missing`);
      }
    }

    const allAvailable = Object.values(results).every(status => status === 'AVAILABLE');
    if (!allAvailable) {
      throw new Error('Not all Logger methods are available');
    }

    return results;
  }

  /**
   * Test Logger context functionality
   */
  async testLoggerContext() {
    // Test different contexts
    const contexts = ['general', 'avatar', 'presence', 'auth', 'visibility', 'realtime'];
    const results = {};

    for (const context of contexts) {
      try {
        Logger.debug(`Test message for context: ${context}`, null, context);
        results[context] = 'WORKING';
        console.log(`✅ Context '${context}': Working`);
      } catch (error) {
        results[context] = 'FAILED';
        console.log(`❌ Context '${context}': Failed - ${error.message}`);
      }
    }

    const allWorking = Object.values(results).every(status => status === 'WORKING');
    if (!allWorking) {
      throw new Error('Some Logger contexts are not working');
    }

    return results;
  }

  /**
   * Test Logger history functionality
   */
  async testLoggerHistory() {
    if (typeof Logger.getHistory !== 'function') {
      throw new Error('Logger.getHistory is not a function');
    }

    const history = Logger.getHistory();
    if (!Array.isArray(history)) {
      throw new Error('Logger history is not an array');
    }

    console.log(`✅ Logger history contains ${history.length} entries`);
    return {
      historyLength: history.length,
      historyType: typeof history,
      isArray: Array.isArray(history)
    };
  }

  /**
   * Test Logger performance
   */
  async testLoggerPerformance() {
    const iterations = 100;
    const startTime = Date.now();

    for (let i = 0; i < iterations; i++) {
      Logger.debug(`Performance test message ${i}`, { iteration: i }, 'general');
    }

    const endTime = Date.now();
    const duration = endTime - startTime;
    const avgTime = duration / iterations;

    if (avgTime > 1) {
      throw new Error(`Logger performance too slow: ${avgTime}ms per call`);
    }

    console.log(`✅ Logger performance: ${avgTime.toFixed(2)}ms per call`);
    return {
      totalTime: duration,
      avgTime: avgTime,
      iterations: iterations
    };
  }

  /**
   * Test Logger integration with existing code
   */
  async testLoggerIntegration() {
    // Test if Logger can be used in the same way as the replaced console.log statements
    try {
      Logger.success('Integration test message', { test: true }, 'general');
      Logger.debug('Integration test debug', { test: true }, 'avatar');
      Logger.info('Integration test info', { test: true }, 'presence');
      Logger.warn('Integration test warning', { test: true }, 'auth');
      Logger.error('Integration test error', { test: true }, 'visibility');
      
      console.log('✅ Logger integration: All methods working');
      return { integration: 'WORKING' };
    } catch (error) {
      throw new Error(`Logger integration failed: ${error.message}`);
    }
  }

  /**
   * Generate comprehensive diagnostic report
   */
  generateDiagnosticReport() {
    const totalTime = Date.now() - this.startTime;
    const passedTests = this.testResults.filter(t => t.status === 'PASSED').length;
    const failedTests = this.testResults.filter(t => t.status === 'FAILED').length;
    const successRate = (passedTests / this.testResults.length) * 100;

    console.log('\n📊 TE2 LOGGER DIAGNOSTIC REPORT');
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
    window.loggerDiagnosticResults = this.testResults;
    window.loggerDiagnosticReport = {
      totalTests: this.testResults.length,
      passedTests,
      failedTests,
      successRate,
      totalTime,
      timestamp: new Date().toISOString()
    };

    return window.loggerDiagnosticReport;
  }
}

// Make test suite available globally
window.LoggerDiagnosticTest = LoggerDiagnosticTest;

// Quick diagnostic functions for console use
window.testLogger = function() {
  const diagnostic = new LoggerDiagnosticTest();
  return diagnostic.runDiagnosticTest();
};

window.quickLoggerCheck = function() {
  console.log('🔍 QUICK LOGGER CHECK:');
  
  const checks = {
    'Logger Available': typeof Logger !== 'undefined',
    'window.Logger Available': typeof window.Logger !== 'undefined',
    'Logger.debug Available': typeof Logger?.debug === 'function',
    'Logger.success Available': typeof Logger?.success === 'function',
    'Logger.getHistory Available': typeof Logger?.getHistory === 'function',
    'Logger History Working': Array.isArray(Logger?.getHistory?.())
  };

  Object.entries(checks).forEach(([check, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${check}: ${passed ? 'YES' : 'NO'}`);
  });

  return checks;
};

window.fixLoggerIfBroken = function() {
  console.log('🔧 ATTEMPTING LOGGER FIX...');
  
  if (typeof Logger === 'undefined') {
    console.log('❌ Logger not available, creating fallback...');
    
    // Create fallback Logger
    window.Logger = {
      debug: (msg, data, context) => console.log(`🔍 ${msg}`, data),
      info: (msg, data, context) => console.log(`ℹ️ ${msg}`, data),
      warn: (msg, data, context) => console.warn(`⚠️ ${msg}`, data),
      error: (msg, data, context) => console.error(`❌ ${msg}`, data),
      success: (msg, data, context) => console.log(`✅ ${msg}`, data),
      getHistory: () => [],
      setLevel: () => {},
      setEnabled: () => {}
    };
    
    console.log('✅ Fallback Logger created');
    return true;
  } else {
    console.log('✅ Logger is already available');
    return false;
  }
};

console.log('🧪 TE2 LOGGER DIAGNOSTIC TEST LOADED');
console.log('Available functions:');
console.log('- window.testLogger() - Run full diagnostic test');
console.log('- window.quickLoggerCheck() - Quick status check');
console.log('- window.fixLoggerIfBroken() - Attempt to fix Logger issues');
console.log('- window.LoggerDiagnosticTest - Test suite class');

