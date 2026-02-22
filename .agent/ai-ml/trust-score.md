# Trust Score Algorithm

## Overview

The Trust Score is a 0-100 reliability metric for each sentinel, calculated based on verification history, consistency, tenure, and behavioral patterns.

## Algorithm Components

### 1. Base Score Calculation

```typescript
baseScore = (verifiedObservations / totalObservations) * 100
```

### 2. Verification History Weight (40%)

```typescript
verificationWeight = 0.4
verificationScore = (verifiedObservations / totalObservations) * 100 * verificationWeight

// Penalties
if (falseObservations > 0) {
  penalty = (falseObservations / totalObservations) * 30
  verificationScore -= penalty
}
```

### 3. Consistency Bonus (25%)

Rewards sentinels who submit observations regularly without spam patterns.

```typescript
consistencyScore = 0

// Regular submission pattern (1-3 per week)
if (avgObservationsPerWeek >= 1 && avgObservationsPerWeek <= 3) {
  consistencyScore = 25
}

// Penalize burst submissions (spam indicator)
if (observationsInLast24Hours > 5) {
  consistencyScore -= 15
}
```

### 4. Tenure Bonus (20%)

Rewards long-term, active sentinels.

```typescript
const daysActive = (now - createdAt) / (1000 * 60 * 60 * 24)

if (daysActive >= 90) {
  tenureBonus = 20
} else if (daysActive >= 30) {
  tenureBonus = 10
} else if (daysActive >= 7) {
  tenureBonus = 5
} else {
  tenureBonus = 0
}
```

### 5. Peer Validation (15%)

Bonus when observations are corroborated by other sentinels.

```typescript
peerValidationScore = 0

// Count observations that contributed to alerts (3-sentinel rule)
if (observationsInAlerts > 0) {
  peerValidationScore = Math.min(15, observationsInAlerts * 3)
}
```

## Final Trust Score Formula

```typescript
trustScore = Math.max(0, Math.min(100,
  verificationScore +
  consistencyScore +
  tenureBonus +
  peerValidationScore
))
```

## Trust Score Tiers

| Score Range | Tier | Description | BHW Action |
|-------------|------|-------------|------------|
| 0-30 | Low | New or unreliable sentinel | Mandatory review of all observations |
| 31-50 | Medium-Low | Building reliability | Random audit (50% sampled) |
| 51-70 | Medium | Moderately trusted | Random audit (25% sampled) |
| 71-85 | High | Highly trusted | Random audit (10% sampled) |
| 86-100 | Elite | Proven track record | Auto-approved, weighted heavily in alerts |

## Score Update Triggers

### Positive Updates
- **Verified Observation**: +5 points (max 100)
- **Observation Contributes to Alert**: +3 points
- **Consistency Milestone**: +2 points (weekly active for 4+ weeks)
- **Tenure Milestone**: +5 points (30, 90, 180 days)

### Negative Updates
- **False Observation**: -10 points
- **Spam Detected**: -15 points
- **Burst Submission Pattern**: -5 points
- **Geolocation Mismatch**: -8 points

### Status Changes Based on Score

```typescript
if (trustScore < 20 && falseObservations >= 3) {
  status = 'suspended' // 7-day suspension
}

if (trustScore < 10 || spamDetections >= 3) {
  status = 'banned' // Permanent ban
}

if (trustScore >= 50 && status === 'trial') {
  status = 'active' // Graduate from trial
}
```

## Implementation

### Location: `src/lib/trust-score.ts`

```typescript
export interface TrustScoreFactors {
  verifiedObservations: number;
  falseObservations: number;
  totalObservations: number;
  daysActive: number;
  observationsInAlerts: number;
  avgObservationsPerWeek: number;
  observationsInLast24Hours: number;
}

export function calculateTrustScore(factors: TrustScoreFactors): number {
  // Implementation here
}

export function updateTrustScore(
  sentinelId: string,
  reason: string,
  observationId?: string
): Promise<void> {
  // Update Firestore and log change
}
```

## Audit Trail

All trust score changes are logged in `trust_score_logs` collection for transparency and debugging.

```typescript
{
  sentinelId: "sentinel_123",
  previousScore: 65,
  newScore: 70,
  change: +5,
  reason: "verified_observation",
  observationId: "obs_456",
  verifiedBy: "bhw_789",
  createdAt: Timestamp
}
```

## Anti-Gaming Measures

1. **Rate Limiting**: Max 5 observations per day
2. **Cooldown Period**: 15 minutes between submissions
3. **Geolocation Check**: Must be within 2km of reported location
4. **Duplicate Detection**: Similar observations within 1 hour flagged
5. **Burst Pattern Detection**: >5 submissions in 24 hours triggers review
6. **Trial Period**: First 5 observations always reviewed by BHW
