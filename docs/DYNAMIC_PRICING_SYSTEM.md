# Dynamic Pricing System

## Overview

A token-based dynamic pricing system that balances demand and availability. Costs appreciate as resources become more scarce, with free tiers for early users.

## Key Features

1. **Free Tier** - First system-wide users get free access
2. **Dynamic Pricing** - Cost increases with demand
3. **Capacity Limits** - Maximum resource limits (e.g., 25 cursors per page)
4. **Data-Driven Optimization** - Automatically adjusts pricing based on usage patterns
5. **Tiered Pricing** - Multiple pricing tiers for different usage levels

## Example: Cursor Pricing

### Configuration
- **Free Tier**: First 3 cursors on a page are FREE
- **Max Capacity**: 25 cursors per page
- **Pricing Tiers**:
  - Tier 1 (3-9 cursors): 1 token + 0.5 tokens per additional cursor
  - Tier 2 (10-19 cursors): 5 tokens + 1 token per additional cursor
  - Tier 3 (20-24 cursors): 15 tokens + 2 tokens per additional cursor

### Cost Calculation Examples

| Current Cursors | Cost for Next User |
|----------------|-------------------|
| 0-2 | FREE |
| 3 | 1.0 tokens |
| 5 | 2.0 tokens (1.0 + 0.5×2) |
| 10 | 5.0 tokens |
| 15 | 10.0 tokens (5.0 + 1.0×5) |
| 20 | 15.0 tokens |
| 24 | 23.0 tokens (15.0 + 2.0×4) |
| 25 | Unavailable (at capacity) |

## Architecture

### Components

1. **DynamicPricingService** - Core pricing logic
2. **Database Models** - Pricing config, usage tracking, optimization data
3. **API Endpoints** - Cost calculation, access control, optimization

### Database Models

- `DynamicPricingConfig` - Pricing configuration per resource
- `ResourceUsage` - Active usage tracking
- `PricingOptimizationData` - Historical data for optimization

## API Endpoints

### Get Pricing Config
```
GET /api/dynamic-pricing/config?resourceType=cursor&resourceId=page-123
```

### Calculate Cost
```
GET /api/dynamic-pricing/cost?resourceType=cursor&resourceId=page-123
```

### Check Access
```
GET /api/dynamic-pricing/access?resourceType=cursor&resourceId=page-123
```

### Request Access
```
POST /api/dynamic-pricing/access
{
  "resourceType": "cursor",
  "resourceId": "page-123",
  "duration": 3600 // seconds
}
```

### Get Current Usage
```
GET /api/dynamic-pricing/usage?resourceType=cursor&resourceId=page-123
```

### Optimize Pricing
```
POST /api/dynamic-pricing/optimization/optimize?resourceType=cursor&lookbackDays=7
```

## Usage Flow

### 1. User Wants to Access Resource

```typescript
// Check cost
const costCalc = await dynamicPricingService.calculateCost(
  'cursor',
  'page-123',
  userId
);

if (costCalc.cost === 0) {
  // Free access
} else if (costCalc.cost === Infinity) {
  // At capacity
} else {
  // Show cost to user
}
```

### 2. User Confirms Access

```typescript
// Check if user has enough tokens
const access = await dynamicPricingService.checkAccess(
  'cursor',
  'page-123',
  userId
);

if (access.allowed) {
  // Charge user
  await dynamicPricingService.chargeForAccess(
    'cursor',
    'page-123',
    userId,
    access.cost
  );

  // Record usage
  await dynamicPricingService.recordUsage(
    'cursor',
    'page-123',
    userId,
    3600 // 1 hour
  );
}
```

### 3. Usage Expires

```typescript
// Usage automatically expires based on expiresAt
// Or manually end usage
await dynamicPricingService.endUsage(usageId);
```

## Optimization

### Data Collection

The system collects:
- Current usage levels
- Current costs
- Demand levels (0-1)
- Availability levels (0-1)
- Conversion rates (how many users pay vs abandon)

### Automatic Optimization

Pricing is optimized based on:
- **High Demand + Low Availability** → Increase costs
- **Low Demand + High Availability** → Decrease costs
- **Low Conversion Rate** → Adjust free tier or reduce costs
- **High Conversion Rate** → May increase free tier if capacity allows

### Manual Optimization

```typescript
// Optimize pricing based on last 7 days
const optimized = await dynamicPricingService.optimizePricing(
  'cursor',
  'page-123',
  7 // days
);
```

## Integration

### Add to app.js

```javascript
const dynamicPricingRoutes = require('./routes/dynamicPricing');
app.use('/api/dynamic-pricing', dynamicPricingRoutes);
```

### Initialize Cursor Pricing

```bash
node scripts/init-cursor-pricing.js
```

### Frontend Integration

```typescript
// Check cost before showing cursor
const response = await fetch(
  `/api/dynamic-pricing/cost?resourceType=cursor&resourceId=${pageId}`,
  { headers: { Authorization: `Bearer ${token}` } }
);
const { data: costCalc } = await response.json();

if (costCalc.cost === 0) {
  // Show cursor (free)
} else if (costCalc.cost === Infinity) {
  // Show "at capacity" message
} else {
  // Show cost and ask user to confirm
  const confirmed = await showCostDialog(costCalc.cost);
  if (confirmed) {
    // Request access
    await fetch('/api/dynamic-pricing/access', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        resourceType: 'cursor',
        resourceId: pageId,
        duration: 3600
      })
    });
  }
}
```

## Configuration

### Create Pricing Config

```typescript
const config: DynamicPricingConfig = {
  resourceType: 'cursor',
  resourceId: null, // Global or specific page
  freeTierLimit: 3,
  maxCapacity: 25,
  pricingTiers: [
    {
      name: 'tier_1',
      startUsage: 3,
      baseCost: 1.0,
      costPerUnit: 0.5
    },
    // ... more tiers
  ],
  optimizationEnabled: true
};

await dynamicPricingService.upsertPricingConfig(config);
```

## Benefits

1. **Fair Resource Allocation** - Prevents resource hoarding
2. **Revenue Generation** - Token-based monetization
3. **Automatic Optimization** - Self-adjusting based on demand
4. **Free Tier** - Encourages early adoption
5. **Scalable** - Works for any resource type

## Future Enhancements

1. **ML-Based Optimization** - Machine learning for better pricing
2. **Predictive Pricing** - Forecast costs based on patterns
3. **Auction System** - Allow users to bid for access
4. **Priority Access** - Premium users get priority
5. **Resource Bundles** - Discounts for multiple resources






