// Type declarations for ttsController.js
import { Request, Response, NextFunction } from 'express';

export function generateTTS(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void>;

export function generateTTSSegments(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void>;

