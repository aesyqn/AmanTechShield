/**
 * Islamic Ethics Evaluation Controller
 * 
 * Evaluates cybersecurity practices against Islamic ethical principles:
 * - Amanah (Trust/Integrity)
 * - Maslahah (Public Benefit/Welfare)
 * - Overall Compliance Level
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../../prisma';

export const ethicsRouter = Router();

/**
 * POST /api/ethics/evaluate
 * 
 * Evaluates audit findings against Islamic ethical principles
 */
ethicsRouter.post('/evaluate', async (req: Request, res: Response) => {
  try {
    const { auditId } = req.body as { auditId?: string };

    if (!auditId) {
      return res.status(400).json({ error: 'auditId is required' });
    }

    console.log(`🕌 Evaluating Islamic ethics for audit: ${auditId}`);

    // Fetch audit with all findings
    const audit = await prisma.auditSession.findUnique({
      where: { id: auditId },
      include: {
        penTests: true,
        phishingScans: true,
        idsLogs: true,
        riskScore: true
      }
    });

    if (!audit) {
      return res.status(404).json({ error: 'Audit session not found' });
    }

    // Calculate ethical scores
    const amanahScore = calculateAmanahScore(audit);
    const maslahahScore = calculateMaslahahScore(audit);
    const complianceLevel = determineComplianceLevel(amanahScore, maslahahScore);

    // Save to database
    const evaluation = await prisma.islamicEthicsEvaluation.upsert({
      where: { auditId },
      update: {
        amanahScore,
        maslahahScore,
        complianceLevel
      },
      create: {
        auditId,
        amanahScore,
        maslahahScore,
        complianceLevel
      }
    });

    console.log(`✅ Islamic ethics evaluation complete`);
    console.log(`   Amanah Score: ${amanahScore.toFixed(2)}/5`);
    console.log(`   Maslahah Score: ${maslahahScore.toFixed(2)}/5`);
    console.log(`   Compliance Level: ${complianceLevel}`);

    return res.status(200).json({
      success: true,
      evaluation: {
        id: evaluation.id,
        amanahScore,
        maslahahScore,
        complianceLevel,
        interpretation: generateInterpretation(amanahScore, maslahahScore, complianceLevel)
      }
    });

  } catch (error: any) {
    console.error('❌ Error evaluating Islamic ethics:', error);
    return res.status(500).json({ 
      error: 'Failed to evaluate Islamic ethics',
      message: error.message 
    });
  }
});

/**
 * Calculate Amanah (Trust/Integrity) Score
 * 
 * Evaluates violations of user trust:
 * - Authentication vulnerabilities
 * - Password security issues
 * - Session management problems
 * - Data protection failures
 * 
 * Score: 5.0 = Perfect Trust, 0.0 = Complete Trust Violation
 */
function calculateAmanahScore(audit: any): number {
  let trustViolations = 0;
  let totalFindings = 0;

  // Analyze penetration test findings
  audit.penTests.forEach((test: any) => {
    totalFindings++;
    
    const vulnType = test.vulnerabilityType.toLowerCase();
    
    // Critical trust violations
    if (
      vulnType.includes('password') ||
      vulnType.includes('auth') ||
      vulnType.includes('session') ||
      vulnType.includes('credential') ||
      vulnType.includes('token') ||
      vulnType.includes('encryption') ||
      vulnType.includes('ssl') ||
      vulnType.includes('tls')
    ) {
      trustViolations += test.technicalRisk >= 4 ? 2 : 1;
    } else if (test.technicalRisk >= 4) {
      trustViolations += 0.5;
    }
  });

  // Phishing indicates trust manipulation
  audit.phishingScans.forEach((scan: any) => {
    if (scan.isPhishing) {
      totalFindings++;
      trustViolations += 2; // Phishing is a severe trust violation
    }
  });

  // IDS intrusions indicate trust breaches
  audit.idsLogs.forEach((log: any) => {
    if (log.failedAttempts > 0) {
      totalFindings++;
      trustViolations += log.failedAttempts > 10 ? 2 : 
                        log.failedAttempts > 5 ? 1 : 0.5;
    }
  });

  // Calculate score (inverse of violations)
  if (totalFindings === 0) return 5.0; // No findings = perfect trust
  
  const violationRatio = trustViolations / Math.max(totalFindings, 1);
  const score = Math.max(0, 5 - (violationRatio * 2.5));
  
  return Math.round(score * 100) / 100; // Round to 2 decimals
}

