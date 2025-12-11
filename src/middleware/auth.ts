// Authentication middleware - extracts userId from x-user-id header
import { Request, Response, NextFunction } from 'express';

export function requireUserId(req: Request, res: Response, next: NextFunction): void {
  const userId = req.headers['x-user-id'] as string;

  if (!userId) {
    res.status(400).json({ error: 'Missing x-user-id' });
    return;
  }

  req.userId = userId;
  next();
}

