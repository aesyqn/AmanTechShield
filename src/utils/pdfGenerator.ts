import { Vulnerability } from './vulnerabilityDetector';
export interface AuditorDetails {
  name: string;
  position: string;
  date: string;
}

export interface RecoveryPlanData {
  actionSteps?: string;
  disclosurePolicy?: string;
}
export function generatePDFReport(vulnerabilities: Vulnerability[], auditor: AuditorDetails, riskScore: any, recoveryPlanData?: RecoveryPlanData): string {
  // Generate formatted text report
  const report = `
═══════════════════════════════════════════════════════════════
    CYBERSECURITY ETHICAL DISCLOSURE REPORT
═══════════════════════════════════════════════════════════════

AUDITOR DETAILS
───────────────────────────────────────────────────────────────
Name:           ${auditor.name}
Position:       ${auditor.position}
Date:           ${auditor.date}

EXECUTIVE SUMMARY
───────────────────────────────────────────────────────────────
Overall Risk Score:     ${riskScore.overall.toFixed(1)}%
Technical Risk:         ${riskScore.technical.toFixed(1)}/5
Ethical Risk:           ${riskScore.ethical.toFixed(1)}/5

Vulnerabilities Found:  ${vulnerabilities.length}
  • Critical:           ${riskScore.critical}
  • High:               ${riskScore.high}
  • Medium:             ${riskScore.medium}
  • Low:                ${riskScore.low}

${vulnerabilities.map((vuln, index) => `
VULNERABILITY #${index + 1}
───────────────────────────────────────────────────────────────
Finding ID:         ${vuln.id}
Type:               ${vuln.type}
Severity:           ${vuln.severity.toUpperCase()}
Technical Risk:     ${vuln.technicalRisk}/5
Ethical Risk:       ${vuln.ethicalRisk}/5

Description:
${vuln.description}

Impact Summary:
${vuln.ethicalImplication}

Recommendation:
${vuln.recommendation}
`).join('\n')}

DISCLOSURE POLICY
───────────────────────────────────────────────────────────────
Type:                   Private Disclosure
Recipients:             Bank IT Security Team
Disclosure Date:        ${new Date(new Date(auditor.date).getTime() + 86400000).toLocaleDateString()}
Communication Channel:  Secure Email (PGP-encrypted)

RECOVERY PLAN
───────────────────────────────────────────────────────────────
${generateRecoveryPlanText(recoveryPlanData)}

ISLAMIC ETHICAL ALIGNMENT
───────────────────────────────────────────────────────────────
"Do not betray the trust (amanah) placed in you."
— Surah Al-Anfal: 27

This disclosure respects Maslahah (public benefit) and Amanah 
(trust) by preventing harm to users before public exposure.

Key Ethical Principles Applied:
• Amanah (Trust): Protecting customer data as a sacred trust
• Maslahah (Public Benefit): Prioritizing user safety over convenience
• Ihsan (Excellence): Pursuing the highest security standards
• Adl (Justice): Fair and transparent disclosure practices

───────────────────────────────────────────────────────────────
Report Generated: ${new Date().toLocaleString()}
Confidential - For Internal Use Only
═══════════════════════════════════════════════════════════════
  `;
  return report;
}

// Helper function to format recovery plan for text report
function generateRecoveryPlanText(recoveryPlanData?: RecoveryPlanData): string {
  console.log('🔍 generateRecoveryPlanText called with:', {
    hasData: !!recoveryPlanData,
    hasActionSteps: !!recoveryPlanData?.actionSteps,
    actionStepsType: typeof recoveryPlanData?.actionSteps,
    actionStepsLength: recoveryPlanData?.actionSteps?.length
  });

  if (!recoveryPlanData || !recoveryPlanData.actionSteps) {
    console.log('⚠️ No recovery plan data, using fallback');
    // Fallback to generic recovery plan
    return `Immediate Actions (0-24 hours):
1. Address all CRITICAL vulnerabilities immediately
2. Implement temporary security measures
3. Notify affected stakeholders

Short-term Actions (1-7 days):
1. Patch all HIGH severity vulnerabilities
2. Conduct security awareness training
3. Update security policies and procedures

Long-term Actions (1-3 months):
1. Resolve MEDIUM and LOW severity issues
2. Implement continuous monitoring
3. Schedule follow-up security audit`;
  }

  try {
    const actionSteps = JSON.parse(recoveryPlanData.actionSteps);
    console.log('✅ Parsed action steps:', { count: actionSteps.length });
    
    const phases = [
      { key: 'immediate', label: 'Immediate Actions (0-24 hours):' },
      { key: 'short_term', label: 'Short-term Actions (1-7 days):' },
      { key: 'long_term', label: 'Long-term Actions (1-3 months):' }
    ];

    let text = '';
    phases.forEach((phase, phaseIndex) => {
      const items = actionSteps.filter((item: any) => item.phase === phase.key);
      if (items.length > 0) {
        if (phaseIndex > 0) text += '\n\n';
        text += phase.label + '\n';
        items.forEach((item: any, index: number) => {
          text += `${index + 1}. ${item.title}\n`;
          text += `   ${item.description}\n`;
          if (item.timeline) {
            text += `   Timeline: ${item.timeline}\n`;
          }
        });
      }
    });

    return text || 'No recovery plan generated.';
  } catch (error) {
    console.error('Failed to parse recovery plan:', error);
    return 'Error loading recovery plan. Please contact support.';
  }
}

