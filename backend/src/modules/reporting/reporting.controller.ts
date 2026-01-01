/**
 * Reporting & Recovery Plan Controller
 * 
 * Handles:
 * - Recovery plan generation and storage
 * - PDF report generation from database
 * - Historical report retrieval
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../../prisma';
import PDFDocument from 'pdfkit';
import { generateAIRecoveryPlan } from './ai-recovery.service';

export const reportingRouter = Router();

// ============================================
// RECOVERY PLAN GENERATION
// ============================================

interface RecoveryPlanItem {
  phase: 'immediate' | 'short_term' | 'long_term';
  title: string;
  description: string;
  relatedVulnerabilityIds: string[];
  stakeholders: string[];
  priority: 1 | 2 | 3;
}

/**
 * POST /api/reporting/generate-recovery-plan
 * 
 * Generates and saves recovery plan based on audit findings
 */
reportingRouter.post('/generate-recovery-plan', async (req: Request, res: Response) => {
  try {
    const { auditId, useAI } = req.body as { auditId?: string; useAI?: boolean };

    if (!auditId) {
      return res.status(400).json({ error: 'auditId is required' });
    }

    console.log(`📋 Generating recovery plan for audit: ${auditId} ${useAI ? '(AI-powered)' : '(rule-based)'}`);

    // Fetch audit with all findings
    const audit = await prisma.auditSession.findUnique({
      where: { id: auditId },
      include: {
        penTests: true,
        phishingScans: true,
        idsLogs: true,
        riskScore: true,
        ethics: true
      }
    });

    if (!audit) {
      return res.status(404).json({ error: 'Audit session not found' });
    }

    let plan: any;
    let disclosurePolicy: string;
    let actionSteps: string;

    // Use AI or rule-based generation
    if (useAI && process.env.GEMINI_API_KEY) {
      try {
        console.log('🤖 Generating AI-powered recovery plan with Gemini...');
        const aiResult = await generateAIRecoveryPlan(audit);
        
        plan = aiResult.actionSteps;
        disclosurePolicy = aiResult.disclosurePolicy;
        actionSteps = JSON.stringify(aiResult.actionSteps, null, 2);
        
        console.log('✅ AI recovery plan generated successfully');
      } catch (aiError) {
        console.warn('⚠️ AI generation failed, falling back to rule-based:', aiError);
        plan = generateRecoveryPlanItems(audit);
        disclosurePolicy = generateDisclosurePolicy(audit);
        actionSteps = JSON.stringify(plan, null, 2);
      }
    } else {
      // Rule-based generation
      plan = generateRecoveryPlanItems(audit);
      disclosurePolicy = generateDisclosurePolicy(audit);
      actionSteps = JSON.stringify(plan, null, 2);
    }

    // Convert disclosurePolicy to JSON string for database storage
    const disclosurePolicyString = typeof disclosurePolicy === 'object' && disclosurePolicy !== null
      ? JSON.stringify(disclosurePolicy, null, 2)
      : disclosurePolicy;

    // Save to database
    const recoveryPlan = await prisma.recoveryPlan.upsert({
      where: { auditId },
      update: {
        actionSteps,
        disclosurePolicy: disclosurePolicyString
      },
      create: {
        auditId,
        actionSteps,
        disclosurePolicy: disclosurePolicyString
      }
    });

    console.log(`✅ Recovery plan generated and saved`);

    return res.status(200).json({
      success: true,
      recoveryPlan: {
        id: recoveryPlan.id,
        items: plan,
        disclosurePolicy
      }
    });

  } catch (error: any) {
    console.error('❌ Error generating recovery plan:', error);
    return res.status(500).json({ 
      error: 'Failed to generate recovery plan',
      message: error.message 
    });
  }
});

/**
 * Generate recovery plan items based on findings
 */
function generateRecoveryPlanItems(audit: any): RecoveryPlanItem[] {
  const plan: RecoveryPlanItem[] = [];
  
  const riskScore = audit.riskScore;
  const criticalCount = riskScore?.criticalCount || 0;
  const highCount = riskScore?.highCount || 0;
  const mediumCount = riskScore?.mediumCount || 0;
  const lowCount = riskScore?.lowCount || 0;

  // Immediate actions for critical vulnerabilities
  if (criticalCount > 0) {
    plan.push({
      phase: 'immediate',
      title: 'Resolve all critical vulnerabilities within 24 hours',
      description: 'Prioritize remediation of all CRITICAL findings to prevent immediate exploitation and protect sensitive customer data. Implement emergency patches and temporary security controls.',
      relatedVulnerabilityIds: audit.penTests.filter((t: any) => t.technicalRisk >= 5).map((t: any) => t.id),
      stakeholders: ['IT Security Team', 'System Owners', 'CISO'],
      priority: 1
    });
  }

  // Short-term actions for high severity
  if (highCount > 0) {
    plan.push({
      phase: 'short_term',
      title: 'Patch all high severity vulnerabilities within 7 days',
      description: 'Apply patches and configuration changes for all HIGH severity findings, including authentication, session management, and access control issues.',
      relatedVulnerabilityIds: audit.penTests.filter((t: any) => t.technicalRisk >= 4 && t.technicalRisk < 5).map((t: any) => t.id),
      stakeholders: ['IT Security Team', 'Development Team'],
      priority: criticalCount > 0 ? 2 : 1
    });
  }

  // Phishing awareness if phishing detected
  const hasPhishing = audit.phishingScans.some((s: any) => s.isPhishing);
  if (hasPhishing) {
    plan.push({
      phase: 'short_term',
      title: 'Conduct phishing awareness training for staff',
      description: 'Deliver targeted awareness training to staff on recognizing phishing emails, suspicious links, and social engineering tactics. Implement email filtering improvements.',
      relatedVulnerabilityIds: audit.phishingScans.filter((s: any) => s.isPhishing).map((s: any) => s.id),
      stakeholders: ['HR Department', 'IT Security Team', 'All Staff'],
      priority: 2
    });
  }

  // IDS improvements if intrusions detected
  const hasIntrusions = audit.idsLogs.some((log: any) => log.failedAttempts > 5);
  if (hasIntrusions) {
    plan.push({
      phase: 'short_term',
      title: 'Enhance intrusion detection and response capabilities',
      description: 'Review and strengthen IDS rules, implement automated blocking for suspicious IPs, and establish 24/7 security monitoring.',
      relatedVulnerabilityIds: audit.idsLogs.filter((log: any) => log.failedAttempts > 5).map((log: any) => log.id),
      stakeholders: ['Security Operations Center', 'Network Team'],
      priority: 2
    });
  }

  // Long-term improvements
  if (mediumCount + lowCount > 0) {
    plan.push({
      phase: 'long_term',
      title: 'Plan remediation of medium and low risks within 1-3 months',
      description: 'Schedule remediation and hardening activities for MEDIUM and LOW severity issues, focusing on defense-in-depth and continuous monitoring.',
      relatedVulnerabilityIds: [],
      stakeholders: ['IT Security Team', 'Infrastructure Team'],
      priority: 3
    });
  }

  // Continuous improvement
  plan.push({
    phase: 'long_term',
    title: 'Implement continuous security monitoring and testing',
    description: 'Establish regular security audits, penetration testing schedule, and automated vulnerability scanning. Develop incident response playbooks.',
    relatedVulnerabilityIds: [],
    stakeholders: ['IT Security Team', 'Management'],
    priority: 3
  });

  return plan;
}

