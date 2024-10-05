import { Request, Response } from 'express';

declare global {
  namespace Express {
    interface Request {
      sessionID?: string;
    }
    interface Response {}
  }
}
