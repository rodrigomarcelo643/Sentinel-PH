# Firebase Database Schema

## Collections

### `sentinels`
Community observers who submit health observations.

```typescript
interface Sentinel {
  id: string;
  phoneNumber: string;
  name: string;
  role: 'sari_sari' | 'tricycle' | 'vendor' | 'tanod' | 'religious' | 'hilot' | 'bhw';
  barangay: string;
  purok: string;
  municipality: string;
  province: string;
  trustScore: number; // 0-100
  verifiedObservations: number;
  falseObservations: number;
  totalObservations: number;
  status: 'trial' | 'active' | 'suspended' | 'banned';
  deviceId?: string;
  lastSubmissionAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `observations`
Health observations submitted by sentinels.

```typescript
interface Observation {
  id: string;
  sentinelId: string;
  sentinelName: string;
  sentinelRole: string;
  type: 'medication_purchase' | 'illness_mention' | 'absence_pattern' | 'environmental_concern' | 'other';
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  landmark: string;
  barangay: string;
  purok: string;
  photoUrl?: string;
  trustScore: number; // Sentinel's score at submission time
  status: 'pending' | 'verified' | 'false' | 'investigating' | 'spam';
  verifiedBy?: string; // BHW user ID
  verificationNote?: string;
  aiCategory?: string;
  spamScore?: number;
  createdAt: Timestamp;
  verifiedAt?: Timestamp;
}
```

### `alerts`
Multi-source validated health alerts.

```typescript
interface Alert {
  id: string;
  barangay: string;
  municipality: string;
  province: string;
  observationIds: string[]; // 3+ observations
  sentinelIds: string[]; // 3+ unique sentinels
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'investigating' | 'resolved' | 'false_alarm';
  affectedPurok: string[];
  aggregateTrustScore: number; // Average of sentinel trust scores
  responseTeamId?: string;
  resolvedBy?: string;
  resolutionNote?: string;
  createdAt: Timestamp;
  resolvedAt?: Timestamp;
}
```

### `bhw_users`
Barangay Health Workers who verify observations.

```typescript
interface BHWUser {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  barangay: string;
  municipality: string;
  province: string;
  role: 'bhw' | 'municipal_officer' | 'provincial_officer';
  verifiedObservations: number;
  createdAt: Timestamp;
}
```

### `trust_score_logs`
Audit trail for trust score changes.

```typescript
interface TrustScoreLog {
  id: string;
  sentinelId: string;
  previousScore: number;
  newScore: number;
  change: number;
  reason: 'verified_observation' | 'false_observation' | 'spam_detected' | 'consistency_bonus' | 'tenure_bonus';
  observationId?: string;
  verifiedBy?: string;
  createdAt: Timestamp;
}
```

### `feedback_messages`
Two-way communication between system and sentinels.

```typescript
interface FeedbackMessage {
  id: string;
  sentinelId: string;
  type: 'acknowledgment' | 'verification_result' | 'advisory' | 'warning' | 'reward';
  message: string;
  observationId?: string;
  alertId?: string;
  status: 'sent' | 'delivered' | 'read';
  sentAt: Timestamp;
  readAt?: Timestamp;
}
```

## Indexes

### Required Composite Indexes

```javascript
// observations collection
{
  collectionGroup: "observations",
  fields: [
    { fieldPath: "barangay", order: "ASCENDING" },
    { fieldPath: "status", order: "ASCENDING" },
    { fieldPath: "createdAt", order: "DESCENDING" }
  ]
}

{
  collectionGroup: "observations",
  fields: [
    { fieldPath: "sentinelId", order: "ASCENDING" },
    { fieldPath: "createdAt", order: "DESCENDING" }
  ]
}

// alerts collection
{
  collectionGroup: "alerts",
  fields: [
    { fieldPath: "barangay", order: "ASCENDING" },
    { fieldPath: "status", order: "ASCENDING" },
    { fieldPath: "createdAt", order: "DESCENDING" }
  ]
}
```

## Security Rules

See `firestore.rules` in project root. Currently set to open for development:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ Production Rules Required:**
- Sentinels can only read/write their own data
- BHWs can read all observations in their barangay
- Only BHWs can update observation status
- Trust scores can only be updated by Cloud Functions
