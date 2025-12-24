# Risk Scoring with Islamic Ethics Backend

This module will power the **Risk Scoring with Islamic Ethics** feature.

## Stack (free only)
- Node.js + Express + TypeScript
- Optional: PostgreSQL (Supabase/Neon free tier) with Prisma for storing scoring rules

## Planned API
- `POST /api/risk/calculate`
  - Body: `{ vulnerabilities: Vulnerability[] }`
  - Returns: technical, ethical, overall scores, severity counts, plus any ethical annotations.

## Implementation Steps
1. Copy your current `calculateRiskScore` logic into a backend service file.
2. Optionally store severity thresholds and ethical weights in a DB table so they can be tuned.
3. Ensure the response matches what `RiskScoreDisplay` expects on the frontend.
4. Mount `riskRouter` under `/api/risk` in the Express app.
