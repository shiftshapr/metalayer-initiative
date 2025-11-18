/**
 * Token Launch Type Definitions
 * TypeScript interfaces for token launch system
 */

import { PrismaClient } from '../generated/prisma';

// Re-export Prisma types
export type PrismaClientType = PrismaClient;

// ========== Milestone Types ==========

export interface MilestoneData {
  milestoneKey: string;
  name: string;
  description?: string;
  category: 'community' | 'governance' | 'technical' | 'compliance' | 'treasury';
  targetValue?: string | Record<string, any>;
  currentValue?: string | Record<string, any>;
  isComplete?: boolean;
  evidenceUrl?: string;
  evidenceHash?: string;
  verifiedBy?: string;
  verifiedAt?: Date;
}

export interface MilestoneAttestationData {
  milestoneId: string;
  attestorId: string;
  signature: string;
  publicKey?: string;
  evidenceData?: Record<string, any>;
  evidenceUrl?: string;
}

export interface LaunchReadiness {
  allCompleted: boolean;
  overallPercentage: number;
  byCategory: Record<string, {
    completed: number;
    total: number;
    percentage: number;
  }>;
  milestones: any[];
}

// ========== Community Metrics Types ==========

export interface CommunityMetricsData {
  totalMembers: number;
  activeMembers: number;
  participationRate: number;
  messagesCount: number;
  communitiesCount: number;
  groupsCount: number;
  metadata?: Record<string, any>;
}

export interface EngagementMilestoneCheck {
  met: boolean;
  checks: {
    totalMembers: boolean;
    activeMembers: boolean;
    participationRate: boolean;
    messagesCount: boolean;
    communitiesCount: boolean;
  };
  metrics: CommunityMetricsData;
  thresholds: {
    minTotalMembers: number;
    minActiveMembers: number;
    minParticipationRate: number;
    minMessagesCount: number;
    minCommunitiesCount: number;
  };
}

// ========== Governance Types ==========

export type ProposalType = 'treasury' | 'parameter' | 'upgrade' | 'general';
export type ProposalStatus = 'draft' | 'active' | 'passed' | 'rejected' | 'executed';
export type VoteType = 'yes' | 'no' | 'abstain';

export interface GovernanceProposalData {
  title: string;
  description: string;
  proposalType: ProposalType;
  proposerId: string;
  status?: ProposalStatus;
  votingStart?: Date | string;
  votingEnd?: Date | string;
  quorumThreshold?: number;
  approvalThreshold?: number;
  snapshotBlock?: bigint | string;
  executionData?: Record<string, any>;
}

export interface GovernanceVoteData {
  proposalId: string;
  voterId: string;
  vote: VoteType;
  votingPower?: number;
  rationale?: string;
}

export interface ProposalResults {
  proposal: any;
  summary: {
    totalVotes: number;
    yesVotes: number;
    noVotes: number;
    abstainVotes: number;
    totalVotingPower: number;
    yesPower: number;
    noPower: number;
    approvalRate: number;
    participationRate: number | null;
    meetsQuorum: boolean;
    meetsApproval: boolean;
    shouldPass: boolean;
  };
}

// ========== Treasury Types ==========

export type TransactionType = 'income' | 'expense' | 'transfer' | 'yield';
export type TransactionStatus = 'pending' | 'approved' | 'executed' | 'rejected';

export interface TreasuryTransactionData {
  transactionType: TransactionType;
  category: string;
  amount: number;
  currency?: string;
  description?: string;
  proposalId?: string;
  approvedBy?: string;
  executedBy?: string;
  status?: TransactionStatus;
  executionHash?: string;
  metadata?: Record<string, any>;
}

export interface TreasuryBalanceData {
  currency: string;
  balance: number;
  allocated?: number;
  available?: number;
  category?: string;
}

export interface TreasurySummary {
  balances: any[];
  totalByCurrency: Record<string, number>;
  recentTransactions: any[];
  summary: {
    totalCurrencies: number;
    totalAllocated: number;
    totalAvailable: number;
  };
}

// ========== Token Utility Types ==========

export type UtilityType = 'access_gate' | 'reputation' | 'governance' | 'payment' | 'staking';
export type TargetType = 'module' | 'community' | 'feature' | 'service';

