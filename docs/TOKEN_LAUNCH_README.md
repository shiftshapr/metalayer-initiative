# Token Launch System

Complete blockchain-agnostic infrastructure for token launch with bonding curve, milestone tracking, governance, treasury management, and security monitoring.

## Quick Start

### 1. Database Setup

Add the token launch schema to your Prisma schema:

```bash
# Copy models from token-launch-schema.prisma to schema.prisma
# Add relations to AppUser model (see TOKEN_LAUNCH_IMPLEMENTATION_PLAN.md)
# Run migration
npx prisma migrate dev --name add_token_launch_models
```

### 2. Initialize Milestones

```bash
node scripts/init-token-launch-milestones.js
```

### 3. Add Routes to app.js

```javascript
const tokenLaunchRoutes = require('./routes/tokenLaunch');
app.use('/api/token-launch', tokenLaunchRoutes);
```

### 4. Set Up Scheduled Tasks

Add to your cron or task scheduler:

```bash
# Daily metrics calculation
0 0 * * * node scripts/calculate-community-metrics.js

# Hourly security monitoring
0 * * * * node scripts/run-security-monitoring.js
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Token Launch System                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Milestones  │  │  Governance  │  │   Treasury   │  │
│  │   Service    │  │   Service    │  │   Service    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Metrics    │  │    Token     │  │   Security   │  │
│  │   Service    │  │   Utility    │  │   Service    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              API Routes & Controllers                 │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              Database (PostgreSQL)                    │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Components

### 1. Milestone Tracking

Tracks verifiable milestones required for token launch activation.

**Key Features:**
- Cryptographic attestations
- Evidence storage (IPFS/Arweave ready)
- Independent verification
- Launch readiness calculation

**API:**
- `GET /api/token-launch/milestones` - Get all milestones
- `GET /api/token-launch/milestones/:key` - Get specific milestone
- `GET /api/token-launch/milestones/readiness/status` - Get launch readiness
- `PUT /api/token-launch/milestones/:key` - Update milestone
- `POST /api/token-launch/milestones/:milestoneId/attestations` - Add attestation

### 2. Community Metrics

Tracks community engagement metrics for milestone verification.

**Key Features:**
- Automated calculation
- Historical tracking
- Engagement milestone checking
- Trend analysis

**API:**
- `GET /api/token-launch/metrics` - Get current metrics
- `GET /api/token-launch/metrics/history` - Get metrics history
- `GET /api/token-launch/metrics/engagement-check` - Check engagement milestone
- `POST /api/token-launch/metrics/calculate` - Calculate and store metrics

### 3. Governance

Proposal creation, voting, and execution system.

**Key Features:**
- Token-weighted voting (when tokens live)
- Snapshot-based voting
- Quorum and approval thresholds
- Proposal execution

**API:**
- `GET /api/token-launch/governance/proposals` - Get proposals
- `POST /api/token-launch/governance/proposals` - Create proposal
- `POST /api/token-launch/governance/proposals/:id/votes` - Cast vote
- `GET /api/token-launch/governance/proposals/:id/results` - Get results

### 4. Treasury Management

Treasury transaction tracking, balances, and allocations.

**Key Features:**
- Transaction tracking
- Balance management
- Fund allocation
- Approval workflows

**API:**
- `GET /api/token-launch/treasury/summary` - Get treasury summary
- `GET /api/token-launch/treasury/transactions` - Get transactions
- `POST /api/token-launch/treasury/transactions` - Create transaction
- `POST /api/token-launch/treasury/transactions/:id/approve` - Approve transaction
- `POST /api/token-launch/treasury/transactions/:id/execute` - Execute transaction

### 5. Token Utility

Token gating and utility integration across the platform.

**Key Features:**
- Access gating
- Balance tracking
- Utility configuration
- On-chain sync (placeholder)

**API:**
- `GET /api/token-launch/token-utilities` - Get utilities
- `GET /api/token-launch/token-utilities/check-access` - Check user access
- `GET /api/token-launch/users/:userId/balance` - Get user balance
- `POST /api/token-launch/users/:userId/balance/sync` - Sync balance

### 6. Security Monitoring

Security alerts, anomaly detection, and multisig management.

**Key Features:**
- Automated monitoring
- Alert generation
- Multisig signer management
- Incident tracking

**API:**
- `GET /api/token-launch/security/alerts` - Get alerts
- `POST /api/token-launch/security/alerts/:id/acknowledge` - Acknowledge alert
- `GET /api/token-launch/security/multisig-signers` - Get signers
- `POST /api/token-launch/security/monitoring/run` - Run monitoring checks

## Database Models

See `prisma/token-launch-schema.prisma` for complete schema:

- `TokenLaunchMilestone` - Milestone tracking
- `MilestoneAttestation` - Cryptographic attestations
- `CommunityMetrics` - Engagement metrics
- `GovernanceProposal` - Governance proposals
- `GovernanceVote` - Voting records
- `TreasuryTransaction` - Treasury transactions
- `TreasuryBalance` - Treasury balances
- `TokenUtility` - Token utility configurations
- `UserTokenBalance` - User token balances
- `SecurityAlert` - Security alerts
- `MultisigSigner` - Multisig signers
- `TokenLaunchConfig` - Configuration

## Services

All services are in `/services`:

- `milestoneService.js` - Milestone management
- `communityMetricsService.js` - Metrics calculation
- `governanceService.js` - Governance operations
- `treasuryService.js` - Treasury management
- `tokenUtilityService.js` - Token utility
- `securityService.js` - Security monitoring

## Documentation

- [Implementation Plan](./TOKEN_LAUNCH_IMPLEMENTATION_PLAN.md) - Complete implementation guide
- [Milestone Specification](./TOKEN_LAUNCH_MILESTONE_SPEC.md) - Milestone definitions
- [Security Plan](./TOKEN_LAUNCH_SECURITY_PLAN.md) - Security architecture

## Next Steps

1. **Integrate Database Schema** - Add models to main schema.prisma
2. **Set Up Authentication** - Add auth middleware to routes
3. **Create Initial Milestones** - Run init script
4. **Configure Multisig** - Add signers via API
5. **Set Up Monitoring** - Configure scheduled tasks
6. **Build Frontend** - Create dashboards for each component
7. **Blockchain Integration** - Connect to chosen blockchain (Base/Solana)
8. **Deploy Contracts** - Deploy bonding curve and governance contracts

## Testing

Run tests:

```bash
npm test -- tests/services/milestoneService.test.js
```

## Support

For questions or issues, see the implementation plan or contact the development team.









