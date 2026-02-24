import { Router } from 'express';
import { db } from '../config/firebase-admin';

const router = Router();

router.post('/admin-login', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

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
