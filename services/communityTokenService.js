const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

/**
 * Community Token Service
 * Manages per-community token launches
 */
class CommunityTokenService {
  /**
   * Create token launch for a community
   */
  async createTokenLaunch(communityId, tokenData) {
    const { tokenName, tokenSymbol, chain, metadata } = tokenData;

    return await prisma.communityTokenLaunch.create({
      data: {
        communityId,
        tokenName,
        tokenSymbol,
        chain,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null
      }
    });
  }

  /**
   * Get token launch for community
   */
  async getTokenLaunch(communityId) {
    return await prisma.communityTokenLaunch.findUnique({
      where: { communityId },
      include: {
        Milestones: {
          orderBy: { created_at: 'asc' }
        },
        Community: {
          select: { id: true, name: true, description: true }
        }
      }
    });
  }

  /**
   * Get all active token launches
   */
  async getActiveTokenLaunches(filters = {}) {
    const { chain, status } = filters;
    const where = { status: { not: 'paused' } };
    if (chain) where.chain = chain;
    if (status) where.status = status;

    return await prisma.communityTokenLaunch.findMany({
      where,
      include: {
        Community: {
          select: { id: true, name: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  /**
   * Update token launch status
   */
  async updateTokenLaunchStatus(communityId, status, contractAddress = null, bondingCurveAddress = null) {
    const updateData = {
      status,
      updated_at: new Date()
    };

    if (status === 'active' && !updateData.launchDate) {
      updateData.launchDate = new Date();
    }

    if (contractAddress) updateData.contractAddress = contractAddress;
    if (bondingCurveAddress) updateData.bondingCurveAddress = bondingCurveAddress;

    return await prisma.communityTokenLaunch.update({
      where: { communityId },
      data: updateData
    });
  }

  /**
   * Create community-specific milestone
   */
  async createCommunityMilestone(tokenLaunchId, milestoneData) {
    return await prisma.communityTokenMilestone.create({
      data: {
        tokenLaunchId,
        ...milestoneData,
        targetValue: milestoneData.targetValue ? JSON.stringify(milestoneData.targetValue) : null,
        currentValue: milestoneData.currentValue ? JSON.stringify(milestoneData.currentValue) : null
      }
    });
  }

  /**
   * Get community token launch readiness
   */
  async getLaunchReadiness(communityId) {
    const tokenLaunch = await this.getTokenLaunch(communityId);
    if (!tokenLaunch) return null;

    const milestones = tokenLaunch.Milestones || [];
    const completed = milestones.filter(m => m.isComplete).length;
    const total = milestones.length;

    return {
      tokenLaunch,
      readiness: {
        completed,
        total,
        percentage: total > 0 ? (completed / total) * 100 : 0,
        allComplete: total > 0 && completed === total
      }
    };
  }

  /**
   * Record token transaction
   */
  async recordTransaction(tokenLaunchId, userId, transactionData) {
    const { transactionType, amount, price, onChainHash } = transactionData;

    return await prisma.communityTokenTransaction.create({
      data: {
        tokenLaunchId,
        userId,
        transactionType,
        amount,
        price,
        onChainHash,
        status: onChainHash ? 'confirmed' : 'pending',
        confirmed_at: onChainHash ? new Date() : null
      }
    });
  }

  /**
   * Get community token transactions
   */
  async getTokenTransactions(communityId, filters = {}) {
    const tokenLaunch = await this.getTokenLaunch(communityId);
    if (!tokenLaunch) return [];

    const { userId, transactionType, limit = 50, offset = 0 } = filters;
    const where = { tokenLaunchId: tokenLaunch.id };
    if (userId) where.userId = userId;
    if (transactionType) where.transactionType = transactionType;

    return await prisma.communityTokenTransaction.findMany({
      where,
      include: {
        AppUser: {
          select: { id: true, handle: true, name: true }
        }
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset
    });
  }

  /**
   * Get popular communities for token launch (Google, X, Discord, Facebook, blockchains)
   */
  async getPopularCommunitiesForLaunch() {
    // These would be communities that are likely to launch tokens first
    const popularAuthProviders = ['google', 'x', 'discord', 'facebook'];
    const popularBlockchains = ['ethereum', 'solana', 'base', 'polygon', 'arbitrum'];

    // Query communities that match these criteria
    // This is a placeholder - actual implementation would query based on community metadata
    return await prisma.metaCommunity.findMany({
      where: {
        status: 'active',
        isPublic: true
      },
      take: 20,
      orderBy: { createdAt: 'desc' }
    });
  }
}

module.exports = new CommunityTokenService();









