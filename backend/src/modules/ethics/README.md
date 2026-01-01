# Islamic Ethics Evaluation Module

## Overview
This module evaluates cybersecurity audit findings against Islamic ethical principles, specifically **Amanah (Trust)** and **Maslahah (Public Benefit)**.

## API Endpoints

### POST /api/ethics/evaluate
Evaluates an audit session and calculates Islamic ethics scores.

**Request Body:**
```json
{
  "auditId": "audit-session-id"
}
```

**Response:**
```json
{
  "id": "ethics-evaluation-id",
  "auditId": "audit-session-id",
  "amanahScore": 3.5,
  "maslahahScore": 4.0,
  "complianceLevel": "Good",
  "interpretation": "Your system demonstrates good adherence to Islamic ethical principles...",
  "evaluatedAt": "2024-01-15T10:30:00Z"
}
```

### GET /api/ethics/:auditId
Retrieves existing ethics evaluation for an audit.

**Response:** Same as POST endpoint

---

## Scoring Methodology

### Amanah (Trust/Integrity) Score - Scale: 0-5
Measures how well the system protects the trust placed in it by users.

**Evaluation Criteria:**
- **Authentication Issues** (Max -1.5 points)
  - Weak authentication mechanisms
  - Missing multi-factor authentication
  - Session management vulnerabilities
  
- **Password Security** (Max -1.0 points)
  - Weak password policies
  - Password storage issues
  - Credential exposure

- **Session Security** (Max -1.0 points)
  - Session hijacking vulnerabilities
  - Insecure session handling
  
- **Encryption** (Max -1.5 points)
  - Missing encryption
  - Weak encryption algorithms
  - Data transmission vulnerabilities

**Calculation:**
- Start with 5.0 (perfect trust)
- Deduct points based on trust violations found
- Minimum score: 0.0

---

### Maslahah (Public Benefit/Welfare) Score - Scale: 0-5
Measures the potential harm to users and public welfare from security issues.

**Evaluation Criteria:**
- **High-Risk Vulnerabilities** (Max -2.0 points)
  - Critical severity issues
  - High severity issues
  - Exploitable vulnerabilities

- **Data Exposure** (Max -2.0 points)
  - Sensitive data leaks
  - Privacy violations
  - Information disclosure

- **Intrusion Threats** (Max -0.5 points)
  - Detected intrusion attempts
  - Security breaches
  
- **Phishing Susceptibility** (Max -0.5 points)
  - Social engineering vulnerabilities
  - User deception risks

**Calculation:**
- Start with 5.0 (no harm to public)
- Deduct points based on potential harm
- Minimum score: 0.0

---

## Compliance Levels

Based on combined Amanah and Maslahah scores:

| Average Score | Compliance Level | Description |
|---------------|-----------------|-------------|
| 4.5 - 5.0 | **Excellent** | Exemplary adherence to Islamic ethical principles |
| 3.5 - 4.49 | **Good** | Strong alignment with ethical standards |
| 2.5 - 3.49 | **Fair** | Acceptable but needs improvement |
| 1.5 - 2.49 | **Poor** | Significant ethical concerns |
| 0.0 - 1.49 | **Critical** | Severe violations requiring immediate action |

---

## Integration

### Automatic Evaluation
The ethics evaluation is automatically triggered after risk calculation (Step 3) in the scanning flow.

**Flow:**
1. User completes risk assessment
2. Frontend calls `POST /api/risk/calculate`
3. Backend calculates technical risk scores
4. Frontend automatically calls `POST /api/ethics/evaluate`
5. Backend analyzes findings against Islamic principles
6. Ethics scores saved to database
7. Scores included in PDF report

### Manual Evaluation
You can manually trigger evaluation for any audit:

```typescript
const response = await fetch('/api/ethics/evaluate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ auditId: 'your-audit-id' })
});

const ethics = await response.json();
console.log(`Amanah Score: ${ethics.amanahScore}`);
console.log(`Maslahah Score: ${ethics.maslahahScore}`);
console.log(`Compliance: ${ethics.complianceLevel}`);
```

---

## Islamic References

### Amanah (Trust)
> "Indeed, Allah commands you to render trusts to whom they are due."
> 
> **Surah An-Nisa (4:58)**

In cybersecurity context:
- User data is an **amanah** (trust/sacred responsibility)
- Organizations must protect data with utmost care
- Negligence in security is a betrayal of trust

### Maslahah (Public Benefit)
> "No harm shall be inflicted or reciprocated in Islam."
>
> **Islamic Legal Maxim (La Darar wa La Dirar)**

In cybersecurity context:
- Systems must not harm users or society
- Privacy and safety are paramount
- Public welfare takes precedence over convenience

---

## Database Schema

```prisma
model IslamicEthicsEvaluation {
  id              String   @id @default(uuid())
  auditId         String   @unique
  amanahScore     Float    // 0-5 scale
  maslahahScore   Float    // 0-5 scale
  complianceLevel String   // Excellent/Good/Fair/Poor/Critical
  interpretation  String   @db.Text
  evaluatedAt     DateTime @default(now())
  
  audit AuditSession @relation(fields: [auditId], references: [id])
}
```

---

## Example Interpretations

### Excellent (4.5+)
> "Your system demonstrates exemplary adherence to Islamic ethical principles. The strong Amanah score (4.8/5.0) reflects excellent protection of user trust through robust authentication and encryption. The high Maslahah score (4.7/5.0) shows minimal risk to public welfare. Continue maintaining these high standards."

### Fair (2.5-3.49)
> "Your system shows acceptable adherence to Islamic ethical principles but requires improvement. The Amanah score (3.2/5.0) indicates some trust violations in authentication and session management. Address these to better fulfill the sacred responsibility of data protection (Amanah)."

### Critical (<1.5)
> "Your system has severe ethical concerns requiring immediate action. The low Amanah score (1.2/5.0) reveals significant trust violations. The poor Maslahah score (1.1/5.0) indicates substantial risk to public welfare. Immediate remediation is required to fulfill Islamic ethical obligations."

---

## Testing

To test the ethics evaluation:

1. **Complete a security scan** with some vulnerabilities
2. **Check the ethics scores** in the console after Step 3
3. **Download the PDF report** to see visual ethics display
4. **Verify database** - ethics record should be linked to audit

Expected behavior:
- Systems with no/few vulnerabilities → High scores (4.0+)
- Systems with authentication issues → Lower Amanah score
- Systems with critical vulnerabilities → Lower Maslahah score
- Scores accurately reflect Islamic ethical principles

---

## Future Enhancements

Potential improvements:
- [ ] Display ethics scores in frontend UI (Step 4)
- [ ] Add remediation guidance specific to Islamic principles
- [ ] Include more Quranic references for different violations
- [ ] Support custom weighting of ethical criteria
- [ ] Historical ethics score tracking over time
- [ ] Compliance certification generation

---

## Support

For questions about Islamic ethics evaluation:
- Review the Quranic references above
- Consult Islamic scholars for principle interpretations
- Check audit findings to understand score deductions
- Examine interpretation field for detailed explanation
