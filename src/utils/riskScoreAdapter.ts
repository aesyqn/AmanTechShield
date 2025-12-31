// Adapter to transform backend risk score response to frontend format

export interface BackendRiskScore {
  technical_score: number;
  ethical_score: number;
  overall_score: number;
  summary: string;
  severity_counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface FrontendRiskScore {
  overall: number;      // 0-100 percentage
  technical: number;    // 0-5 scale
  ethical: number;      // 0-5 scale
  critical: number;
  high: number;
  medium: number;
  low: number;
}

/**
 * Converts backend risk score (0-5 scale) to frontend format (overall as 0-100%)
 */
export function adaptRiskScore(backendScore: BackendRiskScore): FrontendRiskScore {
  return {
    overall: (backendScore.overall_score / 5) * 100, // Convert 0-5 to 0-100%
    technical: backendScore.technical_score,         // Keep 0-5 scale
    ethical: backendScore.ethical_score,             // Keep 0-5 scale
    critical: backendScore.severity_counts.critical,
    high: backendScore.severity_counts.high,
    medium: backendScore.severity_counts.medium,
    low: backendScore.severity_counts.low,
  };
}
