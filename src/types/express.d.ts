import { Request, Response } from 'express';

declare global {
  namespace Express {
    interface Request {
      sessionID?: string;
      user?: {
        userId: number;
        email?: string;
      };
    }
    interface Response {}
  }
}
