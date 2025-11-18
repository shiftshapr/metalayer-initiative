/**
 * Dynamic Pricing Service - TypeScript
 * Manages dynamic token-based pricing that scales with demand and availability
 */

import { PrismaClient } from '../../generated/prisma';
import type {
  DynamicPricingConfig,
  ResourceUsage,
  PricingTier,
  CostCalculation,
  PricingOptimizationData
} from './types';

const prisma = new PrismaClient();

class DynamicPricingService {
  /**
   * Get or create pricing config for a resource
   */
  async getPricingConfig(resourceType: string, resourceId?: string): Promise<DynamicPricingConfig | null> {
    const config = await prisma.dynamicPricingConfig.findFirst({
      where: {
        resourceType,
        resourceId: resourceId || null
      }
    });

    return config;
  }

  /**
   * Create or update pricing config
   */
  async upsertPricingConfig(config: DynamicPricingConfig): Promise<any> {
    const { resourceType, resourceId, ...data } = config;

    return await prisma.dynamicPricingConfig.upsert({
      where: {
        resourceType_resourceId: {
          resourceType,
          resourceId: resourceId || null
        }
      },
      update: {
        ...data,
        updated_at: new Date()
      },
      create: {
        resourceType,
        resourceId: resourceId || null,
        ...data
      }
    });
  }

