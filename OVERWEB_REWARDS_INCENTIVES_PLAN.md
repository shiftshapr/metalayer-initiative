# Overweb Rewards & Incentives System - Implementation Plan

## Executive Summary

This document outlines the comprehensive plan for implementing the Overweb rewards and incentives system, which compensates bridgers for creating verified bridges, curating content, and participating in the ecosystem. The system includes multi-level referral tracking, ecosystem distribution, and dynamic reward pools.

---

## 1. System Architecture Overview

### 1.1 Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Rewards & Incentives System               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Reward Pool  │  │ Referral     │  │ Ecosystem    │      │
│  │ Manager      │  │ Tracker      │  │ Distributor  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Bridge       │  │ Curation     │  │ Context      │      │
│  │ Rewards      │  │ Rewards      │  │ Index        │      │
│  │ Calculator   │  │ Calculator   │  │ Manager      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Protocol     │  │ Meta-        │  │ Rewards      │      │
│  │ Enabler      │  │ Community    │  │ Distribution │      │
│  │ Tracker      │  │ Manager      │  │ Engine       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Key Principles

1. **Creator-Centric**: 70% of rewards go to creators, 30% to ecosystem
2. **Progressive Earnings**: Users earn 70-90% (increasing as they grow)
3. **Ecosystem Support**: Rewards flow to communities, referrers, and context indexes
4. **Multi-Level Referrals**: 8-level deep referral system
5. **Dynamic Pools**: Rewards accumulate and distribute periodically

---

## 2. Data Models

### 2.1 Core Entities

#### 2.1.1 Bridge Registry
```typescript
interface Bridge {
  id: string;
  bridgerId: string;              // Creator of the bridge
  sourceUrl: string;
  targetUrl: string;
  verified: boolean;              // Verified bridge status
  upvotes: number;
  uniqueCrossings: number;        // Tracked for reward calculation
  createdAt: Date;
  updatedAt: Date;
  
  // Context assignments
  topic?: string;                 // 3% of ecosystem share
  category?: string;              // 1% of ecosystem share
  tags: string[];                 // 6% of ecosystem share (split)
  
  // Community affiliations
  metaCommunities: string[];      // Guilds/communities (10% of ecosystem)
  
  // Referral tracking
  referrerChain: string[];        // Array of referrer IDs (L1-L8)
  
  // Protocol enabler
  protocolEnabler?: string;       // Browser/extension/SDK (1%)
}
```

#### 2.1.2 Reward Pool
```typescript
interface RewardPool {
  id: string;
  period: string;                 // e.g., "2025-01"
  totalAmount: number;             // Total OWEB in pool
  bridgePoolAmount: number;        // 80% of total
  curationPoolAmount: number;      // 20% of total
  
  // Sources
  daoReflections: number;          // 50% of DAO reflections (above 50% locked)
  apiFees: number;                 // Revenue from Universal Content Graph API
  otherSources: number;
  
  status: 'accumulating' | 'calculating' | 'distributing' | 'completed';
  distributionDate?: Date;
  createdAt: Date;
}
```

#### 2.1.3 Referral Chain
```typescript
interface ReferralChain {
  userId: string;
  referrerCode: string;           // Unique referral code
  referredBy?: string;             // Direct referrer (L1)
  referralChain: string[];         // Full chain L1-L8
  referralLevel: number;           // Current level in chain (1-8)
  
  // Earnings tracking
  totalEarnings: number;
  referralEarnings: number;        // Earnings from referrals
  directEarnings: number;          // Direct bridge earnings
  
  // Growth tracking
  earningsPercentage: number;      // 70-90% based on growth
  downlineCount: number[];         // Count at each level [L1, L2, ..., L8]
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2.1.4 Bridge Reward Calculation
```typescript
interface BridgeReward {
  bridgeId: string;
  bridgerId: string;
  period: string;
  
  // Metrics
  uniqueCrossings: number;
  upvotes: number;
  proportionOfTotal: number;      // Proportion of total crossings
  
