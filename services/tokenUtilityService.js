const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

/**
 * Token Utility Service
 * Manages token utility integrations across the platform
 */
class TokenUtilityService {
  /**
   * Create a new token utility
   */
  async createUtility(data) {
    return await prisma.tokenUtility.create({
      data: {
        ...data,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : null
      }
    });
  }

  /**
   * Get utility by ID
   */
  async getUtility(utilityId) {
    return await prisma.tokenUtility.findUnique({
      where: { id: utilityId }
    });
  }

  /**
   * Get utilities by type and target
   */
  async getUtilities(filters = {}) {
    const { utilityType, targetType, targetId, isActive } = filters;

    const where = {};
    if (utilityType) where.utilityType = utilityType;
    if (targetType) where.targetType = targetType;
    if (targetId) where.targetId = targetId;
    if (isActive !== undefined) where.isActive = isActive;

    return await prisma.tokenUtility.findMany({
      where,
      orderBy: { created_at: 'desc' }
    });
  }

  /**
   * Check if user has required tokens for utility
   */
  async checkUserAccess(userId, utilityType, targetType, targetId = null) {
    // Get user token balance
    const userBalance = await prisma.userTokenBalance.findUnique({
      where: { userId }
    });

    if (!userBalance) {
      return { hasAccess: false, reason: 'No token balance found' };
    }

    // Find applicable utilities
    const utilities = await this.getUtilities({
      utilityType,
      targetType,
      targetId,
      isActive: true
    });

    if (utilities.length === 0) {
      return { hasAccess: true, reason: 'No token requirement for this resource' };
    }

    // Check if user meets any utility requirement
    for (const utility of utilities) {
      const requiredAmount = utility.requiredAmount || 0;
      const userAmount = userBalance.balance;

      if (userAmount >= requiredAmount) {
        return {
          hasAccess: true,
          utility: utility,
          requiredAmount,
          userAmount
        };
      }
    }

    return {
      hasAccess: false,
      reason: 'Insufficient tokens',
      requiredAmount: utilities[0]?.requiredAmount || 0,
      userAmount: userBalance.balance
    };
  }

  /**
   * Update utility
   */
  async updateUtility(utilityId, data) {
    const updateData = { ...data };
    if (data.metadata) {
      updateData.metadata = JSON.parse(JSON.stringify(data.metadata));
    }
    updateData.updated_at = new Date();

    return await prisma.tokenUtility.update({
      where: { id: utilityId },
      data: updateData
    });
  }

  /**
   * Deactivate utility
   */
  async deactivateUtility(utilityId) {
    return await prisma.tokenUtility.update({
      where: { id: utilityId },
      data: {
        isActive: false,
        updated_at: new Date()
      }
    });
  }

  /**
   * Sync user token balance from on-chain (placeholder for blockchain integration)
   */
  async syncUserBalance(userId, walletAddress = null) {
    // TODO: Integrate with blockchain service to fetch actual balance
    // For now, this is a placeholder
    
    const existing = await prisma.userTokenBalance.findUnique({
      where: { userId }
    });

    if (!existing) {
      return await prisma.userTokenBalance.create({
        data: {
          userId,
          walletAddress,
          balance: 0,
          stakedBalance: 0,
          lastSyncedAt: new Date()
        }
      });
    }

    // In production, fetch from blockchain
    const onChainBalance = 0; // Placeholder
    const stakedBalance = 0; // Placeholder

    return await prisma.userTokenBalance.update({
      where: { userId },
      data: {
        walletAddress: walletAddress || existing.walletAddress,
        balance: onChainBalance,
        stakedBalance,
        lastSyncedAt: new Date(),
        updated_at: new Date()
      }
    });
  }

  /**
   * Get user token balance
   */
  async getUserBalance(userId) {
    return await prisma.userTokenBalance.findUnique({
      where: { userId },
      include: {
        AppUser: {
          select: { id: true, handle: true, name: true }
        }
      }
    });
  }

  /**
   * Gate access to a resource based on token requirements
   */
  async gateAccess(userId, resourceType, resourceId) {
    const accessCheck = await this.checkUserAccess(userId, 'access_gate', resourceType, resourceId);
    
    if (!accessCheck.hasAccess) {
      throw new Error(`Access denied: ${accessCheck.reason}`);
    }

    return accessCheck;
  }
}

module.exports = new TokenUtilityService();









