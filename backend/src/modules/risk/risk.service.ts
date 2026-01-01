import { prisma } from '../../prisma.ts';

// Severity mapping for technical risk calculation
const SEVERITY_WEIGHTS = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
} as const;

// Vulnerability type to severity mapping
function getVulnerabilitySeverity(technicalRisk: number): string {
  if (technicalRisk >= 5) return 'critical';
  if (technicalRisk >= 4) return 'high';
  if (technicalRisk >= 3) return 'medium';
  return 'low';
}

// Calculate technical risk score from all findings
function calculateTechnicalScore(findings: {
  penTests: Array<{ technicalRisk: number }>;
  phishingScans: Array<{ isPhishing: boolean }>;
  idsLogs: Array<{ failedAttempts: number }>;
}): { score: number; counts: { critical: number; high: number; medium: number; low: number } } {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  let weightedScore = 0;
  let totalFindings = 0;

  // Process penetration test results
  findings.penTests.forEach((penTest) => {
    const severity = getVulnerabilitySeverity(penTest.technicalRisk);
    counts[severity as keyof typeof counts]++;
    
    // Use weighted scoring based on severity
    weightedScore += penTest.technicalRisk * SEVERITY_WEIGHTS[severity as keyof typeof SEVERITY_WEIGHTS] / 5;
    totalFindings++;
  });

  // Process phishing analysis (if phishing detected, treat as high severity)
  findings.phishingScans.forEach((scan) => {
    if (scan.isPhishing) {
      counts.high++;
      weightedScore += 4 * SEVERITY_WEIGHTS.high / 5;
      totalFindings++;
    }
  });

  // Process IDS logs (many failed attempts = security concern)
  findings.idsLogs.forEach((log) => {
    if (log.failedAttempts > 10) {
      counts.critical++;
      weightedScore += 5 * SEVERITY_WEIGHTS.critical / 5;
      totalFindings++;
    } else if (log.failedAttempts > 5) {
      counts.high++;
      weightedScore += 4 * SEVERITY_WEIGHTS.high / 5;
      totalFindings++;
    } else if (log.failedAttempts > 0) {
      counts.medium++;
      weightedScore += 3 * SEVERITY_WEIGHTS.medium / 5;
      totalFindings++;
    }
  });

  // Calculate base score (0-5 scale)
  let finalScore = totalFindings > 0 ? weightedScore / totalFindings : 0;
  
  // Apply minimum thresholds based on severity counts
  // If you have critical vulnerabilities, score should be at least 4.0
  if (counts.critical > 0) {
    finalScore = Math.max(finalScore, 4.0 + (counts.critical * 0.2));
  } 
  // If you have 3+ high vulnerabilities, score should be at least 3.5
  else if (counts.high >= 3) {
    finalScore = Math.max(finalScore, 3.5 + (counts.high * 0.1));
  }
  // If you have 2+ high vulnerabilities, score should be at least 3.0
  else if (counts.high >= 2) {
    finalScore = Math.max(finalScore, 3.0);
  }

  return {
    score: Math.min(finalScore, 5),
    counts,
  };
}

// Calculate ethical risk score based on Islamic principles
function calculateEthicalScore(findings: {
  penTests: Array<{ technicalRisk: number; vulnerabilityType: string }>;
  phishingScans: Array<{ isPhishing: boolean }>;
  idsLogs: Array<{ failedAttempts: number }>;
  ethics?: { amanahScore: number | null; maslahahScore: number | null } | null;
}): number {
  // If Islamic ethics evaluation exists, use those scores
  if (findings.ethics?.amanahScore !== null && findings.ethics?.amanahScore !== undefined &&
      findings.ethics?.maslahahScore !== null && findings.ethics?.maslahahScore !== undefined) {
    return (findings.ethics.amanahScore + findings.ethics.maslahahScore) / 2;
  }

  // Fallback calculation if no ethics evaluation
  let amanahScore = 0; // Trust/Integrity violations (lower is better)
  let maslahahScore = 0; // Public harm/welfare impact (lower is better)

  // Amanah (Trust) Assessment - violations that breach user trust
  const authViolations = findings.penTests.filter(
    (test) =>
      /password|auth|session|credential|login|token|encryption|data\s*breach/i.test(test.vulnerabilityType)
  );
  
  // Weight by severity
  let amanahViolationScore = 0;
  authViolations.forEach(v => {
    if (v.technicalRisk >= 5) amanahViolationScore += 1.5;
    else if (v.technicalRisk >= 4) amanahViolationScore += 1.0;
    else if (v.technicalRisk >= 3) amanahViolationScore += 0.5;
  });
  
  amanahScore = Math.min(amanahViolationScore, 5);

  // Maslahah (Public Welfare) Assessment - potential harm to users
  let maslahahHarmScore = 0;
  
  // High technical risk vulnerabilities = high harm potential
  const criticalVulns = findings.penTests.filter(test => test.technicalRisk >= 5).length;
  const highVulns = findings.penTests.filter(test => test.technicalRisk >= 4 && test.technicalRisk < 5).length;
  
  maslahahHarmScore += criticalVulns * 1.5;  // Critical = 1.5 points each
  maslahahHarmScore += highVulns * 1.0;      // High = 1.0 point each
  
  // Phishing threats harm public trust
  const phishingCount = findings.phishingScans.filter(scan => scan.isPhishing).length;
  maslahahHarmScore += phishingCount * 0.8;
  
  // Intrusion attempts threaten user security
  const intrusionCount = findings.idsLogs.filter(log => log.failedAttempts > 5).length;
  maslahahHarmScore += intrusionCount * 0.7;

  maslahahScore = Math.min(maslahahHarmScore, 5);

  // Average of both Islamic ethics dimensions
  // Higher scores mean higher ethical risk (worse)
  return Math.min((amanahScore + maslahahScore) / 2, 5);
}

