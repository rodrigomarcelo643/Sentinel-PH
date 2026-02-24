import express from 'express';
import { auth, db } from '../config/firebase-admin';
import { sendOTPEmail, sendRegistrationConfirmation, sendWelcomeEmail } from '../services/email';
import { sendApprovalEmail, sendRejectionEmail } from '../services/email';

const router = express.Router();

// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map<string, { otp: string; expiresAt: number; name: string }>();

/**
 * POST /webhook/send-otp
 * Generate and send OTP to email
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name required' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore.set(email, { otp, expiresAt, name });

    // Send email
    await sendOTPEmail(email, otp, name);

    res.json({
      success: true,
      message: 'OTP sent to email',
      expiresIn: 600, // seconds
    });

  } catch (error: any) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      error: 'Failed to send OTP',
      details: error.message,
    });
  }
});

/**
 * POST /webhook/verify-otp
 * Verify OTP and create user
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, phoneNumber, role, barangay, purok } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP required' });
    }

    // Check OTP
    const stored = otpStore.get(email);

    if (!stored) {
      return res.status(400).json({ error: 'OTP not found or expired' });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP expired' });
    }

    // Create Firebase user
    const userRecord = await auth.createUser({
      email,
      phoneNumber,
      displayName: stored.name,
      emailVerified: true,
    });

    // Create sentinel record in Firestore
    await db.collection('sentinels').doc(userRecord.uid).set({
      email,
      phoneNumber,
      name: stored.name,
      role,
      barangay,
      purok,
      trustScore: 50,
      verifiedObservations: 0,
      falseObservations: 0,
      totalObservations: 0,
      status: 'trial',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Send confirmation email
    await sendRegistrationConfirmation(email, stored.name, role);

    // Clean up OTP
    otpStore.delete(email);

    res.json({
      success: true,
      userId: userRecord.uid,
      message: 'Registration successful',
    });

  } catch (error: any) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      error: 'Failed to verify OTP',
      details: error.message,
    });
  }
});

/**
 * POST /webhook/complete-training
 * Send welcome email after training completion
 */
router.post('/complete-training', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Get sentinel data
    const sentinelDoc = await db.collection('sentinels').doc(userId).get();

    if (!sentinelDoc.exists) {
      return res.status(404).json({ error: 'Sentinel not found' });
    }

    const sentinel = sentinelDoc.data();

    // Update status to active
    await db.collection('sentinels').doc(userId).update({
      status: 'active',
      trainingCompletedAt: new Date(),
    });

    // Send welcome email
    await sendWelcomeEmail(
      sentinel!.email,
      sentinel!.name,
      sentinel!.role,
      sentinel!.barangay
    );

    res.json({
      success: true,
      message: 'Training completed, welcome email sent',
    });

  } catch (error: any) {
    console.error('Complete training error:', error);
    res.status(500).json({
      error: 'Failed to complete training',
      details: error.message,
    });
  }
});

/**
 * POST /webhook/resend-otp
 * Resend OTP to email
 */
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const stored = otpStore.get(email);

    if (!stored) {
      return res.status(400).json({ error: 'No OTP request found for this email' });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    // Update stored OTP
    otpStore.set(email, { otp, expiresAt, name: stored.name });

    // Send email
    await sendOTPEmail(email, otp, stored.name);

    res.json({
      success: true,
      message: 'OTP resent to email',
      expiresIn: 600,
    });

  } catch (error: any) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      error: 'Failed to resend OTP',
      details: error.message,
    });
  }
});

/**
 * POST /webhook/approve-registration
 * Approve sentinel registration (BHW only)
 */
router.post('/approve-registration', async (req, res) => {
  try {
    const { sentinelId, approvedBy } = req.body;

    if (!sentinelId || !approvedBy) {
      return res.status(400).json({ error: 'Sentinel ID and approver required' });
    }

    // Get sentinel data
    const sentinelDoc = await db.collection('sentinels').doc(sentinelId).get();

    if (!sentinelDoc.exists) {
      return res.status(404).json({ error: 'Sentinel not found' });
    }

    const sentinel = sentinelDoc.data();

    // Update status to approved
    await db.collection('sentinels').doc(sentinelId).update({
      status: 'active',
      approvedBy,
      approvedAt: new Date(),
      updatedAt: new Date(),
    });

    // Send approval email
    await sendApprovalEmail(
      sentinel!.email,
      sentinel!.name,
      sentinel!.barangay
    );

    res.json({
      success: true,
      message: 'Registration approved, email sent',
    });

  } catch (error: any) {
    console.error('Approve registration error:', error);
    res.status(500).json({
      error: 'Failed to approve registration',
      details: error.message,
    });
  }
});

/**
 * POST /webhook/reject-registration
 * Reject sentinel registration (BHW only)
 */
router.post('/reject-registration', async (req, res) => {
  try {
    const { sentinelId, rejectedBy, reason } = req.body;

    if (!sentinelId || !rejectedBy) {
      return res.status(400).json({ error: 'Sentinel ID and rejector required' });
    }

    // Get sentinel data
    const sentinelDoc = await db.collection('sentinels').doc(sentinelId).get();

    if (!sentinelDoc.exists) {
      return res.status(404).json({ error: 'Sentinel not found' });
    }

    const sentinel = sentinelDoc.data();

    // Update status to rejected
    await db.collection('sentinels').doc(sentinelId).update({
      status: 'rejected',
      rejectedBy,
      rejectionReason: reason || 'Not specified',
      rejectedAt: new Date(),
      updatedAt: new Date(),
    });

    // Send rejection email
    await sendRejectionEmail(
      sentinel!.email,
      sentinel!.name,
      reason || 'Your registration did not meet the requirements'
    );

    res.json({
      success: true,
      message: 'Registration rejected, email sent',
    });

  } catch (error: any) {
    console.error('Reject registration error:', error);
    res.status(500).json({
      error: 'Failed to reject registration',
      details: error.message,
    });
  }
});

/**
 * POST /webhook/admin-login
 * Admin login with username
 */
router.post('/admin-login', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Query admins collection for username
    const adminsRef = db.collection('admins');
    const snapshot = await adminsRef.where('username', '==', username).limit(1).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }

    const adminData = snapshot.docs[0].data();
    
    res.json({
      email: adminData.email,
      uid: adminData.uid,
      role: adminData.role,
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /webhook/admin-login
 * Admin login with username
 */
router.post('/admin-login', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Query admins collection for username
    const adminsRef = db.collection('admins');
    const snapshot = await adminsRef.where('username', '==', username).limit(1).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }

    const adminData = snapshot.docs[0].data();
    
    res.json({
      email: adminData.email,
      uid: adminData.uid,
      role: adminData.role,
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
