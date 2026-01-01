# Risk Scoring Criteria - AmanTech Shield

## Overview
Risk scores are calculated on a **0-5 scale** and converted to **0-100% for display**.

---

## Scoring Components

### 1. Technical Risk Score (0-5)

Evaluates security vulnerabilities and technical weaknesses.

#### Severity Classification:
- **Critical (5.0)**: Vulnerabilities with technical risk ≥ 5.0
- **High (4.0)**: Vulnerabilities with technical risk ≥ 4.0 and < 5.0
- **Medium (3.0)**: Vulnerabilities with technical risk ≥ 3.0 and < 4.0
- **Low (2.0)**: Vulnerabilities with technical risk < 3.0

#### Weighted Scoring:
Each finding is weighted by its severity:
- Critical findings: Weight × 5
- High findings: Weight × 4
- Medium findings: Weight × 3
- Low findings: Weight × 2

#### Minimum Score Thresholds:
To ensure critical issues aren't averaged down:

- **1+ Critical vulnerabilities** → Minimum score: **4.0** (+ 0.2 per additional critical)
- **3+ High vulnerabilities** → Minimum score: **3.5** (+ 0.1 per additional high)
- **2+ High vulnerabilities** → Minimum score: **3.0**

#### IDS Log Integration:
- 10+ failed login attempts → Critical (5.0)
- 6-10 failed attempts → High (4.0)
- 1-5 failed attempts → Medium (3.0)

#### Phishing Detection:
- Phishing detected → High severity (4.0)

**Example Calculation:**
```
Findings: 3 High (4.0 each), 2 Medium (3.0 each), 1 Low (2.0)

Weighted Score = (3×4×4 + 2×3×3 + 1×2×2) / 6 = 66/6 = 3.67

With 3+ High findings → Apply minimum threshold: max(3.67, 3.5 + 0.3) = 3.8

Final Technical Score: 3.8/5.0 (76%)
```

---

### 2. Ethical Risk Score (0-5)

Evaluates impact on Islamic ethical principles: **Amanah (Trust)** and **Maslahah (Public Welfare)**.

#### Amanah (Trust) Assessment:
Violations of user trust through security weaknesses.

**Trust Violation Keywords:**
- password, auth, session, credential, login, token
- encryption, data breach, unauthorized access

**Scoring:**
- Critical auth vulnerability: +1.5 points
- High auth vulnerability: +1.0 point
- Medium auth vulnerability: +0.5 points
- **Maximum:** 5.0

#### Maslahah (Public Welfare) Assessment:
Potential harm to users and society.

**Harm Calculation:**
- Each Critical vulnerability: +1.5 points
- Each High vulnerability: +1.0 point
- Each Phishing threat: +0.8 points
- Each Intrusion attempt (5+ failed logins): +0.7 points
- **Maximum:** 5.0

**Combined Ethical Score:**
```
Ethical Risk = (Amanah Score + Maslahah Score) / 2
```

**If Islamic Ethics Evaluation exists:** Use the detailed scores from the ethics module instead.

**Example:**
```
Auth vulnerabilities: 2 High (2.0 Amanah points)
Other vulnerabilities: 1 Critical, 2 High (1.5 + 2.0 = 3.5 Maslahah points)
Phishing: 1 detected (0.8 Maslahah points)

Amanah Score: 2.0
Maslahah Score: min(3.5 + 0.8, 5.0) = 4.3

Ethical Risk: (2.0 + 4.3) / 2 = 3.15/5.0 (63%)
```

---

### 3. Overall Risk Score (0-5)

Weighted combination of Technical and Ethical risk.

**Formula:**
```
Overall = (Technical × 0.7) + (Ethical × 0.3)
```

**Reasoning:** Technical vulnerabilities are primary threats, ethical impact amplifies the severity.

#### Minimum Overall Thresholds:
- 1+ Critical findings → **Minimum 4.0**
- 3+ High findings → **Minimum 3.5**
- 2+ High findings → **Minimum 3.0**

