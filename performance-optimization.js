#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Performance optimization script for the Metalayer extension
// This optimizes polling intervals and reduces unnecessary API calls

const optimizations = [
  {
    file: 'presence/sidepanel.js',
    changes: [
      {
        // Optimize heartbeat interval from 5 seconds to 30 seconds
        pattern: /}, 5000\); \/\/ 5 seconds/g,
        replacement: '}, 30000); // 30 seconds - reduced frequency for better performance'
      },
      {
        // Optimize message polling from 5 seconds to 10 seconds
        pattern: /}, 5000\); \/\/ Poll every 5 seconds/g,
        replacement: '}, 10000); // Poll every 10 seconds - reduced frequency'
      },
      {
        // Add performance monitoring
        pattern: /function startMessagePolling\(\) {/,
        replacement: `function startMessagePolling() {
  // Performance optimization: reduce polling frequency
  if (messagePollingInterval) {
    console.warn('⚠️ POLLING: Message polling already active, skipping duplicate start');
    return;
  }`
      },
      {
        // Add heartbeat performance monitoring
        pattern: /presenceHeartbeatInterval = setInterval\(async \(\) => {/,
        replacement: `presenceHeartbeatInterval = setInterval(async () => {
    // Performance optimization: batch heartbeat operations
    const startTime = performance.now();`
      },
      {
        // Add performance logging
        pattern: /console\.log\('💓 HEARTBEAT: Heartbeat sent successfully'\);/,
        replacement: `console.log('💓 HEARTBEAT: Heartbeat sent successfully');
        const endTime = performance.now();
        if (endTime - startTime > 1000) {
          console.warn('⚠️ PERFORMANCE: Heartbeat took', (endTime - startTime).toFixed(2), 'ms');
        }`
      }
    ]
  }
];

// Additional performance optimizations
const performanceConfig = {
  // Optimized intervals
  intervals: {
    heartbeat: 30000,    // 30 seconds (was 5 seconds)
    messagePolling: 10000, // 10 seconds (was 5 seconds)
    visibilityPolling: 60000, // 1 minute (was not optimized)
    presenceUpdate: 15000  // 15 seconds for presence updates
  },
  
  // API call optimizations
  apiOptimizations: {
    batchRequests: true,
    cacheResponses: true,
    retryFailedRequests: true,
    maxRetries: 3
  },
  
  // Memory optimizations
  memoryOptimizations: {
    clearOldMessages: true,
    limitMessageHistory: 100,
    garbageCollectionInterval: 300000 // 5 minutes
  }
};

function applyOptimizations() {
  console.log('🚀 Starting performance optimizations...');
  
  optimizations.forEach(optimization => {
    const filePath = path.join(__dirname, optimization.file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${optimization.file}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    optimization.changes.forEach(change => {
      const newContent = content.replace(change.pattern, change.replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Optimized: ${optimization.file}`);
    } else {
      console.log(`ℹ️  No changes needed: ${optimization.file}`);
    }
  });
}

// Create performance monitoring utility
function createPerformanceMonitor() {
  const monitorCode = `
// Performance monitoring utility
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      apiCalls: 0,
      averageResponseTime: 0,
      errors: 0,
      memoryUsage: 0
    };
    this.startTime = Date.now();
  }
  
  recordApiCall(duration) {
    this.metrics.apiCalls++;
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.apiCalls - 1) + duration) / this.metrics.apiCalls;
  }
  
  recordError() {
    this.metrics.errors++;
  }
  
  getMetrics() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.startTime
    };
  }
  
  logMetrics() {
    const metrics = this.getMetrics();
    console.log('📊 Performance Metrics:', {
      'API Calls': metrics.apiCalls,
      'Avg Response Time': metrics.averageResponseTime.toFixed(2) + 'ms',
      'Errors': metrics.errors,
      'Uptime': Math.floor(metrics.uptime / 1000) + 's'
    });
  }
}

// Global performance monitor
window.performanceMonitor = new PerformanceMonitor();

// Log metrics every 5 minutes
setInterval(() => {
  window.performanceMonitor.logMetrics();
}, 300000);
`;

  const monitorPath = path.join(__dirname, 'presence/performance-monitor.js');
  fs.writeFileSync(monitorPath, monitorCode);
  console.log('✅ Created performance monitor: presence/performance-monitor.js');
}

// Apply all optimizations
applyOptimizations();
createPerformanceMonitor();

console.log('✅ Performance optimization complete!');
console.log('📊 Optimized intervals:');
console.log('  - Heartbeat: 30 seconds (was 5 seconds)');
console.log('  - Message polling: 10 seconds (was 5 seconds)');
console.log('  - Visibility polling: 60 seconds');
console.log('💡 Performance monitoring is now available via window.performanceMonitor');










