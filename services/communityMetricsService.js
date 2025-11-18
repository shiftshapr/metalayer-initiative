const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

/**
 * Community Metrics Service
 * Tracks community engagement metrics for milestone verification
 */
class CommunityMetricsService {
  /**
   * Calculate and store current community metrics
   */
  async calculateAndStoreMetrics() {
    const metrics = await this.calculateCurrentMetrics();
    
    return await prisma.communityMetrics.create({
      data: {
        totalMembers: metrics.totalMembers,
        activeMembers: metrics.activeMembers,
        participationRate: metrics.participationRate,
        messagesCount: metrics.messagesCount,
        communitiesCount: metrics.communitiesCount,
        groupsCount: metrics.groupsCount,
        metadata: metrics.metadata ? JSON.parse(JSON.stringify(metrics.metadata)) : null
      }
    });
  }

  /**
   * Calculate current community metrics
   */
  async calculateCurrentMetrics() {
    // Total members
    const totalMembers = await prisma.appUser.count({
      where: {
        isSuperAdmin: false // Exclude system accounts
      }
    });

    // Active members (active in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeMembers = await prisma.appUser.count({
      where: {
        isSuperAdmin: false,
        OR: [
          {
            user_presence: {
              some: {
                last_seen: {
                  gte: thirtyDaysAgo
                }
              }
            }
          },
          {
            messages: {
              some: {
                created_at: {
                  gte: thirtyDaysAgo
                }
              }
            }
          }
        ]
      }
    });

    // Messages count (last 30 days)
    const messagesCount = await prisma.messages.count({
      where: {
        created_at: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Communities count
    const communitiesCount = await prisma.metaCommunity.count({
      where: {
        status: 'active'
      }
    });

    // Groups count (spaces)
    const groupsCount = await prisma.space.count();

    // Participation rate
    const participationRate = totalMembers > 0 
      ? activeMembers / totalMembers 
      : 0;

    // Additional metadata
    const metadata = {
      averageMessagesPerUser: activeMembers > 0 ? messagesCount / activeMembers : 0,
      averageCommunitiesPerUser: totalMembers > 0 ? communitiesCount / totalMembers : 0,
      calculatedAt: new Date().toISOString()
    };

    return {
      totalMembers,
      activeMembers,
      participationRate,
      messagesCount,
      communitiesCount,
      groupsCount,
      metadata
    };
  }

  /**
   * Get latest metrics
   */
  async getLatestMetrics() {
    return await prisma.communityMetrics.findFirst({
      orderBy: { metricDate: 'desc' }
    });
  }

  /**
   * Get metrics history
   */
  async getMetricsHistory(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await prisma.communityMetrics.findMany({
      where: {
        metricDate: {
          gte: startDate
        }
      },
      orderBy: { metricDate: 'desc' }
    });
  }

  /**
   * Get metrics for milestone verification
   */
  async getMetricsForMilestone() {
    const latest = await this.getLatestMetrics();
    const current = await this.calculateCurrentMetrics();

    return {
      latest: latest || null,
      current,
      trend: latest ? this.calculateTrend(latest, current) : null
    };
  }

  /**
   * Calculate trend between two metric snapshots
   */
  calculateTrend(previous, current) {
    return {
      totalMembers: current.totalMembers - previous.totalMembers,
      activeMembers: current.activeMembers - previous.activeMembers,
      participationRate: current.participationRate - (previous.participationRate || 0),
      messagesCount: current.messagesCount - previous.messagesCount,
      communitiesCount: current.communitiesCount - previous.communitiesCount,
      groupsCount: current.groupsCount - previous.groupsCount
    };
  }

  /**
   * Check if community engagement milestone is met
   */
  async checkEngagementMilestone() {
    const metrics = await this.calculateCurrentMetrics();
    
    // Define thresholds (adjust based on your requirements)
    const thresholds = {
      minTotalMembers: 100,
      minActiveMembers: 50,
      minParticipationRate: 0.3, // 30%
      minMessagesCount: 1000,
      minCommunitiesCount: 5
    };

    const checks = {
      totalMembers: metrics.totalMembers >= thresholds.minTotalMembers,
      activeMembers: metrics.activeMembers >= thresholds.minActiveMembers,
      participationRate: metrics.participationRate >= thresholds.minParticipationRate,
      messagesCount: metrics.messagesCount >= thresholds.minMessagesCount,
      communitiesCount: metrics.communitiesCount >= thresholds.minCommunitiesCount
    };

    const allMet = Object.values(checks).every(v => v === true);

    return {
      met: allMet,
      checks,
      metrics,
      thresholds
    };
  }
}

module.exports = new CommunityMetricsService();





