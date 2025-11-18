# Creator Subscription Economy - Token-Paid Feeds

## 🎯 **Vision**

Enable creators (participants & communities) to monetize their curated feeds through **token-paid subscriptions**, where subscribers pay tokens to receive notifications about:
- **Public activities** (posts, updates, announcements)
- **Private/exclusive content** (behind-the-paywall content)
- **Curated collections** (handpicked content streams)
- **Creative works** (art, writing, code, designs)

---

## 💡 **Core Concept**

### **Curated Feeds = Subscription Products**

```
Creator → Curates Feed → Sets Token Price → Subscriber Pays → Gets Notifications
```

**Examples:**
- **Artist Feed**: "Subscribe for 50 CANOPI/month to get notified about my new artwork"
- **Developer Feed**: "100 COMM tokens for exclusive code updates and tutorials"
- **Community Feed**: "25 tokens for curated community highlights and announcements"
- **Alpha Feed**: "500 tokens for early access to project updates"

---

## 🏗️ **Architecture**

### **1. Feed Types**

```typescript
type FeedType = 
  | 'participant'   // Individual creator feed
  | 'community'     // Community curated feed
  | 'collection'    // Curated collection feed
  | 'topic';        // Topic-based feed

type FeedVisibility = 
  | 'public'        // Free, anyone can subscribe
  | 'token_gated'   // Requires token payment
  | 'private';      // Invite-only + token payment

type FeedContentType =
  | 'all'           // All creator activities
  | 'posts'         // Posts only
  | 'creations'     // Creative works only
  | 'announcements' // Announcements only
  | 'exclusive'     // Exclusive/private content only
  | 'curated';      // Manually curated items
```

### **2. Curated Feed Model**

```typescript
interface CuratedFeed {
  // Identity
  id: string;
  feedType: FeedType;
  creatorId: string;           // User or community ID
  creatorType: 'user' | 'community';
  
  // Feed details
  name: string;
  description: string;
  coverImage?: string;
  tags: string[];
  
  // Visibility & Access
  visibility: FeedVisibility;
  contentTypes: FeedContentType[];
  
  // Token Economics
  pricing: {
    // Subscription cost
    subscriptionCost: {
      amount: number;
      tokenType: 'CANOPI' | 'COMMUNITY';
      tokenId?: string;        // For community tokens
      interval: 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
    };
    
    // Revenue split
    revenueSplit: {
      creator: number;         // % to creator (e.g., 70%)
      platform: number;        // % to platform (e.g., 20%)
      community: number;       // % to community (e.g., 10%)
    };
    
    // Pricing tiers (optional)
    tiers?: Array<{
      name: string;            // "Basic", "Premium", "VIP"
      cost: number;
      benefits: string[];
      contentTypes: FeedContentType[];
    }>;
  };
  
  // Subscription Management
  subscriptionSettings: {
    autoRenew: boolean;
    trialPeriod?: number;      // Days of free trial
    refundPolicy?: string;
    maxSubscribers?: number;   // Cap on subscribers
    waitlistEnabled: boolean;
  };
  
  // Content Curation
  curation: {
    isAutomated: boolean;      // Auto-include all content
    requiresApproval: boolean; // Manual approval for each item
    filters?: {                // Automated filters
      minQuality?: number;
      includeHashtags?: string[];
      excludeHashtags?: string[];
    };
  };
  
  // Analytics
  stats: {
    totalSubscribers: number;
    activeSubscribers: number;
    totalRevenue: number;
    avgEngagement: number;
    contentCount: number;
  };
  
  // Metadata
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
}
```

### **3. Feed Subscription Model**

