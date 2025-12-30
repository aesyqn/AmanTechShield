import { Vulnerability } from './vulnerabilityDetector';

export type RecoveryPhase = 'immediate' | 'short_term' | 'long_term';

export interface RecoveryPlanItem {
  id: string;
  phase: RecoveryPhase;
  title: string;
  description: string;
  relatedVulnerabilityIds: string[];
  stakeholders: string[];
  priority: 1 | 2 | 3;
}

interface RiskScoreSummary {
  overall: number;
  technical: number;
  ethical: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export function generateRecoveryPlan(
  vulnerabilities: Vulnerability[],
  riskScore: RiskScoreSummary | null
): RecoveryPlanItem[] {
  if (!vulnerabilities.length || !riskScore) {
    return [];
  }

  const plan: RecoveryPlanItem[] = [];

  const criticalCount = riskScore.critical || 0;
  const highCount = riskScore.high || 0;
  const mediumCount = riskScore.medium || 0;
  const lowCount = riskScore.low || 0;

  const criticalIds = vulnerabilities
    .filter(v => v.severity === 'critical')
    .map(v => v.id);
  const highIds = vulnerabilities
    .filter(v => v.severity === 'high')
    .map(v => v.id);
  const mediumLowIds = vulnerabilities
    .filter(v => v.severity === 'medium' || v.severity === 'low')
    .map(v => v.id);

  if (criticalCount > 0) {
    plan.push({
      id: `RP-IMM-${Date.now()}-1`,
      phase: 'immediate',
      title: 'Resolve all critical vulnerabilities within 24 hours',
      description:
        'Prioritise remediation of all CRITICAL findings to prevent immediate exploitation and protect sensitive customer data.',
      relatedVulnerabilityIds: criticalIds,
      stakeholders: ['IT Security Team', 'System Owners'],
      priority: 1,
    });
  }

  if (highCount > 0) {
    plan.push({
      id: `RP-ST-${Date.now()}-1`,
      phase: 'short_term',
      title: 'Patch all high severity vulnerabilities within 7 days',
      description:
        'Apply patches and configuration changes for all HIGH severity findings, including authentication, session management, and access control issues.',
      relatedVulnerabilityIds: highIds,
      stakeholders: ['IT Security Team'],
      priority: criticalCount > 0 ? 2 : 1,
    });
  }

  if (mediumCount + lowCount > 0) {
    plan.push({
      id: `RP-LT-${Date.now()}-1`,
      phase: 'long_term',
      title: 'Plan remediation of medium and low risks within 1–3 months',
      description:
        'Schedule remediation and hardening activities for MEDIUM and LOW severity issues, focusing on defence-in-depth and monitoring.',
      relatedVulnerabilityIds: mediumLowIds,
      stakeholders: ['IT Security Team', 'Infrastructure'],
      priority: 3,
    });
  }

  const hasPhishing = vulnerabilities.some(v =>
    v.type.toLowerCase().includes('phishing')
  );

  if (hasPhishing) {
    plan.push({
      id: `RP-ST-${Date.now()}-2`,
      phase: 'short_term',
      title: 'Conduct phishing awareness training for staff',
      description:
        'Deliver targeted awareness training to staff on recognising phishing emails, suspicious links, and social engineering tactics.',
      relatedVulnerabilityIds: vulnerabilities
        .filter(v => v.type.toLowerCase().includes('phishing'))
        .map(v => v.id),
      stakeholders: ['IT Security Team', 'HR / Training'],
      priority: 2,
    });
  }

  const hasIdsAnomalies = vulnerabilities.some(v =>
    v.id.startsWith('IDS-') || v.type.toLowerCase().includes('access')
  );

  if (hasIdsAnomalies) {
    plan.push({
      id: `RP-IMM-${Date.now()}-2`,
      phase: 'immediate',
      title: 'Strengthen monitoring and incident response for unusual access',
      description:
        'Review IDS alerts, tune detection rules, and ensure incident response runbooks are in place for unusual access patterns and failed logins.',
      relatedVulnerabilityIds: vulnerabilities
        .filter(
          v =>
            v.id.startsWith('IDS-') ||
            v.type.toLowerCase().includes('access') ||
            v.description.toLowerCase().includes('login')
        )
        .map(v => v.id),
      stakeholders: ['IT Security Team', 'Operations'],
      priority: criticalCount > 0 ? 2 : 1,
    });
  }

  if (!plan.length) {
    plan.push({
      id: `RP-LT-${Date.now()}-fallback`,
      phase: 'long_term',
      title: 'Maintain security monitoring and schedule regular audits',
      description:
        'No significant vulnerabilities were detected. Continue monitoring and schedule periodic security assessments to maintain assurance.',
      relatedVulnerabilityIds: [],
      stakeholders: ['IT Security Team'],
      priority: 3,
    });
  }

  return plan;
}
