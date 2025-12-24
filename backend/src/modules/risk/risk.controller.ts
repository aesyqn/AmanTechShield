import { Router, Request, Response } from 'express';

export const riskRouter = Router();

riskRouter.post('/calculate', async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Risk scoring backend not implemented yet.' });
});
