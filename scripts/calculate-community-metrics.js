/**
 * Calculate and Store Community Metrics
 * 
 * Run this script periodically (e.g., daily via cron) to calculate and store community metrics
 * 
 * Usage: node scripts/calculate-community-metrics.js
 */

const communityMetricsService = require('../services/communityMetricsService');

async function calculateMetrics() {
  console.log('Calculating community metrics...');

  try {
    const metrics = await communityMetricsService.calculateAndStoreMetrics();
    
    console.log('Metrics calculated and stored:');
    console.log(`  Total Members: ${metrics.totalMembers}`);
    console.log(`  Active Members: ${metrics.activeMembers}`);
    console.log(`  Participation Rate: ${(metrics.participationRate * 100).toFixed(2)}%`);
    console.log(`  Messages (30d): ${metrics.messagesCount}`);
    console.log(`  Communities: ${metrics.communitiesCount}`);
    console.log(`  Groups: ${metrics.groupsCount}`);

    // Check engagement milestone
    const engagementCheck = await communityMetricsService.checkEngagementMilestone();
    console.log('\nEngagement Milestone Status:');
    console.log(`  Met: ${engagementCheck.met}`);
    console.log('  Checks:', engagementCheck.checks);

    process.exit(0);
  } catch (error) {
    console.error('Error calculating metrics:', error);
    process.exit(1);
  }
}

calculateMetrics();













