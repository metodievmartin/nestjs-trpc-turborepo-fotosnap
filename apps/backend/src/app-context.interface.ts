import { Request, Response } from 'express';
import { session, user } from './auth/schema';

export interface BaseContext {
  req: Request;
  res: Response;
}

export interface TrpcSessionContext {
  req: Request;
  res: Response;
  user: typeof user.$inferSelect;
  session: typeof session.$inferSelect;
}
