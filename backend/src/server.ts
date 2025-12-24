// AmanTech Shield backend server
// To run during development (from project root):
// 1) Install deps: npm install express cors dotenv ts-node typescript @types/express @types/node --save-dev
// 2) Start server with: npx ts-node backend/src/server.ts
//    or add a script in package.json: "backend:dev": "ts-node backend/src/server.ts" and run npm run backend:dev

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { penTestRouter } from './modules/penTest/penTest.controller';
import { phishingRouter } from './modules/phishing/phishing.controller';
import { idsRouter } from './modules/ids/ids.controller';
import { riskRouter } from './modules/risk/risk.controller';
import { reportingRouter } from './modules/reporting/reporting.controller';

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

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'AmanTech backend' });
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
