import express from 'express';
import crypto from 'crypto';
import { db } from '../config/firebase-admin';

const router = express.Router();

const WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET!;

function verifySignature(payload: any, signature: string): boolean {
  const hash = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return hash === signature;
}

router.post('/observation', async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'] as string;
    
    if (!verifySignature(req.body, signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { observationId, sentinelId, description, type, location, barangay } = req.body;

    // Removed RAG context query
    const category = type || 'other';
    const isSpam = false;

    await db.collection('observations').doc(observationId).update({
      aiCategory: category,
      spamScore: isSpam ? 1 : 0,
      status: isSpam ? 'spam' : 'pending',
      processedAt: new Date(),
      ragContextUsed: false,
    });

    const similarObservations = await db
      .collection('observations')
      .where('barangay', '==', barangay)
      .where('aiCategory', '==', category)
      .where('status', '==', 'verified')
      .where('createdAt', '>', new Date(Date.now() - 48 * 60 * 60 * 1000))
      .get();

    const uniqueSentinels = new Set(
      similarObservations.docs.map(doc => doc.data().sentinelId)
    );

    if (uniqueSentinels.size >= 3) {
      const alertData = {
        barangay,
        observationIds: similarObservations.docs.map(doc => doc.id),
        sentinelIds: Array.from(uniqueSentinels),
        type: category,
        severity: calculateSeverity(similarObservations.docs.length),
        status: 'active',
        createdAt: new Date(),
      };

      const alertRef = await db.collection('alerts').add(alertData);

      await fetch(`${process.env.N8N_BASE_URL}/webhook/alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-signature': generateSignature(alertData),
        },
        body: JSON.stringify({ alertId: alertRef.id, ...alertData }),
      });
    }

    res.json({
      success: true,
      observationId,
      category,
      isSpam,
      alertGenerated: uniqueSentinels.size >= 3,
    });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/alert', async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'] as string;
    
    if (!verifySignature(req.body, signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { alertId, barangay, severity, description } = req.body;

    const bhwSnapshot = await db
      .collection('bhw_users')
      .where('barangay', '==', barangay)
      .get();

    const notifications = [];

    for (const doc of bhwSnapshot.docs) {
      const bhw = doc.data();

      const smsResult = await fetch(`${process.env.N8N_BASE_URL}/webhook/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-signature': generateSignature({ to: bhw.phoneNumber }),
        },
        body: JSON.stringify({
          to: bhw.phoneNumber,
          message: `ALERT [${severity.toUpperCase()}]: ${description} in ${barangay}. Check dashboard.`,
        }),
      });

      notifications.push({
        bhwId: doc.id,
        phoneNumber: bhw.phoneNumber,
        status: smsResult.ok ? 'sent' : 'failed',
      });
    }

    await db.collection('alert_notifications').add({
      alertId,
      notifications,
      sentAt: new Date(),
    });

    res.json({ success: true, notificationsSent: notifications.length });

  } catch (error) {
    console.error('Alert webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/trust-score', async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'] as string;
    
    if (!verifySignature(req.body, signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { sentinelId, observationId, verified, verifiedBy } = req.body;

    const sentinelDoc = await db.collection('sentinels').doc(sentinelId).get();
    const sentinel = sentinelDoc.data();

    if (!sentinel) {
      return res.status(404).json({ error: 'Sentinel not found' });
    }

    const change = verified ? 5 : -10;
    const newScore = Math.max(0, Math.min(100, sentinel.trustScore + change));

    await db.collection('sentinels').doc(sentinelId).update({
      trustScore: newScore,
      verifiedObservations: verified ? sentinel.verifiedObservations + 1 : sentinel.verifiedObservations,
      falseObservations: !verified ? sentinel.falseObservations + 1 : sentinel.falseObservations,
      updatedAt: new Date(),
    });

    await db.collection('trust_score_logs').add({
      sentinelId,
      previousScore: sentinel.trustScore,
      newScore,
      change,
      reason: verified ? 'verified_observation' : 'false_observation',
      observationId,
      verifiedBy,
      createdAt: new Date(),
    });

    await fetch(`${process.env.N8N_BASE_URL}/webhook/send-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-signature': generateSignature({ sentinelId }),
      },
      body: JSON.stringify({
        sentinelId,
        message: verified 
          ? `Your observation was verified! Trust score: ${newScore} (+${change})`
          : `Observation marked as false. Trust score: ${newScore} (${change})`,
        type: verified ? 'verification_result' : 'warning',
      }),
    });

    res.json({ success: true, newScore, change });

  } catch (error) {
    console.error('Trust score webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function calculateSeverity(observationCount: number): string {
  if (observationCount >= 10) return 'critical';
  if (observationCount >= 7) return 'high';
  if (observationCount >= 5) return 'medium';
  return 'low';
}

function generateSignature(payload: any): string {
  return crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
}

export default router;
