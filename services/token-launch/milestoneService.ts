/**
 * Milestone Service - TypeScript
 * Manages token launch milestone tracking and verification
 */

import { PrismaClient } from '../../generated/prisma';
import type {
  MilestoneData,
  MilestoneAttestationData,
  LaunchReadiness
} from './types';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

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
          take: 5
        }
      }
    });
  }

  /**
   * Get milestone by key
   */
  async getMilestoneByKey(milestoneKey: string) {
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
  async upsertMilestone(data: MilestoneData) {
    const { milestoneKey, targetValue, currentValue, ...updateData } = data;
    
    const processedData: any = {
      ...updateData,
      targetValue: targetValue ? (typeof targetValue === 'string' ? targetValue : JSON.stringify(targetValue)) : null,
      currentValue: currentValue ? (typeof currentValue === 'string' ? currentValue : JSON.stringify(currentValue)) : null
    };

    return await prisma.tokenLaunchMilestone.upsert({
      where: { milestoneKey },
      update: {
        ...processedData,
        updated_at: new Date()
      },
      create: {
        milestoneKey,
        ...processedData
      }
    });
  }

  /**
   * Update milestone completion status
   */
  async updateMilestoneStatus(
    milestoneKey: string,
    isComplete: boolean,
    verifiedBy: string | null,
    evidenceData: Record<string, any> | null = null
  ) {
    const updateData: any = {
      isComplete,
      verifiedBy,
      verifiedAt: isComplete ? new Date() : null,
      updated_at: new Date()
    };

    if (evidenceData) {
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
  async addAttestation(data: MilestoneAttestationData) {
    const { milestoneId, attestorId, signature, evidenceData, ...rest } = data;

    const attestation = await prisma.milestoneAttestation.create({
      data: {
        milestoneId,
        attestorId,
        signature,
        evidenceData: evidenceData ? JSON.parse(JSON.stringify(evidenceData)) : null,
        ...rest
      }
    });

    await this.checkMilestoneCompletion(milestoneId);

    return attestation;
  }

  /**
   * Check if milestone has enough attestations to be considered complete
   */
  async checkMilestoneCompletion(milestoneId: string): Promise<void> {
    const milestone = await prisma.tokenLaunchMilestone.findUnique({
      where: { id: milestoneId },
      include: {
        MilestoneAttestation: true
      }
    });

    if (!milestone) return;

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
  async getLaunchReadiness(): Promise<LaunchReadiness> {
    const milestones = await this.getAllMilestones();
    
    const byCategory = milestones.reduce((acc: Record<string, any[]>, m) => {
      if (!acc[m.category]) acc[m.category] = [];
      acc[m.category].push(m);
      return acc;
    }, {});

    const readiness: Record<string, { completed: number; total: number; percentage: number }> = {};
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
  generateHash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Verify milestone evidence signature
   */
  async verifyAttestation(attestationId: string) {
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

    return {
      valid: true,
      attestation
    };
  }
}

export default new MilestoneService();





