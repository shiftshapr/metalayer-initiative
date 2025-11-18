# Token Launch Milestone Specification

## Overview

This document defines the specific milestones that must be met before the token launch bonding curve can be activated. Each milestone requires verifiable evidence and independent attestation.

## Milestone Categories

### 1. Community Engagement

**Milestone Key:** `community_engagement`

**Requirements:**
- Minimum 100 total members
- Minimum 50 active members (active in last 30 days)
- Minimum 30% participation rate
- Minimum 1,000 messages in last 30 days
- Minimum 5 active communities

**Verification:**
- Automated metrics calculation
- Evidence: Community metrics snapshot
- Requires 2 independent attestations

**Evidence Format:**
```json
{
  "totalMembers": 150,
  "activeMembers": 75,
  "participationRate": 0.5,
  "messagesCount": 2500,
  "communitiesCount": 8,
  "calculatedAt": "2025-01-XX",
  "snapshotHash": "..."
}
```

### 2. Governance Readiness

**Milestone Key:** `governance_readiness`

**Requirements:**
- Governance charter ratified
- Multisig signers identified and configured (minimum 3/5)
- Proposal creation process defined
- Voting mechanism established
- Quorum rules documented

**Verification:**
- Manual review of governance documents
- Multisig configuration verified
- Evidence: Signed governance charter, multisig addresses

**Evidence Format:**
```json
{
  "charterUrl": "ipfs://...",
  "charterHash": "...",
  "multisigAddresses": ["0x...", "0x..."],
  "quorumRules": {...},
  "ratifiedAt": "2025-01-XX"
}
```

### 3. Technical Preparedness

**Milestone Key:** `technical_preparedness`

**Requirements:**
- Bonding curve contract deployed and audited
- Security monitoring system operational
- TEE/attestation system ready (if applicable)
- Testnet testing completed
- Incident response plan documented

**Verification:**
- Audit reports reviewed
- Testnet deployment verified
- Monitoring dashboards operational
- Evidence: Audit reports, testnet addresses, monitoring setup

**Evidence Format:**
```json
{
  "contractAddress": "0x...",
  "auditReportUrl": "ipfs://...",
  "testnetAddress": "0x...",
  "monitoringUrl": "...",
  "incidentPlanUrl": "ipfs://..."
}
```

### 4. Compliance Readiness

**Milestone Key:** `compliance_readiness`

**Requirements:**
- Legal entity formed (foundation/cooperative/LLC)
- Token utility documentation complete
- Terms of service drafted
- KYC/AML procedures defined (if required)
- Legal counsel engaged

**Verification:**
- Legal documents reviewed
- Entity registration verified
- Evidence: Entity documents, legal memos

**Evidence Format:**
```json
{
  "entityType": "foundation",
  "entityName": "...",
  "jurisdiction": "...",
  "registrationNumber": "...",
  "legalDocsUrl": "ipfs://...",
  "tokenUtilityDocUrl": "ipfs://..."
}
```

### 5. Treasury Plan

**Milestone Key:** `treasury_plan`

**Requirements:**
- Treasury allocation plan documented
- Budget categories defined
- Spending approval process established
- Treasury dashboard operational
- Initial treasury balances tracked

**Verification:**
- Treasury plan reviewed
- Budget approved by governance
- Evidence: Treasury plan document, approved budget

**Evidence Format:**
```json
{
  "allocationPlanUrl": "ipfs://...",
  "budgetCategories": {...},
  "approvalProcess": "...",
  "initialBalances": {...},
  "approvedAt": "2025-01-XX"
}
```

## Attestation Process

### Requirements

1. **Minimum Attestations:** Each milestone requires at least 2 independent attestations
2. **Attestor Eligibility:** Attestors must be:
   - Verified community members
   - Not directly involved in milestone completion
   - Independent of each other

### Attestation Format

```json
{
  "milestoneId": "uuid",
  "attestorId": "uuid",
  "signature": "cryptographic_signature",
  "publicKey": "attestor_public_key",
  "evidenceData": {...},
  "evidenceUrl": "ipfs://...",
  "attestedAt": "2025-01-XX"
}
```

### Verification

- Cryptographic signature verification
- Evidence hash verification
- Attestor identity verification
- Independence verification

## Launch Activation

### Prerequisites

All milestones must be:
- Marked as complete (`isComplete: true`)
- Have at least 2 attestations
- Evidence verified and stored
- On-chain proof submitted (if applicable)

### Activation Process

1. **Verification Check**
   - System checks all milestones are complete
   - Verifies attestations
   - Validates evidence

2. **On-Chain Proof**
   - Milestone checklist hash submitted to blockchain
   - Multisig signs activation transaction
   - Bonding curve contract verifies proof

3. **Activation**
   - Bonding curve contract activated
   - Minting enabled
   - Public launch announced

## Evidence Storage

### IPFS/Arweave Integration

All evidence should be stored in:
- **IPFS** - For public, permanent storage
- **Arweave** - For permanent archival
- **Database** - For quick access and metadata

### Evidence Hash

Each piece of evidence is hashed using SHA-256:
- Hash stored in database
- Hash included in attestations
- Hash verified on-chain

## Monitoring

### Ongoing Verification

- Metrics recalculated daily
- Attestations verified periodically
- Evidence integrity checked
- On-chain state synchronized

### Alerts

- Milestone status changes
- Attestation additions
- Evidence updates
- Verification failures

## Implementation

### API Endpoints

- `GET /api/token-launch/milestones` - Get all milestones
- `GET /api/token-launch/milestones/:key` - Get specific milestone
- `GET /api/token-launch/milestones/readiness/status` - Get launch readiness
- `PUT /api/token-launch/milestones/:key` - Update milestone
- `POST /api/token-launch/milestones/:milestoneId/attestations` - Add attestation

### Database Models

See `prisma/token-launch-schema.prisma` for:
- `TokenLaunchMilestone`
- `MilestoneAttestation`

### Services

- `milestoneService.js` - Milestone management
- `communityMetricsService.js` - Metrics calculation





