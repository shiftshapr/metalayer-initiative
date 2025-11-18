/**
 * Initialize Token Launch Milestones
 * 
 * Run this script to create the initial milestone definitions in the database
 * 
 * Usage: node scripts/init-token-launch-milestones.js
 */

const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const milestones = [
  {
    milestoneKey: 'community_engagement',
    name: 'Community Engagement',
    description: 'Community must reach minimum engagement thresholds',
    category: 'community',
    targetValue: JSON.stringify({
      minTotalMembers: 100,
      minActiveMembers: 50,
      minParticipationRate: 0.3,
      minMessagesCount: 1000,
      minCommunitiesCount: 5
    })
  },
  {
    milestoneKey: 'governance_readiness',
    name: 'Governance Readiness',
    description: 'Governance framework must be established and operational',
    category: 'governance',
    targetValue: JSON.stringify({
      charterRatified: true,
      multisigConfigured: true,
      minSigners: 3,
      quorumRules: 'defined'
    })
  },
  {
    milestoneKey: 'technical_preparedness',
    name: 'Technical Preparedness',
    description: 'All technical systems must be ready and audited',
    category: 'technical',
    targetValue: JSON.stringify({
      contractsAudited: true,
      monitoringDeployed: true,
      testnetTested: true,
      incidentPlanReady: true
    })
  },
  {
    milestoneKey: 'compliance_readiness',
    name: 'Compliance Readiness',
    description: 'Legal and compliance requirements must be met',
    category: 'compliance',
    targetValue: JSON.stringify({
      entityFormed: true,
      termsDrafted: true,
      kycProcedures: 'defined',
      legalCounsel: 'engaged'
    })
  },
  {
    milestoneKey: 'treasury_plan',
    name: 'Treasury Plan',
    description: 'Treasury management plan must be approved',
    category: 'treasury',
    targetValue: JSON.stringify({
      allocationPlan: 'approved',
      budgetCategories: 'defined',
      approvalProcess: 'established',
      dashboardOperational: true
    })
  }
];

async function initMilestones() {
  console.log('Initializing token launch milestones...');

  try {
    for (const milestone of milestones) {
      const existing = await prisma.tokenLaunchMilestone.findUnique({
        where: { milestoneKey: milestone.milestoneKey }
      });

      if (existing) {
        console.log(`Milestone ${milestone.milestoneKey} already exists, skipping...`);
        continue;
      }

      await prisma.tokenLaunchMilestone.create({
        data: milestone
      });

      console.log(`✓ Created milestone: ${milestone.name}`);
    }

    console.log('\nAll milestones initialized successfully!');
  } catch (error) {
    console.error('Error initializing milestones:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

initMilestones();