```typescript
interface FeedSubscription extends Subscription {
  // Feed reference
  feedId: string;
  feedName: string;
  creatorId: string;
  
  // Payment details
  payment: {
    amount: number;
    tokenType: 'CANOPI' | 'COMMUNITY';
    tokenId?: string;
    interval: 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
    
    // Payment tracking
    lastPayment: number;       // Timestamp
    nextPayment: number;       // Timestamp
    totalPaid: number;         // Lifetime total
    
    // Payment status
    status: 'active' | 'pending' | 'expired' | 'cancelled';
    autoRenew: boolean;
    
    // Transaction history
    transactions: Array<{
      id: string;
      amount: number;
      timestamp: number;
      status: 'pending' | 'completed' | 'failed' | 'refunded';
      txHash?: string;         // On-chain transaction hash
    }>;
  };
  
  // Subscription tier
  tier?: {
    name: string;
    benefits: string[];
  };
  
  // Trial period
  trial?: {
    isTrialing: boolean;
    trialEndsAt: number;
  };
  
  // Access control
  access: {
    contentTypes: FeedContentType[];
    startDate: number;
    expiresAt?: number;
    isLifetime: boolean;
  };
}
```

---

## 💰 **Token Payment Flow**

### **Flow 1: Subscribe to Creator Feed**

```typescript
// 1. User browses creator feeds
const feed = await feedService.getFeed('feed-123');

// 2. User subscribes with tokens
const result = await feedSubscriptionService.subscribe({
  feedId: 'feed-123',
  tier: 'premium',
  payment: {
    amount: 100,              // 100 tokens
    tokenType: 'CANOPI',
    interval: 'monthly',
    autoRenew: true
  }
});

// 3. System processes payment
if (result.success) {
  // a. Deduct tokens from user balance
  await tokenService.deductTokens(userId, 100, 'CANOPI');
  
  // b. Distribute revenue
  await revenueService.distributeRevenue({
    feedId: 'feed-123',
    amount: 100,
    split: {
      creator: 70,    // 70 tokens to creator
      platform: 20,   // 20 tokens to platform
      community: 10   // 10 tokens to community
    }
  });
  
  // c. Create subscription
  await subscriptionManager.subscribe({
    targetType: 'feed',
    targetId: 'feed-123',
    preferences: {
      enabled: true,
      sound: true,
      desktop: true
    }
  });
  
  // d. Notify creator
  await notificationManager.showNotification('SYSTEM_ALERT', {
    title: 'New Subscriber!',
    message: `${userName} subscribed to your feed (100 CANOPI)`,
    source: { category: 'personal' }
  });
}
```

### **Flow 2: Auto-Renewal**

```typescript
// Daily cron job checks expiring subscriptions
async function processAutoRenewals() {
  const expiring = await feedSubscriptionService.getExpiringSubscriptions({
    expiresWithin: 86400000,  // 24 hours
    autoRenew: true
  });
  
  for (const subscription of expiring) {
    // Check if user has sufficient balance
    const balance = await tokenService.getBalance(
      subscription.userId,
      subscription.payment.tokenType
    );
    
    if (balance >= subscription.payment.amount) {
      // Renew subscription
      await feedSubscriptionService.renewSubscription(subscription.id);
      
      // Notify user
      await notificationManager.showNotification('SYSTEM_ALERT', {
        title: 'Subscription Renewed',
        message: `Your subscription to ${subscription.feedName} has been renewed (${subscription.payment.amount} tokens)`,
        source: { category: 'personal' }
      });
    } else {
      // Insufficient balance - notify user
      await notificationManager.showNotification('SYSTEM_ALERT', {
        title: 'Subscription Expiring',
        message: `Your subscription to ${subscription.feedName} expires in 24 hours. Add ${subscription.payment.amount - balance} more tokens to renew.`,
        priority: 'high',
        source: { category: 'personal' }
      });
    }
  }
}
```

### **Flow 3: Content Notification**

```typescript
// When creator publishes content
async function onContentPublished(content: Content) {
  // Get feed subscribers
  const feed = await feedService.getFeedByCreator(content.creatorId);
  const subscribers = await feedSubscriptionService.getActiveSubscribers(feed.id);
  
  // Filter by content type access
  const eligibleSubscribers = subscribers.filter(sub => {
    // Check if subscriber has access to this content type
    return sub.access.contentTypes.includes(content.type);
  });
  
  // Send notifications to eligible subscribers
  for (const subscriber of eligibleSubscribers) {
    await notificationManager.showNotification('MESSAGE_NEW', {
      title: `New ${content.type} from ${feed.name}`,
      message: content.title || content.preview,
      url: content.url,
      anchor: {
        target: `[data-content-id="${content.id}"]`,
        highlightStyle: 'glow'
      },
      source: {
        category: 'subscription',
        subscriptionId: subscriber.id,
        targetType: 'feed',
        targetId: feed.id,
        targetName: feed.name
      }
    });
  }
}
```

