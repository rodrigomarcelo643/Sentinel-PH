# 3-Sentinel Rule: Multi-Source Validation

## Overview

The 3-Sentinel Rule is the core validation mechanism that prevents false alerts. An alert is only generated when **3 or more unrelated sentinels** report similar health observations within a defined time window.

## Purpose

- **Prevent False Alarms**: Single reports may be inaccurate or misunderstood
- **Filter Spam**: Coordinated spam requires multiple accounts
- **Build Confidence**: Multiple independent sources increase reliability
- **Reduce Noise**: Random observations don't trigger system-wide alerts

## Validation Criteria

### 1. Minimum Sentinel Count
```typescript
const MIN_SENTINELS = 3;
```

### 2. Sentinel Independence
Sentinels must be **unrelated** to prevent coordinated false reporting:

```typescript
interface SentinelIndependence {
  differentLocations: boolean;  // Not from same household/address
  differentRoles: boolean;       // Different community roles
  noSharedDevice: boolean;       // Different device IDs
  geographicSpread: boolean;     // At least 100m apart
}
```

### 3. Time Window
```typescript
const TIME_WINDOW_HOURS = 48; // Observations within 48 hours
```

### 4. Observation Similarity
Observations must be related:
- Same barangay or adjacent purok
- Same or related observation type
- Similar time period mentioned

### 5. Trust Score Threshold
```typescript
const MIN_AGGREGATE_TRUST_SCORE = 150; // Sum of 3 sentinel scores
// Example: 50 + 60 + 40 = 150 ✅
// Example: 20 + 30 + 25 = 75 ❌
```

## Algorithm Implementation

### Step 1: Observation Clustering

```typescript
interface ObservationCluster {
  observations: Observation[];
  sentinels: Sentinel[];
  barangay: string;
  type: string;
  timeRange: { start: Date; end: Date };
  aggregateTrustScore: number;
}

function clusterObservations(
  observations: Observation[],
  timeWindowHours: number = 48
): ObservationCluster[] {
  // Group by barangay and type
  // Filter by time window
  // Calculate aggregate trust scores
}
```

### Step 2: Validate Independence

```typescript
function validateSentinelIndependence(
  sentinels: Sentinel[]
): boolean {
  // Check different locations
  const uniqueLocations = new Set(
    sentinels.map(s => `${s.barangay}-${s.purok}`)
  );
  
  // Check different roles
  const uniqueRoles = new Set(sentinels.map(s => s.role));
  
  // Check different devices
  const uniqueDevices = new Set(
    sentinels.map(s => s.deviceId).filter(Boolean)
  );
  
  // Check geographic spread
  const minDistance = calculateMinDistance(sentinels);
  
  return (
    uniqueLocations.size >= 2 &&
    uniqueRoles.size >= 2 &&
    uniqueDevices.size >= 3 &&
    minDistance >= 100 // meters
  );
}
```

### Step 3: Generate Alert

```typescript
function generateAlert(cluster: ObservationCluster): Alert | null {
  if (cluster.sentinels.length < 3) {
    return null; // Not enough sentinels
  }
  
  if (!validateSentinelIndependence(cluster.sentinels)) {
    return null; // Sentinels not independent
  }
  
  if (cluster.aggregateTrustScore < 150) {
    return null; // Trust score too low
  }
  
  return {
    id: generateId(),
    barangay: cluster.barangay,
    observationIds: cluster.observations.map(o => o.id),
    sentinelIds: cluster.sentinels.map(s => s.id),
    type: cluster.type,
    severity: calculateSeverity(cluster),
    status: 'active',
    aggregateTrustScore: cluster.aggregateTrustScore,
    createdAt: new Date(),
  };
}
```

## Severity Calculation

```typescript
function calculateSeverity(cluster: ObservationCluster): Severity {
  const sentinelCount = cluster.sentinels.length;
  const trustScore = cluster.aggregateTrustScore;
  const timeSpan = cluster.timeRange.end - cluster.timeRange.start;
  
  let score = 0;
  
  // More sentinels = higher severity
  if (sentinelCount >= 5) score += 30;
  else if (sentinelCount >= 4) score += 20;
  else score += 10;
  
  // Higher trust = higher severity
  if (trustScore >= 240) score += 30; // 3 sentinels with 80+ each
  else if (trustScore >= 180) score += 20;
  else score += 10;
  
  // Faster spread = higher severity
  if (timeSpan <= 24 * 60 * 60 * 1000) score += 30; // Within 24 hours
  else if (timeSpan <= 36 * 60 * 60 * 1000) score += 20;
  else score += 10;
  
  if (score >= 70) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}
```

## Example Scenarios

### ✅ Valid Alert (3-Sentinel Rule Met)

```typescript
Observation 1:
- Sentinel: Maria (sari-sari owner, Purok 1, Trust: 75)
- Type: medication_purchase
- Description: "Many buying Biogesic this week"
- Time: Jan 15, 10:00 AM

Observation 2:
- Sentinel: Juan (tricycle driver, Purok 2, Trust: 68)
- Type: illness_mention
- Description: "Passengers mentioning fever"
- Time: Jan 15, 3:00 PM

Observation 3:
- Sentinel: Rosa (market vendor, Purok 3, Trust: 82)
- Type: medication_purchase
- Description: "Increased paracetamol sales"
- Time: Jan 16, 9:00 AM

Result: ALERT GENERATED ✅
- 3 independent sentinels
- Different roles and locations
- Within 48-hour window
- Aggregate trust: 225 (>150)
- Severity: HIGH
```

### ❌ Invalid Alert (Not Enough Sentinels)

```typescript
Observation 1:
- Sentinel: Maria (Trust: 85)
- Type: medication_purchase

Observation 2:
- Sentinel: Juan (Trust: 90)
- Type: medication_purchase

Result: NO ALERT ❌
- Only 2 sentinels (need 3+)
```

### ❌ Invalid Alert (Low Trust Score)

```typescript
Observation 1:
- Sentinel: Pedro (Trust: 25)

Observation 2:
- Sentinel: Ana (Trust: 30)

Observation 3:
- Sentinel: Luis (Trust: 35)

Result: NO ALERT ❌
- Aggregate trust: 90 (<150)
```

## Cloud Function Implementation

```typescript
// functions/src/index.ts
export const checkForAlerts = functions.firestore
  .document('observations/{observationId}')
  .onCreate(async (snap, context) => {
    const newObservation = snap.data();
    
    // Get recent observations in same barangay
    const recentObs = await getRecentObservations(
      newObservation.barangay,
      48 // hours
    );
    
    // Cluster similar observations
    const clusters = clusterObservations(recentObs);
    
    // Check each cluster for 3-sentinel rule
    for (const cluster of clusters) {
      const alert = generateAlert(cluster);
      
      if (alert) {
        await db.collection('alerts').add(alert);
        await notifyBHW(alert);
        await notifySentinels(cluster.sentinels, alert);
      }
    }
  });
```

## Performance Optimization

1. **Incremental Processing**: Only check new observations
2. **Indexed Queries**: Use Firestore composite indexes
3. **Caching**: Cache sentinel data to reduce reads
4. **Batch Operations**: Update multiple documents at once
5. **Background Jobs**: Run clustering as scheduled function

## Future Enhancements

1. **Dynamic Threshold**: Adjust sentinel count based on barangay size
2. **Weighted Voting**: Higher trust sentinels count more
3. **Cross-Barangay Alerts**: Detect patterns across boundaries
4. **Temporal Patterns**: Detect weekly/seasonal trends
5. **Machine Learning**: Predict alert likelihood before 3rd sentinel
