/**
 * Run Security Monitoring Checks
 * 
 * Run this script periodically (e.g., hourly via cron) to check for security issues
 * 
 * Usage: node scripts/run-security-monitoring.js
 */

const securityService = require('../services/securityService');

async function runMonitoring() {
  console.log('Running security monitoring checks...');

  try {
    const results = await securityService.runMonitoringChecks();
    
    console.log('Monitoring results:');
    console.log(`  Treasury Alerts: ${results.treasuryAlerts}`);
    console.log(`  Governance Alerts: ${results.governanceAlerts}`);
    console.log(`  Timestamp: ${results.timestamp}`);

    if (results.treasuryAlerts > 0 || results.governanceAlerts > 0) {
      console.log('\n⚠️  Alerts generated - review security dashboard');
      process.exit(1);
    } else {
      console.log('\n✓ No security alerts');
      process.exit(0);
    }
  } catch (error) {
    console.error('Error running monitoring:', error);
    process.exit(1);
  }
}

runMonitoring();








