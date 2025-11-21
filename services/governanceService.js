const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

/**
 * Governance Service
 * Manages governance proposals, voting, and execution
 */
class GovernanceService {
  /**
   * Create a new governance proposal
   */
  async createProposal(data) {
    const { proposerId, title, description, proposalType, votingStart, votingEnd, ...rest } = data;

    return await prisma.governanceProposal.create({
      data: {
        proposerId,
        title,
        description,
        proposalType,
        votingStart: votingStart ? new Date(votingStart) : null,
        votingEnd: votingEnd ? new Date(votingEnd) : null,
        executionData: rest.executionData ? JSON.parse(JSON.stringify(rest.executionData)) : null,
        ...rest
      }
    });
  }

  /**
   * Get proposal by ID
   */
  async getProposal(proposalId) {
    return await prisma.governanceProposal.findUnique({
      where: { id: proposalId },
      include: {
        Votes: {
          include: {
            AppUser: {
              select: { id: true, handle: true, name: true }
            }
          }
        },
        AppUser: {
          select: { id: true, handle: true, name: true }
        }
      }
    });
  }

  /**
   * Get all proposals with filters
   */
  async getProposals(filters = {}) {
    const { status, proposalType, limit = 50, offset = 0 } = filters;

    const where = {};
    if (status) where.status = status;
    if (proposalType) where.proposalType = proposalType;

    return await prisma.governanceProposal.findMany({
      where,
      include: {
        Votes: true,
        AppUser: {
          select: { id: true, handle: true, name: true }
        }
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset
    });
  }

  /**
   * Cast a vote on a proposal
   */
  async castVote(proposalId, voterId, vote, votingPower = null, rationale = null) {
    // Check if user already voted
    const existingVote = await prisma.governanceVote.findUnique({
      where: {
        proposalId_voterId: {
          proposalId,
          voterId
        }
      }
    });

    if (existingVote) {
      // Update existing vote
      return await prisma.governanceVote.update({
        where: { id: existingVote.id },
        data: {
          vote,
          votingPower,
          rationale,
          created_at: new Date() // Update timestamp
        }
      });
    }

    // Create new vote
    return await prisma.governanceVote.create({
      data: {
        proposalId,
        voterId,
        vote,
        votingPower,
        rationale
      }
    });
  }

  /**
   * Get proposal voting results
   */
  async getProposalResults(proposalId) {
    const proposal = await this.getProposal(proposalId);
    if (!proposal) return null;

    const votes = proposal.Votes || [];
    const totalVotes = votes.length;
    const yesVotes = votes.filter(v => v.vote === 'yes').length;
    const noVotes = votes.filter(v => v.vote === 'no').length;
    const abstainVotes = votes.filter(v => v.vote === 'abstain').length;

    // Calculate weighted voting if votingPower is available
    let totalVotingPower = 0;
    let yesPower = 0;
    let noPower = 0;

    votes.forEach(vote => {
      const power = vote.votingPower || 1;
      totalVotingPower += power;
      if (vote.vote === 'yes') yesPower += power;
      if (vote.vote === 'no') noPower += power;
    });

    const approvalRate = totalVotingPower > 0 ? yesPower / totalVotingPower : 0;
    const participationRate = proposal.quorumThreshold 
      ? totalVotingPower / (proposal.quorumThreshold * 100) // Assuming quorum is percentage
      : null;

    const meetsQuorum = proposal.quorumThreshold 
      ? participationRate >= proposal.quorumThreshold
      : true;

    const meetsApproval = proposal.approvalThreshold
      ? approvalRate >= proposal.approvalThreshold
      : yesVotes > noVotes;

    return {
      proposal,
      summary: {
        totalVotes,
        yesVotes,
        noVotes,
        abstainVotes,
        totalVotingPower,
        yesPower,
        noPower,
        approvalRate,
        participationRate,
        meetsQuorum,
        meetsApproval,
        shouldPass: meetsQuorum && meetsApproval
      }
    };
  }

  /**
   * Update proposal status
   */
  async updateProposalStatus(proposalId, status, executedBy = null) {
    const updateData = {
      status,
      updated_at: new Date()
    };

    if (status === 'executed' && executedBy) {
      updateData.executedBy = executedBy;
      updateData.executedAt = new Date();
    }

    return await prisma.governanceProposal.update({
      where: { id: proposalId },
      data: updateData
    });
  }

  /**
   * Start voting on a proposal
   */
  async startVoting(proposalId, votingStart, votingEnd, snapshotBlock = null) {
    return await prisma.governanceProposal.update({
      where: { id: proposalId },
      data: {
        status: 'active',
        votingStart: new Date(votingStart),
        votingEnd: new Date(votingEnd),
        snapshotBlock: snapshotBlock ? BigInt(snapshotBlock) : null,
        updated_at: new Date()
      }
    });
  }

  /**
   * Check and update proposal statuses (for expired votes, etc.)
   */
  async checkProposalStatuses() {
    const now = new Date();
    
    // Find active proposals that have expired
    const expiredProposals = await prisma.governanceProposal.findMany({
      where: {
        status: 'active',
        votingEnd: {
          lte: now
        }
      }
    });

    for (const proposal of expiredProposals) {
      const results = await this.getProposalResults(proposal.id);
      const newStatus = results.summary.shouldPass ? 'passed' : 'rejected';
      
      await this.updateProposalStatus(proposal.id, newStatus);
    }

    return expiredProposals.length;
  }
}

module.exports = new GovernanceService();