/**
 * Calculate Maslahah (Public Benefit/Welfare) Score
 * 
 * Evaluates potential harm to users and public:
 * - High-risk vulnerabilities (potential harm)
 * - Data exposure risks
 * - Service disruption risks
 * - User safety concerns
 * 
 * Score: 5.0 = Excellent Public Welfare, 0.0 = Severe Public Harm
 */
function calculateMaslahahScore(audit: any): number {
  let harmPotential = 0;
  let totalFindings = 0;

  // Analyze penetration test findings for harm potential
  audit.penTests.forEach((test: any) => {
    totalFindings++;
    
    // High technical risk = high harm potential
    if (test.technicalRisk >= 5) {
      harmPotential += 3; // Critical harm
    } else if (test.technicalRisk >= 4) {
      harmPotential += 2; // High harm
    } else if (test.technicalRisk >= 3) {
      harmPotential += 1; // Moderate harm
    }
    
    // Data-related vulnerabilities have higher welfare impact
    const vulnType = test.vulnerabilityType.toLowerCase();
    if (
      vulnType.includes('data') ||
      vulnType.includes('information') ||
      vulnType.includes('disclosure') ||
      vulnType.includes('leak') ||
      vulnType.includes('exposure')
    ) {
      harmPotential += 1;
    }
  });

  // Phishing harms users directly
  const phishingCount = audit.phishingScans.filter((s: any) => s.isPhishing).length;
  if (phishingCount > 0) {
    totalFindings += phishingCount;
    harmPotential += phishingCount * 2; // Each phishing = potential harm to users
  }

  // Intrusions indicate active harm
  audit.idsLogs.forEach((log: any) => {
    if (log.failedAttempts > 5) {
      totalFindings++;
      harmPotential += log.failedAttempts > 10 ? 3 : 2;
    }
  });

  // Calculate score (inverse of harm)
  if (totalFindings === 0) return 5.0; // No findings = excellent welfare
  
  const harmRatio = harmPotential / Math.max(totalFindings, 1);
  const score = Math.max(0, 5 - (harmRatio * 1.5));
  
  return Math.round(score * 100) / 100; // Round to 2 decimals
}

/**
 * Determine Overall Compliance Level
 */
function determineComplianceLevel(amanahScore: number, maslahahScore: number): string {
  const averageScore = (amanahScore + maslahahScore) / 2;
  
  if (averageScore >= 4.5) {
    return 'Excellent - Fully Compliant with Islamic Ethics';
  } else if (averageScore >= 3.5) {
    return 'Good - Mostly Compliant with Minor Improvements Needed';
  } else if (averageScore >= 2.5) {
    return 'Fair - Partial Compliance with Significant Improvements Required';
  } else if (averageScore >= 1.5) {
    return 'Poor - Limited Compliance with Major Ethical Concerns';
  } else {
    return 'Critical - Severe Ethical Violations Requiring Immediate Action';
  }
}

/**
 * Generate human-readable interpretation
 */
