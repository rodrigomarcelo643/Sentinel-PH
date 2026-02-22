import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

export function rateLimit(options: {
  windowMs: number;
  max: number;
  message?: string;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    if (!store[key] || now > store[key].resetAt) {
      store[key] = {
        count: 1,
        resetAt: now + options.windowMs,
      };
      return next();
    }

    store[key].count++;

    if (store[key].count > options.max) {
      return res.status(429).json({
        error: options.message || 'Too many requests',
        retryAfter: Math.ceil((store[key].resetAt - now) / 1000),
      });
    }

    next();
  };
}

export const observationRateLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5,
  message: 'Maximum 5 observations per day',
});

export const otpRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Maximum 3 OTP requests per hour',
});

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests, please try again later',
});
