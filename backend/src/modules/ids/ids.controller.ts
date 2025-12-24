import { Router, Request, Response } from 'express';

export const idsRouter = Router();

idsRouter.post('/analyze-logs', async (req: Request, res: Response) => {
  res.status(501).json({ message: 'IDS log analysis backend not implemented yet.' });
});