**Example:**
```
Technical: 3.8/5.0
Ethical: 3.15/5.0

Base Overall = (3.8 × 0.7) + (3.15 × 0.3) = 2.66 + 0.945 = 3.605

With 3 High findings → Apply minimum: max(3.605, 3.5) = 3.605

Final Overall Score: 3.61/5.0 (72.2%)
```

---

## Risk Level Classification

| Score Range | Risk Level | Percentage | Action Required |
|-------------|-----------|------------|-----------------|
| 4.5 - 5.0 | **Critical** | 90-100% | IMMEDIATE ACTION REQUIRED |
| 4.0 - 4.49 | **High** | 80-89.9% | Urgent remediation needed |
| 3.0 - 3.99 | **Medium** | 60-79.9% | Timely remediation recommended |
| 0.0 - 2.99 | **Low** | 0-59.9% | Monitor and maintain |

---

## Summary Generation

Risk summaries include:

1. **Urgency Level:**
   - Critical/High → "IMMEDIATE ACTION REQUIRED"
   - Medium → "Timely remediation recommended"
   - Low → Standard monitoring

2. **Vulnerability Counts:**
   - Lists all critical, high, and medium severity findings

3. **Ethical Impact:**
   - Describes breach of Amanah and Maslahah principles
   - Links to Islamic ethical framework

**Example Summary:**
```
"Urgent remediation needed. High risk level. 3 high-risk issues, 
2 medium-risk issues detected. Moderate ethical concerns regarding 
user trust and data protection."
```

---

## Comparison: Old vs New Criteria

### Old Scoring Issues:
❌ Simple averaging allowed critical issues to be diluted  
❌ No minimum score thresholds  
❌ 60/40 weighting undervalued technical risk  
❌ Ethical score too simplistic  
❌ Frontend displayed wrong percentage (2.6% instead of 52%)

### New Improvements:
✅ Weighted scoring by severity  
✅ Minimum score thresholds prevent dilution  
✅ 70/30 weighting emphasizes technical risk  
✅ Enhanced ethical scoring with Amanah + Maslahah  
✅ Correct percentage display (0-5 → 0-100%)  
✅ Better integration with Islamic ethics module  

---

## Real-World Example

**Scenario:** 3 High vulnerabilities, 2 Medium, 1 Low

### Old System:
- Technical: Simple average of (4+4+4+3+3+2)/6 = 3.33
- Ethical: Basic count = 1.5
- Overall: (3.33 × 0.6) + (1.5 × 0.4) = 2.6
- **Display: 2.6% (WRONG - should be 52%)**
- **Risk Level: Low (WRONG - should be Medium/High)**

### New System:
- Technical: Weighted score with 3+ High threshold = 3.8
- Ethical: Detailed Amanah + Maslahah = 3.15
- Overall: (3.8 × 0.7) + (3.15 × 0.3) = 3.61
- **Display: 72.2% (CORRECT)**
- **Risk Level: Medium (CORRECT)**
- **Summary: "Urgent remediation needed. 3 high-risk issues detected."**

---

## Testing Validation

To verify scoring works correctly:

1. **No vulnerabilities** → Overall: 0.0 (0%) - Low Risk
2. **1 Critical vuln** → Overall: ≥4.0 (80%) - High Risk
3. **3 High vulns** → Overall: ≥3.5 (70%) - Medium Risk
4. **Mix of severities** → Properly weighted average
5. **Auth vulnerabilities** → Higher ethical score
6. **Frontend display** → Shows as percentage (0-100%)

---

## API Response Format

```json
{
  "technical_score": 3.8,
  "ethical_score": 3.15,
  "overall_score": 3.61,
  "severity_counts": {
    "critical": 0,
    "high": 3,
    "medium": 2,
    "low": 1
  },
  "summary": "Urgent remediation needed. High risk level. 3 high-risk issues, 2 medium-risk issues detected. Moderate ethical concerns regarding user trust and data protection."
}
```

Frontend converts: `3.61 / 5.0 * 100 = 72.2%`

---

## Notes

- All scores capped at maximum 5.0
- Minimum thresholds ensure critical issues aren't hidden
- Ethical scoring integrates with Islamic Ethics Evaluation module
- Summary provides actionable, context-aware guidance
- Percentage display accurately reflects 0-5 scale conversion