function generateInterpretation(
  amanahScore: number, 
  maslahahScore: number, 
  complianceLevel: string
): any {
  return {
    amanah: {
      score: amanahScore,
      rating: getRating(amanahScore),
      interpretation: getAmanahInterpretation(amanahScore),
      quranicReference: '"Verily, Allah commands you to render trusts to whom they are due." - Surah An-Nisa: 58'
    },
    maslahah: {
      score: maslahahScore,
      rating: getRating(maslahahScore),
      interpretation: getMaslahahInterpretation(maslahahScore),
      quranicReference: '"And do not cause harm to yourselves or others." - Islamic Legal Maxim (La Darar wa La Dirar)'
    },
    overall: {
      complianceLevel,
      averageScore: ((amanahScore + maslahahScore) / 2).toFixed(2),
      recommendation: getRecommendation(amanahScore, maslahahScore)
    }
  };
}

function getRating(score: number): string {
  if (score >= 4.5) return 'Excellent';
  if (score >= 3.5) return 'Good';
  if (score >= 2.5) return 'Fair';
  if (score >= 1.5) return 'Poor';
  return 'Critical';
}

function getAmanahInterpretation(score: number): string {
  if (score >= 4.5) {
    return 'Your system demonstrates exceptional protection of user trust. Authentication and data security measures are robust and align well with Islamic principles of trustworthiness.';
  } else if (score >= 3.5) {
    return 'Your system maintains good trust protection with minor areas for improvement. Consider strengthening authentication and encryption measures.';
  } else if (score >= 2.5) {
    return 'Trust protection requires attention. Several vulnerabilities could compromise user trust. Prioritize fixing authentication and session management issues.';
  } else if (score >= 1.5) {
    return 'Significant trust violations detected. Immediate action required to restore user confidence and protect sensitive data.';
  } else {
    return 'Critical trust violations present severe risks. System fails to uphold Amanah principles. Urgent remediation required.';
  }
}

function getMaslahahInterpretation(score: number): string {
  if (score >= 4.5) {
    return 'Your system excellently prioritizes public welfare and user safety. Security measures effectively prevent potential harm.';
  } else if (score >= 3.5) {
    return 'System adequately protects public welfare with room for enhancement. Focus on reducing high-risk vulnerabilities.';
  } else if (score >= 2.5) {
    return 'Public welfare protection needs improvement. Several vulnerabilities pose potential harm to users. Address high-risk issues promptly.';
  } else if (score >= 1.5) {
    return 'Significant risks to public welfare detected. Multiple vulnerabilities could harm users. Immediate action required.';
  } else {
    return 'Critical failures in protecting public welfare. System poses severe risks to users and violates Maslahah principles. Emergency remediation required.';
  }
}

function getRecommendation(amanahScore: number, maslahahScore: number): string {
  const avgScore = (amanahScore + maslahahScore) / 2;
  
  if (avgScore >= 4.5) {
    return 'Maintain current security posture and continue regular audits to ensure ongoing compliance with Islamic ethical principles.';
  } else if (avgScore >= 3.5) {
    return 'Address identified vulnerabilities within the next sprint. Focus on strengthening authentication and reducing harm potential.';
  } else if (avgScore >= 2.5) {
    return 'Initiate immediate remediation plan for high-priority vulnerabilities. Conduct follow-up audit within 30 days to verify improvements.';
  } else {
    return 'URGENT: Implement emergency security measures immediately. Consider temporarily limiting system access until critical vulnerabilities are resolved. Engage security experts for comprehensive remediation.';
  }
}

/**
 * GET /api/ethics/:auditId
 * 
 * Retrieve existing Islamic ethics evaluation
 */
ethicsRouter.get('/:auditId', async (req: Request, res: Response) => {
  try {
    const { auditId } = req.params;

    const evaluation = await prisma.islamicEthicsEvaluation.findUnique({
      where: { auditId }
    });

    if (!evaluation) {
      return res.status(404).json({ error: 'Ethics evaluation not found' });
    }

    return res.status(200).json({
      success: true,
      evaluation: {
        ...evaluation,
        interpretation: generateInterpretation(
          evaluation.amanahScore || 0,
          evaluation.maslahahScore || 0,
          evaluation.complianceLevel || ''
        )
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching ethics evaluation:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch ethics evaluation',
      message: error.message 
    });
  }
});