/**
 * Generate disclosure policy
 */
function generateDisclosurePolicy(audit: any): string {
  const riskScore = audit.riskScore;
  const severity = riskScore?.overallScore >= 4 ? 'High' : riskScore?.overallScore >= 3 ? 'Medium' : 'Low';
  
  return `
ETHICAL DISCLOSURE POLICY

Type: Private Responsible Disclosure
Severity Level: ${severity}

Disclosure Timeline:
- Immediate notification to internal security team
- 24-hour disclosure to system owners for critical issues
- 7-day disclosure to affected stakeholders for high-severity issues
- Regular updates to management until remediation

Communication Channels:
- Secure email (PGP-encrypted) for sensitive findings
- Internal ticketing system for tracking
- Encrypted file sharing for detailed reports

Islamic Ethical Principles Applied:
1. Amanah (Trust) - Protecting user data as a sacred trust
2. Maslahah (Public Benefit) - Prioritizing user safety and welfare
3. Ihsan (Excellence) - Pursuing the highest security standards
4. Adl (Justice) - Fair and transparent disclosure practices

"Do not betray the trust (amanah) placed in you." - Surah Al-Anfal: 27

This disclosure respects Maslahah (public benefit) and Amanah (trust) by 
preventing harm to users through responsible remediation before any public exposure.
`;
}

// ============================================
// PDF REPORT GENERATION
// ============================================

/**
 * POST /api/reporting/generate-pdf
 * 
 * Generates PDF report from database audit session
 */
reportingRouter.post('/generate-pdf', async (req: Request, res: Response) => {
  try {
    const { auditId } = req.body as { auditId?: string };

    if (!auditId) {
      return res.status(400).json({ error: 'auditId is required' });
    }

    console.log(`📄 Generating PDF report for audit: ${auditId}`);

    // Fetch complete audit data
    const audit = await prisma.auditSession.findUnique({
      where: { id: auditId },
      include: {
        user: {
          select: { name: true, email: true, position: true }
        },
        penTests: true,
        phishingScans: true,
        idsLogs: true,
        riskScore: true,
        recoveryPlan: true,
        ethics: true
      }
    });

    if (!audit) {
      return res.status(404).json({ error: 'Audit session not found' });
    }

    // Generate PDF
    const doc = new PDFDocument({ 
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=AmanTech_Security_Report_${auditId.substring(0, 8)}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Generate PDF content
    generatePDFContent(doc, audit);

    // Finalize PDF
    doc.end();

    console.log(`✅ PDF report generated successfully`);

  } catch (error: any) {
    console.error('❌ Error generating PDF:', error);
    
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: 'Failed to generate PDF report',
        message: error.message 
      });
    }
  }
});

/**
 * Generate PDF content with modern, professional design
 */
