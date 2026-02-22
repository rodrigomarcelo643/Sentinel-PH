import { Request, Response, NextFunction } from 'express';

export function validateEmail(req: Request, res: Response, next: NextFunction) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  next();
}

export function validatePhoneNumber(req: Request, res: Response, next: NextFunction) {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const phoneRegex = /^\+63\d{10}$/;
  if (!phoneRegex.test(phoneNumber)) {
    return res.status(400).json({ 
      error: 'Invalid phone number format. Use +63XXXXXXXXXX' 
    });
  }

  next();
}

export function validateObservation(req: Request, res: Response, next: NextFunction) {
  const { description, type, location, barangay } = req.body;

  if (!description || description.trim().length < 10) {
    return res.status(400).json({ 
      error: 'Description must be at least 10 characters' 
    });
  }

  if (!type) {
    return res.status(400).json({ error: 'Observation type is required' });
  }

  if (!location || !location.lat || !location.lng) {
    return res.status(400).json({ error: 'Location is required' });
  }

  if (!barangay) {
    return res.status(400).json({ error: 'Barangay is required' });
  }

  next();
}

export function validateOTP(req: Request, res: Response, next: NextFunction) {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ error: 'OTP is required' });
  }

  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({ error: 'OTP must be 6 digits' });
  }

  next();
}

export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  req.body = sanitize(req.body);
  next();
}