// Generate risk summary message
function generateSummary(
  technicalScore: number,
  ethicalScore: number,
  counts: { critical: number; high: number; medium: number; low: number }
): string {
  const issues: string[] = [];

  if (counts.critical > 0) {
    issues.push(`${counts.critical} critical vulnerabilit${counts.critical > 1 ? 'ies' : 'y'}`);
  }
  if (counts.high > 0) {
    issues.push(`${counts.high} high-risk issue${counts.high > 1 ? 's' : ''}`);
  }
  if (counts.medium > 0) {
    issues.push(`${counts.medium} medium-risk issue${counts.medium > 1 ? 's' : ''}`);
  }

  // Determine overall risk level based on both scores
  const maxScore = Math.max(technicalScore, ethicalScore);
  let riskLevel = 'Low';
  let urgency = '';
  
  if (counts.critical > 0 || maxScore >= 4.5) {
    riskLevel = 'Critical';
    urgency = 'IMMEDIATE ACTION REQUIRED. ';
  } else if (maxScore >= 4.0 || counts.high >= 3) {
    riskLevel = 'High';
    urgency = 'Urgent remediation needed. ';
  } else if (maxScore >= 3.0 || counts.high >= 1) {
    riskLevel = 'Medium';
    urgency = 'Timely remediation recommended. ';
  }

  const issueText = issues.length > 0 ? issues.join(', ') + ' detected' : 'No major issues found';
  
  let ethicalImpact = '';
  if (ethicalScore >= 4) {
    ethicalImpact = ' Significant breach of Islamic ethical principles (Amanah & Maslahah) - user trust and welfare at risk.';
  } else if (ethicalScore >= 3) {
    ethicalImpact = ' Moderate ethical concerns regarding user trust and data protection.';
  } else if (ethicalScore >= 2) {
    ethicalImpact = ' Minor ethical considerations present.';
  } else {
    ethicalImpact = ' Minimal ethical impact.';
  }

  return `${urgency}${riskLevel} risk level. ${issueText}.${ethicalImpact}`;
}

// Main function to calculate risk score for an audit session
export async function calculateRiskScore(auditId: string) {
  // Fetch all findings for this audit session
  const audit = await prisma.auditSession.findUnique({
    where: { id: auditId },
    include: {
      penTests: true,
      phishingScans: true,
      idsLogs: true,
      ethics: true,
    },
  });

  if (!audit) {
    throw new Error('Audit session not found');
  }

  // Calculate technical score
  const technical = calculateTechnicalScore({
    penTests: audit.penTests,
    phishingScans: audit.phishingScans,
    idsLogs: audit.idsLogs,
  });

  // Calculate ethical score
  const ethicalScore = calculateEthicalScore({
    penTests: audit.penTests,
    phishingScans: audit.phishingScans,
    idsLogs: audit.idsLogs,
    ethics: audit.ethics,
  });

  // Calculate overall score (weighted average: 70% technical, 30% ethical)
  // Technical vulnerabilities are the primary risk, ethical impact amplifies it
  let overallScore = technical.score * 0.7 + ethicalScore * 0.3;
  
  // Apply minimum overall score based on severity
  if (technical.counts.critical > 0) {
    overallScore = Math.max(overallScore, 4.0);
  } else if (technical.counts.high >= 3) {
    overallScore = Math.max(overallScore, 3.5);
  } else if (technical.counts.high >= 2) {
    overallScore = Math.max(overallScore, 3.0);
  }
  
  // Cap at 5.0
  overallScore = Math.min(overallScore, 5.0);

  // Generate summary
  const summary = generateSummary(technical.score, ethicalScore, technical.counts);

  // Save to database
  const riskScore = await prisma.riskScore.upsert({
    where: { auditId },
    update: {
      technicalScore: technical.score,
      ethicalScore: ethicalScore,
      overallScore: overallScore,
      criticalCount: technical.counts.critical,
      highCount: technical.counts.high,
      mediumCount: technical.counts.medium,
      lowCount: technical.counts.low,
    },
    create: {
      auditId,
      technicalScore: technical.score,
      ethicalScore: ethicalScore,
      overallScore: overallScore,
      criticalCount: technical.counts.critical,
      highCount: technical.counts.high,
      mediumCount: technical.counts.medium,
      lowCount: technical.counts.low,
    },
  });

  return {
    technical_score: technical.score,
    ethical_score: ethicalScore,
    overall_score: overallScore,
    summary,
    severity_counts: {
      critical: technical.counts.critical,
      high: technical.counts.high,
      medium: technical.counts.medium,
      low: technical.counts.low,
    },
    riskScore,
  };
}