  // Rewards
  totalReward: number;             // From bridge pool (80%)
  creatorReward: number;           // 70% of totalReward
  ecosystemReward: number;          // 30% of totalReward
  
  // Ecosystem breakdown
  ecosystemBreakdown: {
    metaCommunities: number;       // 10% of ecosystem
    contextIndexes: {
      topic: number;               // 3% of ecosystem
      category: number;            // 1% of ecosystem
      tags: number;                // 6% of ecosystem (split)
    };
    referrals: {
      [level: string]: number;     // L1: 3.5%, L2: 1.5%, etc.
    };
    protocolEnabler: number;       // 1% of ecosystem
  };
  
  calculatedAt: Date;
}
```

#### 2.1.5 Curation Reward
```typescript
interface CurationReward {
  bridgeId: string;
  curatorId: string;
  period: string;
  
  // Early upvote tracking
  upvoteOrder: number;             // Position in first 20% of upvoters
  upvoteTimestamp: Date;
  bridgeBecameValuable: boolean;   // Bridge had valuable activity
  
  // Reward calculation
  rewardAmount: number;            // Exponential decay based on order
  poolContribution: number;        // From curation pool (20%)
  
  calculatedAt: Date;
}
```

#### 2.1.6 Context Index (Metabag NFT)
```typescript
interface ContextIndex {
  id: string;
  type: 'topic' | 'category' | 'tag';
  name: string;                    // e.g., "asthma", "technology"
  
  // Reward accumulation
  totalRewardsAccumulated: number;
  rewardHistory: {
    period: string;
    amount: number;
  }[];
  
  // Network activity
  associatedBridges: string[];     // Bridge IDs
  activityStats: {
    totalCrossings: number;
    uniqueBridgers: number;
    lastActivity: Date;
  };
  
  // NFT metadata
  nftTokenId?: string;
  ownerId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2.1.7 Meta-Community/Guild
```typescript
interface MetaCommunity {
  id: string;
  name: string;
  type: 'guild' | 'meta-community' | 'cause';
  
  // Membership
  members: string[];
  requiredRewardPercentage?: number; // Some may require % of rewards
  
  // Reward accumulation
  totalRewardsAccumulated: number;
  rewardHistory: {
    period: string;
    amount: number;
    bridgeCount: number;
  }[];
  
  // Settings
  settings: {
    requireRewardAssignment: boolean;
    defaultRewardPercentage: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2.1.8 Protocol Enabler
```typescript
interface ProtocolEnabler {
  id: string;
  type: 'browser' | 'extension' | 'sdk';
  name: string;                    // e.g., "Overweb Browser", "Chrome Extension"
  identifier: string;              // Unique identifier
  
