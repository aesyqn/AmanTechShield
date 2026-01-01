/**
 * AI-Powered Recovery Plan Service using Google Gemini
 * 
 * Generates intelligent, context-aware recovery plans based on:
 * - Vulnerability analysis
 * - Risk scoring
 * - Islamic ethical principles
 * - Industry best practices
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI (use environment variable for security)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface AuditFindings {
  penTests: Array<{ 
    id: string;
    auditId: string;
    vulnerabilityType: string; 
    technicalRisk: number;
  }>;
  phishingScans: Array<{ 
    id: string;
    auditId: string;
    isPhishing: boolean; 
    detectedKeywords: string[]; 
    riskScore: number | null;
    suspiciousPatterns: string[];
  }>;
  idsLogs: Array<{ 
    id: string;
    auditId: string;
    failedAttempts: number; 
    anomaliesFound: string | null;
  }>;
  riskScore: {
    id: string;
    auditId: string;
    overallScore: number;
    technicalScore: number;
    ethicalScore: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    calculatedAt: Date;
  } | null;
  ethics?: {
    id: string;
    auditId: string;
    amanahScore: number | null;
    maslahahScore: number | null;
    complianceLevel: string | null;
    interpretation?: string | null;
    evaluatedAt?: Date;
  } | null;
}

interface RecoveryPlanItem {
  phase: 'immediate' | 'short_term' | 'long_term';
  title: string;
  description: string;
  stakeholders: string[];
  priority: 1 | 2 | 3;
  timeline: string;
}

/**
 * Generate AI-powered recovery plan using Gemini
 */
export async function generateAIRecoveryPlan(audit: AuditFindings): Promise<{
  actionSteps: RecoveryPlanItem[];
  disclosurePolicy: string;
  executiveSummary: string;
}> {
  try {
    // Use Gemini 1.5 Flash - faster and more generous free tier
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash'
    });

    // Build comprehensive prompt
    const prompt = buildRecoveryPrompt(audit);

    // Generate recovery plan
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse AI response into structured format
    const parsedPlan = parseAIResponse(text);

    return parsedPlan;

  } catch (error) {
    console.error('❌ AI recovery plan generation failed:', error);
    
    // Fallback to rule-based generation
    return generateFallbackPlan(audit);
  }
}

/**
 * Build detailed prompt for Gemini AI
 */
function buildRecoveryPrompt(audit: AuditFindings): string {
  const { riskScore, penTests, phishingScans, idsLogs, ethics } = audit;

  return `You are a cybersecurity expert and Islamic ethics consultant. Generate a comprehensive security recovery plan based on the following audit findings:

# AUDIT FINDINGS SUMMARY

## Risk Scores
- Overall Risk: ${riskScore?.overallScore?.toFixed(2) || 'N/A'}/5.0
- Technical Risk: ${riskScore?.technicalScore?.toFixed(2) || 'N/A'}/5.0
- Ethical Risk: ${riskScore?.ethicalScore?.toFixed(2) || 'N/A'}/5.0

## Vulnerability Breakdown
- Critical: ${riskScore?.criticalCount || 0}
- High: ${riskScore?.highCount || 0}
- Medium: ${riskScore?.mediumCount || 0}
- Low: ${riskScore?.lowCount || 0}

## Detailed Findings

### Penetration Test Results (${penTests.length} findings)
${penTests.map((test, i) => `${i + 1}. ${test.vulnerabilityType} (Risk: ${test.technicalRisk}/5)`).join('\n')}

### Phishing Analysis (${phishingScans.length} scans)
${phishingScans.map((scan, i) => {
  return `${i + 1}. ${scan.isPhishing ? '⚠️ PHISHING DETECTED' : '✅ Safe'} - Keywords: ${scan.detectedKeywords.slice(0, 3).join(', ')}`;
}).join('\n')}

### Intrusion Detection (${idsLogs.length} logs)
${idsLogs.map((log, i) => `${i + 1}. Failed Login Attempts: ${log.failedAttempts}${log.anomaliesFound ? ` - ${log.anomaliesFound}` : ''}`).join('\n')}

## Islamic Ethical Assessment
${ethics && ethics.amanahScore !== null && ethics.maslahahScore !== null ? `
- Amanah (Trust) Score: ${ethics.amanahScore.toFixed(2)}/5.0
- Maslahah (Public Welfare) Score: ${ethics.maslahahScore.toFixed(2)}/5.0
- Compliance Level: ${ethics.complianceLevel || 'Not assessed'}
${ethics.interpretation ? `- Analysis: ${ethics.interpretation}` : ''}
` : 'Not yet evaluated'}

# REQUIREMENTS

Generate a JSON response with the following structure:

{
  "executiveSummary": "Brief 2-3 sentence overview of the security posture and urgency level",
  "actionSteps": [
    {
      "phase": "immediate" | "short_term" | "long_term",
      "title": "Clear, actionable task title",
      "description": "Detailed step-by-step instructions for remediation",
      "stakeholders": ["Specific roles/teams responsible"],
      "priority": 1-3 (1=highest),
      "timeline": "e.g., '0-24 hours', '1-7 days', '1-3 months'"
    }
  ],
  "disclosurePolicy": "Ethical disclosure policy following Islamic principles of Amanah and Maslahah"
}

# IMPORTANT GUIDELINES

1. **Immediate Actions (0-24 hours)**: For CRITICAL vulnerabilities only
2. **Short-term Actions (1-7 days)**: For HIGH severity issues and security improvements
3. **Long-term Actions (1-3 months)**: For MEDIUM/LOW issues and strategic improvements

4. **Islamic Ethical Integration**:
   - Reference Amanah (protecting user trust as sacred responsibility)
   - Reference Maslahah (prioritizing public welfare and preventing harm)
   - Include Quranic guidance where appropriate
   - Emphasize responsible disclosure to protect users

5. **Stakeholders**: Be specific (e.g., "IT Security Team", "CISO", "Development Team", "HR", "All Staff")

6. **Descriptions**: Must be technical, actionable, and specific to the vulnerabilities found

7. **Disclosure Policy**: Include:
   - Severity-based timeline
   - Communication channels
   - Islamic ethical principles (Amanah, Maslahah, Ihsan, Adl)
   - Responsible disclosure approach

Generate ONLY valid JSON. Do not include markdown formatting or code blocks.`;
}