---

## 🎨 **Creator Dashboard**

### **Feed Management UI**

```typescript
// Creator creates a new feed
interface CreateFeedForm {
  // Basic info
  name: string;
  description: string;
  coverImage: File;
  tags: string[];
  
  // Content settings
  contentTypes: FeedContentType[];
  visibility: FeedVisibility;
  
  // Pricing
  pricing: {
    tier: 'free' | 'basic' | 'premium' | 'custom';
    
    // If custom
    customPricing?: {
      amount: number;
      tokenType: 'CANOPI' | 'COMMUNITY';
      interval: 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
    };
  };
  
  // Revenue split (optional, defaults to platform standard)
  customRevenueSplit?: {
    creator: number;
    platform: number;
    community: number;
  };
}

// Example: Create artist feed
const feed = await feedService.createFeed({
  name: "Sarah's Art Studio",
  description: "Exclusive access to my latest artwork, process videos, and tutorials",
  tags: ['art', 'digital-art', 'tutorials'],
  contentTypes: ['creations', 'posts', 'exclusive'],
  visibility: 'token_gated',
  pricing: {
    tier: 'custom',
    customPricing: {
      amount: 50,
      tokenType: 'CANOPI',
      interval: 'monthly'
    }
  }
});
```

### **Analytics Dashboard**

```typescript
interface FeedAnalytics {
  // Subscribers
  subscribers: {
    total: number;
    active: number;
    new: number;              // This month
    churned: number;          // This month
    growthRate: number;       // %
  };
  
  // Revenue
  revenue: {
    total: number;            // All time
    thisMonth: number;
    lastMonth: number;
    projected: number;        // Next month
    averagePerSubscriber: number;
  };
  
  // Engagement
  engagement: {
    avgNotificationOpenRate: number;
    avgContentViews: number;
    avgTimeSpent: number;
    topContent: Array<{
      id: string;
      title: string;
      views: number;
      engagement: number;
    }>;
  };
  
  // Content
  content: {
    totalPublished: number;
    thisMonth: number;
    avgPerWeek: number;
    byType: Record<FeedContentType, number>;
  };
}
```

---

## 📊 **Database Schema**

