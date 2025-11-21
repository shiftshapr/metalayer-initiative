/**
 * Milestone Service Tests
 * 
 * Run with: npm test -- tests/services/milestoneService.test.js
 */

const milestoneService = require('../../services/milestoneService');
const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();

describe('MilestoneService', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.milestoneAttestation.deleteMany();
    await prisma.tokenLaunchMilestone.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('getAllMilestones', () => {
    it('should return empty array when no milestones exist', async () => {
      const milestones = await milestoneService.getAllMilestones();
      expect(milestones).toEqual([]);
    });

    it('should return all milestones', async () => {
      // Create test milestones
      await prisma.tokenLaunchMilestone.createMany({
        data: [
          {
            milestoneKey: 'test_milestone_1',
            name: 'Test Milestone 1',
            category: 'community',
            isComplete: false
          },
          {
            milestoneKey: 'test_milestone_2',
            name: 'Test Milestone 2',
            category: 'governance',
            isComplete: true
          }
        ]
      });

      const milestones = await milestoneService.getAllMilestones();
      expect(milestones).toHaveLength(2);
    });
  });

  describe('getMilestoneByKey', () => {
    it('should return milestone by key', async () => {
      await prisma.tokenLaunchMilestone.create({
        data: {
          milestoneKey: 'test_milestone',
          name: 'Test Milestone',
          category: 'community'
        }
      });

      const milestone = await milestoneService.getMilestoneByKey('test_milestone');
      expect(milestone).toBeDefined();
      expect(milestone.milestoneKey).toBe('test_milestone');
    });

    it('should return null for non-existent milestone', async () => {
      const milestone = await milestoneService.getMilestoneByKey('non_existent');
      expect(milestone).toBeNull();
    });
  });

  describe('updateMilestoneStatus', () => {
    it('should update milestone completion status', async () => {
      const milestone = await prisma.tokenLaunchMilestone.create({
        data: {
          milestoneKey: 'test_milestone',
          name: 'Test Milestone',
          category: 'community',
          isComplete: false
        }
      });

      const updated = await milestoneService.updateMilestoneStatus(
        'test_milestone',
        true,
        'test-user-id'
      );

      expect(updated.isComplete).toBe(true);
      expect(updated.verifiedBy).toBe('test-user-id');
      expect(updated.verifiedAt).toBeDefined();
    });
  });

  describe('getLaunchReadiness', () => {
    it('should calculate launch readiness correctly', async () => {
      // Create milestones in different categories
      await prisma.tokenLaunchMilestone.createMany({
        data: [
          {
            milestoneKey: 'community_1',
            name: 'Community 1',
            category: 'community',
            isComplete: true
          },
          {
            milestoneKey: 'community_2',
            name: 'Community 2',
            category: 'community',
            isComplete: false
          },
          {
            milestoneKey: 'governance_1',
            name: 'Governance 1',
            category: 'governance',
            isComplete: true
          }
        ]
      });

      const readiness = await milestoneService.getLaunchReadiness();
      
      expect(readiness.allCompleted).toBe(false);
      expect(readiness.byCategory.community.completed).toBe(1);
      expect(readiness.byCategory.community.total).toBe(2);
      expect(readiness.byCategory.governance.completed).toBe(1);
      expect(readiness.byCategory.governance.total).toBe(1);
    });
  });
});








