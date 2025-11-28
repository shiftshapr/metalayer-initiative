/**
 * Initialize Cursor Pricing Configuration
 * 
 * Sets up dynamic pricing for cursor presence on pages
 * - First 3 cursors: FREE
 * - Max 25 cursors per page
 * - Cost increases as more cursors join
 * 
 * Usage: node scripts/init-cursor-pricing.js
 */

const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const cursorPricingConfig = {
  resourceType: 'cursor',
  resourceId: null, // Global config (can be overridden per page)
  freeTierLimit: 3,
  maxCapacity: 25,
  pricingTiers: [
    {
      name: 'tier_1',
      startUsage: 3, // After 3 free users
      baseCost: 1.0, // 1 token
      costPerUnit: 0.5 // +0.5 tokens per additional cursor
    },
    {
      name: 'tier_2',
      startUsage: 10, // After 10 users
      baseCost: 5.0, // 5 tokens
      costPerUnit: 1.0 // +1 token per additional cursor
    },
    {
      name: 'tier_3',
      startUsage: 20, // After 20 users
      baseCost: 15.0, // 15 tokens
      costPerUnit: 2.0 // +2 tokens per additional cursor
    }
  ],
  optimizationEnabled: true,
  metadata: {
    description: 'Dynamic pricing for cursor presence on pages',
    example: 'First 3 cursors free, then cost increases with demand'
  }
};

async function initCursorPricing() {
  console.log('Initializing cursor pricing configuration...');

  try {
    // Check if config already exists
    const existing = await prisma.dynamicPricingConfig.findFirst({
      where: {
        resourceType: 'cursor',
        resourceId: null
      }
    });

    if (existing) {
      console.log('Cursor pricing config already exists, updating...');
      await prisma.dynamicPricingConfig.update({
        where: { id: existing.id },
        data: {
          ...cursorPricingConfig,
          pricingTiers: JSON.parse(JSON.stringify(cursorPricingConfig.pricingTiers)),
          metadata: JSON.parse(JSON.stringify(cursorPricingConfig.metadata)),
          updated_at: new Date()
        }
      });
      console.log('✓ Cursor pricing config updated');
    } else {
      await prisma.dynamicPricingConfig.create({
        data: {
          ...cursorPricingConfig,
          pricingTiers: JSON.parse(JSON.stringify(cursorPricingConfig.pricingTiers)),
          metadata: JSON.parse(JSON.stringify(cursorPricingConfig.metadata))
        }
      });
      console.log('✓ Cursor pricing config created');
    }

    console.log('\nConfiguration:');
    console.log(`  Free tier: ${cursorPricingConfig.freeTierLimit} cursors`);
    console.log(`  Max capacity: ${cursorPricingConfig.maxCapacity} cursors`);
    console.log(`  Pricing tiers: ${cursorPricingConfig.pricingTiers.length}`);
    console.log('\n✓ Cursor pricing initialized successfully!');
  } catch (error) {
    console.error('Error initializing cursor pricing:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

initCursorPricing();











