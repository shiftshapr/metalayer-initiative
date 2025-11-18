const milestoneService = require('../services/milestoneService');
const communityMetricsService = require('../services/communityMetricsService');
const governanceService = require('../services/governanceService');
const treasuryService = require('../services/treasuryService');
const tokenUtilityService = require('../services/tokenUtilityService');
const securityService = require('../services/securityService');

/**
 * Token Launch Controller
 * Handles all token launch related API endpoints
 */
class TokenLaunchController {
  // ========== Milestone Endpoints ==========
  
  async getMilestones(req, res) {
    try {
      const milestones = await milestoneService.getAllMilestones();
      res.json({ success: true, data: milestones });
    } catch (error) {
      console.error('Error fetching milestones:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getMilestone(req, res) {
    try {
      const { key } = req.params;
      const milestone = await milestoneService.getMilestoneByKey(key);
      if (!milestone) {
        return res.status(404).json({ success: false, error: 'Milestone not found' });
      }
      res.json({ success: true, data: milestone });
    } catch (error) {
      console.error('Error fetching milestone:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getLaunchReadiness(req, res) {
    try {
      const readiness = await milestoneService.getLaunchReadiness();
      res.json({ success: true, data: readiness });
    } catch (error) {
      console.error('Error fetching launch readiness:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateMilestone(req, res) {
    try {
      const { key } = req.params;
      const { isComplete, evidenceData } = req.body;
      const verifiedBy = req.user?.id; // Assuming auth middleware sets req.user

      const milestone = await milestoneService.updateMilestoneStatus(
        key,
        isComplete,
        verifiedBy,
        evidenceData
      );
      res.json({ success: true, data: milestone });
    } catch (error) {
      console.error('Error updating milestone:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async addAttestation(req, res) {
    try {
      const { milestoneId } = req.params;
      const { signature, evidenceData } = req.body;
      const attestorId = req.user?.id;

      const attestation = await milestoneService.addAttestation(
        milestoneId,
        attestorId,
        signature,
        evidenceData
      );
      res.json({ success: true, data: attestation });
    } catch (error) {
      console.error('Error adding attestation:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ========== Community Metrics Endpoints ==========

  async getMetrics(req, res) {
    try {
      const metrics = await communityMetricsService.getMetricsForMilestone();
      res.json({ success: true, data: metrics });
    } catch (error) {
      console.error('Error fetching metrics:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getMetricsHistory(req, res) {
    try {
      const { days = 30 } = req.query;
      const history = await communityMetricsService.getMetricsHistory(parseInt(days));
      res.json({ success: true, data: history });
    } catch (error) {
      console.error('Error fetching metrics history:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async checkEngagementMilestone(req, res) {
    try {
      const result = await communityMetricsService.checkEngagementMilestone();
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error checking engagement milestone:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async calculateMetrics(req, res) {
    try {
      const metrics = await communityMetricsService.calculateAndStoreMetrics();
      res.json({ success: true, data: metrics });
    } catch (error) {
      console.error('Error calculating metrics:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ========== Governance Endpoints ==========

  async getProposals(req, res) {
    try {
      const proposals = await governanceService.getProposals(req.query);
      res.json({ success: true, data: proposals });
    } catch (error) {
      console.error('Error fetching proposals:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getProposal(req, res) {
    try {
      const { id } = req.params;
      const proposal = await governanceService.getProposal(id);
      if (!proposal) {
        return res.status(404).json({ success: false, error: 'Proposal not found' });
      }
      res.json({ success: true, data: proposal });
    } catch (error) {
      console.error('Error fetching proposal:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createProposal(req, res) {
    try {
      const proposerId = req.user?.id;
      const proposal = await governanceService.createProposal({
        ...req.body,
        proposerId
      });
      res.status(201).json({ success: true, data: proposal });
    } catch (error) {
      console.error('Error creating proposal:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async castVote(req, res) {
    try {
      const { id } = req.params;
      const { vote, votingPower, rationale } = req.body;
      const voterId = req.user?.id;

      const voteRecord = await governanceService.castVote(
        id,
        voterId,
        vote,
        votingPower,
        rationale
      );
      res.json({ success: true, data: voteRecord });
    } catch (error) {
      console.error('Error casting vote:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getProposalResults(req, res) {
    try {
      const { id } = req.params;
      const results = await governanceService.getProposalResults(id);
      res.json({ success: true, data: results });
    } catch (error) {
      console.error('Error fetching proposal results:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ========== Treasury Endpoints ==========

  async getTreasurySummary(req, res) {
    try {
      const summary = await treasuryService.getTreasurySummary();
      res.json({ success: true, data: summary });
    } catch (error) {
      console.error('Error fetching treasury summary:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getTreasuryTransactions(req, res) {
    try {
      const transactions = await treasuryService.getTransactionHistory(req.query);
      res.json({ success: true, data: transactions });
    } catch (error) {
      console.error('Error fetching treasury transactions:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createTransaction(req, res) {
    try {
      const transaction = await treasuryService.createTransaction(req.body);
      res.status(201).json({ success: true, data: transaction });
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async approveTransaction(req, res) {
    try {
      const { id } = req.params;
      const approvedBy = req.user?.id;
      const transaction = await treasuryService.approveTransaction(id, approvedBy);
      res.json({ success: true, data: transaction });
    } catch (error) {
      console.error('Error approving transaction:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async executeTransaction(req, res) {
    try {
      const { id } = req.params;
      const { executionHash } = req.body;
      const executedBy = req.user?.id;
      const transaction = await treasuryService.executeTransaction(id, executedBy, executionHash);
      res.json({ success: true, data: transaction });
    } catch (error) {
      console.error('Error executing transaction:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ========== Token Utility Endpoints ==========

  async getTokenUtilities(req, res) {
    try {
      const utilities = await tokenUtilityService.getUtilities(req.query);
      res.json({ success: true, data: utilities });
    } catch (error) {
      console.error('Error fetching token utilities:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async checkAccess(req, res) {
    try {
      const { utilityType, targetType, targetId } = req.query;
      const userId = req.user?.id;

      const access = await tokenUtilityService.checkUserAccess(
        userId,
        utilityType,
        targetType,
        targetId
      );
      res.json({ success: true, data: access });
    } catch (error) {
      console.error('Error checking access:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getUserBalance(req, res) {
    try {
      const { userId } = req.params;
      const balance = await tokenUtilityService.getUserBalance(userId);
      res.json({ success: true, data: balance });
    } catch (error) {
      console.error('Error fetching user balance:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async syncUserBalance(req, res) {
    try {
      const { userId } = req.params;
      const { walletAddress } = req.body;
      const balance = await tokenUtilityService.syncUserBalance(userId, walletAddress);
      res.json({ success: true, data: balance });
    } catch (error) {
      console.error('Error syncing user balance:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ========== Security Endpoints ==========

  async getSecurityAlerts(req, res) {
    try {
      const alerts = await securityService.getAlerts(req.query);
      res.json({ success: true, data: alerts });
    } catch (error) {
      console.error('Error fetching security alerts:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async acknowledgeAlert(req, res) {
    try {
      const { id } = req.params;
      const acknowledgedBy = req.user?.id;
      const alert = await securityService.acknowledgeAlert(id, acknowledgedBy);
      res.json({ success: true, data: alert });
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getMultisigSigners(req, res) {
    try {
      const signers = await securityService.getMultisigSigners();
      res.json({ success: true, data: signers });
    } catch (error) {
      console.error('Error fetching multisig signers:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async runMonitoring(req, res) {
    try {
      const results = await securityService.runMonitoringChecks();
      res.json({ success: true, data: results });
    } catch (error) {
      console.error('Error running monitoring:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new TokenLaunchController();





