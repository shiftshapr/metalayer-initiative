/**
 * API MONITOR
 * Monitors and displays Supabase API usage to prevent rate limit issues
 */

class APIMonitor {
  constructor() {
    this.isVisible = false;
    this.updateInterval = null;
    this.dashboard = null;
    
    console.log('📊 APIMonitor: Monitor initialized');
  }

  /**
   * Show the monitoring dashboard
   */
  showDashboard() {
    if (this.isVisible) {
      this.hideDashboard();
      return;
    }

    this.createDashboard();
    this.isVisible = true;
    this.startMonitoring();
    
    console.log('📊 APIMonitor: Dashboard shown');
  }

  /**
   * Hide the monitoring dashboard
   */
  hideDashboard() {
    if (this.dashboard) {
      this.dashboard.remove();
      this.dashboard = null;
    }
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    this.isVisible = false;
    console.log('📊 APIMonitor: Dashboard hidden');
  }

  /**
   * Create the monitoring dashboard
   */
  createDashboard() {
    // Create overlay
    this.dashboard = document.createElement('div');
    this.dashboard.id = 'api-monitor-dashboard';
    this.dashboard.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 400px;
      max-height: 600px;
      background: white;
      border: 2px solid #007bff;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: monospace;
      font-size: 12px;
      overflow-y: auto;
    `;

    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
      background: #007bff;
      color: white;
      padding: 10px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    header.innerHTML = `
      <span>🛡️ API Monitor</span>
      <button id="close-monitor" style="background: none; border: none; color: white; cursor: pointer; font-size: 16px;">×</button>
    `;

    // Create content area
    const content = document.createElement('div');
    content.id = 'monitor-content';
    content.style.cssText = `
      padding: 15px;
      max-height: 500px;
      overflow-y: auto;
    `;

    this.dashboard.appendChild(header);
    this.dashboard.appendChild(content);

    // Add to page
    document.body.appendChild(this.dashboard);

    // Add close button listener
    document.getElementById('close-monitor').addEventListener('click', () => {
      this.hideDashboard();
    });

    // Initial update
    this.updateDashboard();
  }

  /**
   * Start monitoring updates
   */
  startMonitoring() {
    this.updateInterval = setInterval(() => {
      this.updateDashboard();
    }, 2000); // Update every 2 seconds
  }

  /**
   * Update the dashboard content
   */
  updateDashboard() {
    if (!this.dashboard) return;

    const content = document.getElementById('monitor-content');
    if (!content) return;

    // Get API stats
    const apiStats = window.apiRateLimiter ? window.apiRateLimiter.getUsageStats() : null;
    const realtimeStats = window.simpleRealtimeManager ? window.simpleRealtimeManager.getAPIStats() : null;
    const queueStatus = window.simpleRealtimeManager ? window.simpleRealtimeManager.getQueueStatus() : null;

    // Create status indicators
    const statusColor = apiStats && apiStats.isBlocked ? '#dc3545' : '#28a745';
    const statusText = apiStats && apiStats.isBlocked ? 'BLOCKED' : 'ACTIVE';

    content.innerHTML = `
      <div style="margin-bottom: 15px;">
        <h3 style="margin: 0 0 10px 0; color: #333;">API Status</h3>
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <span style="color: ${statusColor}; font-weight: bold;">●</span>
          <span style="margin-left: 8px;">Status: ${statusText}</span>
        </div>
        ${apiStats && apiStats.blockUntil ? `
          <div style="color: #dc3545; font-size: 11px;">
            Blocked until: ${new Date(apiStats.blockUntil).toLocaleTimeString()}
          </div>
        ` : ''}
      </div>

      <div style="margin-bottom: 15px;">
        <h3 style="margin: 0 0 10px 0; color: #333;">Usage Statistics</h3>
        ${apiStats ? `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 11px;">
            <div>Total: ${apiStats.total}</div>
            <div>Today: ${apiStats.today}</div>
            <div>This Hour: ${apiStats.thisHour}</div>
            <div>This Minute: ${apiStats.thisMinute}</div>
            <div>Errors: ${apiStats.errors}</div>
            <div>Blocked: ${apiStats.blocked}</div>
          </div>
        ` : '<div style="color: #6c757d;">No data available</div>'}
      </div>

      <div style="margin-bottom: 15px;">
        <h3 style="margin: 0 0 10px 0; color: #333;">Rate Limits</h3>
        ${apiStats ? `
          <div style="font-size: 11px;">
            <div>Per Minute: ${apiStats.thisMinute}/${apiStats.limits.perMinute}</div>
            <div>Per Hour: ${apiStats.thisHour}/${apiStats.limits.perHour}</div>
            <div>Per Day: ${apiStats.today}/${apiStats.limits.perDay}</div>
          </div>
        ` : '<div style="color: #6c757d;">No data available</div>'}
      </div>

      <div style="margin-bottom: 15px;">
        <h3 style="margin: 0 0 10px 0; color: #333;">Queue Status</h3>
        ${queueStatus ? `
          <div style="font-size: 11px;">
            <div>Message Queue: ${queueStatus.messageQueueLength}</div>
            ${queueStatus.apiQueueStatus ? `
              <div>API Queue: ${queueStatus.apiQueueStatus.queueLength}</div>
              <div>Processing: ${queueStatus.apiQueueStatus.isProcessing ? 'Yes' : 'No'}</div>
            ` : ''}
          </div>
        ` : '<div style="color: #6c757d;">No data available</div>'}
      </div>

      <div style="margin-bottom: 15px;">
        <h3 style="margin: 0 0 10px 0; color: #333;">Actions</h3>
        <div style="display: flex; gap: 5px; flex-wrap: wrap;">
          <button onclick="window.apiRateLimiter.resetCounters()" style="
            background: #ffc107; 
            border: none; 
            padding: 5px 10px; 
            border-radius: 3px; 
            cursor: pointer; 
            font-size: 11px;
          ">Reset Counters</button>
          <button onclick="window.simpleRealtimeManager.processMessageQueue()" style="
            background: #17a2b8; 
            border: none; 
            padding: 5px 10px; 
            border-radius: 3px; 
            cursor: pointer; 
            font-size: 11px;
          ">Process Queue</button>
        </div>
      </div>

      <div style="font-size: 10px; color: #6c757d; text-align: center;">
        Last updated: ${new Date().toLocaleTimeString()}
      </div>
    `;
  }

  /**
   * Get current monitoring data
   */
  getMonitoringData() {
    const apiStats = window.apiRateLimiter ? window.apiRateLimiter.getUsageStats() : null;
    const realtimeStats = window.simpleRealtimeManager ? window.simpleRealtimeManager.getAPIStats() : null;
    const queueStatus = window.simpleRealtimeManager ? window.simpleRealtimeManager.getQueueStatus() : null;

    return {
      apiStats,
      realtimeStats,
      queueStatus,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Export monitoring data
   */
  exportData() {
    const data = this.getMonitoringData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-monitor-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Create global instance
window.apiMonitor = new APIMonitor();

// Add keyboard shortcut
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'M') {
    e.preventDefault();
    window.apiMonitor.showDashboard();
  }
});

console.log('✅ APIMonitor: Monitor loaded');
console.log('📋 APIMonitor: Press Ctrl+Shift+M to show/hide monitor');
console.log('📋 APIMonitor: Use window.apiMonitor.showDashboard() to show monitor');

