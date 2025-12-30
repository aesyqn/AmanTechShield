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
  let totalScore = 0;
  let totalFindings = 0;

  // Process penetration test results
  findings.penTests.forEach((penTest) => {
    const severity = getVulnerabilitySeverity(penTest.technicalRisk);
    counts[severity as keyof typeof counts]++;
    totalScore += penTest.technicalRisk;
    totalFindings++;
  });

  // Process phishing analysis (if phishing detected, treat as high severity)
  findings.phishingScans.forEach((scan) => {
    if (scan.isPhishing) {
      counts.high++;
      totalScore += 4;
      totalFindings++;
    }
  });

  // Process IDS logs (many failed attempts = security concern)
  findings.idsLogs.forEach((log) => {
    if (log.failedAttempts > 10) {
      counts.critical++;
      totalScore += 5;
      totalFindings++;
    } else if (log.failedAttempts > 5) {
      counts.high++;
      totalScore += 4;
      totalFindings++;
    } else if (log.failedAttempts > 0) {
      counts.medium++;
      totalScore += 3;
      totalFindings++;
    }
  });

  // Calculate average score (0-5 scale)
  const averageScore = totalFindings > 0 ? totalScore / totalFindings : 0;

  return {
    score: Math.min(averageScore, 5),
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
  let amanahScore = 0; // Trust/Integrity violations
  let maslahahScore = 0; // Public harm/welfare impact

  // Amanah (Trust) Assessment
  // Vulnerabilities that breach user trust
  const trustViolations = findings.penTests.filter(
    (test) =>
      test.vulnerabilityType.toLowerCase().includes('password') ||
      test.vulnerabilityType.toLowerCase().includes('auth') ||
      test.vulnerabilityType.toLowerCase().includes('session')
  ).length;

  amanahScore = Math.min((trustViolations / 3) * 5, 5); // Normalize to 0-5

  // Maslahah (Public Welfare) Assessment
  // High technical risk = high potential harm to users
  const highRiskCount = findings.penTests.filter((test) => test.technicalRisk >= 4).length;
  const phishingRisk = findings.phishingScans.filter((scan) => scan.isPhishing).length;
  const intrusionRisk = findings.idsLogs.filter((log) => log.failedAttempts > 5).length;

  const totalHarmPotential = highRiskCount + phishingRisk + intrusionRisk;
  maslahahScore = Math.min((totalHarmPotential / 5) * 5, 5); // Normalize to 0-5

  // Use existing Islamic ethics evaluation if available
  if (findings.ethics) {
    if (findings.ethics.amanahScore !== null && findings.ethics.amanahScore !== undefined) {
      amanahScore = findings.ethics.amanahScore;
    }
    if (findings.ethics.maslahahScore !== null && findings.ethics.maslahahScore !== undefined) {
      maslahahScore = findings.ethics.maslahahScore;
    }
  }

  // Average of both Islamic ethics dimensions
  return (amanahScore + maslahahScore) / 2;
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

  let riskLevel = 'Low';
  if (technicalScore >= 4 || ethicalScore >= 4) riskLevel = 'High';
  else if (technicalScore >= 3 || ethicalScore >= 3) riskLevel = 'Medium';

  const issueText = issues.length > 0 ? issues.join(' and ') : 'No major issues found';
  const ethicalImpact =
    ethicalScore >= 4
      ? 'Significant ethical harm to user trust and welfare (Amanah and Maslahah principles violated).'
      : ethicalScore >= 3
        ? 'Moderate ethical concerns regarding user trust.'
        : 'Minimal ethical impact.';

  return `${riskLevel} risk detected. ${issueText}. ${ethicalImpact}`;
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

  // Calculate overall score (weighted average: 60% technical, 40% ethical)
  const overallScore = technical.score * 0.6 + ethicalScore * 0.4;

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