function generatePDFContent(doc: PDFKit.PDFDocument, audit: any) {
  const riskScore = audit.riskScore;
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 50;
  const contentWidth = pageWidth - (margin * 2);

  // ============================================
  // COVER PAGE
  // ============================================
  doc.rect(0, 0, pageWidth, 250).fill('#0A0E27');

  doc.fontSize(40)
    .fillColor('#00D9FF')
    .font('Helvetica-Bold')
    .text('AMANTECH SHIELD', 50, 80, { align: 'center' });

  doc.fontSize(18)
    .fillColor('#FFFFFF')
    .font('Helvetica')
    .text('Security Assessment Report', 50, 140, { align: 'center' });

  doc.moveTo(150, 180)
    .lineTo(pageWidth - 150, 180)
    .lineWidth(2)
    .strokeColor('#00D9FF')
    .stroke();

  const boxY = 280;
  doc.roundedRect(100, boxY, pageWidth - 200, 200, 10)
    .fillAndStroke('#F8F9FA', '#E0E0E0');

  doc.fontSize(12)
    .fillColor('#333333')
    .font('Helvetica-Bold')
    .text('REPORT INFORMATION', 120, boxY + 20);

  doc.fontSize(10)
    .fillColor('#666666')
    .font('Helvetica');

  const infoY = boxY + 50;
  const labelX = 120;
  const valueX = 220;
  const lineHeight = 22;

  doc.text('Auditor:', labelX, infoY)
    .fillColor('#000000')
    .text(audit.user.name, valueX, infoY);

  doc.fillColor('#666666')
    .text('Position:', labelX, infoY + lineHeight)
    .fillColor('#000000')
    .text(audit.user.position, valueX, infoY + lineHeight);

  doc.fillColor('#666666')
    .text('Date:', labelX, infoY + lineHeight * 2)
    .fillColor('#000000')
    .text(new Date(audit.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }), valueX, infoY + lineHeight * 2);

  doc.fillColor('#666666')
    .text('Target:', labelX, infoY + lineHeight * 3)
    .fillColor('#000000')
    .text(audit.targetUrl, valueX, infoY + lineHeight * 3, { width: 250 });

  doc.fillColor('#666666')
    .text('Audit ID:', labelX, infoY + lineHeight * 4)
    .fillColor('#000000')
    .font('Courier')
    .fontSize(8)
    .text(audit.id, valueX, infoY + lineHeight * 4 + 2);

  // Footer section with confidential notice and generated timestamp
  const footerY = boxY + 230;
  
  doc.fontSize(9)
    .fillColor('#999999')
    .font('Helvetica')
    .text('Confidential - For Internal Use Only', 0, footerY, { align: 'center' });

  doc.fontSize(8)
    .fillColor('#CCCCCC')
    .text(`Generated: ${new Date().toLocaleString()}`, 0, footerY + 20, { align: 'center' });

  // ============================================
  // EXECUTIVE SUMMARY PAGE
  // ============================================
  doc.addPage();
  drawPageHeader(doc, 'Executive Summary');

  let currentY = 120;

  if (riskScore) {
    const cardWidth = 140;
    const cardHeight = 85;
    const cardSpacing = 20;
    const startX = (pageWidth - (cardWidth * 3 + cardSpacing * 2)) / 2;

    drawRiskCard(doc, startX, currentY, cardWidth, cardHeight, 'Overall Risk', riskScore.overallScore, 5, '#00D9FF');
    drawRiskCard(doc, startX + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 'Technical Risk', riskScore.technicalScore, 5, '#FF6B35');
    drawRiskCard(doc, startX + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 'Ethical Risk', riskScore.ethicalScore, 5, '#9D4EDD');

    currentY += cardHeight + 40;

    doc.fontSize(16)
      .fillColor('#0A0E27')
      .font('Helvetica-Bold')
      .text('Vulnerability Distribution', margin, currentY);

    currentY += 35;

    const vulnData = [
      { label: 'Critical', count: riskScore.criticalCount, color: '#FF0055' },
      { label: 'High', count: riskScore.highCount, color: '#FF6B35' },
      { label: 'Medium', count: riskScore.mediumCount, color: '#F7B801' },
      { label: 'Low', count: riskScore.lowCount, color: '#0066FF' }
    ];

    const maxCount = Math.max(...vulnData.map(v => v.count), 1);

    vulnData.forEach((item, index) => {
      const y = currentY + (index * 35);

      doc.roundedRect(200, y, 300, 28, 5).fill('#F0F0F0');

      const barWidth = (item.count / maxCount) * 280;
      if (barWidth > 0) {
        doc.roundedRect(210, y + 6, barWidth, 16, 3).fill(item.color);
      }

      doc.fontSize(11)
        .fillColor('#333333')
        .font('Helvetica-Bold')
        .text(item.label, 60, y + 8);

      if (item.count > 0) {
        doc.fontSize(11)
          .fillColor('#000000')
          .font('Helvetica-Bold')
          .text(item.count.toString(), 215, y + 7, { width: Math.max(barWidth - 10, 20), align: 'center' });
      }
    });
  }

  // ============================================
  // PENETRATION TEST FINDINGS
  // ============================================
  if (audit.penTests && audit.penTests.length > 0) {
    doc.addPage();
    drawPageHeader(doc, 'Penetration Test Findings');

    let y = 140;
    audit.penTests.forEach((test: any, index: number) => {
      const vulnDetails = getVulnerabilityDetails(test.vulnerabilityType, test.technicalRisk);
      const severity = getSeverityLabel(test.technicalRisk);
      
      // Calculate required height
      const titleHeight = 20;
      const descHeight = doc.heightOfString(vulnDetails.description, { width: contentWidth - 30 });
      const impactHeight = doc.heightOfString(vulnDetails.impact, { width: contentWidth - 30 });
      const recHeight = doc.heightOfString(vulnDetails.recommendation, { width: contentWidth - 30 });
      const totalHeight = titleHeight + descHeight + impactHeight + recHeight + 120;
      
      // Check if we need a new page
      if (y + totalHeight > 750) {
        doc.addPage();
        drawPageHeader(doc, 'Penetration Test Findings (continued)');
        y = 140;
      }

      // Vulnerability header card
      const color = getSeverityColor(test.technicalRisk);
      doc.roundedRect(margin, y, contentWidth, 50, 8)
        .fillAndStroke('#FFFFFF', '#E0E0E0');
      
      doc.roundedRect(margin + 15, y + 13, 100, 24, 5).fill(color);
      doc.fontSize(10)
        .fillColor('#FFFFFF')
        .font('Helvetica-Bold')
        .text(severity.toUpperCase(), margin + 15, y + 18, { width: 100, align: 'center' });

      doc.fontSize(12)
        .fillColor('#000000')
        .font('Helvetica-Bold')
        .text(`VULNERABILITY #${index + 1}`, margin + 130, y + 20);

      y += 60;

      // Finding ID and Type
      doc.fontSize(9)
        .fillColor('#999999')
        .font('Helvetica')
        .text(`Finding ID: ${test.id}`, margin + 15, y);
      
      y += 15;

      doc.fontSize(11)
        .fillColor('#000000')
        .font('Helvetica-Bold')
        .text(`Type: ${test.vulnerabilityType}`, margin + 15, y);
      
      y += 20;

      doc.fontSize(9)
        .fillColor('#666666')
        .font('Helvetica')
        .text(`Technical Risk: ${test.technicalRisk}/5`, margin + 15, y);
      
      y += 25;

      // Description
      doc.fontSize(9)
        .fillColor('#0A0E27')
        .font('Helvetica-Bold')
        .text('Description:', margin + 15, y);
      
      y += 15;

      doc.fontSize(9)
        .fillColor('#333333')
        .font('Helvetica')
        .text(vulnDetails.description, margin + 15, y, { width: contentWidth - 30, lineGap: 2 });
      
      y += descHeight + 15;

      // Impact Summary
      doc.fontSize(9)
        .fillColor('#0A0E27')
        .font('Helvetica-Bold')
        .text('Impact Summary:', margin + 15, y);
      
      y += 15;

      doc.fontSize(9)
        .fillColor('#333333')
        .font('Helvetica')
        .text(vulnDetails.impact, margin + 15, y, { width: contentWidth - 30, lineGap: 2 });
      
      y += impactHeight + 15;

      // Recommendation
      doc.fontSize(9)
        .fillColor('#0A0E27')
        .font('Helvetica-Bold')
        .text('Recommendation:', margin + 15, y);
      
      y += 15;

      doc.fontSize(9)
        .fillColor('#333333')
        .font('Helvetica')
        .text(vulnDetails.recommendation, margin + 15, y, { width: contentWidth - 30, lineGap: 2 });
      
      y += recHeight + 30;
    });
  }

  // ============================================
  // PHISHING ANALYSIS
  // ============================================
  if (audit.phishingScans && audit.phishingScans.length > 0) {
    const phishingScans = audit.phishingScans.filter((scan: any) => scan.isPhishing);
    
    if (phishingScans.length > 0) {
      doc.addPage();
      drawPageHeader(doc, 'Phishing Analysis Results');

      let y = 140;
      phishingScans.forEach((scan: any, index: number) => {
        // Calculate height needed
        const keywordsText = scan.detectedKeywords?.join(', ') || 'None';
        const patternsText = scan.suspiciousPatterns?.join(', ') || 'None';
        const descText = `Detected phishing indicators: ${keywordsText}`;
        
        const descHeight = doc.heightOfString(descText, { width: contentWidth - 30 });
        const totalHeight = descHeight + 200;

        if (y + totalHeight > 750) {
          doc.addPage();
          drawPageHeader(doc, 'Phishing Analysis (continued)');
          y = 140;
        }

        const severity = scan.riskScore >= 4 ? 'HIGH' : scan.riskScore >= 3 ? 'MEDIUM' : 'LOW';
        const color = scan.riskScore >= 4 ? '#FF6B35' : scan.riskScore >= 3 ? '#F7B801' : '#0066FF';

        // Header card
        doc.roundedRect(margin, y, contentWidth, 50, 8)
          .fillAndStroke('#FFFFFF', '#E0E0E0');
        
        doc.roundedRect(margin + 15, y + 13, 100, 24, 5).fill(color);
        doc.fontSize(10)
          .fillColor('#FFFFFF')
          .font('Helvetica-Bold')
          .text(severity, margin + 15, y + 18, { width: 100, align: 'center' });

        doc.fontSize(12)
          .fillColor('#000000')
          .font('Helvetica-Bold')
          .text(`VULNERABILITY #${index + 1}`, margin + 130, y + 20);

        y += 60;

        // Finding details
        doc.fontSize(9)
          .fillColor('#999999')
          .font('Helvetica')
          .text(`Finding ID: ${scan.id}`, margin + 15, y);
        
        y += 15;

        doc.fontSize(11)
          .fillColor('#000000')
          .font('Helvetica-Bold')
          .text('Type: Phishing Attempt Detected', margin + 15, y);
        
        y += 20;

        doc.fontSize(9)
          .fillColor('#666666')
          .font('Helvetica')
          .text(`Technical Risk: ${Math.ceil(scan.riskScore || 5)}/5`, margin + 15, y);
        
        y += 25;

        // Description
        doc.fontSize(9)
          .fillColor('#0A0E27')
          .font('Helvetica-Bold')
          .text('Description:', margin + 15, y);
        
        y += 15;

        doc.fontSize(9)
          .fillColor('#333333')
          .font('Helvetica')
          .text(descText, margin + 15, y, { width: contentWidth - 30, lineGap: 2 });
        
        y += descHeight + 15;

        // Impact
        doc.fontSize(9)
          .fillColor('#0A0E27')
          .font('Helvetica-Bold')
          .text('Impact Summary:', margin + 15, y);
        
        y += 15;

        doc.fontSize(9)
          .fillColor('#333333')
          .font('Helvetica')
          .text('Phishing violates trust and may lead to identity theft and financial harm.', margin + 15, y, { width: contentWidth - 30, lineGap: 2 });
        
        y += 35;

        // Recommendation
        doc.fontSize(9)
          .fillColor('#0A0E27')
          .font('Helvetica-Bold')
          .text('Recommendation:', margin + 15, y);
        
        y += 15;

        doc.fontSize(9)
          .fillColor('#333333')
          .font('Helvetica')
          .text('Block sender, report incident, educate users.', margin + 15, y, { width: contentWidth - 30, lineGap: 2 });
        
        y += 45;
      });
    }
  }

  // ============================================
  // IDS FINDINGS
  // ============================================
  if (audit.idsLogs && audit.idsLogs.length > 0) {
    doc.addPage();
    drawPageHeader(doc, 'Intrusion Detection System Findings');

    let y = 140;
    audit.idsLogs.forEach((log: any, index: number) => {
      // Parse anomalies if stored as JSON string
      let anomaliesArray: any[] = [];
      try {
        if (typeof log.anomaliesFound === 'string') {
          anomaliesArray = JSON.parse(log.anomaliesFound);
        } else if (Array.isArray(log.anomaliesFound)) {
          anomaliesArray = log.anomaliesFound;
        }
      } catch (e) {
        // If not parseable, treat as single anomaly description
        if (log.anomaliesFound) {
          anomaliesArray = [{ type: 'General Anomaly Detected', description: log.anomaliesFound }];
        }
      }

      // Display each anomaly as a separate vulnerability
      anomaliesArray.forEach((anomaly: any, aIndex: number) => {
        const idsDetails = getIDSVulnerabilityDetails(anomaly.type || 'General Anomaly Detected', anomaly);
        const riskLevel = anomaly.severity === 'CRITICAL' ? 5 : anomaly.severity === 'HIGH' ? 4 : 3;
        const severity = getSeverityLabel(riskLevel);
        
        const descHeight = doc.heightOfString(idsDetails.description, { width: contentWidth - 30 });
        const impactHeight = doc.heightOfString(idsDetails.impact, { width: contentWidth - 30 });
        const recHeight = doc.heightOfString(idsDetails.recommendation, { width: contentWidth - 30 });
        const totalHeight = descHeight + impactHeight + recHeight + 180;

        if (y + totalHeight > 750) {
          doc.addPage();
          drawPageHeader(doc, 'IDS Findings (continued)');
          y = 140;
        }

        const color = getSeverityColor(riskLevel);

        // Header card
        doc.roundedRect(margin, y, contentWidth, 50, 8)
          .fillAndStroke('#FFFFFF', '#E0E0E0');
        
        doc.roundedRect(margin + 15, y + 13, 100, 24, 5).fill(color);
        doc.fontSize(10)
          .fillColor('#FFFFFF')
          .font('Helvetica-Bold')
          .text(severity.toUpperCase(), margin + 15, y + 18, { width: 100, align: 'center' });

        doc.fontSize(12)
          .fillColor('#000000')
          .font('Helvetica-Bold')
          .text(`VULNERABILITY #${index + 1}`, margin + 130, y + 20);

        y += 60;

        // Finding ID
        doc.fontSize(9)
          .fillColor('#999999')
          .font('Helvetica')
          .text(`Finding ID: ${anomaly.id || log.id}`, margin + 15, y);
        
        y += 15;

        // Type
        doc.fontSize(11)
          .fillColor('#000000')
          .font('Helvetica-Bold')
          .text(`Type: ${anomaly.type || 'General Anomaly Detected'}`, margin + 15, y);
        
        y += 20;

        doc.fontSize(9)
          .fillColor('#666666')
          .font('Helvetica')
          .text(`Technical Risk: ${riskLevel}/5`, margin + 15, y);
        
        y += 25;

        // Description
        doc.fontSize(9)
          .fillColor('#0A0E27')
          .font('Helvetica-Bold')
          .text('Description:', margin + 15, y);
        
        y += 15;

        doc.fontSize(9)
          .fillColor('#333333')
          .font('Helvetica')
          .text(idsDetails.description, margin + 15, y, { width: contentWidth - 30, lineGap: 2 });
        
        y += descHeight + 15;

        // Impact
        doc.fontSize(9)
          .fillColor('#0A0E27')
          .font('Helvetica-Bold')
          .text('Impact Summary:', margin + 15, y);
        
        y += 15;

        doc.fontSize(9)
          .fillColor('#333333')
          .font('Helvetica')
          .text(idsDetails.impact, margin + 15, y, { width: contentWidth - 30, lineGap: 2 });
        
        y += impactHeight + 15;

        // Recommendation
        doc.fontSize(9)
          .fillColor('#0A0E27')
          .font('Helvetica-Bold')
          .text('Recommendation:', margin + 15, y);
        
        y += 15;

        doc.fontSize(9)
          .fillColor('#333333')
          .font('Helvetica')
          .text(idsDetails.recommendation, margin + 15, y, { width: contentWidth - 30, lineGap: 2 });
        
        y += recHeight + 30;
      });
    });
  }

  // ============================================
  // RECOVERY PLAN
  // ============================================
  if (audit.recoveryPlan && audit.recoveryPlan.actionSteps) {
    doc.addPage();
    drawPageHeader(doc, 'Recovery & Remediation Plan');

    let y = 140;

    try {
      const planItems = JSON.parse(audit.recoveryPlan.actionSteps || '[]');
      const phases = [
        { key: 'immediate', label: 'IMMEDIATE ACTIONS (0-24 Hours)', color: '#FF0055' },
        { key: 'short_term', label: 'SHORT-TERM ACTIONS (1-7 Days)', color: '#FF6B35' },
        { key: 'long_term', label: 'LONG-TERM ACTIONS (1-3 Months)', color: '#0066FF' }
      ];

      phases.forEach(phase => {
        const items = planItems.filter((item: any) => item.phase === phase.key);
        
        if (items.length > 0) {
          if (y > 650) {
            doc.addPage();
            drawPageHeader(doc, 'Recovery Plan (continued)');
            y = 140;
          }

          // Phase header
          doc.roundedRect(margin, y, contentWidth, 32, 5).fill(phase.color);
          doc.fontSize(11)
            .fillColor('#FFFFFF')
            .font('Helvetica-Bold')
            .text(phase.label, margin + 15, y + 10);

          y += 42;

          items.forEach((item: any, index: number) => {
            // Calculate required height for this item
            const titleHeight = doc.heightOfString(`${index + 1}. ${item.title}`, {
              width: contentWidth - 30,
              lineGap: 2
            });
            const descHeight = doc.heightOfString(item.description, {
              width: contentWidth - 45,
              lineGap: 3
            });
            const itemHeight = titleHeight + descHeight + 25;

            // Check if we need a new page
            if (y + itemHeight > 750) {
              doc.addPage();
              drawPageHeader(doc, 'Recovery Plan (continued)');
              y = 140;
            }

            // Title
            doc.fontSize(10)
              .fillColor('#000000')
              .font('Helvetica-Bold')
              .text(`${index + 1}. ${item.title}`, margin + 15, y, {
                width: contentWidth - 30,
                lineGap: 2
              });

            y += titleHeight + 5;

            // Description
            doc.fontSize(9)
              .fillColor('#666666')
              .font('Helvetica')
              .text(item.description, margin + 30, y, {
                width: contentWidth - 45,
                lineGap: 3,
                align: 'left'
              });

            y += descHeight + 20;
          });

          y += 5;
        }
      });
    } catch (e) {
      doc.fontSize(10).fillColor('#FF0000').text('Error loading recovery plan', margin + 15, y);
    }
  }

  // ============================================
  // ISLAMIC ETHICAL ALIGNMENT
  // ============================================
  doc.addPage();
  drawPageHeader(doc, 'Islamic Ethical Alignment');

  let ethicsY = 140;

  if (audit.ethics) {
    const ethics = audit.ethics;

    const complianceColors: any = {
      'Excellent': { bg: '#10B981', text: '#FFFFFF' },
      'Good': { bg: '#3B82F6', text: '#FFFFFF' },
      'Fair': { bg: '#F59E0B', text: '#FFFFFF' },
      'Poor': { bg: '#EF4444', text: '#FFFFFF' },
      'Critical': { bg: '#DC2626', text: '#FFFFFF' }
    };

    const complianceColor = complianceColors[ethics.complianceLevel] || complianceColors['Fair'];
    const complianceText = ethics.complianceLevel.toUpperCase() + 
      (ethics.recommendation ? ` - ${ethics.recommendation.toUpperCase()}` : '');

    doc.roundedRect(pageWidth / 2 - 120, ethicsY, 240, 50, 8)
      .fillAndStroke(complianceColor.bg, complianceColor.bg);

    doc.fontSize(11)
      .fillColor(complianceColor.text)
      .font('Helvetica-Bold')
      .text('COMPLIANCE LEVEL', pageWidth / 2 - 110, ethicsY + 10);

    doc.fontSize(10)
      .fillColor(complianceColor.text)
      .font('Helvetica')
      .text(complianceText, pageWidth / 2 - 110, ethicsY + 28, {
        width: 220,
        align: 'center'
      });

    ethicsY += 65;

    const cardWidth = (pageWidth - 120) / 2;

    // Amanah Card
    doc.roundedRect(margin, ethicsY, cardWidth - 10, 85, 10)
      .fillAndStroke('#FFFFFF', '#3B82F6');

    doc.fontSize(11)
      .fillColor('#3B82F6')
      .font('Helvetica-Bold')
      .text('AMANAH (TRUST)', margin + 15, ethicsY + 12);

    doc.fontSize(24)
      .fillColor('#0A0E27')
      .font('Helvetica-Bold')
      .text(`${ethics.amanahScore.toFixed(1)}/5.0`, margin + 15, ethicsY + 32);

    doc.fontSize(8)
      .fillColor('#666666')
      .font('Helvetica')
      .text('Protecting data as sacred trust', margin + 15, ethicsY + 62, { width: cardWidth - 40 });

    // Maslahah Card
    doc.roundedRect(margin + cardWidth, ethicsY, cardWidth - 10, 85, 10)
      .fillAndStroke('#FFFFFF', '#10B981');

    doc.fontSize(11)
      .fillColor('#10B981')
      .font('Helvetica-Bold')
      .text('MASLAHAH (PUBLIC BENEFIT)', margin + cardWidth + 15, ethicsY + 12);

    doc.fontSize(24)
      .fillColor('#0A0E27')
      .font('Helvetica-Bold')
      .text(`${ethics.maslahahScore.toFixed(1)}/5.0`, margin + cardWidth + 15, ethicsY + 32);

    doc.fontSize(8)
      .fillColor('#666666')
      .font('Helvetica')
      .text('Prioritizing user safety & welfare', margin + cardWidth + 15, ethicsY + 62, { width: cardWidth - 40 });

    ethicsY += 105;

    if (ethics.interpretation) {
      const interpretHeight = doc.heightOfString(ethics.interpretation, {
        width: contentWidth - 40,
        lineGap: 3
      }) + 40;

      if (ethicsY + interpretHeight > 750) {
        doc.addPage();
        drawPageHeader(doc, 'Islamic Ethical Alignment (continued)');
        ethicsY = 140;
      }

      doc.roundedRect(margin, ethicsY, contentWidth, interpretHeight, 10)
        .fillAndStroke('#F0F7FF', '#00D9FF');

      doc.fontSize(10)
        .fillColor('#0A0E27')
        .font('Helvetica-Bold')
        .text('ETHICAL ANALYSIS', margin + 20, ethicsY + 12);

      doc.fontSize(8)
        .fillColor('#333333')
        .font('Helvetica')
        .text(ethics.interpretation, margin + 20, ethicsY + 28, {
          width: contentWidth - 40,
          lineGap: 3
        });

      ethicsY += interpretHeight + 20;
    }
  }

  // Quranic verse
  doc.roundedRect(80, ethicsY, pageWidth - 160, 70, 10)
    .fillAndStroke('#F0F7FF', '#00D9FF');

  doc.fontSize(11)
    .fillColor('#0A0E27')
    .font('Helvetica-Oblique')
    .text('"Indeed, Allah commands you to render trusts to whom they are due."', 100, ethicsY + 15, {
      width: pageWidth - 200,
      align: 'center'
    });

  doc.fontSize(9)
    .fillColor('#666666')
    .font('Helvetica')
    .text('Surah An-Nisa: 58', 100, ethicsY + 42, {
      width: pageWidth - 200,
      align: 'center'
    });

  ethicsY += 90;

  // Principles
  const principles = [
    { name: 'Amanah (Trust)', desc: 'Protecting customer data as a sacred trust' },
    { name: 'Maslahah (Public Benefit)', desc: 'Prioritizing user safety and welfare' },
    { name: 'Ihsan (Excellence)', desc: 'Pursuing the highest security standards' },
    { name: 'Adl (Justice)', desc: 'Fair and transparent disclosure practices' }
  ];

  principles.forEach((principle, index) => {
    const y = ethicsY + (index * 55);

    if (y > 720) {
      doc.addPage();
      drawPageHeader(doc, 'Islamic Ethical Alignment (continued)');
      ethicsY = 140;
    }

    doc.roundedRect(margin, y, contentWidth, 50, 8)
      .fillAndStroke('#FFFFFF', '#E0E0E0');

    doc.fontSize(10)
      .fillColor('#0A0E27')
      .font('Helvetica-Bold')
      .text(principle.name, margin + 15, y + 12);

    doc.fontSize(8)
      .fillColor('#666666')
      .font('Helvetica')
      .text(principle.desc, margin + 15, y + 28, { width: contentWidth - 30 });
  });

  doc.fontSize(8)
    .fillColor('#999999')
    .text('This report adheres to Islamic ethical principles in cybersecurity disclosure', 0, pageHeight - 40, { align: 'center' });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function drawPageHeader(doc: PDFKit.PDFDocument, title: string) {
  doc.fontSize(20)
    .fillColor('#0A0E27')
    .font('Helvetica-Bold')
    .text(title, 50, 50);

  doc.moveTo(50, 85)
    .lineTo(545, 85)
    .lineWidth(2)
    .strokeColor('#00D9FF')
    .stroke();
}

