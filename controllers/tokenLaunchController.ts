/**
 * Token Launch Controller - TypeScript
 * Handles all token launch related API endpoints
 */

import { Request, Response } from 'express';
import milestoneService from '../services/token-launch/milestoneService';
import communityMetricsService from '../services/token-launch/communityMetricsService';
import type { ApiResponse } from '../services/token-launch/types';

// Extend Express Request to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

class TokenLaunchController {
  // ========== Milestone Endpoints ==========
  
  async getMilestones(req: Request, res: Response<ApiResponse>) {
    try {
      const milestones = await milestoneService.getAllMilestones();
      res.json({ success: true, data: milestones });
    } catch (error: any) {
      console.error('Error fetching milestones:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getMilestone(req: Request, res: Response<ApiResponse>) {
    try {
      const { key } = req.params;
      const milestone = await milestoneService.getMilestoneByKey(key);
      if (!milestone) {
        return res.status(404).json({ success: false, error: 'Milestone not found' });
      }
      res.json({ success: true, data: milestone });
    } catch (error: any) {
      console.error('Error fetching milestone:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getLaunchReadiness(req: Request, res: Response<ApiResponse>) {
    try {
      const readiness = await milestoneService.getLaunchReadiness();
      res.json({ success: true, data: readiness });
    } catch (error: any) {
      console.error('Error fetching launch readiness:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateMilestone(req: AuthenticatedRequest, res: Response<ApiResponse>) {
    try {
      const { key } = req.params;
      const { isComplete, evidenceData } = req.body;
      const verifiedBy = req.user?.id || null;

      const milestone = await milestoneService.updateMilestoneStatus(
        key,
        isComplete,
        verifiedBy,
        evidenceData
      );
      res.json({ success: true, data: milestone });
    } catch (error: any) {
      console.error('Error updating milestone:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async addAttestation(req: AuthenticatedRequest, res: Response<ApiResponse>) {
    try {
      const { milestoneId } = req.params;
      const { signature, evidenceData } = req.body;
      const attestorId = req.user?.id;

      if (!attestorId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const attestation = await milestoneService.addAttestation({
        milestoneId,
        attestorId,
        signature,
        evidenceData
      });
      res.json({ success: true, data: attestation });
    } catch (error: any) {
      console.error('Error adding attestation:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ========== Community Metrics Endpoints ==========

  async getMetrics(req: Request, res: Response<ApiResponse>) {
    try {
      const metrics = await communityMetricsService.getMetricsForMilestone();
      res.json({ success: true, data: metrics });
    } catch (error: any) {
      console.error('Error fetching metrics:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getMetricsHistory(req: Request, res: Response<ApiResponse>) {
    try {
      const { days = '30' } = req.query;
      const history = await communityMetricsService.getMetricsHistory(parseInt(days as string));
      res.json({ success: true, data: history });
    } catch (error: any) {
      console.error('Error fetching metrics history:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async checkEngagementMilestone(req: Request, res: Response<ApiResponse>) {
    try {
      const result = await communityMetricsService.checkEngagementMilestone();
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Error checking engagement milestone:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async calculateMetrics(req: Request, res: Response<ApiResponse>) {
    try {
      const metrics = await communityMetricsService.calculateAndStoreMetrics();
      res.json({ success: true, data: metrics });
    } catch (error: any) {
      console.error('Error calculating metrics:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default new TokenLaunchController();








