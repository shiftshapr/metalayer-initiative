/**
 * Dynamic Pricing Controller - TypeScript
 * Handles dynamic pricing API endpoints
 */

import { Request, Response } from 'express';
import dynamicPricingService from '../services/token-launch/dynamicPricingService';
import type { ApiResponse, DynamicPricingConfig, PricingOptimizationData } from '../services/token-launch/types';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

class DynamicPricingController {
  /**
   * Get pricing config for a resource
   */
  async getPricingConfig(req: Request, res: Response<ApiResponse>) {
    try {
      const { resourceType, resourceId } = req.query;
      const config = await dynamicPricingService.getPricingConfig(
        resourceType as string,
        resourceId as string | undefined
      );
      res.json({ success: true, data: config });
    } catch (error: any) {
      console.error('Error fetching pricing config:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Create or update pricing config
   */
  async upsertPricingConfig(req: Request, res: Response<ApiResponse>) {
    try {
      const config = req.body as DynamicPricingConfig;
      const result = await dynamicPricingService.upsertPricingConfig(config);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Error upserting pricing config:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get current resource usage
   */
  async getCurrentUsage(req: Request, res: Response<ApiResponse>) {
    try {
      const { resourceType, resourceId } = req.query;
      const usage = await dynamicPricingService.getCurrentUsage(
        resourceType as string,
        resourceId as string | undefined
      );
      res.json({ success: true, data: usage });
    } catch (error: any) {
      console.error('Error fetching current usage:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Calculate cost for accessing a resource
   */
  async calculateCost(req: AuthenticatedRequest, res: Response<ApiResponse>) {
    try {
      const { resourceType, resourceId } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const costCalc = await dynamicPricingService.calculateCost(
        resourceType as string,
        resourceId as string | undefined,
        userId
      );
      res.json({ success: true, data: costCalc });
    } catch (error: any) {
      console.error('Error calculating cost:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Check if user can access resource
   */
  async checkAccess(req: AuthenticatedRequest, res: Response<ApiResponse>) {
    try {
      const { resourceType, resourceId } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const access = await dynamicPricingService.checkAccess(
        resourceType as string,
        resourceId as string | undefined,
        userId
      );
      res.json({ success: true, data: access });
    } catch (error: any) {
      console.error('Error checking access:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Request resource access (charge and record usage)
   */
  async requestAccess(req: AuthenticatedRequest, res: Response<ApiResponse>) {
    try {
      const { resourceType, resourceId, duration } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      // Check access and calculate cost
      const access = await dynamicPricingService.checkAccess(
        resourceType,
        resourceId,
        userId
      );

      if (!access.allowed) {
        return res.status(403).json({
          success: false,
          error: access.reason || 'Access denied',
          data: { cost: access.cost }
        });
      }

      // Charge user
      await dynamicPricingService.chargeForAccess(
        resourceType,
        resourceId,
        userId,
        access.cost
      );

      // Record usage
      const usage = await dynamicPricingService.recordUsage(
        resourceType,
        resourceId,
        userId,
        duration
      );

      res.json({
        success: true,
        data: {
          usage,
          cost: access.cost,
          accessGranted: true
        }
      });
    } catch (error: any) {
      console.error('Error requesting access:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * End resource usage
   */
  async endUsage(req: AuthenticatedRequest, res: Response<ApiResponse>) {
    try {
      const { usageId } = req.params;
      await dynamicPricingService.endUsage(usageId);
      res.json({ success: true, data: { ended: true } });
    } catch (error: any) {
      console.error('Error ending usage:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Collect optimization data
   */
  async collectOptimizationData(req: Request, res: Response<ApiResponse>) {
    try {
      const { resourceType, resourceId, ...data } = req.body;
      await dynamicPricingService.collectOptimizationData(
        resourceType,
        resourceId,
        data as PricingOptimizationData
      );
      res.json({ success: true, data: { collected: true } });
    } catch (error: any) {
      console.error('Error collecting optimization data:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Optimize pricing based on historical data
   */
  async optimizePricing(req: Request, res: Response<ApiResponse>) {
    try {
      const { resourceType, resourceId, lookbackDays } = req.query;
      const optimized = await dynamicPricingService.optimizePricing(
        resourceType as string,
        resourceId as string | undefined,
        lookbackDays ? parseInt(lookbackDays as string) : 7
      );
      res.json({ success: true, data: optimized });
    } catch (error: any) {
      console.error('Error optimizing pricing:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default new DynamicPricingController();