function drawRiskCard(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  score: number,
  maxScore: number,
  color: string
) {
  doc.roundedRect(x, y, width, height, 10)
    .fillAndStroke('#FFFFFF', '#E0E0E0');

  doc.fontSize(10)
    .fillColor('#666666')
    .font('Helvetica')
    .text(label, x, y + 12, { width: width, align: 'center' });

  doc.fontSize(28)
    .fillColor(color)
    .font('Helvetica-Bold')
    .text(score.toFixed(1), x, y + 30, { width: width, align: 'center' });

  doc.fontSize(9)
    .fillColor('#999999')
    .font('Helvetica')
    .text(`/ ${maxScore}`, x, y + 62, { width: width, align: 'center' });
}

function drawFindingCard(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  type: string,
  risk: number,
  index: number,
  color: string
) {
  doc.roundedRect(x, y, width, 70, 8)
    .fillAndStroke('#FFFFFF', '#E0E0E0');

  doc.roundedRect(x + 15, y + 15, 65, 22, 5).fill(color);

  doc.fontSize(9)
    .fillColor('#FFFFFF')
    .font('Helvetica-Bold')
    .text(`Risk ${risk}/5`, x + 15, y + 19, { width: 65, align: 'center' });

  doc.fontSize(11)
    .fillColor('#000000')
    .font('Helvetica-Bold')
    .text(`Finding #${index}`, x + 90, y + 18);

  doc.fontSize(10)
    .fillColor('#333333')
    .font('Helvetica')
    .text(type, x + 15, y + 45, { width: width - 30 });
}