/**
 * Parse AI response into structured format
 */
function parseAIResponse(text: string): {
  actionSteps: RecoveryPlanItem[];
  disclosurePolicy: string;
  executiveSummary: string;
} {
  try {
    // Remove markdown code blocks if present
    let cleanText = text.trim();
    cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const parsed = JSON.parse(cleanText);
    
    // Validate structure
    if (!parsed.actionSteps || !Array.isArray(parsed.actionSteps)) {
      throw new Error('Invalid response structure: missing actionSteps');
    }

    return {
      actionSteps: parsed.actionSteps,
      disclosurePolicy: parsed.disclosurePolicy || 'No disclosure policy generated',
      executiveSummary: parsed.executiveSummary || 'Security assessment complete'
    };

  } catch (error) {
    console.error('❌ Failed to parse AI response:', error);
    throw error;
  }
}

/**
 * Fallback: Rule-based recovery plan if AI fails
 */
function generateFallbackPlan(audit: AuditFindings): {
  actionSteps: RecoveryPlanItem[];
  disclosurePolicy: string;
  executiveSummary: string;
} {
  const plan: RecoveryPlanItem[] = [];
  const { riskScore, penTests, phishingScans, idsLogs } = audit;

  const criticalCount = riskScore?.criticalCount || 0;
  const highCount = riskScore?.highCount || 0;

  // Immediate actions for critical vulnerabilities
  if (criticalCount > 0) {
    plan.push({
      phase: 'immediate',
      title: 'Resolve all critical vulnerabilities',
      description: 'Immediately patch or mitigate all CRITICAL severity findings to prevent exploitation.',
      stakeholders: ['IT Security Team', 'CISO', 'System Owners'],
      priority: 1,
      timeline: '0-24 hours'
    });
  }

  // Short-term actions for high severity
  if (highCount > 0) {
    plan.push({
      phase: 'short_term',
      title: 'Patch high severity vulnerabilities',
      description: 'Apply security patches and configuration fixes for all HIGH severity issues.',
      stakeholders: ['IT Security Team', 'Development Team'],
      priority: 2,
      timeline: '1-7 days'
    });
  }

  // Phishing awareness
  if (phishingScans.some(s => s.isPhishing)) {
    plan.push({
      phase: 'short_term',
      title: 'Conduct phishing awareness training',
      description: 'Deliver staff training on recognizing phishing attacks and social engineering.',
      stakeholders: ['HR Department', 'All Staff'],
      priority: 2,
      timeline: '1-7 days'
    });
  }

  // Intrusion response
  if (idsLogs.some(log => log.failedAttempts > 5)) {
    plan.push({
      phase: 'short_term',
      title: 'Enhance intrusion detection',
      description: 'Strengthen IDS rules and implement automated threat response.',
      stakeholders: ['Security Operations', 'Network Team'],
      priority: 2,
      timeline: '1-7 days'
    });
  }

  // Long-term improvements
  plan.push({
    phase: 'long_term',
    title: 'Implement continuous security monitoring',
    description: 'Establish regular penetration testing and vulnerability scanning programs.',
    stakeholders: ['IT Security Team', 'Management'],
    priority: 3,
    timeline: '1-3 months'
  });

  const severity = (riskScore?.overallScore || 0) >= 4 ? 'High' : 
                   (riskScore?.overallScore || 0) >= 3 ? 'Medium' : 'Low';

  return {
    actionSteps: plan,
    executiveSummary: `Security assessment identified ${criticalCount} critical and ${highCount} high severity issues requiring ${severity.toLowerCase()} priority remediation.`,
    disclosurePolicy: `ETHICAL DISCLOSURE POLICY

Type: Private Responsible Disclosure
Severity Level: ${severity}

Disclosure Timeline:
- Immediate notification to internal security team
- 24-hour disclosure to system owners for critical issues
- 7-day disclosure for high-severity issues

Islamic Ethical Principles:
1. Amanah (Trust) - Protecting user data as sacred trust
2. Maslahah (Public Benefit) - Preventing harm through responsible disclosure
3. Ihsan (Excellence) - Pursuing highest security standards

"Indeed, Allah commands you to render trusts to whom they are due." - Surah An-Nisa: 58`
  };
}
