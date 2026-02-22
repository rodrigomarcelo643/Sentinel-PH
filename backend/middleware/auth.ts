import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase-admin';

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];

    const decodedToken = await auth.verifyIdToken(token);
    (req as any).user = decodedToken;

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export async function authenticateBHW(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const customClaims = user.customClaims || {};

    if (customClaims.role !== 'bhw' && customClaims.role !== 'admin') {
      return res.status(403).json({ error: 'BHW access required' });
    }

    next();
  } catch (error) {
    console.error('BHW auth error:', error);
    res.status(403).json({ error: 'Access denied' });
  }
}