function getSeverityColor(risk: number): string {
  if (risk >= 5) return '#FF0055';
  if (risk >= 4) return '#FF6B35';
  if (risk >= 3) return '#F7B801';
  return '#0066FF';
}

function getSeverityLabel(risk: number): string {
  if (risk >= 5) return 'Critical';
  if (risk >= 4) return 'High';
  if (risk >= 3) return 'Medium';
  return 'Low';
}

/**
 * Map vulnerability types to their full details
 */
function getVulnerabilityDetails(type: string, technicalRisk: number): { description: string, impact: string, recommendation: string } {
  const vulnMap: Record<string, any> = {
    'Missing SSL/TLS Encryption': {
      description: 'The website uses HTTP instead of HTTPS, exposing all data transmission to potential interception.',
      impact: 'Transmitting sensitive data over unencrypted connections violates user trust and privacy. Attackers can intercept and read all communications.',
      recommendation: 'Implement SSL/TLS certificate immediately. Use Let\'s Encrypt for free certificates.'
    },
    'Missing HSTS Header': {
      description: 'HTTP Strict Transport Security (HSTS) header is missing.',
      impact: 'Failing to enforce secure connections can expose users to MITM attacks.',
      recommendation: 'Add "Strict-Transport-Security: max-age=31536000; includeSubDomains" header.'
    },
    'Missing X-Content-Type-Options': {
      description: 'Missing X-Content-Type-Options header allows MIME-type sniffing.',
      impact: 'MIME-type sniffing can lead to XSS attacks.',
      recommendation: 'Add "X-Content-Type-Options: nosniff" header.'
    },
    'Missing Clickjacking Protection': {
      description: 'Neither X-Frame-Options nor CSP frame-ancestors is present.',
      impact: 'Clickjacking tricks users into unintended actions.',
      recommendation: 'Add "X-Frame-Options: DENY" header.'
    },
    'Missing Content Security Policy': {
      description: 'No Content Security Policy (CSP) header found.',
      impact: 'CSP protects users from malicious scripts.',
      recommendation: 'Implement CSP: "Content-Security-Policy: default-src \'self\'".'
    },
    'Missing XSS Protection Header': {
      description: 'X-XSS-Protection header is not set.',
      impact: 'Provides defense-in-depth for older browsers.',
      recommendation: 'Add "X-XSS-Protection: 1; mode=block".'
    },
    'Insecure Cookie Configuration': {
      description: 'Found cookie(s) without Secure/HttpOnly flags.',
      impact: 'Insecure cookies enable session hijacking.',
      recommendation: 'Set "Secure", "HttpOnly", and "SameSite=Strict" flags on all cookies.'
    },
    'Phishing Attempt Detected': {
      description: 'Detected phishing indicators in the analyzed content.',
      impact: 'Phishing violates trust and may lead to identity theft and financial harm.',
      recommendation: 'Block sender, report incident, educate users.'
    }
  };

  // Return matched details or generic details
  if (vulnMap[type]) {
    return vulnMap[type];
  }

  // Generic fallback for unknown types
  return {
    description: `Security vulnerability of type: ${type}`,
    impact: 'Potential security breach may harm user trust',
    recommendation: 'Review and remediate this security issue according to industry best practices.'
  };
}

