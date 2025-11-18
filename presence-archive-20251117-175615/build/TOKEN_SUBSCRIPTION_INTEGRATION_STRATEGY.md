# Token-Gated Subscriptions - Integration Strategy

## 🎯 **Vision**

Integrate blockchain tokens (Canopi token + Community tokens) with the subscription system to enable:
- **Token-gated access** to premium subscriptions
- **Tiered subscription benefits** based on token holdings
- **Community token governance** over subscription features
- **Token rewards** for active subscriptions
- **Cross-community subscription portability**

---

## 🔑 **Guiding Questions**

### **1. Access & Permissions**
- ❓ Should token holders get automatic subscriptions to certain content?
- ❓ What's the minimum token balance required for premium subscriptions?
- ❓ Should different token tiers unlock different subscription features?
- ❓ How do we handle token transfers (do subscriptions move with tokens)?

### **2. Governance**
- ❓ Can token holders vote on subscription features/pricing?
- ❓ Should communities control their own subscription rules?
- ❓ Who decides what content requires token-gating?
- ❓ How do we handle disputes about subscription access?

### **3. Economics**
- ❓ Should subscriptions cost tokens (burn/stake/hold)?
- ❓ Do subscribers earn token rewards for engagement?
- ❓ How do subscription fees flow to content creators/communities?
- ❓ Should there be a bonding curve for subscription pricing?

### **4. User Experience**
- ❓ What happens when user's token balance drops below threshold?
- ❓ Should there be grace periods for subscription lapses?
- ❓ How do we communicate token requirements clearly?
- ❓ Can users subscribe without tokens (paid alternative)?

### **5. Technical**
- ❓ How do we verify token balances efficiently?
- ❓ Should we cache token balances or check real-time?
- ❓ How do we handle multi-chain tokens?
- ❓ What's the fallback if blockchain is unavailable?

### **6. Community Tokens**
- ❓ Can each community set their own subscription rules?
- ❓ Should community tokens grant access to other communities?
- ❓ How do we handle cross-community subscriptions?
- ❓ Can communities bundle subscriptions?

---

## 🏗️ **Proposed Architecture**

### **Token-Gated Subscription Model**

```typescript
interface TokenGatedSubscription extends Subscription {
  // Token requirements
  tokenRequirements?: {
    // Canopi token requirements
    canopiToken?: {
      minBalance: number;        // Minimum balance required
      stakingRequired: boolean;  // Must be staked?
      tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
    };
    
    // Community token requirements
    communityToken?: {
      communityId: string;
      tokenId: string;
      minBalance: number;
      stakingRequired: boolean;
    };
    
    // Alternative: OR logic (either token works)
    requirementType: 'all' | 'any';
  };
  
  // Token benefits
  tokenBenefits?: {
    priorityNotifications: boolean;  // Get notifications first
    customPriority: boolean;         // Set custom priority
    muteOverride: boolean;           // Override global mute settings
    analyticsAccess: boolean;        // Access to subscription analytics
    exclusiveContent: boolean;       // Access to token-gated content
  };
  
  // Token economics
  tokenEconomics?: {
    subscriptionCost?: number;       // Tokens required to subscribe
    rewardRate?: number;             // Tokens earned per engagement
    lastRewardClaim?: number;        // Last time rewards were claimed
    totalRewardsEarned?: number;     // Lifetime rewards
  };
}
```

---

## 💡 **Integration Scenarios**

### **Scenario 1: Token-Gated Room Subscriptions**

```typescript
// User tries to subscribe to premium room
await subscriptionManager.subscribe({
  targetType: 'room',
  targetId: 'premium-room-123',
  targetName: 'Premium Alpha Chat',
  tokenRequirements: {
    canopiToken: {
      minBalance: 1000,      // Need 1000 CANOPI tokens
      stakingRequired: true,  // Must be staked
      tier: 'gold'
    },
    requirementType: 'all'
  }
});

// System checks:
// 1. Does user have 1000+ CANOPI tokens?
// 2. Are they staked?
// 3. Is user in gold tier?
// ✅ Yes → Subscribe
// ❌ No → Show token requirement modal
```

