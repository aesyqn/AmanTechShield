// AmanTech Shield backend server
// To run during development (from project root):
// 1) Install deps: npm install express cors dotenv ts-node typescript @types/express @types/node --save-dev
// 2) Start server with: npx ts-node backend/src/server.ts
//    or add a script in package.json: "backend:dev": "ts-node backend/src/server.ts" and run npm run backend:dev

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { penTestRouter } from './modules/penTest/penTest.controller.ts';
import { phishingRouter } from './modules/phishing/phishing.controller.ts';
import { idsRouter } from './modules/ids/ids.controller.ts';
import { riskRouter } from './modules/risk/risk.controller.ts';
import { reportingRouter } from './modules/reporting/reporting.controller.ts';
import { prisma } from './prisma.ts';

dotenv.config();

const app = express();
const port = process.env.BACKEND_PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/pen-test', penTestRouter);
app.use('/api/phishing', phishingRouter);
app.use('/api/ids', idsRouter);
app.use('/api/risk', riskRouter);
app.use('/api/reporting', reportingRouter);

// Example DB-backed route using Prisma
app.get('/api/users', async (_req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users', error);
    res.status(500).json({ error: 'Failed to fetch users from database' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'AmanTech backend' });
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
