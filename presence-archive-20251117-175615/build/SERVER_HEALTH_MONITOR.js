/**
 * SERVER HEALTH MONITOR
 * Monitors backend server health and provides alerts
 */

(function() {
  'use strict';
  
  const monitor = {
    serverUrl: 'http://216.238.91.120:3002',
    checkInterval: 60000, // 1 minute
    failedChecks: 0,
    maxFailedChecks: 3,
    isMonitoring: false,
    intervalId: null,
    
    async checkHealth() {
      // Don't poll if user is not authenticated
      if (!window.currentUser || !window.currentUser.id) {
        console.log('🔒 SERVER HEALTH: Skipping check - user not authenticated');
        return null; // Return null to indicate skipped check
      }
      
      try {
        const response = await fetch(`${this.serverUrl}/`, { 
          method: 'GET',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        
        if (response.ok) {
          this.failedChecks = 0;
          return true;
        }
        return false;
      } catch (error) {
        this.failedChecks++;
        return false;
      }
    },
    
    async runCheck() {
      const healthy = await this.checkHealth();
      
      if (!healthy) {
        if (this.failedChecks >= this.maxFailedChecks) {
          console.warn('⚠️ SERVER HEALTH: Backend server appears to be down');
          console.warn('   → Multiple health checks failed');
          console.warn('   → Server may need to be restarted');
          console.warn('   → Run: cd /home/ubuntu/metalayer-initiative && bash start_backend.sh');
          console.warn('   → Or: pm2 restart metalayer-api');
        }
      } else {
        if (this.failedChecks > 0) {
          console.log('✅ SERVER HEALTH: Backend server is back online');
          this.failedChecks = 0;
        }
      }
    },
    
    start() {
      if (this.isMonitoring) {
        console.log('⚠️ SERVER HEALTH: Monitor already running');
        return;
      }
      
      this.isMonitoring = true;
      console.log('🔍 SERVER HEALTH: Starting health monitor');
      console.log(`   → Checking every ${this.checkInterval / 1000} seconds`);
      
      // Initial check
      this.runCheck();
      
      // Periodic checks
      this.intervalId = setInterval(() => {
        this.runCheck();
      }, this.checkInterval);
    },
    
    stop() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      this.isMonitoring = false;
      console.log('🛑 SERVER HEALTH: Monitor stopped');
    }
  };
  
  // Export for global access (immediately, not in IIFE)
  window.serverHealthMonitor = monitor;
  window.startServerHealthMonitor = function() {
    return monitor.start();
  };
  window.stopServerHealthMonitor = function() {
    return monitor.stop();
  };
  
  // DISABLED: Auto-start removed - health monitoring is manual/diagnostic only
  // No automatic polling - only runs when explicitly called via startServerHealthMonitor()
  
  console.log('✅ Server Health Monitor loaded');
  console.log('💡 Start: startServerHealthMonitor()');
  console.log('💡 Stop: stopServerHealthMonitor()');
  
  // Verify exports
  if (typeof window.startServerHealthMonitor !== 'function') {
    console.error('❌ SERVER HEALTH: Failed to export startServerHealthMonitor');
  }
  if (typeof window.stopServerHealthMonitor !== 'function') {
    console.error('❌ SERVER HEALTH: Failed to export stopServerHealthMonitor');
  }
  
})();

