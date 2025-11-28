const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

/**
 * Activity Reward Service
 * Manages rewards for PoH-verified user activity
 */
class ActivityRewardService {
  /**
   * Check if user has verified proof of humanity
   */
  async hasProofOfHumanity(userId) {
    const waitlistEntry = await prisma.communityWaitlistEntry.findFirst({
      where: {
        userId,
        proofOfHumanity: { not: null },
        proofOfHumanityVerifiedAt: { not: null }
      }
    });

    return !!waitlistEntry;
  }

  /**
   * Record activity and award reward if PoH verified
   */
  async recordActivity(userId, activityData) {
    const { activityType, activityId, communityId, rewardAmount, rewardCurrency = 'tokens' } = activityData;

    // Check PoH requirement
    const requiresPoH = activityData.requiresPoH !== false; // Default true
    let canReward = true;

    if (requiresPoH) {
      canReward = await this.hasProofOfHumanity(userId);
    }

    if (!canReward) {
      return {
        rewarded: false,
        reason: 'Proof of humanity required',
        activityType,
        activityId
      };
    }

    // Create reward
    const reward = await prisma.activityReward.create({
      data: {
        userId,
        communityId,
        activityType,
        activityId,
        rewardAmount,
        rewardCurrency,
        requiresPoH,
        metadata: activityData.metadata ? JSON.parse(JSON.stringify(activityData.metadata)) : null
      }
    });

    // TODO: Update user token balance or points
    // This would integrate with the token utility service

    return {
      rewarded: true,
      reward,
      activityType,
      activityId
    };
  }

  /**
   * Get user rewards
   */
  async getUserRewards(userId, filters = {}) {
    const { communityId, activityType, limit = 50, offset = 0 } = filters;
    const where = { userId };
    if (communityId) where.communityId = communityId;
    if (activityType) where.activityType = activityType;

    return await prisma.activityReward.findMany({
      where,
      include: {
        Community: {
          select: { id: true, name: true }
        }
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset
    });
  }

  /**
   * Get reward summary for user
   */
  async getRewardSummary(userId, communityId = null) {
    const where = { userId };
    if (communityId) where.communityId = communityId;

    const rewards = await prisma.activityReward.findMany({
      where
    });

    const totalRewards = rewards.reduce((sum, r) => sum + r.rewardAmount, 0);
    const byType = rewards.reduce((acc, r) => {
      acc[r.activityType] = (acc[r.activityType] || 0) + r.rewardAmount;
      return acc;
    }, {});

    return {
      totalRewards,
      rewardCount: rewards.length,
      byType,
      hasPoH: await this.hasProofOfHumanity(userId)
    };
  }

  /**
   * Auto-reward common activities
   */
  async autoRewardActivity(userId, activityType, activityId, communityId = null) {
    // Define reward amounts by activity type
    const rewardAmounts = {
      message: 1.0,
      governance: 5.0,
      contribution: 10.0,
      participation: 2.0
    };

    const rewardAmount = rewardAmounts[activityType] || 1.0;

    return await this.recordActivity(userId, {
      activityType,
      activityId,
      communityId,
      rewardAmount,
      requiresPoH: true
    });
  }
}

module.exports = new ActivityRewardService();













