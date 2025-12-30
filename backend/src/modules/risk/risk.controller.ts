import { Router, Request, Response } from 'express';
import { calculateRiskScore } from './risk.service';

export const riskRouter = Router();

// POST /api/risk/calculate
// Calculate risk score for an audit session
riskRouter.post('/calculate', async (req: Request, res: Response) => {
  try {
    const { auditId } = req.body as { auditId?: string };

    if (!auditId) {
      return res.status(400).json({ error: 'auditId is required' });
    }

    // Calculate risk score
    const result = await calculateRiskScore(auditId);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error calculating risk score:', error);

    if (error instanceof Error && error.message === 'Audit session not found') {
      return res.status(404).json({ error: 'Audit session not found' });
    }

    return res.status(500).json({ error: 'Failed to calculate risk score' });
  }
});