/**
 * Map IDS anomaly types to full details
 */
function getIDSVulnerabilityDetails(type: string, anomalyData: any): { description: string, impact: string, recommendation: string } {
  // Common IDS patterns
  if (type.includes('Brute-Force')) {
    return {
      description: anomalyData.description || `Detected ${anomalyData.count || 'multiple'} failed authentication attempts${anomalyData.targetUser ? ` for user "${anomalyData.targetUser}"` : ''}${anomalyData.velocity ? ` (${anomalyData.velocity} attempts/min - ${anomalyData.velocityLevel} VELOCITY)` : ''}. This indicates an active brute-force attack${anomalyData.targetUser ? ' targeting this account' : ''}.`,
      impact: 'Potential security breach may harm user trust',
      recommendation: anomalyData.targetUser 
        ? `IMMEDIATE ACTION: Lock account "${anomalyData.targetUser}", enforce password reset, enable MFA, and review access logs for this user. Consider implementing account lockout after 3-5 failed attempts.`
        : 'IMMEDIATE ACTION: Implement rate limiting, account lockout policies (3-5 failed attempts), and enable Multi-Factor Authentication (MFA) for all accounts.'
    };
  }

  if (type.includes('Privilege Escalation')) {
    return {
      description: anomalyData.description || `Detected ${anomalyData.count || 'multiple'} unauthorized privilege escalation attempts. User may be attempting to gain elevated system access.`,
      impact: 'Potential security breach may harm user trust',
      recommendation: 'URGENT: Review user permissions immediately. Audit privileged account access. Enable privilege access monitoring and restrict sudo/admin rights.'
    };
  }

  if (type.includes('SQL Injection')) {
    return {
      description: anomalyData.description || `Detected ${anomalyData.count || 'multiple'} SQL injection attempts in request parameters. Attacker attempting to manipulate database queries.`,
      impact: 'SQL injection can lead to data breach, data loss, or complete system compromise.',
      recommendation: 'CRITICAL: Use parameterized queries/prepared statements. Implement input validation. Deploy Web Application Firewall (WAF). Audit all database access code.'
    };
  }

  if (type.includes('Command Injection')) {
    return {
      description: anomalyData.description || `Detected ${anomalyData.count || 'multiple'} command injection attempts. Attacker trying to execute arbitrary system commands.`,
      impact: 'Command injection can lead to complete system takeover and data compromise.',
      recommendation: 'CRITICAL: Sanitize all user inputs. Avoid system calls with user input. Implement strict input validation. Use allowlists instead of blocklists.'
    };
  }

  if (type.includes('Port Scanning')) {
    return {
      description: anomalyData.description || `Detected port scanning activity${anomalyData.sourceIp ? ` from IP ${anomalyData.sourceIp}` : ''}. ${anomalyData.portsAccessed ? `Accessed ${anomalyData.portsAccessed} different ports` : 'Multiple ports accessed'} in short timeframe - reconnaissance activity.`,
      impact: 'Port scanning is typically reconnaissance before a targeted attack.',
      recommendation: `Block source IP${anomalyData.sourceIp ? ` (${anomalyData.sourceIp})` : ''} immediately. Enable network intrusion detection. Configure firewall to drop suspicious scanning traffic.`
    };
  }

  if (type.includes('Credential Stuffing')) {
    return {
      description: anomalyData.description || `Detected credential stuffing attack${anomalyData.sourceIp ? ` from IP ${anomalyData.sourceIp}` : ''}. ${anomalyData.accountsTargeted ? `Targeted ${anomalyData.accountsTargeted} different accounts` : 'Multiple accounts targeted'} with leaked credentials.`,
      impact: 'Credential stuffing can lead to account takeover and data breach if passwords are reused.',
      recommendation: `Block attacker IP${anomalyData.sourceIp ? ` (${anomalyData.sourceIp})` : ''}. Force password resets for targeted accounts. Implement CAPTCHA and rate limiting. Enable Multi-Factor Authentication.`
    };
  }

  if (type.includes('Web Scanner')) {
    return {
      description: anomalyData.description || `Detected automated web scanner${anomalyData.sourceIp ? ` from IP ${anomalyData.sourceIp}` : ''}. Scanner probing for vulnerabilities and security weaknesses.`,
      impact: 'Web scanners identify vulnerabilities that can be exploited in subsequent attacks.',
      recommendation: 'Block scanner IP. Review and patch identified vulnerabilities. Implement rate limiting and bot detection.'
    };
  }

  // Generic anomaly
  return {
    description: anomalyData.description || `Detected ${anomalyData.count || 'multiple'} error-level or suspicious events.`,
    impact: 'Potential security breach may harm user trust',
    recommendation: 'Investigate repeated error patterns and validate system integrity.'
  };
}

/**
 * GET /api/reporting/audit/:auditId
 * 
 * Retrieve complete audit report data
 */
reportingRouter.get('/audit/:auditId', async (req: Request, res: Response) => {
  try {
    const { auditId } = req.params;

    const audit = await prisma.auditSession.findUnique({
      where: { id: auditId },
      include: {
        user: { select: { id: true, name: true, email: true, position: true } },
        penTests: true,
        phishingScans: true,
        idsLogs: true,
        riskScore: true,
        recoveryPlan: true,
        ethics: true
      }
    });

    if (!audit) {
      return res.status(404).json({ error: 'Audit session not found' });
    }

    return res.status(200).json({ success: true, audit });

  } catch (error: any) {
    console.error('❌ Error fetching audit:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch audit data',
      message: error.message 
    });
  }
});