export interface TokenUtilityData {
  utilityType: UtilityType;
  targetType: TargetType;
  targetId?: string;
  requiredAmount?: number;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface UserAccessCheck {
  hasAccess: boolean;
  reason?: string;
  utility?: any;
  requiredAmount?: number;
  userAmount?: number;
}

export interface UserTokenBalanceData {
  userId: string;
  walletAddress?: string;
  balance?: number;
  stakedBalance?: number;
  lastSyncedAt?: Date;
}

// ========== Security Types ==========

export type AlertType = 'anomaly' | 'threshold' | 'governance' | 'treasury';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityAlertData {
  alertType: AlertType;
  severity?: AlertSeverity;
  title: string;
  description: string;
  source?: string;
  metadata?: Record<string, any>;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}

export interface MultisigSignerData {
  userId: string;
  walletAddress: string;
  role?: 'signer' | 'admin' | 'backup';
  isActive?: boolean;
  notes?: string;
}

export interface MonitoringResults {
  treasuryAlerts: number;
  governanceAlerts: number;
  timestamp: Date;
}

// ========== Community Token Types ==========

export type TokenLaunchStatus = 'pending' | 'milestone_tracking' | 'active' | 'dex_transitioned' | 'paused';
export type ChainType = 'base' | 'solana' | 'ethereum' | 'polygon' | 'arbitrum' | string;

export interface CommunityTokenLaunchData {
  communityId: string;
  tokenName: string;
  tokenSymbol: string;
  chain?: ChainType;
  contractAddress?: string;
  bondingCurveAddress?: string;
  status?: TokenLaunchStatus;
  launchDate?: Date;
  dexTransitionDate?: Date;
  metadata?: Record<string, any>;
}

export interface CommunityTokenTransactionData {
  tokenLaunchId: string;
  userId: string;
  transactionType: 'mint' | 'burn' | 'transfer';
  amount: number;
  price?: number;
  onChainHash?: string;
  status?: 'pending' | 'confirmed' | 'failed';
}

// ========== Waitlist Types ==========

export type AuthMethod = 'wallet' | 'oauth2' | 'sso' | 'dweb' | 'generated';
export type AuthProviderName = 'google' | 'x' | 'discord' | 'facebook' | 'mastodon' | 'nostr' | 'universal_id' | 'ethereum' | 'solana' | 'base' | 'custom' | string;

export interface WaitlistEntryData {
  communityId: string;
  userId?: string;
  email?: string;
  authMethod?: AuthMethod;
  authProvider?: AuthProviderName;
  generatedKeys?: {
    publicKey: string;
    privateKey: string;
    generatedAt: string;
  };
  batchNumber?: number;
  batchMission?: string;
  accessGranted?: boolean;
  proofOfHumanity?: string;
  isPioneer?: boolean;
}

export interface BatchData {
  communityId: string;
  batchNumber: number;
  name: string;
  mission: string;
  maxSize: number;
  startDate?: Date | string;
  endDate?: Date | string;
  isActive?: boolean;
}

export interface BatchAssignmentResult {
  assigned: number;
  batchNumber: number;
  isPioneer: boolean;
}

// ========== Auth Types ==========

export type AuthProviderType = 'oauth2' | 'wallet' | 'sso' | 'dweb';

export interface AuthProviderData {
  providerType: AuthProviderType;
  providerName: AuthProviderName;
  isEnabled?: boolean;
  config?: Record<string, any>;
  selfRegistration?: boolean;
}

export interface UserAuthMethodData {
  userId: string;
  authProviderId: string;
  externalId: string;
  credentials?: Record<string, any>;
  isPrimary?: boolean;
  verifiedAt?: Date;
}

// ========== Activity Reward Types ==========

export type ActivityType = 'message' | 'governance' | 'contribution' | 'participation';

export interface ActivityRewardData {
  userId: string;
  communityId?: string;
  activityType: ActivityType;
  activityId?: string;
  rewardAmount: number;
  rewardCurrency?: string;
  requiresPoH?: boolean;
  metadata?: Record<string, any>;
}

export interface ActivityRewardResult {
  rewarded: boolean;
  reason?: string;
  reward?: any;
  activityType: ActivityType;
  activityId?: string;
}

export interface RewardSummary {
  totalRewards: number;
  rewardCount: number;
  byType: Record<string, number>;
  hasPoH: boolean;
}

// ========== Extension Logging Types ==========

export type LogType = 'milestone' | 'error' | 'warning' | 'info' | 'debug';

export interface ExtensionLogData {
  userId?: string;
  logType: LogType;
  category?: string;
  message: string;
  data?: Record<string, any>;
}

export interface JAUmemoryLogResult {
  stored: boolean;
  memoryId?: string;
  content?: string;
}

export interface MilestoneLogData {
  milestoneKey: string;
  name: string;
  status: string;
  communityId?: string;
  userId?: string;
}

export interface ErrorLogData {
  error?: Error | string;
  message?: string;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
  communityId?: string;
}

// ========== Dynamic Pricing Types ==========

export interface PricingTier {
  name: string;
  startUsage: number; // Usage count where this tier starts
  baseCost: number; // Base cost for this tier
  costPerUnit: number; // Cost per additional unit over startUsage
}

export interface DynamicPricingConfig {
  resourceType: string; // e.g., 'cursor', 'presence', 'feature'
  resourceId?: string; // Optional: specific resource instance
  freeTierLimit: number; // Number of free users (e.g., 3 for cursors)
  maxCapacity: number; // Maximum capacity (e.g., 25 for cursors)
  pricingTiers: PricingTier[]; // Tiered pricing structure
  optimizationEnabled?: boolean; // Whether to auto-optimize pricing
  metadata?: Record<string, any>;
}

export interface ResourceUsage {
  resourceType: string;
  resourceId?: string;
  currentCount: number;
  maxCapacity: number;
  userIds: string[];
  timestamp: Date;
}

export interface CostCalculation {
  cost: number; // Token cost (0 = free, Infinity = unavailable)
  tier: string; // Pricing tier name
  reason: string; // Why this cost
  currentUsage?: number;
  freeLimit?: number;
  maxCapacity?: number;
  nextTierCost?: number | null;
}

export interface PricingOptimizationData {
  currentUsage: number;
  currentCost: number;
  demandLevel: number; // 0-1, how high is demand
  availabilityLevel: number; // 0-1, how much capacity available
  conversionRate?: number; // 0-1, how many users pay vs abandon
  metadata?: Record<string, any>;
}

// ========== API Response Types ==========

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ========== Filter Types ==========

export interface MilestoneFilters {
  category?: string;
  isComplete?: boolean;
}

export interface ProposalFilters {
  status?: ProposalStatus;
  proposalType?: ProposalType;
  limit?: number;
  offset?: number;
}

export interface TransactionFilters {
  transactionType?: TransactionType;
  category?: string;
  status?: TransactionStatus;
  limit?: number;
  offset?: number;
}

export interface WaitlistFilters {
  batchNumber?: number;
  accessGranted?: boolean;
  limit?: number;
  offset?: number;
}

export interface AlertFilters {
  alertType?: AlertType;
  severity?: AlertSeverity;
  acknowledged?: boolean;
  limit?: number;
  offset?: number;
}