  /**
   * Get current resource usage
   */
  async getCurrentUsage(resourceType: string, resourceId?: string): Promise<ResourceUsage> {
    // Get active usage records
    const activeUsage = await prisma.resourceUsage.findMany({
      where: {
        resourceType,
        resourceId: resourceId || null,
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    const currentCount = activeUsage.length;
    const userIds = activeUsage.map(u => u.userId);

    return {
      resourceType,
      resourceId,
      currentCount,
      maxCapacity: 0, // Will be set from config
      userIds,
      timestamp: new Date()
    };
  }

  /**
   * Calculate cost for accessing a resource
   */
  async calculateCost(
    resourceType: string,
    resourceId: string | undefined,
    userId: string
  ): Promise<CostCalculation> {
    const config = await this.getPricingConfig(resourceType, resourceId);
    if (!config) {
      // Default: free if no config
      return {
        cost: 0,
        tier: 'free',
        reason: 'no_pricing_config'
      };
    }

    const usage = await this.getCurrentUsage(resourceType, resourceId);
    const currentCount = usage.currentCount;

    // Check if user is already using the resource (free)
    if (usage.userIds.includes(userId)) {
      return {
        cost: 0,
        tier: 'free',
        reason: 'already_active'
      };
    }

    // Check if within free tier
    if (currentCount < config.freeTierLimit) {
      return {
        cost: 0,
        tier: 'free',
        reason: 'within_free_tier',
        currentUsage: currentCount,
        freeLimit: config.freeTierLimit
      };
    }

    // Check if at capacity
    if (currentCount >= config.maxCapacity) {
      return {
        cost: Infinity,
        tier: 'unavailable',
        reason: 'at_capacity',
        currentUsage: currentCount,
        maxCapacity: config.maxCapacity
      };
    }

    // Calculate cost based on current usage and pricing tiers
    const cost = this.calculateTieredCost(
      currentCount,
      config.freeTierLimit,
      config.maxCapacity,
      config.pricingTiers
    );

    return {
      cost,
      tier: this.getTierForUsage(currentCount, config.freeTierLimit, config.pricingTiers),
      reason: 'dynamic_pricing',
      currentUsage: currentCount,
      freeLimit: config.freeTierLimit,
      maxCapacity: config.maxCapacity,
      nextTierCost: this.getNextTierCost(currentCount, config.pricingTiers)
    };
  }

  /**
   * Calculate tiered cost based on usage
   */
  calculateTieredCost(
    currentCount: number,
    freeLimit: number,
    maxCapacity: number,
    tiers: PricingTier[]
  ): number {
    // Sort tiers by startUsage
    const sortedTiers = [...tiers].sort((a, b) => a.startUsage - b.startUsage);

    // Find applicable tier
    for (let i = sortedTiers.length - 1; i >= 0; i--) {
      const tier = sortedTiers[i];
      if (currentCount >= tier.startUsage) {
        // Calculate cost: base cost + (usage over tier start) * cost per unit
        const usageOverTier = currentCount - tier.startUsage;
        return tier.baseCost + (usageOverTier * tier.costPerUnit);
      }
    }

    // Default: exponential cost increase
    const usageOverFree = currentCount - freeLimit;
    const baseCost = 1.0; // Starting cost after free tier
    return baseCost * Math.pow(1.5, usageOverFree);
  }

  /**
   * Get tier name for current usage
   */
  getTierForUsage(
    currentCount: number,
    freeLimit: number,
    tiers: PricingTier[]
  ): string {
    if (currentCount < freeLimit) return 'free';

    const sortedTiers = [...tiers].sort((a, b) => a.startUsage - b.startUsage);
    for (let i = sortedTiers.length - 1; i >= 0; i--) {
      if (currentCount >= sortedTiers[i].startUsage) {
        return sortedTiers[i].name;
      }
    }

    return 'premium';
  }

  /**
   * Get cost for next tier
   */
  getNextTierCost(currentCount: number, tiers: PricingTier[]): number | null {
    const sortedTiers = [...tiers].sort((a, b) => a.startUsage - b.startUsage);
    
    for (const tier of sortedTiers) {
      if (currentCount < tier.startUsage) {
        return tier.baseCost;
      }
    }

    return null;
  }

  /**
   * Record resource usage
   */
  async recordUsage(
    resourceType: string,
    resourceId: string | undefined,
    userId: string,
    duration?: number
  ): Promise<any> {
    const expiresAt = duration 
      ? new Date(Date.now() + duration * 1000)
      : new Date(Date.now() + 60 * 60 * 1000); // Default 1 hour

    // Check if user already has active usage
    const existing = await prisma.resourceUsage.findFirst({
      where: {
        resourceType,
        resourceId: resourceId || null,
        userId,
        isActive: true
      }
    });

    if (existing) {
      // Update existing usage
      return await prisma.resourceUsage.update({
        where: { id: existing.id },
        data: {
          expiresAt,
          updated_at: new Date()
        }
      });
    }

    // Create new usage record
    return await prisma.resourceUsage.create({
      data: {
        resourceType,
        resourceId: resourceId || null,
        userId,
        expiresAt,
        isActive: true
      }
    });
  }

  /**
   * End resource usage
   */
  async endUsage(usageId: string): Promise<void> {
    await prisma.resourceUsage.update({
      where: { id: usageId },
      data: {
        isActive: false,
        endedAt: new Date()
      }
    });
  }

  /**
   * Collect pricing optimization data
   */
  async collectOptimizationData(
    resourceType: string,
    resourceId: string | undefined,
    data: PricingOptimizationData
  ): Promise<void> {
    await prisma.pricingOptimizationData.create({
      data: {
        resourceType,
        resourceId: resourceId || null,
        timestamp: new Date(),
        currentUsage: data.currentUsage,
        currentCost: data.currentCost,
        demandLevel: data.demandLevel,
        availabilityLevel: data.availabilityLevel,
        conversionRate: data.conversionRate,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : null
      }
    });
  }

  /**
   * Optimize pricing based on historical data
   */
  async optimizePricing(
    resourceType: string,
    resourceId: string | undefined,
    lookbackDays: number = 7
  ): Promise<DynamicPricingConfig | null> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - lookbackDays);

    // Get historical data
    const historicalData = await prisma.pricingOptimizationData.findMany({
      where: {
        resourceType,
        resourceId: resourceId || null,
        timestamp: {
          gte: startDate
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    if (historicalData.length === 0) {
      return null;
    }

    // Analyze data to optimize pricing
    const avgUsage = historicalData.reduce((sum, d) => sum + d.currentUsage, 0) / historicalData.length;
    const avgCost = historicalData.reduce((sum, d) => sum + d.currentCost, 0) / historicalData.length;
    const avgDemand = historicalData.reduce((sum, d) => sum + d.demandLevel, 0) / historicalData.length;
    const avgAvailability = historicalData.reduce((sum, d) => sum + d.availabilityLevel, 0) / historicalData.length;
    const avgConversion = historicalData.reduce((sum, d) => sum + (d.conversionRate || 0), 0) / historicalData.length;

    // Get current config
    const currentConfig = await this.getPricingConfig(resourceType, resourceId);
    if (!currentConfig) return null;

    // Optimize based on data
    const optimizedConfig: Partial<DynamicPricingConfig> = { ...currentConfig };

    // If demand is high and availability is low, increase costs
    if (avgDemand > 0.7 && avgAvailability < 0.3) {
      // Increase base costs
      optimizedConfig.pricingTiers = currentConfig.pricingTiers.map(tier => ({
        ...tier,
        baseCost: tier.baseCost * 1.2,
        costPerUnit: tier.costPerUnit * 1.15
      }));
    }

    // If demand is low and availability is high, decrease costs
    if (avgDemand < 0.3 && avgAvailability > 0.7) {
      optimizedConfig.pricingTiers = currentConfig.pricingTiers.map(tier => ({
        ...tier,
        baseCost: Math.max(tier.baseCost * 0.9, 0.1),
        costPerUnit: Math.max(tier.costPerUnit * 0.9, 0.1)
      }));
    }

    // Adjust free tier limit based on conversion rate
    if (avgConversion < 0.5 && currentConfig.freeTierLimit > 1) {
      optimizedConfig.freeTierLimit = Math.max(1, currentConfig.freeTierLimit - 1);
    } else if (avgConversion > 0.8 && avgUsage < currentConfig.maxCapacity * 0.8) {
      optimizedConfig.freeTierLimit = Math.min(
        currentConfig.maxCapacity * 0.2,
        currentConfig.freeTierLimit + 1
      );
    }

    // Update config
    return await this.upsertPricingConfig(optimizedConfig as DynamicPricingConfig);
  }

  /**
   * Check if user can access resource (has tokens and cost is acceptable)
   */
  async checkAccess(
    resourceType: string,
    resourceId: string | undefined,
    userId: string
  ): Promise<{ allowed: boolean; cost: number; reason?: string }> {
    const costCalc = await this.calculateCost(resourceType, resourceId, userId);

    if (costCalc.cost === 0) {
      return { allowed: true, cost: 0 };
    }

    if (costCalc.cost === Infinity) {
      return { allowed: false, cost: Infinity, reason: 'at_capacity' };
    }

    // Check user token balance
    const userBalance = await prisma.userTokenBalance.findUnique({
      where: { userId }
    });

    if (!userBalance || userBalance.balance < costCalc.cost) {
      return {
        allowed: false,
        cost: costCalc.cost,
        reason: 'insufficient_tokens'
      };
    }

    return { allowed: true, cost: costCalc.cost };
  }

  /**
   * Charge user for resource access
   */
  async chargeForAccess(
    resourceType: string,
    resourceId: string | undefined,
    userId: string,
    cost: number
  ): Promise<void> {
    if (cost === 0) return;

    // Deduct from user balance
    await prisma.userTokenBalance.update({
      where: { userId },
      data: {
        balance: {
          decrement: cost
        },
        updated_at: new Date()
      }
    });

    // Record transaction (if treasury system is available)
    // Note: This requires TreasuryTransaction model to exist
    try {
      await prisma.treasuryTransaction.create({
        data: {
          transactionType: 'expense',
          category: 'resource_access',
          amount: cost,
          currency: 'tokens',
          description: `Resource access: ${resourceType}${resourceId ? ` (${resourceId})` : ''}`,
          status: 'executed',
          executedBy: userId,
          executed_at: new Date(),
          metadata: {
            resourceType,
            resourceId,
            userId
          }
        }
      });
    } catch (error) {
      // TreasuryTransaction model may not exist yet
      console.warn('Could not record treasury transaction:', error);
    }
  }
}

export default new DynamicPricingService();