  // Reward accumulation
  totalRewardsAccumulated: number;
  rewardHistory: {
    period: string;
    amount: number;
    bridgeCount: number;
  }[];
  
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 3. Reward Distribution Logic

### 3.1 Reward Pool Creation

**Frequency**: Configurable (e.g., monthly, bi-weekly)

**Process**:
1. Calculate DAO reflections (50% above locked liquidity)
2. Add API fees from Universal Content Graph
3. Add other revenue sources
4. Create new RewardPool record
5. Split: 80% bridge pool, 20% curation pool

### 3.2 Bridge Reward Calculation

**Formula**:
```
Bridge Reward = (Bridge Unique Crossings with Upvotes / Total Unique Crossings) × Bridge Pool Amount
```

**Process**:
1. Aggregate unique bridge crossings with upvotes for period
2. Calculate proportion for each bridge
3. Allocate from bridge pool (80%)
4. Split: 70% creator, 30% ecosystem
5. Distribute ecosystem portion according to Table 12.1

### 3.3 Curation Reward Calculation

**Eligibility**: First 20% of upvoters on bridges with valuable activity

**Formula** (Exponential Decay):
```
Curation Reward = Base Amount × e^(-decay_factor × upvote_order)
```

**Process**:
1. Identify bridges with valuable activity during period
2. Order upvoters by timestamp
3. Select first 20% of upvoters
4. Apply exponential decay function
5. Distribute from curation pool (20%)

### 3.4 Ecosystem Distribution (30% of Bridge Rewards)

**Breakdown**:
- **10% Meta-Communities & Guilds**: Split among designated communities
- **10% Context Indexes**:
  - Topic: 3%
  - Category: 1%
  - Tags: 6% (split proportionally)
- **10% Referrals**:
  - L1: 3.5%
  - L2: 1.5%
  - L3: 1.0%
  - L4: 0.75%
  - L5: 0.50%
  - L6: 0.375%
  - L7: 0.25%
  - L8: 0.125%
- **1% Protocol Enabler**: Browser/extension/SDK

### 3.5 Progressive Earnings (70-90%)

**Growth-Based Calculation**:
```typescript
function calculateEarningsPercentage(user: User): number {
  const basePercentage = 70;
  const growthFactor = calculateGrowthFactor(user);
  const maxPercentage = 90;
  
  // Growth factors:
  // - Total bridges created
  // - Total earnings
  // - Downline size
  // - Time in system
  
  return Math.min(basePercentage + growthFactor, maxPercentage);
}
```

**Distribution**:
- User receives: `earningsPercentage%` of their direct rewards
- Remaining: Distributed to downline, meta-community, etc.

---

## 4. Referral System

### 4.1 Referral Code Generation

**On User Registration**:
1. Generate unique referral code
2. If provided, validate and link referrer
3. Build referral chain (up to 8 levels)
4. Create ReferralChain record

### 4.2 Referral Chain Building

**Process**:
```typescript
function buildReferralChain(newUserId: string, referrerCode: string): string[] {
  const chain: string[] = [];
  let currentReferrer = findUserByReferralCode(referrerCode);
  let level = 1;
  
  while (currentReferrer && level <= 8) {
    chain.push(currentReferrer.id);
    currentReferrer = getReferrer(currentReferrer.id);
    level++;
  }
  
  return chain;
}
```

### 4.3 Referral Reward Distribution

**When Bridge Earns Rewards**:
1. Extract referral chain from bridge creator
2. Calculate ecosystem reward (30% of bridge reward)
3. Distribute 10% of ecosystem reward across referral chain:
   - L1: 3.5% of ecosystem (35% of referral portion)
   - L2: 1.5% of ecosystem (15% of referral portion)
   - L3: 1.0% of ecosystem (10% of referral portion)
   - ... and so on

### 4.4 Downline Tracking

**Metrics to Track**:
- Direct referrals (L1)
- Total downline size (all levels)
- Earnings generated by downline
- Growth rate

---

## 5. Context Index System

### 5.1 Metabag NFT Creation

**For Topics, Categories, Tags**:
1. Create ContextIndex record
2. Mint NFT (if applicable)
3. Link to network activity
4. Accumulate rewards over time

### 5.2 Reward Accumulation

**Process**:
1. When bridge earns rewards, identify context indexes
2. Allocate appropriate percentages:
   - Topic: 3% of ecosystem reward
   - Category: 1% of ecosystem reward
   - Tags: 6% of ecosystem reward (split proportionally)
3. Update ContextIndex records
4. Update NFT metadata (if applicable)

### 5.3 Statistics Publication

**Publish**:
- Total rewards per context index
- Activity levels
- Growth trends
- Most active areas

**Purpose**:
- Generate interest in metabags
- Enable participants to identify active areas
- Create futures market for context indexes

---

## 6. Meta-Community & Guild System

### 6.1 Community Assignment

**When Creating Bridge**:
1. Bridger designates meta-communities/guilds
2. Some communities may require assignment
3. Allocate 10% of ecosystem reward to designated communities

### 6.2 Reward Distribution

**Process**:
1. Identify all meta-communities assigned to bridge
2. Split 10% of ecosystem reward among them
3. Update MetaCommunity records
4. Track per-period contributions

### 6.3 Community Requirements

**Settings**:
- `requireRewardAssignment`: Force members to assign rewards
- `defaultRewardPercentage`: Default % if not specified
- `minimumRewardPercentage`: Minimum required

---

## 7. Protocol Enabler Tracking

### 7.1 Identification

**When Bridge Created**:
1. Detect protocol enabler (browser/extension/SDK)
2. Store in bridge record
3. Link to ProtocolEnabler record

### 7.2 Reward Distribution

**Process**:
1. When bridge earns rewards
2. Allocate 1% of ecosystem reward to protocol enabler
3. Update ProtocolEnabler record
4. Track per-period contributions

---

## 8. Implementation Phases

### Phase 1: Foundation (Weeks 1-4)

**Database Schema**:
- [ ] Create Bridge table with referral/context fields
- [ ] Create RewardPool table
- [ ] Create ReferralChain table
- [ ] Create BridgeReward table
- [ ] Create CurationReward table
- [ ] Create ContextIndex table
- [ ] Create MetaCommunity table
- [ ] Create ProtocolEnabler table

**Core Services**:
- [ ] RewardPoolService (create, update, calculate)
- [ ] ReferralService (chain building, tracking)
- [ ] Basic reward calculation logic

### Phase 2: Reward Calculation (Weeks 5-8)

**Services**:
- [ ] BridgeRewardCalculator
  - Unique crossings tracking
  - Proportion calculation
  - Creator/ecosystem split
- [ ] CurationRewardCalculator
  - Early upvote detection
  - Exponential decay function
  - First 20% selection
- [ ] EcosystemDistributor
  - Meta-community distribution
  - Context index distribution
  - Referral distribution
  - Protocol enabler distribution

### Phase 3: Referral System (Weeks 9-12)

**Features**:
- [ ] Referral code generation
- [ ] Referral chain building
- [ ] Multi-level reward distribution
- [ ] Downline tracking
- [ ] Progressive earnings calculation (70-90%)

### Phase 4: Context Indexes (Weeks 13-16)

**Features**:
- [ ] Context index creation
- [ ] Reward accumulation
- [ ] Statistics publication
- [ ] NFT integration (if applicable)

### Phase 5: Meta-Communities (Weeks 17-20)

**Features**:
- [ ] Meta-community management
- [ ] Bridge-to-community assignment
- [ ] Reward distribution
- [ ] Requirement enforcement

### Phase 6: Integration & Testing (Weeks 21-24)

**Tasks**:
- [ ] Integration with existing bridge registry
- [ ] API endpoints
- [ ] Frontend integration
- [ ] Comprehensive testing
- [ ] Performance optimization

---

## 9. API Endpoints

### 9.1 Referral Endpoints

```
POST   /api/referrals/register
GET    /api/referrals/chain/:userId
GET    /api/referrals/stats/:userId
GET    /api/referrals/downline/:userId
```

### 9.2 Reward Endpoints

```
GET    /api/rewards/pool/:period
GET    /api/rewards/bridge/:bridgeId/:period
GET    /api/rewards/user/:userId
GET    /api/rewards/user/:userId/summary
POST   /api/rewards/calculate/:period
POST   /api/rewards/distribute/:period
```

### 9.3 Curation Endpoints

```
GET    /api/curation/rewards/:userId/:period
GET    /api/curation/bridge/:bridgeId/upvoters
POST   /api/curation/upvote/:bridgeId
```

### 9.4 Context Index Endpoints

```
GET    /api/context-indexes
GET    /api/context-indexes/:id
GET    /api/context-indexes/:id/stats
GET    /api/context-indexes/:id/rewards
```

### 9.5 Meta-Community Endpoints

```
GET    /api/meta-communities
GET    /api/meta-communities/:id
GET    /api/meta-communities/:id/rewards
POST   /api/meta-communities/:id/assign-bridge
```

---

## 10. Technical Considerations

### 10.1 Performance

**Challenges**:
- Calculating rewards for thousands of bridges
- Tracking unique crossings efficiently
- Multi-level referral chain traversal

**Solutions**:
- Batch processing for reward calculations
- Caching of referral chains
- Database indexes on frequently queried fields
- Background jobs for distribution

### 10.2 Data Integrity

**Concerns**:
- Ensuring accurate unique crossing counts
- Preventing double-counting of rewards
- Maintaining referral chain integrity

**Solutions**:
- Transaction-based reward distribution
- Idempotent reward calculations
- Referential integrity constraints
- Audit logging

### 10.3 Scalability

**Considerations**:
- Growing number of bridges
- Increasing referral chain depth
- Multiple reward periods

**Solutions**:
- Partition reward tables by period
- Archive old reward data
- Horizontal scaling of calculation services
- Queue-based processing

### 10.4 Security

**Concerns**:
- Preventing reward manipulation
- Securing referral codes
- Validating bridge verification

**Solutions**:
- Cryptographic verification of bridges
- Rate limiting on reward calculations
- Access control on reward distribution
- Audit trails

---

## 11. Integration Points

### 11.1 Existing Systems

**Bridge Registry**:
- Extend existing bridge model
- Add referral/context fields
- Track unique crossings

**User System**:
- Add referral code to user profile
- Track earnings percentage
- Link to referral chain

**Community System**:
- Link to meta-communities
- Support guild requirements
- Track community rewards

### 11.2 External Systems

**DAO Treasury**:
- Query reflections
- Calculate 50% above locked liquidity
- Transfer to reward pool

**Universal Content Graph API**:
- Track API usage fees
- Add to reward pool
- Link to bridges

**NFT System** (if applicable):
- Mint metabag NFTs
- Update metadata with rewards
- Track ownership

---

## 12. Configuration

### 12.1 Reward Pool Settings

```typescript
interface RewardPoolConfig {
  distributionFrequency: 'weekly' | 'bi-weekly' | 'monthly';
  bridgePoolPercentage: number;        // Default: 80
  curationPoolPercentage: number;      // Default: 20
  daoReflectionPercentage: number;    // Default: 50 (above locked)
  lockedLiquidityPercentage: number;   // Default: 50
}
```

### 12.2 Ecosystem Distribution Settings

```typescript
interface EcosystemDistributionConfig {
  creatorPercentage: number;           // Default: 70
  ecosystemPercentage: number;         // Default: 30
  
  metaCommunityPercentage: number;     // Default: 10
  contextIndexPercentage: number;      // Default: 10
  referralPercentage: number;          // Default: 10
  protocolEnablerPercentage: number;   // Default: 1
  
  contextIndexBreakdown: {
    topic: number;                      // Default: 3
    category: number;                   // Default: 1
    tags: number;                       // Default: 6
  };
  
  referralLevels: {
    L1: number;                         // Default: 3.5
    L2: number;                         // Default: 1.5
    L3: number;                         // Default: 1.0
    L4: number;                         // Default: 0.75
    L5: number;                         // Default: 0.50
    L6: number;                         // Default: 0.375
    L7: number;                         // Default: 0.25
    L8: number;                         // Default: 0.125
  };
}
```

### 12.3 Curation Settings

```typescript
interface CurationConfig {
  earlyUpvoterPercentage: number;        // Default: 20 (first 20%)
  exponentialDecayFactor: number;       // Default: 0.1
  minimumValuableActivity: number;      // Threshold for "valuable"
}
```

### 12.4 Progressive Earnings Settings

```typescript
interface ProgressiveEarningsConfig {
  basePercentage: number;               // Default: 70
  maxPercentage: number;                // Default: 90
  growthFactors: {
    bridgeCount: number;                // Weight for bridge count
    totalEarnings: number;               // Weight for earnings
    downlineSize: number;                // Weight for downline
    timeInSystem: number;                // Weight for tenure
  };
}
```

---

## 13. Monitoring & Analytics

### 13.1 Key Metrics

**Reward Pool**:
- Total pool size per period
- Distribution completion rate
- Time to calculate rewards

**Bridges**:
- Average reward per bridge
- Top earning bridges
- Bridge verification rate

**Referrals**:
- Average referral chain depth
- Referral conversion rate
- Downline growth rate

**Ecosystem**:
- Meta-community participation
- Context index activity
- Protocol enabler distribution

### 13.2 Dashboards

**Admin Dashboard**:
- Reward pool status
- Distribution progress
- System health

**User Dashboard**:
- Personal earnings
- Referral stats
- Downline performance
- Context index rewards

**Community Dashboard**:
- Community earnings
- Member contributions
- Growth metrics

---

## 14. Testing Strategy

### 14.1 Unit Tests

- Reward calculation functions
- Referral chain building
- Ecosystem distribution logic
- Curation reward calculation

### 14.2 Integration Tests

- End-to-end reward distribution
- Referral system flow
- Context index accumulation
- Meta-community distribution

### 14.3 Performance Tests

- Large-scale reward calculations
- Deep referral chains (8 levels)
- High-volume bridge processing
- Concurrent reward distributions

### 14.4 Edge Cases

- Empty referral chains
- Bridges with no upvotes
- Communities with no members
- Missing context indexes
- Zero reward pools

---

## 15. Migration Strategy

### 15.1 Existing Users

**Referral Codes**:
- Generate referral codes for existing users
- Allow retroactive referral linking (optional)
- Preserve existing reward history

### 15.2 Existing Bridges

**Context Assignment**:
- Allow retroactive context assignment
- Default to generic categories if missing
- Preserve existing bridge data

### 15.3 Data Migration

**Steps**:
1. Create new tables
2. Migrate existing bridge data
3. Generate referral codes
4. Build initial referral chains
5. Calculate historical rewards (if applicable)

---

## 16. Future Enhancements

### 16.1 Labeling Rewards

**Future Feature**:
- Add labeling to curation pool
- Reward content labelers
- Improve content categorization

### 16.2 Advanced Analytics

**Features**:
- Predictive reward modeling
- Trend analysis
- Optimization recommendations

### 16.3 Governance Integration

**Features**:
- Community voting on reward parameters
- Proposal system for changes
- Transparent reward distribution

---

## 17. Risk Mitigation

### 17.1 Reward Manipulation

**Risks**:
- Fake bridges
- Sybil attacks
- Referral fraud

**Mitigations**:
- Bridge verification requirements
- Proof of Humanity integration
- Rate limiting
- Fraud detection algorithms

### 17.2 Economic Stability

**Risks**:
- Reward pool volatility
- Token price fluctuations
- Unbalanced distributions

**Mitigations**:
- Smoothing mechanisms
- Reserve funds
- Dynamic adjustments
- Economic modeling

---

## 18. Success Criteria

### 18.1 Technical

- [ ] Reward calculations complete within 1 hour for 10K bridges
- [ ] 99.9% accuracy in reward distribution
- [ ] Support for 8-level referral chains
- [ ] Real-time referral tracking

### 18.2 Business

- [ ] 30% of users have active referral chains
- [ ] Average 3+ bridges per active bridger
- [ ] 50% of bridges have context assignments
- [ ] 20% of users participate in meta-communities

### 18.3 User Experience

- [ ] Clear reward visibility
- [ ] Easy referral code sharing
- [ ] Transparent ecosystem distribution
- [ ] Intuitive context assignment

---

## 19. Documentation Requirements

### 19.1 Developer Documentation

- API reference
- Service architecture
- Database schema
- Integration guide

### 19.2 User Documentation

- How to earn rewards
- Referral system guide
- Context index explanation
- Meta-community participation

### 19.3 Admin Documentation

- Reward pool management
- System configuration
- Monitoring guide
- Troubleshooting

---

## 20. Next Steps

### Immediate (Week 1)

1. **Review & Approve Plan**: Stakeholder review of this document
2. **Database Design**: Finalize schema design
3. **Team Assembly**: Assign developers to components
4. **Tool Selection**: Choose calculation libraries, queue systems

### Short-term (Weeks 2-4)

1. **Database Implementation**: Create tables and migrations
2. **Core Services**: Start building foundation services
3. **API Design**: Finalize endpoint specifications
4. **Testing Framework**: Set up test infrastructure

### Medium-term (Weeks 5-12)

1. **Reward Calculation**: Implement calculation engines
2. **Referral System**: Build referral tracking
3. **Integration**: Connect with existing systems
4. **Testing**: Comprehensive test coverage

### Long-term (Weeks 13-24)

1. **Context Indexes**: Full implementation
2. **Meta-Communities**: Complete system
3. **Performance Optimization**: Scale for production
4. **Launch Preparation**: Documentation, monitoring, support

---

## Appendix A: Reward Distribution Example

### Scenario

**Bridge Details**:
- Bridge ID: `bridge-123`
- Creator: `user-456`
- Unique Crossings: 1,000
- Total Crossings (all bridges): 10,000
- Bridge Pool: 10,000 OWEB
- Creator Earnings %: 80%

**Calculation**:
1. Bridge Proportion: 1,000 / 10,000 = 10%
2. Bridge Reward: 10% × 10,000 OWEB = 1,000 OWEB
3. Creator Reward: 70% × 1,000 = 700 OWEB
4. Ecosystem Reward: 30% × 1,000 = 300 OWEB

**Ecosystem Breakdown** (300 OWEB):
- Meta-Communities: 10% = 30 OWEB
- Context Indexes: 10% = 30 OWEB
  - Topic: 3% = 9 OWEB
  - Category: 1% = 3 OWEB
  - Tags: 6% = 18 OWEB
- Referrals: 10% = 30 OWEB
  - L1: 3.5% = 10.5 OWEB
  - L2: 1.5% = 4.5 OWEB
  - L3: 1.0% = 3 OWEB
  - ... (continues to L8)
- Protocol Enabler: 1% = 3 OWEB

**Creator Receives**: 700 OWEB (70% of total bridge reward)

---

## Appendix B: Referral Chain Example

### Chain Structure

```
User A (Original)
  └─ User B (L1) - 3.5% of ecosystem
      └─ User C (L2) - 1.5% of ecosystem
          └─ User D (L3) - 1.0% of ecosystem
              └─ User E (L4) - 0.75% of ecosystem
                  └─ User F (L5) - 0.50% of ecosystem
                      └─ User G (L6) - 0.375% of ecosystem
                          └─ User H (L7) - 0.25% of ecosystem
                              └─ User I (L8) - 0.125% of ecosystem
```

**When User I creates a bridge that earns 300 OWEB ecosystem reward**:
- User H (L1 from I): 3.5% × 300 = 10.5 OWEB
- User G (L2 from I): 1.5% × 300 = 4.5 OWEB
- User F (L3 from I): 1.0% × 300 = 3.0 OWEB
- ... and so on

---

## Conclusion

This plan provides a comprehensive roadmap for implementing the Overweb rewards and incentives system. The phased approach allows for iterative development, testing, and refinement. Key priorities include:

1. **Foundation First**: Solid database schema and core services
2. **Incremental Build**: Add features progressively
3. **Testing Throughout**: Ensure quality at each phase
4. **Performance Focus**: Scale from the start
5. **User Experience**: Make rewards transparent and accessible

The system is designed to be flexible, scalable, and aligned with the Overweb's vision of rewarding contributors while supporting the broader ecosystem.

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-24  
**Status**: Planning Complete - Ready for Review









