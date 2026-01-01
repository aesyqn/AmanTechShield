/**
 * Audit Session Controller - Unified Session Management
 * 
 * Creates ONE audit session for the entire 5-step scanning flow
 * All modules (pen test, phishing, IDS, risk, recovery) link to this session
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../../prisma';

export const auditRouter = Router();

/**
 * POST /api/audit/create-session
 * 
 * Creates a new unified audit session
 * This session will be used by all 5 steps
 */
auditRouter.post('/create-session', async (req: Request, res: Response) => {
  try {
    const { userId, targetUrl } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({ 
        error: 'Missing userId',
        message: 'User ID is required to create an audit session'
      });
    }

    console.log(`🔐 Creating unified audit session for user: ${userId}`);

    // Create new audit session
    const auditSession = await prisma.auditSession.create({
      data: {
        userId,
        targetUrl: targetUrl || 'pending',
        severity: 'pending', // Will be updated after all scans complete
      }
    });

    console.log(`✅ Unified session created: ${auditSession.id}`);
    console.log(`   This session will be used for all 5 steps`);

    return res.status(201).json({
      success: true,
      auditId: auditSession.id,
      message: 'Unified audit session created successfully',
      session: {
        id: auditSession.id,
        userId: auditSession.userId,
        targetUrl: auditSession.targetUrl,
        createdAt: auditSession.createdAt
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to create audit session:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Failed to create audit session'
    });
  }
});

/**
 * PATCH /api/audit/:auditId/target-url
 * 
 * Updates the target URL after Step 1 (Penetration Test)
 */
auditRouter.patch('/:auditId/target-url', async (req: Request, res: Response) => {
  try {
    const { auditId } = req.params;
    const { targetUrl } = req.body;

    if (!targetUrl) {
      return res.status(400).json({
        error: 'Missing targetUrl',
        message: 'Target URL is required'
      });
    }

    console.log(`📝 Updating target URL for session: ${auditId}`);

    // Update the audit session
    const updated = await prisma.auditSession.update({
      where: { id: auditId },
      data: { targetUrl }
    });

    console.log(`✅ Target URL updated: ${targetUrl}`);

    return res.status(200).json({
      success: true,
      message: 'Target URL updated successfully',
      session: {
        id: updated.id,
        targetUrl: updated.targetUrl
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to update target URL:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Audit session not found',
        message: 'The specified audit session does not exist'
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Failed to update target URL'
    });
  }
});

/**
 * GET /api/audit/:auditId
 * 
 * Get complete audit session data with all related findings
 * Used for PDF generation
 */
auditRouter.get('/:auditId', async (req: Request, res: Response) => {
  try {
    const { auditId } = req.params;

    console.log(`📊 Fetching complete session data: ${auditId}`);

    // Fetch session with all related data
    const session = await prisma.auditSession.findUnique({
      where: { id: auditId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true
          }
        },
        penTests: true,
        phishingScans: true,
        idsLogs: true,
        riskScore: true,
        recoveryPlan: true,
        ethics: true,
        report: true
      }
    });

    if (!session) {
      return res.status(404).json({
        error: 'Audit session not found',
        message: 'The specified audit session does not exist'
      });
    }

    console.log(`✅ Session data retrieved successfully`);
    console.log(`   - Pen Tests: ${session.penTests.length}`);
    console.log(`   - Phishing: ${session.phishingScans.length}`);
    console.log(`   - IDS: ${session.idsLogs.length}`);
    console.log(`   - Risk Score: ${session.riskScore ? 'Yes' : 'No'}`);

    return res.status(200).json({
      success: true,
      session
    });

  } catch (error: any) {
    console.error('❌ Failed to fetch session:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Failed to fetch audit session'
    });
  }
});
