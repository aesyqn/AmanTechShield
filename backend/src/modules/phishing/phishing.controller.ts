import { Router, Request, Response } from 'express';

export const phishingRouter = Router();

phishingRouter.post('/analyze-text', async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Phishing text analysis backend not implemented yet.' });
});

phishingRouter.post('/analyze-file', async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Phishing file analysis backend not implemented yet.' });
});
