# Risk Scoring (Islamic Ethics) Module

## Overview

The **Risk Scoring module** acts as the **"Summary Evaluator"** that aggregates findings from all security modules (Penetration Test, Phishing Detection, and IDS) and calculates comprehensive risk scores based on both **technical** and **Islamic ethical** principles.

---

## Role

⚖️ **Risk & Compliance Officer (Islamic Ethics)**
**"Ethical Risk Evaluator"**

---

## What It Does

1. **Aggregates** all security findings from:
   - Penetration Test results
   - Phishing Analysis
   - IDS (Intrusion Detection) logs

2. **Calculates** three key scores:
   - **Technical Risk Score** (0-5 scale)
   - **Ethical Risk Score** (0-5 scale)
   - **Overall Risk Score** (0-5 scale)

3. **Counts** vulnerabilities by severity:
   - Critical
   - High
   - Medium
   - Low

4. **Stores** results in the database for report generation

---

## Islamic Ethics Principles

The ethical scoring is based on three core Islamic principles:

### 1. **Amanah (Trust/Integrity)**
- Measures violations of user trust
- Focuses on authentication and password vulnerabilities
- Example: Weak password policies = breach of Amanah

### 2. **Maslahah (Public Benefit/Welfare)**
- Assesses potential harm to users and public
- High-risk vulnerabilities = high harm potential
- Example: Data exposure = violation of Maslahah

### 3. **Harm Avoidance (Darura)**
- Prevents damage before it occurs
- Prioritizes fixing critical issues first

> *"Do not betray the trust (amanah) placed in you."* — Surah Al-Anfal: 27

---

## API Endpoint

### `POST /api/risk/calculate`

**Request Body:**
```json
{
  "auditId": "uuid-of-audit-session"
}
```

**Response:**
```json
{
  "technical_score": 4.5,
  "ethical_score": 4.0,
  "overall_score": 4.3,
  "summary": "High risk detected. 2 critical vulnerabilities and 3 high-risk issues. Significant ethical harm to user trust and welfare.",
  "severity_counts": {
    "critical": 2,
    "high": 3,
    "medium": 1,
    "low": 0
  },
  "riskScore": {
    "id": "...",
    "auditId": "...",
    "technicalScore": 4.5,
    "ethicalScore": 4.0,
    "overallScore": 4.3,
    "criticalCount": 2,
    "highCount": 3,
    "mediumCount": 1,
    "lowCount": 0,
    "calculatedAt": "2025-12-30T..."
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad Request (missing auditId)
- `404` - Audit session not found
- `500` - Server error

---

## How Scoring Works

### Technical Score Calculation (0-5 scale)

1. **From Penetration Tests:**
   - Uses `technicalRisk` field (1-5)
   - Maps to severity levels:
     - 5 = Critical
     - 4 = High
     - 3 = Medium
     - 2 = Low

2. **From Phishing Analysis:**
   - If `isPhishing = true` → Counts as High severity (4)

3. **From IDS Logs:**
   - `failedAttempts > 10` → Critical (5)
   - `failedAttempts > 5` → High (4)
   - `failedAttempts > 0` → Medium (3)

**Formula:**
```
Technical Score = Average of all weighted findings
```

### Ethical Score Calculation (0-5 scale)

1. **Amanah (Trust) Score:**
   - Counts vulnerabilities related to:
     - Password security
     - Authentication
     - Session management
   - More trust violations = higher score

2. **Maslahah (Public Welfare) Score:**
   - Counts high-risk findings that harm users:
     - High technical risk (≥4)
     - Phishing attempts
     - Intrusion attempts
   - More harm potential = higher score

**Formula:**
```
Ethical Score = (Amanah Score + Maslahah Score) / 2
```

> **Note:** If `IslamicEthicsEvaluation` exists for this audit, it uses the stored `amanahScore` and `maslahahScore` values.

### Overall Score Calculation

```
Overall Score = (Technical Score × 60%) + (Ethical Score × 40%)
```

This weighted approach emphasizes technical security while honoring Islamic ethical considerations.

---

## Database Schema

### RiskScore Table

```sql
CREATE TABLE "RiskScore" (
  id uuid PRIMARY KEY,
  auditId uuid UNIQUE REFERENCES "AuditSession"(id),
  technicalScore double precision NOT NULL,
  ethicalScore double precision NOT NULL,
  overallScore double precision NOT NULL,
  criticalCount integer DEFAULT 0,
  highCount integer DEFAULT 0,
  mediumCount integer DEFAULT 0,
  lowCount integer DEFAULT 0,
  calculatedAt timestamp DEFAULT CURRENT_TIMESTAMP
);
```

---

## Files

```
backend/src/modules/risk/
├── risk.controller.ts   # API endpoint handler
├── risk.service.ts      # Scoring logic and calculations
└── README.md            # This file
```

---

## Dependencies

This module depends on:
- ✅ **Module 1:** Penetration Test Simulation
- ✅ **Module 2:** Phishing Detection
- ✅ **Module 3:** Intrusion Detection (IDS)

And is used by:
- ⏭️ **Module 5:** Recovery & Disclosure Plan
- ⏭️ **Module 5:** Report Generation

---

## Testing

### 🧪 Automated Test (Recommended)

Since other modules aren't complete yet, use the automated test script with mock data:

```bash
# From project root
npx ts-node backend/src/modules/risk/test-risk-scoring.ts
```

**What it does:**
1. ✅ Creates a test user
2. ✅ Creates an audit session
3. ✅ Adds mock vulnerabilities (5 pen tests, 2 phishing, 3 IDS logs)
4. ✅ Adds Islamic ethics evaluation
5. ✅ Runs risk scoring calculation
6. ✅ Displays formatted results

**Expected Output:**
```
📈 RISK SCORE RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 Technical Score:  4.20/5.00
⚖️  Ethical Score:    4.25/5.00
🎯 Overall Score:    4.22/5.00

