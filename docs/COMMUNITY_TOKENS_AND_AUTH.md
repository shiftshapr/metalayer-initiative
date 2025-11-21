# Community Tokens and Auth System

## Overview

Extended token launch system supporting:
- **Per-community token launches** (Google, X, Discord, Facebook, blockchains)
- **Multiple auth methods** (web3auth, OAuth2, SSO, DWeb)
- **Waitlist and batch access** with pioneer badges
- **Proof of humanity** integration (Fractal ID)
- **Activity rewards** for PoH-verified users
- **Extension logging to JAUmemory**

## Community Token Launches

### Priority Communities

First tokens likely to launch:
1. **OAuth Communities** - Google, X, Discord, Facebook
2. **Blockchain Communities** - Ethereum, Solana, Base, Polygon, Arbitrum
3. **Large Existing Communities** - Communities with established user bases

### Token Launch Flow

1. **Community creates token launch**
   - Defines token name, symbol, chain
   - Sets up milestones
   - Configures bonding curve parameters

2. **Milestone tracking**
   - Community-specific milestones
   - Engagement thresholds
   - Governance readiness

3. **Activation**
   - Bonding curve goes live
   - Community members can mint/burn
   - Fees accrue to community treasury

4. **DEX Transition**
   - Break out of bonding curve
   - Seed liquidity on DEX
   - Open trading

## Authentication System

### Supported Auth Methods

#### 1. Wallets (via web3auth)
- Ethereum
- Solana
- Base
- Other EVM chains

#### 2. OAuth2
- Google
- X (Twitter)
- Discord
- Facebook

#### 3. SSO (Self-Registration)
- Companies can self-register
- Custom SSO providers
- Enterprise access

#### 4. DWeb
- Mastodon
- Nostr
- Universal ID
- Other decentralized identity systems

#### 5. Generated Keys
- For users without other auth methods
- Keys generated and stored securely
- Can be upgraded to other methods later

### Auth Flow

1. **User selects auth method**
2. **Authenticates with provider**
3. **System creates/links account**
4. **User can add multiple auth methods**
5. **One method marked as primary**

## Waitlist and Batch Access

### Waitlist System

Users without existing auth methods:
1. Join community waitlist
2. System generates keys
3. Assigned to batch when ready

### Batch System

**Batch Structure:**
- **Batch 1 (Pioneers)** - First access, get pioneer badge
- **Batch 2+** - Subsequent batches with specific missions

**Batch Missions:**
- Grow the overweb
- Participate in desirable properties
- Use Canopi and provide feedback
- Improve system dynamics

**Access Grant:**
- Batches granted access in sequence
- Users can provide feedback
- System configures based on feedback

## Proof of Humanity

### Integration

- **Fractal ID** - Primary PoH provider
- Other PoH providers supported
- Verification required for rewards

### PoH Benefits

- **Activity Rewards** - PoH-verified users earn rewards
- **System Dynamics** - Activity affects system behavior
- **Governance** - PoH may be required for certain votes

## Activity Rewards

### Reward Types

- **Messages** - 1.0 tokens per message
- **Governance** - 5.0 tokens per vote/contribution
- **Contributions** - 10.0 tokens for major contributions
- **Participation** - 2.0 tokens for participation

### Requirements

- **Proof of Humanity** - Required for rewards (default)
- **Community Context** - Rewards can be community-specific
- **Activity Tracking** - All activities tracked

## Extension Logging to JAUmemory

### Log Types

- **Milestones** - Token launch milestones
- **Errors** - System errors and exceptions
- **Warnings** - Important warnings
- **Info** - General information

### Integration

Extension sends logs to:
1. **Database** - Stored in `ExtensionLog` table
2. **JAUmemory** - Stored as memories via MCP
3. **Tags** - Categorized for easy retrieval

### Usage

```javascript
// In extension
await fetch('/api/community-tokens/extension/logs', {
  method: 'POST',
  body: JSON.stringify({
    userId: userId,
    logType: 'milestone',
    category: 'token_launch',
    message: 'Token launch milestone completed',
    data: { milestoneKey: 'community_engagement', status: 'completed' }
  })
});
```

## Database Models

### New Models

- `CommunityTokenLaunch` - Per-community token launches
- `CommunityTokenMilestone` - Community-specific milestones
- `CommunityTokenTransaction` - Token transactions
- `CommunityWaitlistEntry` - Waitlist entries
- `CommunityBatch` - Batch configurations
- `UserBadge` - User badges and achievements
- `AuthProvider` - Auth provider configurations
- `UserAuthMethod` - User auth methods
- `ActivityReward` - Activity rewards
- `ExtensionLog` - Extension logs

## API Endpoints

### Community Tokens
- `GET /api/community-tokens/communities/:communityId/token-launch`
- `POST /api/community-tokens/communities/:communityId/token-launch`
- `GET /api/community-tokens/token-launches/active`

### Waitlist
- `POST /api/community-tokens/communities/:communityId/waitlist`
- `GET /api/community-tokens/communities/:communityId/waitlist`
- `POST /api/community-tokens/communities/:communityId/batches`
- `POST /api/community-tokens/communities/:communityId/batches/:batchNumber/assign`
- `POST /api/community-tokens/communities/:communityId/batches/:batchNumber/grant-access`
- `POST /api/community-tokens/users/:userId/proof-of-humanity`

### Auth
- `GET /api/community-tokens/auth/providers`
- `GET /api/community-tokens/users/:userId/auth-methods`

### Rewards
- `POST /api/community-tokens/users/:userId/activities/reward`
- `GET /api/community-tokens/users/:userId/rewards`
- `GET /api/community-tokens/users/:userId/rewards/summary`

### Logging
- `POST /api/community-tokens/extension/logs`

## Implementation Steps

1. **Add Database Schema**
   - Copy models from `community-token-schema.prisma`
   - Add to main `schema.prisma`
   - Run migration

2. **Initialize Auth Providers**
   ```javascript
   await authService.initializeDefaultProviders();
   ```

3. **Add Routes**
   ```javascript
   const communityTokenRoutes = require('./routes/communityTokens');
   app.use('/api/community-tokens', communityTokenRoutes);
   ```

4. **Configure JAUmemory**
   - Set `JAUMEMORY_ENABLED=true`
   - Set `JAUMEMORY_AUTO_STORE=true`
   - Configure MCP connection

5. **Set Up Extension Logging**
   - Add logging calls in extension
   - Configure error handling
   - Test JAUmemory integration

## Next Steps

1. Integrate web3auth for wallet authentication
2. Set up OAuth2 providers (Google, X, Discord, Facebook)
3. Implement DWeb auth (Mastodon, Nostr, Universal ID)
4. Integrate Fractal ID for proof of humanity
5. Build batch management UI
6. Create pioneer badge system
7. Implement activity reward distribution
8. Set up JAUmemory MCP connection








