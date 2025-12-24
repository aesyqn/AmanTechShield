import { Router, Request, Response } from 'express';

export const reportingRouter = Router();

reportingRouter.post('/generate', async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Report generation backend not implemented yet.' });
});
