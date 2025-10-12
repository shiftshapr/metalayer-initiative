
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