🔍 VULNERABILITY BREAKDOWN
🔴 Critical:  2
🟠 High:      5
🟡 Medium:    2
🔵 Low:       1
```

💡 **Tip:** The test data remains in your database so you can inspect it in Supabase Table Editor!

---

## Example Usage

### Backend (Testing with curl)

```bash
curl -X POST http://localhost:4000/api/risk/calculate \
  -H "Content-Type: application/json" \
  -d '{"auditId": "your-audit-id-here"}'
```

### Frontend (React/TypeScript)

```typescript
import { adaptRiskScore } from '@/utils/riskScoreAdapter';
import { RiskScoreDisplay } from '@/components/RiskScoreDisplay';

// Fetch risk score
const response = await fetch('/api/risk/calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ auditId: auditId })
});

const backendScore = await response.json();

// Transform to frontend format
const frontendScore = adaptRiskScore(backendScore);

// Display
<RiskScoreDisplay riskScore={frontendScore} />
```

---

## Summary Generation

The module automatically generates a human-readable summary based on:
- Risk level (High/Medium/Low)
- Number of critical/high vulnerabilities
- Ethical impact assessment

**Example:**
> "High risk detected. 2 critical vulnerabilities and 3 high-risk issues. Significant ethical harm to user trust and welfare (Amanah and Maslahah principles violated)."

---

## Future Enhancements

- [ ] Configurable scoring weights
- [ ] Custom Islamic ethics rules
- [ ] Risk trend analysis over time
- [ ] Integration with Shariah compliance frameworks
- [ ] Multi-language support for Islamic terms

---

## Support

For questions about this module, refer to:
- Project documentation: `/docs`
- Main system README: `/README.md`
- Islamic Finance PDF: Reference document for ethical principles

---

**Module Status:** ✅ **Complete and Ready to Use**

Last Updated: December 30, 2025
