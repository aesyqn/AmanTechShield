// Vercel serverless function entry point
// This wraps the Express app for Vercel's serverless environment

import express from 'express';
import cors from 'cors';

// Import all routers
import { penTestRouter } from '../backend/src/modules/penTest/penTest.controller.ts';
import { phishingRouter } from '../backend/src/modules/phishing/phishing.controller.ts';
import { idsRouter } from '../backend/src/modules/ids/ids.code.ts';
import { riskRouter } from '../backend/src/modules/risk/risk.controller.ts';
import { reportingRouter } from '../backend/src/modules/reporting/reporting.controller.ts';
import { authRouter } from '../backend/src/modules/auth/auth.controller.ts';
import { auditRouter } from '../backend/src/modules/audit/audit.controller.ts';
import { ethicsRouter } from '../backend/src/modules/ethics/ethics.controller.ts';
import { prisma } from '../backend/src/prisma.ts';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/audit', auditRouter);
app.use('/api/pen-test', penTestRouter);
app.use('/api/phishing', phishingRouter);
app.use('/api/ids', idsRouter);
app.use('/api/risk', riskRouter);
app.use('/api/ethics', ethicsRouter);
app.use('/api/reporting', reportingRouter);
app.use('/api/auth', authRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'AmanTech backend', environment: 'vercel' });
});

// Example DB-backed route
app.get('/api/users', async (_req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users', error);
    res.status(500).json({ error: 'Failed to fetch users from database' });
  }
});

// Create audit session
app.post('/api/audit-session', async (req, res) => {
  try {
    const { userId, targetUrl } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const auditSession = await prisma.auditSession.create({
      data: {
        userId,
        targetUrl: targetUrl || 'pending'
      }
    });

    res.json(auditSession);
  } catch (error) {
    console.error('Error creating audit session', error);
    res.status(500).json({ error: 'Failed to create audit session' });
  }
});

// Export for Vercel serverless
export default app;
