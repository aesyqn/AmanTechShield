import { Vulnerability } from './vulnerabilityDetector';
export interface AuditorDetails {
  name: string;
  position: string;
  date: string;
}
export function generatePDFReport(vulnerabilities: Vulnerability[], auditor: AuditorDetails, riskScore: any): string {
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
Immediate Actions (0-24 hours):
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
3. Schedule follow-up security audit

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
      line-height: 1.6;
      padding: 40px;
      background: white;
    }
    .header {
      text-align: center;
      border-bottom: 4px solid #00D9FF;
      padding-bottom: 30px;
      margin-bottom: 40px;
    }
    .header h1 {
      font-size: 32px;
      color: #0A0E27;
      margin-bottom: 10px;
      font-weight: 800;
    }
    .header .subtitle {
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 20px;
      color: #00D9FF;
      border-left: 4px solid #00D9FF;
      padding-left: 15px;
      margin-bottom: 20px;
      font-weight: 700;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 10px;
      margin-bottom: 20px;
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
      gap: 20px;
      margin: 30px 0;
    }
    .stat-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      border-left: 4px solid #00D9FF;
    }
    .stat-value {
      font-size: 36px;
      font-weight: 800;
      color: #00D9FF;
      margin-bottom: 5px;
    }
    .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .vulnerability {
      background: #f8f9fa;
      border-left: 4px solid;
      padding: 25px;
      margin-bottom: 25px;
      border-radius: 0 8px 8px 0;
      page-break-inside: avoid;
    }
    .vuln-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 15px;
    }
    .vuln-title {
      font-size: 18px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 5px;
    }
    .vuln-id {
      font-size: 12px;
      color: #666;
      font-family: 'Courier New', monospace;
    }
    .severity-badge {
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: white;
    }
    .risk-scores {
      display: flex;
      gap: 20px;
      margin: 15px 0;
      font-size: 14px;
    }
    .risk-score {
      font-weight: 600;
    }
    .vuln-section {
      margin: 15px 0;
    }
    .vuln-section-title {
      font-size: 13px;
      font-weight: 700;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .vuln-section-content {
      color: #333;
      line-height: 1.8;
    }
    .ethical-box {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin: 30px 0;
    }
    .ethical-box h3 {
      font-size: 20px;
      margin-bottom: 15px;
    }
    .ethical-quote {
      font-style: italic;
      font-size: 16px;
      margin: 15px 0;
      padding-left: 20px;
      border-left: 3px solid rgba(255,255,255,0.5);
    }
    .recovery-list {
      list-style: none;
      padding: 0;
    }
    .recovery-list li {
      padding: 12px 0;
      padding-left: 30px;
      position: relative;
      border-bottom: 1px solid #e0e0e0;
    }
    .recovery-list li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #00D9FF;
      font-weight: bold;
      font-size: 18px;
    }
    .footer {
      margin-top: 60px;
      padding-top: 30px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 12px;
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
    <div class="info-grid">
      <div class="info-label">Total Vulnerabilities:</div>
      <div class="info-value">${vulnerabilities.length}</div>
      <div class="info-label">Critical:</div>
      <div class="info-value" style="color: #FF0055; font-weight: 700;">${riskScore.critical}</div>
      <div class="info-label">High:</div>
      <div class="info-value" style="color: #FF6B35; font-weight: 700;">${riskScore.high}</div>
      <div class="info-label">Medium:</div>
      <div class="info-value" style="color: #F7B801; font-weight: 700;">${riskScore.medium}</div>
      <div class="info-label">Low:</div>
      <div class="info-value" style="color: #0066FF; font-weight: 700;">${riskScore.low}</div>
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

  <div class="section">
    <h2 class="section-title">Recovery Plan</h2>
    <h3 style="margin: 20px 0 10px 0; font-size: 16px;">Immediate Actions (0-24 hours)</h3>
    <ul class="recovery-list">
      <li>Address all CRITICAL vulnerabilities immediately</li>
      <li>Implement temporary security measures</li>
      <li>Notify affected stakeholders</li>
    </ul>
    <h3 style="margin: 20px 0 10px 0; font-size: 16px;">Short-term Actions (1-7 days)</h3>
    <ul class="recovery-list">
      <li>Patch all HIGH severity vulnerabilities</li>
      <li>Conduct security awareness training</li>
      <li>Update security policies and procedures</li>
    </ul>
    <h3 style="margin: 20px 0 10px 0; font-size: 16px;">Long-term Actions (1-3 months)</h3>
    <ul class="recovery-list">
      <li>Resolve MEDIUM and LOW severity issues</li>
      <li>Implement continuous monitoring</li>
      <li>Schedule follow-up security audit</li>
    </ul>
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
    <p style="margin-top: 15px;">
      <strong>Key Ethical Principles Applied:</strong><br>
      • Amanah (Trust): Protecting customer data as a sacred trust<br>
      • Maslahah (Public Benefit): Prioritizing user safety over convenience<br>
      • Ihsan (Excellence): Pursuing the highest security standards<br>
      • Adl (Justice): Fair and transparent disclosure practices
    </p>
  </div>

  <div class="footer">
    <p>Report Generated: ${new Date().toLocaleString()}</p>
    <p style="margin-top: 10px;">Confidential - For Internal Use Only</p>
    <p style="margin-top: 5px;">© ${new Date().getFullYear()} AmanTech Shield. All rights reserved.</p>
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