const { PrismaClient } = require('../generated/prisma');
const crypto = require('crypto');

const prisma = new PrismaClient();

/**
 * Waitlist Service
 * Manages community waitlist and batch access
 */
class WaitlistService {
  /**
   * Add user to community waitlist
   */
  async addToWaitlist(communityId, data) {
    const { userId, email, authMethod, authProvider } = data;

    // Generate keys if no auth method provided
    let generatedKeys = null;
    if (!authMethod || authMethod === 'generated') {
      generatedKeys = this.generateKeys();
    }

    return await prisma.communityWaitlistEntry.create({
      data: {
        communityId,
        userId: userId || null,
        email: email || null,
        authMethod: authMethod || 'generated',
        authProvider,
        generatedKeys: generatedKeys ? JSON.parse(JSON.stringify(generatedKeys)) : null
      }
    });
  }

  /**
   * Generate keys for users without auth methods
   */
  generateKeys() {
    return {
      publicKey: crypto.randomBytes(32).toString('hex'),
      privateKey: crypto.randomBytes(32).toString('hex'), // In production, encrypt this
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Get waitlist entries for community
   */
  async getWaitlistEntries(communityId, filters = {}) {
    const { batchNumber, accessGranted, limit = 100, offset = 0 } = filters;
    const where = { communityId };
    if (batchNumber !== undefined) where.batchNumber = batchNumber;
    if (accessGranted !== undefined) where.accessGranted = accessGranted;

    return await prisma.communityWaitlistEntry.findMany({
      where,
      include: {
        AppUser: {
          select: { id: true, handle: true, name: true, email: true }
        },
        Community: {
          select: { id: true, name: true }
        }
      },
      orderBy: { created_at: 'asc' },
      take: limit,
      skip: offset
    });
  }

  /**
   * Create batch for community access
   */
  async createBatch(communityId, batchData) {
    const { batchNumber, name, mission, maxSize, startDate, endDate } = batchData;

    return await prisma.communityBatch.create({
      data: {
        communityId,
        batchNumber,
        name,
        mission,
        maxSize,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      }
    });
  }

  /**
   * Assign users to batch
   */
  async assignToBatch(communityId, batchNumber, userIds) {
    const batch = await prisma.communityBatch.findUnique({
      where: {
        communityId_batchNumber: {
          communityId,
          batchNumber
        }
      }
    });

    if (!batch) {
      throw new Error('Batch not found');
    }

    // Check if batch is full
    const currentCount = await prisma.communityWaitlistEntry.count({
      where: {
        communityId,
        batchNumber
      }
    });

    if (currentCount + userIds.length > batch.maxSize) {
      throw new Error('Batch is full');
    }

    // Mark first batch as pioneers
    const isPioneer = batchNumber === 1;

    // Update waitlist entries
    const updates = userIds.map(userId =>
      prisma.communityWaitlistEntry.updateMany({
        where: {
          communityId,
          userId
        },
        data: {
          batchNumber,
          batchMission: batch.mission,
          isPioneer
        }
      })
    );

    await Promise.all(updates);

    // Award pioneer badges if first batch
    if (isPioneer) {
      await this.awardPioneerBadges(userIds, communityId);
    }

    return { assigned: userIds.length, batchNumber, isPioneer };
  }

  /**
   * Grant access to batch
   */
  async grantBatchAccess(communityId, batchNumber) {
    const updated = await prisma.communityWaitlistEntry.updateMany({
      where: {
        communityId,
        batchNumber
      },
      data: {
        accessGranted: true,
        accessGrantedAt: new Date(),
        updated_at: new Date()
      }
    });

    // Activate batch
    await prisma.communityBatch.update({
      where: {
        communityId_batchNumber: {
          communityId,
          batchNumber
        }
      },
      data: {
        isActive: true,
        startDate: new Date()
      }
    });

    return updated.count;
  }

  /**
   * Award pioneer badges
   */
  async awardPioneerBadges(userIds, communityId) {
    const badges = userIds.map(userId =>
      prisma.userBadge.create({
        data: {
          userId,
          communityId,
          badgeType: 'pioneer',
          badgeName: 'Pioneer',
          description: 'Member of the first batch to access the community',
          metadata: {
            awardedFor: 'first_batch_access',
            communityId
          }
        }
      })
    );

    return await Promise.all(badges);
  }

  /**
   * Verify proof of humanity
   */
  async verifyProofOfHumanity(userId, pohIdentifier, provider = 'fractal') {
    // TODO: Integrate with Fractal ID or other PoH provider
    // For now, just mark as verified

    const waitlistEntries = await prisma.communityWaitlistEntry.findMany({
      where: { userId }
    });

    const updates = waitlistEntries.map(entry =>
      prisma.communityWaitlistEntry.update({
        where: { id: entry.id },
        data: {
          proofOfHumanity: pohIdentifier,
          proofOfHumanityVerifiedAt: new Date()
        }
      })
    );

    await Promise.all(updates);

    return { verified: true, pohIdentifier, provider };
  }

  /**
   * Get user badges
   */
  async getUserBadges(userId, communityId = null) {
    const where = { userId };
    if (communityId) where.communityId = communityId;

    return await prisma.userBadge.findMany({
      where,
      include: {
        Community: {
          select: { id: true, name: true }
        }
      },
      orderBy: { awardedAt: 'desc' }
    });
  }
}

module.exports = new WaitlistService();













