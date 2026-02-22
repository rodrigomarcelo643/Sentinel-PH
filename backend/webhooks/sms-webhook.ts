import express from 'express';
import twilio from 'twilio';
import { db } from '../config/firebase-admin';

const router = express.Router();

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER!;

router.post('/send-sms', async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ error: 'Missing required fields: to, message' });
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE,
      to: to,
    });

    res.json({
      success: true,
      messageSid: result.sid,
      status: result.status,
      to: result.to,
    });

  } catch (error: any) {
    console.error('SMS webhook error:', error);
    res.status(500).json({
      error: 'Failed to send SMS',
      details: error.message,
    });
  }
});

router.post('/send-feedback', async (req, res) => {
  try {
    const { sentinelId, message, type } = req.body;

    const sentinelDoc = await db.collection('sentinels').doc(sentinelId).get();
    
    if (!sentinelDoc.exists) {
      return res.status(404).json({ error: 'Sentinel not found' });
    }

    const sentinel = sentinelDoc.data();
    const phoneNumber = sentinel?.phoneNumber;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Sentinel has no phone number' });
    }

    const result = await twilioClient.messages.create({
      body: `[SentinelPH] ${message}`,
      from: TWILIO_PHONE,
      to: phoneNumber,
    });

    await db.collection('feedback_messages').add({
      sentinelId,
      type,
      message,
      status: 'sent',
      messageSid: result.sid,
      sentAt: new Date(),
    });

    res.json({
      success: true,
      messageSid: result.sid,
      sentTo: phoneNumber,
    });

  } catch (error: any) {
    console.error('Feedback webhook error:', error);
    res.status(500).json({
      error: 'Failed to send feedback',
      details: error.message,
    });
  }
});

router.post('/send-bulk-sms', async (req, res) => {
  try {
    const { recipients, message } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'Invalid recipients array' });
    }

    const results = [];

    for (const recipient of recipients) {
      try {
        const result = await twilioClient.messages.create({
          body: message,
          from: TWILIO_PHONE,
          to: recipient.phoneNumber,
        });

        results.push({
          phoneNumber: recipient.phoneNumber,
          status: 'sent',
          messageSid: result.sid,
        });
      } catch (error: any) {
        results.push({
          phoneNumber: recipient.phoneNumber,
          status: 'failed',
          error: error.message,
        });
      }
    }

    const successCount = results.filter(r => r.status === 'sent').length;

    res.json({
      success: true,
      total: recipients.length,
      sent: successCount,
      failed: recipients.length - successCount,
      results,
    });

  } catch (error: any) {
    console.error('Bulk SMS webhook error:', error);
    res.status(500).json({
      error: 'Failed to send bulk SMS',
      details: error.message,
    });
  }
});

export default router;