### **Scenario 2: Community Token Access**

```typescript
// Community sets token requirement for their rooms
await communityTokenService.setSubscriptionRule({
  communityId: 'community-456',
  targetType: 'room',
  tokenRequirements: {
    communityToken: {
      communityId: 'community-456',
      tokenId: 'COMM456',
      minBalance: 100,
      stakingRequired: false
    }
  }
});

// Any room in this community now requires 100 COMM456 tokens
```

### **Scenario 3: Tiered Subscription Benefits**

```typescript
// Bronze tier (100-999 tokens)
{
  tokenBenefits: {
    priorityNotifications: false,
    customPriority: false,
    muteOverride: false,
    analyticsAccess: false,
    exclusiveContent: false
  }
}

// Gold tier (10,000+ tokens)
{
  tokenBenefits: {
    priorityNotifications: true,   // Get notifications before others
    customPriority: true,          // Set custom notification priority
    muteOverride: true,            // Can unmute globally muted content
    analyticsAccess: true,         // See subscription analytics
    exclusiveContent: true         // Access token-gated content
  }
}
```

### **Scenario 4: Token Rewards for Engagement**

```typescript
// User engages with subscribed content
async function onUserEngagement(subscriptionId: string) {
  const subscription = await subscriptionManager.getSubscription(subscriptionId);
  
  if (subscription.tokenEconomics?.rewardRate) {
    // Award tokens for engagement
    await tokenRewardService.awardTokens({
      userId: subscription.userId,
      amount: subscription.tokenEconomics.rewardRate,
      reason: 'subscription_engagement',
      subscriptionId: subscription.id
    });
  }
}
```

---

## 🔧 **Technical Implementation**

### **1. Token Balance Verification Service**