```prisma
// Curated feeds
model CuratedFeed {
  id                String    @id @default(uuid())
  feedType          String    // 'participant', 'community', 'collection', 'topic'
  creatorId         String    @db.Uuid
  creatorType       String    // 'user', 'community'
  
  // Details
  name              String
  description       String    @db.Text
  coverImage        String?
  tags              String[]
  
  // Visibility
  visibility        String    // 'public', 'token_gated', 'private'
  contentTypes      String[]  // Array of FeedContentType
  
  // Pricing
  subscriptionCost  Float     @db.Decimal(20, 8)
  tokenType         String    // 'CANOPI', 'COMMUNITY'
  tokenId           String?   @db.Uuid
  interval          String    // 'monthly', 'quarterly', 'yearly', 'lifetime'
  
  // Revenue split (percentages)
  creatorSplit      Float     @default(70) @db.Decimal(5, 2)
  platformSplit     Float     @default(20) @db.Decimal(5, 2)
  communitySplit    Float     @default(10) @db.Decimal(5, 2)
  
  // Settings
  autoRenew         Boolean   @default(true)
  trialPeriod       Int?      // Days
  maxSubscribers    Int?
  waitlistEnabled   Boolean   @default(false)
  
  // Curation
  isAutomated       Boolean   @default(true)
  requiresApproval  Boolean   @default(false)
  
  // Stats
  totalSubscribers  Int       @default(0)
  activeSubscribers Int       @default(0)
  totalRevenue      Float     @default(0) @db.Decimal(20, 8)
  contentCount      Int       @default(0)
  
  // Status
  isActive          Boolean   @default(true)
  createdAt         DateTime  @default(now()) @db.Timestamptz(6)
  updatedAt         DateTime  @updatedAt @db.Timestamptz(6)
  
  // Relations
  Subscriptions     FeedSubscription[]
  Content           FeedContent[]
  Tiers             FeedTier[]
  
  @@index([creatorId, creatorType])
  @@index([visibility])
  @@index([tokenType])
  @@index([isActive])
}

// Feed subscription tiers
model FeedTier {
  id                String    @id @default(uuid())
  feedId            String    @db.Uuid
  name              String    // 'Basic', 'Premium', 'VIP'
  description       String?   @db.Text
  cost              Float     @db.Decimal(20, 8)
  contentTypes      String[]  // What content types this tier includes
  benefits          String[]  // List of benefits
  sortOrder         Int       @default(0)
  
  Feed              CuratedFeed @relation(fields: [feedId], references: [id], onDelete: Cascade)
  
  @@index([feedId])
}

// Feed subscriptions (extends base subscription)
model FeedSubscription {
  id                String    @id @default(uuid())
  feedId            String    @db.Uuid
  userId            String    @db.Uuid
  tierId            String?   @db.Uuid
  
  // Payment
  amount            Float     @db.Decimal(20, 8)
  tokenType         String    // 'CANOPI', 'COMMUNITY'
  tokenId           String?   @db.Uuid
  interval          String    // 'monthly', 'quarterly', 'yearly', 'lifetime'
  
  // Payment tracking
  lastPayment       DateTime  @db.Timestamptz(6)
  nextPayment       DateTime? @db.Timestamptz(6)
  totalPaid         Float     @default(0) @db.Decimal(20, 8)
  
  // Status
  status            String    @default("active") // 'active', 'pending', 'expired', 'cancelled'
  autoRenew         Boolean   @default(true)
  
  // Trial
  isTrialing        Boolean   @default(false)
  trialEndsAt       DateTime? @db.Timestamptz(6)
  
  // Access
  contentTypes      String[]  // What content types user has access to
  startDate         DateTime  @default(now()) @db.Timestamptz(6)
  expiresAt         DateTime? @db.Timestamptz(6)
  isLifetime        Boolean   @default(false)
  
  // Metadata
  createdAt         DateTime  @default(now()) @db.Timestamptz(6)
  updatedAt         DateTime  @updatedAt @db.Timestamptz(6)
  
  // Relations
  Feed              CuratedFeed @relation(fields: [feedId], references: [id], onDelete: Cascade)
  Transactions      FeedPaymentTransaction[]
  
  @@unique([feedId, userId])
  @@index([userId])
  @@index([status])
  @@index([nextPayment])
}

// Payment transactions
model FeedPaymentTransaction {
  id                String    @id @default(uuid())
  subscriptionId    String    @db.Uuid
  userId            String    @db.Uuid
  feedId            String    @db.Uuid
  
  // Transaction details
  amount            Float     @db.Decimal(20, 8)
  tokenType         String    // 'CANOPI', 'COMMUNITY'
  transactionType   String    // 'subscription', 'renewal', 'refund'
  status            String    @default("pending") // 'pending', 'completed', 'failed', 'refunded'
  
  // On-chain
  txHash            String?   // Blockchain transaction hash
  blockNumber       BigInt?
  
  // Revenue distribution
  creatorAmount     Float     @db.Decimal(20, 8)
  platformAmount    Float     @db.Decimal(20, 8)
  communityAmount   Float     @db.Decimal(20, 8)
  
  // Metadata
  createdAt         DateTime  @default(now()) @db.Timestamptz(6)
  completedAt       DateTime? @db.Timestamptz(6)
  
  // Relations
  Subscription      FeedSubscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  
  @@index([subscriptionId])
  @@index([userId])
  @@index([feedId])
  @@index([status])
  @@index([createdAt(sort: Desc)])
}

// Feed content items
model FeedContent {
  id                String    @id @default(uuid())
  feedId            String    @db.Uuid
  creatorId         String    @db.Uuid
  
  // Content details
  contentType       String    // 'post', 'creation', 'announcement', 'exclusive'
  title             String?
  preview           String?   @db.Text
  content           String?   @db.Text
  url               String?
  mediaUrls         String[]
  
  // Access control
  visibility        String    @default("subscribers") // 'public', 'subscribers', 'tier_specific'
  requiredTier      String?   // If tier_specific
  
  // Curation
  isApproved        Boolean   @default(false)
  approvedBy        String?   @db.Uuid
  approvedAt        DateTime? @db.Timestamptz(6)
  
  // Engagement
  views             Int       @default(0)
  engagements       Int       @default(0)
  
  // Metadata
  publishedAt       DateTime  @default(now()) @db.Timestamptz(6)
  createdAt         DateTime  @default(now()) @db.Timestamptz(6)
  
  // Relations
  Feed              CuratedFeed @relation(fields: [feedId], references: [id], onDelete: Cascade)
  
  @@index([feedId])
  @@index([creatorId])
  @@index([contentType])
  @@index([publishedAt(sort: Desc)])
}

// Creator revenue tracking
model CreatorRevenue {
  id                String    @id @default(uuid())
  creatorId         String    @db.Uuid
  creatorType       String    // 'user', 'community'
  feedId            String?   @db.Uuid
  
  // Revenue
  amount            Float     @db.Decimal(20, 8)
  tokenType         String    // 'CANOPI', 'COMMUNITY'
  source            String    // 'subscription', 'renewal', 'tip'
  
  // Status
  status            String    @default("pending") // 'pending', 'available', 'withdrawn'
  withdrawnAt       DateTime? @db.Timestamptz(6)
  withdrawTxHash    String?
  
  // Metadata
  createdAt         DateTime  @default(now()) @db.Timestamptz(6)
  
  @@index([creatorId, status])
  @@index([feedId])
  @@index([createdAt(sort: Desc)])
}
```