// Generate HTML content for PDF conversion
export function generatePDFHTML(vulnerabilities: Vulnerability[], auditor: AuditorDetails, riskScore: any): string {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#FF0055';
      case 'high':
        return '#FF6B35';
      case 'medium':
        return '#F7B801';
      default:
        return '#0066FF';
    }
  };
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #1a1a1a;
      line-height: 1.4;
      padding: 20px 30px;
      background: white;
      font-size: 11px;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #00D9FF;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .header h1 {
      font-size: 22px;
      color: #0A0E27;
      margin-bottom: 4px;
      font-weight: 800;
    }
    .header .subtitle {
      font-size: 10px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    .section {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 14px;
      color: #00D9FF;
      border-left: 3px solid #00D9FF;
      padding-left: 10px;
      margin-bottom: 10px;
      font-weight: 700;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 6px 12px;
      margin-bottom: 12px;
      font-size: 10px;
    }
    .info-label {
      font-weight: 600;
      color: #666;
    }
    .info-value {
      color: #1a1a1a;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin: 12px 0;
    }
    .stat-card {
      background: #f8f9fa;
      padding: 10px;
      border-radius: 6px;
      text-align: center;
      border-left: 3px solid #00D9FF;
    }
    .stat-value {
      font-size: 24px;
      font-weight: 800;
      color: #00D9FF;
      margin-bottom: 2px;
    }
    .stat-label {
      font-size: 9px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .vulnerability {
      background: #f8f9fa;
      border-left: 3px solid;
      padding: 12px 15px;
      margin-bottom: 12px;
      border-radius: 0 6px 6px 0;
      page-break-inside: avoid;
    }
    .vuln-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 8px;
    }
    .vuln-title {
      font-size: 12px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 2px;
    }
    .vuln-id {
      font-size: 9px;
      color: #666;
      font-family: 'Courier New', monospace;
    }
    .severity-badge {
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: white;
    }
    .risk-scores {
      display: flex;
      gap: 15px;
      margin: 6px 0;
      font-size: 10px;
    }
    .risk-score {
      font-weight: 600;
    }
    .vuln-section {
      margin: 8px 0;
    }
    .vuln-section-title {
      font-size: 10px;
      font-weight: 700;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .vuln-section-content {
      color: #333;
      line-height: 1.5;
      font-size: 10px;
    }
    .ethical-box {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px;
      border-radius: 6px;
      margin: 15px 0;
    }
    .ethical-box h3 {
      font-size: 13px;
      margin-bottom: 8px;
    }
    .ethical-quote {
      font-style: italic;
      font-size: 10px;
      margin: 8px 0;
      padding-left: 12px;
      border-left: 2px solid rgba(255,255,255,0.5);
    }
    .ethical-box p {
      font-size: 10px;
      line-height: 1.5;
    }
    .recovery-list {
      list-style: none;
      padding: 0;
    }
    .recovery-list li {
      padding: 6px 0 6px 20px;
      position: relative;
      border-bottom: 1px solid #e0e0e0;
      font-size: 10px;
    }
    .recovery-list li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #00D9FF;
      font-weight: bold;
      font-size: 12px;
    }
    .recovery-section h3 {
      margin: 12px 0 6px 0;
      font-size: 11px;
      font-weight: 700;
    }
    .footer {
      margin-top: 20px;
      padding-top: 15px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 9px;
    }
    .two-column {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>CYBERSECURITY ETHICAL DISCLOSURE REPORT</h1>
    <div class="subtitle">AmanTech Shield Security Assessment</div>
  </div>

  <div class="section">
    <h2 class="section-title">Auditor Details</h2>
    <div class="info-grid">
      <div class="info-label">Name:</div>
      <div class="info-value">${auditor.name}</div>
      <div class="info-label">Position:</div>
      <div class="info-value">${auditor.position}</div>
      <div class="info-label">Date:</div>
      <div class="info-value">${auditor.date}</div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Executive Summary</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${riskScore.overall.toFixed(1)}%</div>
        <div class="stat-label">Overall Risk</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${riskScore.technical.toFixed(1)}/5</div>
        <div class="stat-label">Technical Risk</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${riskScore.ethical.toFixed(1)}/5</div>
        <div class="stat-label">Ethical Risk</div>
      </div>
    </div>
    <div class="two-column">
      <div class="info-grid">
        <div class="info-label">Total Vulnerabilities:</div>
        <div class="info-value">${vulnerabilities.length}</div>
        <div class="info-label">Critical:</div>
        <div class="info-value" style="color: #FF0055; font-weight: 700;">${riskScore.critical}</div>
        <div class="info-label">High:</div>
        <div class="info-value" style="color: #FF6B35; font-weight: 700;">${riskScore.high}</div>
      </div>
      <div class="info-grid">
        <div class="info-label">Medium:</div>
        <div class="info-value" style="color: #F7B801; font-weight: 700;">${riskScore.medium}</div>
        <div class="info-label">Low:</div>
        <div class="info-value" style="color: #0066FF; font-weight: 700;">${riskScore.low}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Vulnerability Details</h2>
    ${vulnerabilities.map((vuln, index) => `
      <div class="vulnerability" style="border-left-color: ${getSeverityColor(vuln.severity)}">
        <div class="vuln-header">
          <div>
            <div class="vuln-title">${index + 1}. ${vuln.type}</div>
            <div class="vuln-id">${vuln.id}</div>
          </div>
          <div class="severity-badge" style="background-color: ${getSeverityColor(vuln.severity)}">
            ${vuln.severity}
          </div>
        </div>
        <div class="risk-scores">
          <div class="risk-score">Technical Risk: <span style="color: #00D9FF">${vuln.technicalRisk}/5</span></div>
          <div class="risk-score">Ethical Risk: <span style="color: #764ba2">${vuln.ethicalRisk}/5</span></div>
        </div>
        <div class="vuln-section">
          <div class="vuln-section-title">Description</div>
          <div class="vuln-section-content">${vuln.description}</div>
        </div>
        <div class="vuln-section">
          <div class="vuln-section-title">Ethical Implication</div>
          <div class="vuln-section-content">${vuln.ethicalImplication}</div>
        </div>
        <div class="vuln-section">
          <div class="vuln-section-title">Recommendation</div>
          <div class="vuln-section-content">${vuln.recommendation}</div>
        </div>
      </div>
    `).join('')}
  </div>

  <div class="section">
    <h2 class="section-title">Disclosure Policy</h2>
    <div class="info-grid">
      <div class="info-label">Type:</div>
      <div class="info-value">Private Disclosure</div>
      <div class="info-label">Recipients:</div>
      <div class="info-value">Bank IT Security Team</div>
      <div class="info-label">Disclosure Date:</div>
      <div class="info-value">${new Date(new Date(auditor.date).getTime() + 86400000).toLocaleDateString()}</div>
      <div class="info-label">Communication:</div>
      <div class="info-value">Secure Email (PGP-encrypted)</div>
    </div>
  </div>

  <div class="section recovery-section">
    <h2 class="section-title">Recovery Plan</h2>
    <div class="two-column">
      <div>
        <h3>Immediate (0-24h)</h3>
        <ul class="recovery-list">
          <li>Address CRITICAL vulnerabilities</li>
          <li>Implement temporary measures</li>
          <li>Notify stakeholders</li>
        </ul>
        <h3>Long-term (1-3 months)</h3>
        <ul class="recovery-list">
          <li>Resolve MEDIUM/LOW issues</li>
          <li>Continuous monitoring</li>
          <li>Follow-up audit</li>
        </ul>
      </div>
      <div>
        <h3>Short-term (1-7 days)</h3>
        <ul class="recovery-list">
          <li>Patch HIGH vulnerabilities</li>
          <li>Security awareness training</li>
          <li>Update security policies</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="ethical-box">
    <h3>Islamic Ethical Alignment</h3>
    <div class="ethical-quote">
      "Do not betray the trust (amanah) placed in you." — Surah Al-Anfal: 27
    </div>
    <p>
      This disclosure respects <strong>Maslahah</strong> (public benefit) and <strong>Amanah</strong> (trust) 
      by preventing harm to users before public exposure.
    </p>
    <p style="margin-top: 8px;">
      <strong>Key Principles:</strong>
      • Amanah (Trust) • Maslahah (Public Benefit) • Ihsan (Excellence) • Adl (Justice)
    </p>
  </div>

  <div class="footer">
    <p>Report Generated: ${new Date().toLocaleString()} | Confidential - Internal Use Only | © ${new Date().getFullYear()} AmanTech Shield</p>
  </div>
</body>
</html>
  `;
}
export function downloadTextReport(content: string, filename: string) {
  const blob = new Blob([content], {
    type: 'text/plain'
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
export function downloadPDFReport(htmlContent: string, filename: string) {
  // Create a new window for PDF generation
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow pop-ups to download the PDF report');
    return;
  }
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      // Note: User will need to "Save as PDF" in the print dialog
    }, 250);
  };
}