```typescript
class TokenVerificationService {
  private cache: Map<string, { balance: number; timestamp: number }> = new Map();
  private cacheTimeout = 300000; // 5 minutes
  
  /**
   * Verify user has required tokens
   */
  async verifyTokenRequirements(
    userId: string,
    requirements: TokenRequirements
  ): Promise<{ verified: boolean; reason?: string }> {
    // Check Canopi token
    if (requirements.canopiToken) {
      const balance = await this.getCanopiTokenBalance(userId);
      
      if (balance < requirements.canopiToken.minBalance) {
        return {
          verified: false,
          reason: `Requires ${requirements.canopiToken.minBalance} CANOPI tokens (you have ${balance})`
        };
      }
      
      if (requirements.canopiToken.stakingRequired) {
        const isStaked = await this.isTokenStaked(userId);
        if (!isStaked) {
          return {
            verified: false,
            reason: 'Tokens must be staked'
          };
        }
      }
    }
    
    // Check community token
    if (requirements.communityToken) {
      const balance = await this.getCommunityTokenBalance(
        userId,
        requirements.communityToken.tokenId
      );
      
      if (balance < requirements.communityToken.minBalance) {
        return {
          verified: false,
          reason: `Requires ${requirements.communityToken.minBalance} ${requirements.communityToken.tokenId} tokens`
        };
      }
    }
    
    return { verified: true };
  }
  
  /**
   * Get Canopi token balance (with caching)
   */
  async getCanopiTokenBalance(userId: string): Promise<number> {
    const cacheKey = `canopi:${userId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.balance;
    }
    
    // Fetch from blockchain/database
    const balance = await this.fetchCanopiBalance(userId);
    
    // Cache result
    this.cache.set(cacheKey, {
      balance,
      timestamp: Date.now()
    });
    
    return balance;
  }
  
  /**
   * Get community token balance
   */
  async getCommunityTokenBalance(userId: string, tokenId: string): Promise<number> {
    const cacheKey = `community:${tokenId}:${userId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.balance;
    }
    
    const balance = await this.fetchCommunityTokenBalance(userId, tokenId);
    
    this.cache.set(cacheKey, {
      balance,
      timestamp: Date.now()
    });
    
    return balance;
  }
  
  /**
   * Fetch balance from blockchain
   */
  private async fetchCanopiBalance(userId: string): Promise<number> {
    // TODO: Integrate with blockchain
    // For now, fetch from database
    const result = await prisma.userTokenBalance.findFirst({
      where: {
        userId,
        tokenType: 'CANOPI'
      }
    });
    
    return result?.balance || 0;
  }
  
  /**
   * Check if tokens are staked
   */
  private async isTokenStaked(userId: string): Promise<boolean> {
    const result = await prisma.tokenStake.findFirst({
      where: {
        userId,
        tokenType: 'CANOPI',
        status: 'active'
      }
    });
    
    return !!result;
  }
}

export const tokenVerificationService = new TokenVerificationService();
```

### **2. Enhanced Subscription Manager**

```typescript
// Add to SubscriptionManager class

/**
 * Subscribe with token verification
 */
async subscribeWithTokens(
  options: CreateSubscriptionOptions & {
    tokenRequirements?: TokenRequirements;
  }
): Promise<{ success: boolean; subscription?: Subscription; error?: string }> {
  // Verify token requirements
  if (options.tokenRequirements) {
    const verification = await tokenVerificationService.verifyTokenRequirements(
      this.currentUserId!,
      options.tokenRequirements
    );
    
    if (!verification.verified) {
      return {
        success: false,
        error: verification.reason
      };
    }
  }
  
  // Create subscription
  const subscription = await this.subscribe(options);
  
  // Set up token monitoring (check balance periodically)
  if (options.tokenRequirements) {
    await this.setupTokenMonitoring(subscription.id);
  }
  
  return {
    success: true,
    subscription
  };
}

/**
 * Monitor token balance for subscription
 */
private async setupTokenMonitoring(subscriptionId: string): Promise<void> {
  // Check token balance every hour
  setInterval(async () => {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription || !subscription.tokenRequirements) return;
    
    const verification = await tokenVerificationService.verifyTokenRequirements(
      subscription.userId,
      subscription.tokenRequirements
    );
    
    if (!verification.verified) {
      // Token balance dropped below threshold
      await this.handleInsufficientTokens(subscription);
    }
  }, 3600000); // 1 hour
}

/**
 * Handle insufficient token balance
 */
private async handleInsufficientTokens(subscription: Subscription): Promise<void> {
  // Option 1: Disable subscription
  await this.disableSubscription(subscription.id);
  
  // Option 2: Grace period (mute for 24 hours)
  await this.muteSubscription(subscription.id, 86400000);
  
  // Notify user
  await notificationManager.showNotification('SYSTEM_ALERT', {
    title: 'Subscription Paused',
    message: `Your subscription to ${subscription.targetName} has been paused due to insufficient token balance`,
    priority: 'high',
    source: {
      category: 'personal'
    }
  });
}
```

### **3. Token Reward Service**

```typescript
class TokenRewardService {
  /**
   * Award tokens for subscription engagement
   */
  async awardTokens(params: {
    userId: string;
    amount: number;
    reason: string;
    subscriptionId: string;
  }): Promise<void> {
    // Record reward
    await prisma.tokenReward.create({
      data: {
        userId: params.userId,
        amount: params.amount,
        reason: params.reason,
        subscriptionId: params.subscriptionId,
        status: 'pending'
      }
    });
    
    // Update subscription economics
    const subscription = await subscriptionManager.getSubscription(params.subscriptionId);
    if (subscription.tokenEconomics) {
      subscription.tokenEconomics.totalRewardsEarned = 
        (subscription.tokenEconomics.totalRewardsEarned || 0) + params.amount;
    }
    
    // Notify user
    await notificationManager.showNotification('SYSTEM_ALERT', {
      title: 'Tokens Earned!',
      message: `You earned ${params.amount} tokens for engaging with ${subscription.targetName}`,
      priority: 'low',
      source: {
        category: 'personal'
      }
    });
  }
  
  /**
   * Claim pending rewards
   */
  async claimRewards(userId: string): Promise<number> {
    const pending = await prisma.tokenReward.findMany({
      where: {
        userId,
        status: 'pending'
      }
    });
    
    const totalAmount = pending.reduce((sum, reward) => sum + reward.amount, 0);
    
    // Mark as claimed
    await prisma.tokenReward.updateMany({
      where: {
        userId,
        status: 'pending'
      },
      data: {
        status: 'claimed',
        claimedAt: new Date()
      }
    });
    
    // Update user balance
    await this.updateUserBalance(userId, totalAmount);
    
    return totalAmount;
  }
}

export const tokenRewardService = new TokenRewardService();
```

---

## 📊 **Database Schema Extensions**

```prisma
// Add to subscription schema

model TokenGatedSubscription {
  id                    String    @id @default(uuid())
  subscriptionId        String    @db.Uuid
  
  // Token requirements
  canopiMinBalance      Float?    @db.Decimal(20, 8)
  canopiStakingRequired Boolean   @default(false)
  canopiTier            String?   // 'bronze', 'silver', 'gold', 'platinum'
  
  communityTokenId      String?   @db.Uuid
  communityMinBalance   Float?    @db.Decimal(20, 8)
  communityStakingReq   Boolean   @default(false)
  
  requirementType       String    @default("all") // 'all' or 'any'
  
  // Token benefits
  priorityNotifications Boolean   @default(false)
  customPriority        Boolean   @default(false)
  muteOverride          Boolean   @default(false)
  analyticsAccess       Boolean   @default(false)
  exclusiveContent      Boolean   @default(false)
  
  // Token economics
  subscriptionCost      Float?    @db.Decimal(20, 8)
  rewardRate            Float?    @db.Decimal(20, 8)
  lastRewardClaim       DateTime? @db.Timestamptz(6)
  totalRewardsEarned    Float     @default(0) @db.Decimal(20, 8)
  
  // Verification
  lastTokenCheck        DateTime? @db.Timestamptz(6)
  tokenCheckStatus      String?   // 'verified', 'insufficient', 'error'
  
  createdAt             DateTime  @default(now()) @db.Timestamptz(6)
  updatedAt             DateTime  @updatedAt @db.Timestamptz(6)
  
  @@index([subscriptionId])
  @@index([communityTokenId])
}

model TokenReward {
  id                String    @id @default(uuid())
  userId            String    @db.Uuid
  subscriptionId    String    @db.Uuid
  amount            Float     @db.Decimal(20, 8)
  reason            String    // 'subscription_engagement', 'content_creation', etc.
  status            String    @default("pending") // 'pending', 'claimed', 'expired'
  claimedAt         DateTime? @db.Timestamptz(6)
  expiresAt         DateTime? @db.Timestamptz(6)
  createdAt         DateTime  @default(now()) @db.Timestamptz(6)
  
  @@index([userId, status])
  @@index([subscriptionId])
}

model UserTokenBalance {
  id                String    @id @default(uuid())
  userId            String    @db.Uuid
  tokenType         String    // 'CANOPI', 'COMMUNITY'
  tokenId           String?   // For community tokens
  balance           Float     @db.Decimal(20, 8)
  stakedBalance     Float     @default(0) @db.Decimal(20, 8)
  tier              String?   // 'bronze', 'silver', 'gold', 'platinum'
  lastUpdated       DateTime  @updatedAt @db.Timestamptz(6)
  
  @@unique([userId, tokenType, tokenId])
  @@index([userId])
}

model TokenStake {
  id                String    @id @default(uuid())
  userId            String    @db.Uuid
  tokenType         String    // 'CANOPI', 'COMMUNITY'
  amount            Float     @db.Decimal(20, 8)
  status            String    @default("active") // 'active', 'unstaking', 'withdrawn'
  stakedAt          DateTime  @default(now()) @db.Timestamptz(6)
  unstakeRequestAt  DateTime? @db.Timestamptz(6)
  withdrawableAt    DateTime? @db.Timestamptz(6)
  
  @@index([userId, status])
}
```

---

## 🎨 **User Experience Flow**

### **Flow 1: Token-Gated Subscription**

```
1. User clicks "Subscribe to Premium Room"
2. System checks token requirements
3. If insufficient:
   ┌─────────────────────────────────────┐
   │ 🔒 Token Required                   │
   │                                     │
   │ This room requires:                 │
   │ • 1,000 CANOPI tokens (staked)      │
   │                                     │
   │ You have: 500 CANOPI tokens         │
   │                                     │
   │ [Buy Tokens] [Learn More] [Cancel]  │
   └─────────────────────────────────────┘
4. If sufficient:
   ✅ Subscribe successfully
   🎁 "You'll earn 10 tokens per engagement!"
```

### **Flow 2: Token Balance Drop**

```
1. User's token balance drops below threshold
2. System detects during hourly check
3. Grace period starts (24 hours)
4. Notification sent:
   ┌─────────────────────────────────────┐
   │ ⚠️ Subscription At Risk             │
   │                                     │
   │ Your subscription to "Premium Chat" │
   │ requires 1,000 CANOPI tokens.       │
   │                                     │
   │ Current balance: 950 tokens         │
   │                                     │
   │ Grace period: 23 hours remaining    │
   │                                     │
   │ [Buy Tokens] [Unstake] [Dismiss]    │
   └─────────────────────────────────────┘
5. If not resolved:
   Subscription paused after grace period
```

---

## 🚀 **Recommended Implementation Phases**

### **Phase 1: Foundation** (Week 1-2)
- ✅ Token verification service
- ✅ Database schema extensions
- ✅ Basic token-gated subscriptions
- ✅ Token balance caching

### **Phase 2: Governance** (Week 3-4)
- ✅ Community token rules
- ✅ Token tier system
- ✅ Governance proposals for subscription features
- ✅ Multi-token support

### **Phase 3: Economics** (Week 5-6)
- ✅ Token rewards for engagement
- ✅ Subscription costs (burn/stake)
- ✅ Reward claiming system
- ✅ Token analytics

### **Phase 4: Advanced Features** (Week 7-8)
- ✅ Cross-community subscriptions
- ✅ Token bundles
- ✅ Dynamic pricing based on demand
- ✅ Token-gated content anchoring

---

## 🎯 **Success Metrics**

1. **Adoption**
   - % of subscriptions that are token-gated
   - Token holder subscription rate
   - Community token creation rate

2. **Engagement**
   - Tokens earned per user
   - Subscription retention for token holders
   - Token holder engagement vs non-holders

3. **Economics**
   - Token velocity from subscriptions
   - Subscription revenue in tokens
   - Token staking rate

4. **Governance**
   - Proposals related to subscriptions
   - Voter participation rate
   - Community rule adoption

---

## 📝 **Key Decisions Needed**

### **Priority 1: Access Model**
- [ ] Should tokens be required or optional for subscriptions?
- [ ] What's the minimum viable token requirement?
- [ ] How long should grace periods be?

### **Priority 2: Economics**
- [ ] Should subscriptions cost tokens (burn/stake/hold)?
- [ ] What's the reward rate for engagement?
- [ ] How do rewards flow to content creators?

### **Priority 3: Governance**
- [ ] Can communities set their own rules?
- [ ] What requires governance approval?
- [ ] How do we handle rule changes?

---

## 🎉 **Summary**

Token-gated subscriptions enable:
- ✅ **Premium access** for token holders
- ✅ **Tiered benefits** based on holdings
- ✅ **Community governance** over features
- ✅ **Token rewards** for engagement
- ✅ **Cross-community** portability

**Next Steps:**
1. Answer guiding questions
2. Choose implementation phase
3. Define token requirements
4. Build token verification service
5. Launch pilot with one community

**This creates a powerful flywheel: Tokens → Access → Engagement → Rewards → More Tokens!** 🚀