---

## 🎯 **Use Cases**

### **1. Artist Monetization**

```typescript
// Artist creates exclusive art feed
const feed = await feedService.createFeed({
  name: "Sarah's Art Studio",
  description: "Exclusive artwork, process videos, and tutorials",
  contentTypes: ['creations', 'exclusive'],
  pricing: {
    amount: 50,
    tokenType: 'CANOPI',
    interval: 'monthly'
  }
});

// Fan subscribes
await feedSubscriptionService.subscribe({
  feedId: feed.id,
  payment: {
    amount: 50,
    tokenType: 'CANOPI',
    interval: 'monthly',
    autoRenew: true
  }
});

// Artist publishes new artwork
await feedService.publishContent({
  feedId: feed.id,
  contentType: 'creation',
  title: "New Digital Painting",
  mediaUrls: ['ipfs://...'],
  visibility: 'subscribers'
});

// All subscribers get notification
// → "New creation from Sarah's Art Studio"
```

### **2. Community Curated Feed**

```typescript
// Community creates curated highlights feed
const feed = await feedService.createFeed({
  name: "Tech Community Highlights",
  description: "Best discussions, resources, and announcements",
  contentTypes: ['curated', 'announcements'],
  pricing: {
    amount: 25,
    tokenType: 'COMMUNITY',
    tokenId: 'TECH',
    interval: 'monthly'
  },
  curation: {
    isAutomated: false,
    requiresApproval: true  // Moderators curate content
  }
});

// Moderator adds curated content
await feedService.addCuratedContent({
  feedId: feed.id,
  contentType: 'curated',
  title: "Must-read: AI Safety Discussion",
  url: '/discussions/ai-safety-123',
  preview: "Deep dive into AI safety considerations..."
});

// Subscribers get notification
// → "New curated content: Must-read: AI Safety Discussion"
```

### **3. Developer Alpha Feed**

