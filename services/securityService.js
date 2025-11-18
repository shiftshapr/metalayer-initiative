const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

/**
 * Security Service
 * Manages security monitoring, alerts, and multisig operations
 */
class SecurityService {
  /**
   * Create security alert
   */
  async createAlert(data) {
    return await prisma.securityAlert.create({
      data: {
        ...data,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : null
      }
    });
  }

  /**
   * Get alerts with filters
   */
  async getAlerts(filters = {}) {
    const { alertType, severity, acknowledged, limit = 50, offset = 0 } = filters;

    const where = {};
    if (alertType) where.alertType = alertType;
    if (severity) where.severity = severity;
    if (acknowledged !== undefined) {
      if (acknowledged) {
        where.acknowledgedAt = { not: null };
      } else {
        where.acknowledgedAt = null;
      }
    }

    return await prisma.securityAlert.findMany({
      where,
      include: {
        Acknowledger: {
          select: { id: true, handle: true, name: true }
        }
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset
    });
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId, acknowledgedBy) {
    return await prisma.securityAlert.update({
      where: { id: alertId },
      data: {
        acknowledgedBy,
        acknowledgedAt: new Date()
      }
    });
  }

  /**
   * Resolve alert
   */
  async resolveAlert(alertId) {
    return await prisma.securityAlert.update({
      where: { id: alertId },
      data: {
        resolvedAt: new Date()
      }
    });
  }

  /**
   * Monitor treasury transactions for anomalies
   */
  async monitorTreasuryTransactions() {
    // Get recent large transactions
    const recentTransactions = await prisma.treasuryTransaction.findMany({
      where: {
        created_at: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: { amount: 'desc' }
    });

    const alerts = [];

    // Check for large transactions
    for (const tx of recentTransactions) {
      if (tx.amount > 10000) { // Threshold: $10,000
        alerts.push({
          alertType: 'treasury',
          severity: 'high',
          title: 'Large Treasury Transaction Detected',
          description: `Transaction of ${tx.amount} ${tx.currency} detected`,
          source: 'treasury_monitor',
          metadata: {
            transactionId: tx.id,
            amount: tx.amount,
            currency: tx.currency,
            type: tx.transactionType
          }
        });
      }
    }

    // Create alerts
    for (const alertData of alerts) {
      await this.createAlert(alertData);
    }

    return alerts.length;
  }

  /**
   * Monitor governance proposals for anomalies
   */
  async monitorGovernanceProposals() {
    const recentProposals = await prisma.governanceProposal.findMany({
      where: {
        created_at: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      include: {
        Votes: true
      }
    });

    const alerts = [];

    // Check for proposals with unusual voting patterns
    for (const proposal of recentProposals) {
      if (proposal.Votes.length > 0) {
        const yesVotes = proposal.Votes.filter(v => v.vote === 'yes').length;
        const noVotes = proposal.Votes.filter(v => v.vote === 'no').length;
        
        // Alert if unanimous voting (potential collusion)
        if (yesVotes > 0 && noVotes === 0 && proposal.Votes.length >= 5) {
          alerts.push({
            alertType: 'governance',
            severity: 'medium',
            title: 'Unusual Voting Pattern Detected',
            description: `Proposal "${proposal.title}" has unanimous yes votes`,
            source: 'governance_monitor',
            metadata: {
              proposalId: proposal.id,
              totalVotes: proposal.Votes.length,
              yesVotes,
              noVotes
            }
          });
        }
      }
    }

    for (const alertData of alerts) {
      await this.createAlert(alertData);
    }

    return alerts.length;
  }

  /**
   * Get multisig signers
   */
  async getMultisigSigners() {
    return await prisma.multisigSigner.findMany({
      where: {
        isActive: true
      },
      include: {
        AppUser: {
          select: { id: true, handle: true, name: true, email: true }
        }
      },
      orderBy: { addedAt: 'desc' }
    });
  }

  /**
   * Add multisig signer
   */
  async addMultisigSigner(userId, walletAddress, role = 'signer', notes = null) {
    return await prisma.multisigSigner.create({
      data: {
        userId,
        walletAddress,
        role,
        notes
      }
    });
  }

  /**
   * Remove multisig signer
   */
  async removeMultisigSigner(signerId) {
    return await prisma.multisigSigner.update({
      where: { id: signerId },
      data: {
        isActive: false,
        removedAt: new Date()
      }
    });
  }

  /**
   * Run security monitoring checks
   */
  async runMonitoringChecks() {
    const results = {
      treasuryAlerts: 0,
      governanceAlerts: 0,
      timestamp: new Date()
    };

    try {
      results.treasuryAlerts = await this.monitorTreasuryTransactions();
    } catch (error) {
      console.error('Error monitoring treasury:', error);
    }

    try {
      results.governanceAlerts = await this.monitorGovernanceProposals();
    } catch (error) {
      console.error('Error monitoring governance:', error);
    }

    return results;
  }
}

module.exports = new SecurityService();





