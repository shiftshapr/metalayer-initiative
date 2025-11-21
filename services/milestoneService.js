const { PrismaClient } = require('../generated/prisma');
const crypto = require('crypto');

const prisma = new PrismaClient();

/**
 * Milestone Service
 * Manages token launch milestone tracking and verification
 */
class MilestoneService {
  /**
   * Get all milestones with their completion status
   */
  async getAllMilestones() {
    return await prisma.tokenLaunchMilestone.findMany({
      orderBy: { created_at: 'asc' },
      include: {
        MilestoneAttestation: {
          include: {
            AppUser: {
              select: { id: true, handle: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5 // Latest 5 attestations
        }
      }
    });
  }

  /**
   * Get milestone by key
   */
  async getMilestoneByKey(milestoneKey) {
    return await prisma.tokenLaunchMilestone.findUnique({
      where: { milestoneKey },
      include: {
        MilestoneAttestation: {
          include: {
            AppUser: {
              select: { id: true, handle: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  /**
   * Create or update milestone
   */
  async upsertMilestone(data) {
    const { milestoneKey, ...updateData } = data;
    return await prisma.tokenLaunchMilestone.upsert({
      where: { milestoneKey },
      update: {
        ...updateData,
        updated_at: new Date()
      },
      create: {
        milestoneKey,
        ...updateData
      }
    });
  }

  /**
   * Update milestone completion status
   */
  async updateMilestoneStatus(milestoneKey, isComplete, verifiedBy, evidenceData = null) {
    const updateData = {
      isComplete,
      verifiedBy,
      verifiedAt: isComplete ? new Date() : null,
      updated_at: new Date()
    };

    if (evidenceData) {
      // In production, upload to IPFS/Arweave and store hash
      const evidenceHash = this.generateHash(JSON.stringify(evidenceData));
      updateData.evidenceHash = evidenceHash;
      // TODO: Upload to IPFS/Arweave and set evidenceUrl
    }

    return await prisma.tokenLaunchMilestone.update({
      where: { milestoneKey },
      data: updateData
    });
  }

  /**
   * Add milestone attestation
   */
  async addAttestation(milestoneId, attestorId, signature, evidenceData = null) {
    const attestation = await prisma.milestoneAttestation.create({
      data: {
        milestoneId,
        attestorId,
        signature,
        evidenceData: evidenceData ? JSON.parse(JSON.stringify(evidenceData)) : null,
        // TODO: Upload evidence to IPFS/Arweave and set evidenceUrl
      }
    });

    // Check if milestone should be marked complete based on attestations
    await this.checkMilestoneCompletion(milestoneId);

    return attestation;
  }

  /**
   * Check if milestone has enough attestations to be considered complete
   */
  async checkMilestoneCompletion(milestoneId) {
    const milestone = await prisma.tokenLaunchMilestone.findUnique({
      where: { id: milestoneId },
      include: {
        MilestoneAttestation: true
      }
    });

    if (!milestone) return;

    // Require at least 2 independent attestations
    const uniqueAttestors = new Set(milestone.MilestoneAttestation.map(a => a.attestorId));
    const shouldBeComplete = uniqueAttestors.size >= 2;

    if (shouldBeComplete && !milestone.isComplete) {
      await prisma.tokenLaunchMilestone.update({
        where: { id: milestoneId },
        data: {
          isComplete: true,
          verifiedAt: new Date(),
          updated_at: new Date()
        }
      });
    }
  }

  /**
   * Get overall launch readiness status
   */
  async getLaunchReadiness() {
    const milestones = await this.getAllMilestones();
    
    const byCategory = milestones.reduce((acc, m) => {
      if (!acc[m.category]) acc[m.category] = [];
      acc[m.category].push(m);
      return acc;
    }, {});

    const readiness = {};
    for (const [category, categoryMilestones] of Object.entries(byCategory)) {
      const completed = categoryMilestones.filter(m => m.isComplete).length;
      const total = categoryMilestones.length;
      readiness[category] = {
        completed,
        total,
        percentage: total > 0 ? (completed / total) * 100 : 0
      };
    }

    const allCompleted = milestones.every(m => m.isComplete);
    const overallPercentage = milestones.length > 0
      ? (milestones.filter(m => m.isComplete).length / milestones.length) * 100
      : 0;

    return {
      allCompleted,
      overallPercentage,
      byCategory: readiness,
      milestones
    };
  }

  /**
   * Generate cryptographic hash for evidence
   */
  generateHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Verify milestone evidence signature
   */
  async verifyAttestation(attestationId) {
    const attestation = await prisma.milestoneAttestation.findUnique({
      where: { id: attestationId },
      include: {
        AppUser: true
      }
    });

    if (!attestation) {
      throw new Error('Attestation not found');
    }

    // TODO: Implement cryptographic signature verification
    // This would verify the signature against the public key
    // and the evidence data

    return {
      valid: true, // Placeholder
      attestation
    };
  }
}

module.exports = new MilestoneService();