```typescript
// Developer creates early access feed
const feed = await feedService.createFeed({
  name: "Project Alpha - Early Access",
  description: "Get early access to updates, features, and code",
  contentTypes: ['exclusive', 'announcements'],
  pricing: {
    amount: 500,
    tokenType: 'CANOPI',
    interval: 'quarterly'
  },
  subscriptionSettings: {
    maxSubscribers: 100,  // Limited spots
    waitlistEnabled: true
  }
});

// Early supporter subscribes
await feedSubscriptionService.subscribe({
  feedId: feed.id,
  payment: {
    amount: 500,
    tokenType: 'CANOPI',
    interval: 'quarterly'
  }
});

// Developer shares exclusive update
await feedService.publishContent({
  feedId: feed.id,
  contentType: 'exclusive',
  title: "Alpha v0.2 Released",
  content: "New features: ...",
  url: '/releases/alpha-v0.2'
});

// Only subscribers get early access notification
```

### **4. Tiered Subscription Model**

```typescript
// Creator sets up tiered feed
const feed = await feedService.createFeed({
  name: "Creator Pro",
  description: "Multi-tier access to my content",
  contentTypes: ['all']
});

// Add tiers
await feedService.addTier({
  feedId: feed.id,
  name: "Basic",
  cost: 25,
  contentTypes: ['posts', 'announcements'],
  benefits: ["Weekly updates", "Community access"]
});

await feedService.addTier({
  feedId: feed.id,
  name: "Premium",
  cost: 100,
  contentTypes: ['posts', 'announcements', 'creations', 'exclusive'],
  benefits: ["All Basic benefits", "Exclusive content", "Early access", "Direct messaging"]
});

// User subscribes to Premium tier
await feedSubscriptionService.subscribe({
  feedId: feed.id,
  tier: 'premium',
  payment: {
    amount: 100,
    tokenType: 'CANOPI',
    interval: 'monthly'
  }
});
```

---

## 🚀 **Implementation Phases**

### **Phase 1: Core Feed System** (Week 1-2)
- ✅ Feed creation & management
- ✅ Basic token payment
- ✅ Subscription tracking
- ✅ Content publishing
- ✅ Notification delivery

### **Phase 2: Payment Processing** (Week 3-4)
- ✅ Token deduction
- ✅ Revenue distribution
- ✅ Auto-renewal
- ✅ Transaction history
- ✅ Refund handling

### **Phase 3: Creator Tools** (Week 5-6)
- ✅ Creator dashboard
- ✅ Analytics
- ✅ Content curation tools
- ✅ Subscriber management
- ✅ Revenue withdrawal

### **Phase 4: Advanced Features** (Week 7-8)
- ✅ Tiered subscriptions
- ✅ Trial periods
- ✅ Waitlists
- ✅ Cross-feed bundles
- ✅ Gifted subscriptions

---

## 💡 **Key Features**

### **For Creators**
- ✅ Monetize curated feeds with tokens
- ✅ Set custom pricing & intervals
- ✅ Control revenue splits
- ✅ Curate content (manual or automated)
- ✅ Track analytics & revenue
- ✅ Withdraw earnings

### **For Subscribers**
- ✅ Pay with tokens (CANOPI or community)
- ✅ Auto-renewal option
- ✅ Free trial periods
- ✅ Tiered access levels
- ✅ Manage subscriptions
- ✅ Notification preferences

### **For Platform**
- ✅ Revenue share from subscriptions
- ✅ Token utility & demand
- ✅ Creator economy growth
- ✅ Content quality curation
- ✅ Community engagement

---

## 🎉 **Summary**

**Creator Subscription Economy enables:**
- 💰 **Token-paid subscriptions** to curated feeds
- 🎨 **Creator monetization** of content & activities
- 📢 **Notification delivery** to paying subscribers
- 🏆 **Tiered access** with different benefits
- 📊 **Revenue tracking** and analytics
- 🔄 **Auto-renewal** for seamless experience

**This creates a sustainable creator economy where:**
1. Creators curate valuable feeds
2. Subscribers pay tokens for access
3. Revenue is distributed fairly
4. Notifications keep subscribers engaged
5. Token utility drives demand
6. Everyone benefits! 🚀

**Next Steps:**
1. Build feed creation UI
2. Implement token payment flow
3. Set up revenue distribution
4. Create creator dashboard
5. Launch with pilot creators



