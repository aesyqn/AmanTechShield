import { Router, Request, Response } from "express";
import multer from "multer";
import { prisma } from "../../prisma.ts";

export const idsRouter = Router();

/* =======================
   CONFIGURATION
======================= */

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

/* =======================
   TYPES
======================= */

type LogEntry = {
  timestamp?: Date;
  level?: string;
  username?: string;
  ip?: string;
  message: string;
  dataSize?: number;
};

type Finding = {
  id: string;
  title: string;
  description: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  category: "Intrusion Detection";
  recommendation: string;
};

/* =======================
   LOG PARSING
======================= */

function parseTextLogs(raw: string): LogEntry[] {
  const lines = raw.split("\n").filter(Boolean);

  return lines.map(line => {
    // Enhanced pattern matching
    const ipMatch = line.match(/\b\d{1,3}(\.\d{1,3}){3}\b/);
    const userMatch = line.match(/user[:\s=]+([\w.@-]+)/i) || 
                     line.match(/username[:\s=]+([\w.@-]+)/i) ||
                     line.match(/account[:\s=]+([\w.@-]+)/i) ||
                     line.match(/login[:\s=]+([\w.@-]+)/i) ||
                     line.match(/from\s+([\w.@-]+)/i);
    const sizeMatch = line.match(/(\d+\.?\d*)\s*(GB|MB|KB|bytes|Bytes)/i);
    
    // Better timestamp detection (ISO, common formats)
    const timeMatch = line.match(/\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}/) ||
                     line.match(/\d{1,2}:\d{2}:\d{2}/) ||
                     line.match(/\d{1,2}\/\d{1,2}\/\d{4}/);
    
    // Enhanced level detection
    const levelMatch = line.match(/ERROR|WARNING|CRITICAL|INFO|FAIL(ED)?|SUCCESS|ALERT|DENY|DENIED|REJECT(ED)?|UNAUTHORIZED/i);
    
    // Extract HTTP status codes
    const statusMatch = line.match(/\s(4\d{2}|5\d{2})\s/);

    return {
      message: line,
      ip: ipMatch?.[0],
      username: userMatch?.[1],
      dataSize: sizeMatch ? parseSizeToBytes(sizeMatch[0]) : undefined,
      level: levelMatch?.[0] || (statusMatch ? `HTTP_${statusMatch[1]}` : undefined),
      timestamp: timeMatch ? parseTimestamp(timeMatch[0]) : undefined
    };
  });
}

function parseSizeToBytes(sizeStr: string): number {
  const match = sizeStr.match(/(\d+\.?\d*)\s*(GB|MB|KB|bytes|Bytes)/i);
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  
  switch(unit) {
    case 'gb': return value * 1024 * 1024 * 1024;
    case 'mb': return value * 1024 * 1024;
    case 'kb': return value * 1024;
    default: return value;
  }
}

function parseTimestamp(timeStr: string): Date {
  const now = new Date();
  
  // Try ISO format first
  if (timeStr.includes('T') || timeStr.match(/\d{4}-\d{2}-\d{2}/)) {
    return new Date(timeStr);
  }
  
  // Try time only (assume today)
  const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})(:(\d{2}))?/);
  if (timeMatch) {
    const date = new Date();
    date.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]), parseInt(timeMatch[4] || '0'));
    return date;
  }
  
  return now;
}

/* =======================
   DETECTION RULES
======================= */

function detectBruteForce(entries: LogEntry[]): Finding[] {
  const userAttempts: Record<string, { count: number; timestamps: Date[] }> = {};
  const ipAttempts: Record<string, number> = {};
  const findings: Finding[] = [];

  entries.forEach(e => {
    // Enhanced failed login detection with more patterns
    const isFailedAuth = /login\s*(failed|failure|denied)|failed\s*login|authentication\s*(failed|failure|denied)|invalid\s*(password|credentials)|wrong\s*password|access\s*denied|unauthorized|401|403/i.test(e.message);
    
    if (isFailedAuth) {
      // Track by username
      if (e.username) {
        if (!userAttempts[e.username]) {
          userAttempts[e.username] = { count: 0, timestamps: [] };
        }
        userAttempts[e.username].count++;
        if (e.timestamp) {
          userAttempts[e.username].timestamps.push(e.timestamp);
        }
      }
      
      // Track by IP for distributed attacks
      if (e.ip) {
        ipAttempts[e.ip] = (ipAttempts[e.ip] || 0) + 1;
      }
    }
  });

  // Analyze user-based attacks
  Object.entries(userAttempts).forEach(([user, data]) => {
    if (data.count >= 3) {
      // Calculate rate if timestamps available
      let rateInfo = '';
      if (data.timestamps.length >= 2) {
        const timeSpan = data.timestamps[data.timestamps.length - 1].getTime() - data.timestamps[0].getTime();
        const minutes = timeSpan / (1000 * 60);
        const rate = minutes > 0 ? (data.count / minutes).toFixed(1) : data.count;
        rateInfo = minutes < 1 ? ` (${rate} attempts/min - HIGH VELOCITY)` : ` over ${Math.round(minutes)} minutes`;
      }
      
      findings.push({
        id: `IDS-BF-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title: `Brute-Force Attack Detected: ${user}`,
        description: `Detected ${data.count} failed authentication attempts for user "${user}"${rateInfo}. This indicates an active brute-force attack targeting this account.`,
        severity: data.count >= 15 ? "Critical" : data.count >= 8 ? "High" : "Medium",
        category: "Intrusion Detection",
        recommendation: `IMMEDIATE ACTION: Lock account "${user}", enforce password reset, enable MFA, and review access logs for this user. Consider implementing account lockout after 3-5 failed attempts.`
      });
    }
  });
  
  // Detect distributed brute-force (multiple IPs)
  Object.entries(ipAttempts).forEach(([ip, count]) => {
    if (count >= 10) {
      findings.push({
        id: `IDS-DBA-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title: `Distributed Brute-Force from IP: ${ip}`,
        description: `IP ${ip} attempted ${count} failed authentications across multiple accounts. This suggests automated credential stuffing or distributed attack.`,
        severity: count >= 25 ? "Critical" : "High",
        category: "Intrusion Detection",
        recommendation: `Block IP ${ip} immediately. Check for other IPs in same subnet. Enable rate limiting and CAPTCHA on login endpoints.`
      });
    }
  });

  return findings;
}

function detectUnusualAccessTime(entries: LogEntry[]): Finding[] {
  const findings: Finding[] = [];
  const afterHoursLogins = entries.filter(e => {
    if (!/logged in|login success|authentication success/i.test(e.message)) return false;
    if (!e.timestamp) return false;
    
    const hour = e.timestamp.getHours();
    return hour >= 22 || hour <= 6; // 10 PM to 6 AM
  });
  
  if (afterHoursLogins.length >= 2) {
    findings.push({
      id: `IDS-UAT-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: "Unusual Access Time Pattern Detected",
      description: `${afterHoursLogins.length} successful logins detected outside normal business hours (10 PM - 6 AM). This could indicate unauthorized access or compromised credentials.`,
      severity: afterHoursLogins.length >= 5 ? "High" : "Medium",
      category: "Intrusion Detection",
      recommendation: "Verify legitimacy with users. Enable MFA and session monitoring. Review access patterns for compromised accounts."
    });
  }
  
  return findings;
}

function detectSQLInjection(entries: LogEntry[]): Finding[] {
  const findings: Finding[] = [];
  const sqlPatterns = /('|(--)|;|\b(union|select|insert|update|delete|drop|exec|execute|script|javascript|alert)\b.*\b(from|where|table|database)\b)|(%27)|(%3D)|(\bor\s+1\s*=\s*1)|(\/\*.*\*\/)/i;
  
  const suspiciousEntries = entries.filter(e => sqlPatterns.test(e.message));
  
  if (suspiciousEntries.length > 0) {
    findings.push({
      id: `IDS-SQLI-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: "SQL Injection Attempt Detected",
      description: `Detected ${suspiciousEntries.length} log entries with SQL injection patterns. Attack vectors include SQL keywords, comment sequences, or boolean-based injection attempts.`,
      severity: "Critical",
      category: "Intrusion Detection",
      recommendation: "URGENT: Sanitize all user inputs. Use parameterized queries. Enable WAF rules for SQL injection. Block attacking IPs immediately."
    });
  }
  
  return findings;
}

function detectCommandInjection(entries: LogEntry[]): Finding[] {
  const findings: Finding[] = [];
  const cmdPatterns = /(\||;|`|\$\(|\$\{)|\b(bash|sh|cmd|powershell|wget|curl|nc|netcat|chmod|rm\s+-rf)\b|(\.\.\/|\.\.\\ )|(%0a|%0d)/i;
  
  const suspiciousEntries = entries.filter(e => cmdPatterns.test(e.message));
  
  if (suspiciousEntries.length > 0) {
    findings.push({
      id: `IDS-CMDI-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: "Command Injection Attempt Detected",
      description: `Detected ${suspiciousEntries.length} potential command injection attempts with shell metacharacters or system commands.`,
      severity: "Critical",
      category: "Intrusion Detection",
      recommendation: "URGENT: Review application input validation. Disable system command execution where possible. Block attacking IPs and enable application firewall."
    });
  }
  
  return findings;
}

function detectPortScanning(entries: LogEntry[]): Finding[] {
  const findings: Finding[] = [];
  const ipConnections: Record<string, Set<string>> = {};
  
  entries.forEach(e => {
    if (e.ip && /connection|request|access/i.test(e.message)) {
      // Extract port if available
      const portMatch = e.message.match(/port\s+(\d+)|:(\d{1,5})/);
      if (portMatch) {
        const port = portMatch[1] || portMatch[2];
        if (!ipConnections[e.ip]) ipConnections[e.ip] = new Set();
        ipConnections[e.ip].add(port);
      }
    }
  });
  
  Object.entries(ipConnections).forEach(([ip, ports]) => {
    if (ports.size >= 5) {
      findings.push({
        id: `IDS-PS-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title: `Port Scanning Detected from ${ip}`,
        description: `IP ${ip} accessed ${ports.size} different ports, indicating reconnaissance or port scanning activity. Ports: ${Array.from(ports).slice(0, 10).join(', ')}.`,
        severity: ports.size >= 10 ? "High" : "Medium",
        category: "Intrusion Detection",
        recommendation: `Block IP ${ip}. Enable intrusion prevention system (IPS). Close unnecessary ports and services.`
      });
    }
  });
  
  return findings;
}

function detectPrivilegeEscalation(entries: LogEntry[]): Finding[] {
  const findings: Finding[] = [];
  const privPatterns = /sudo|su\s|admin|root|privilege|escalat|chmod\s+777|setuid|runas/i;
  
  const suspiciousEntries = entries.filter(e => 
    privPatterns.test(e.message) && 
    (/fail|denied|unauthorized|attempt/i.test(e.message))
  );
  
  if (suspiciousEntries.length >= 2) {
    findings.push({
      id: `IDS-PE-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: "Privilege Escalation Attempt Detected",
      description: `Detected ${suspiciousEntries.length} unauthorized privilege escalation attempts. User may be attempting to gain elevated system access.`,
      severity: "Critical",
      category: "Intrusion Detection",
      recommendation: "URGENT: Review user permissions immediately. Audit privileged account access. Enable privilege access monitoring and restrict sudo/admin rights."
    });
  }
  
  return findings;
}

function detectSuspiciousIP(entries: LogEntry[]): Finding[] {
  const ipActivity: Record<string, { count: number; errors: number; users: Set<string> }> = {};
  const findings: Finding[] = [];

  entries.forEach(e => {
    if (e.ip) {
      if (!ipActivity[e.ip]) {
        ipActivity[e.ip] = { count: 0, errors: 0, users: new Set() };
      }
      ipActivity[e.ip].count++;
      
      if (/error|fail|denied|unauthorized|403|404|500/i.test(e.message)) {
        ipActivity[e.ip].errors++;
      }
      
      if (e.username) {
        ipActivity[e.ip].users.add(e.username);
      }
    }
  });

  Object.entries(ipActivity).forEach(([ip, data]) => {
    // High-frequency access
    if (data.count >= 20) {
      findings.push({
        id: `IDS-HF-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title: `High-Frequency Access from IP: ${ip}`,
        description: `IP ${ip} generated ${data.count} requests. Error rate: ${((data.errors/data.count)*100).toFixed(1)}%. This could indicate automated scanning or DDoS activity.`,
        severity: data.count >= 50 ? "Critical" : data.count >= 30 ? "High" : "Medium",
        category: "Intrusion Detection",
        recommendation: `Implement rate limiting for IP ${ip}. Enable CAPTCHA. Consider temporary blocking if automated bot detected.`
      });
    }
    
    // Multiple account access from single IP (credential stuffing)
    if (data.users.size >= 5) {
      findings.push({
        id: `IDS-CS-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title: `Credential Stuffing Detected from ${ip}`,
        description: `IP ${ip} attempted access to ${data.users.size} different user accounts. This pattern indicates credential stuffing or account enumeration attack.`,
        severity: "High",
        category: "Intrusion Detection",
        recommendation: `Block IP ${ip} immediately. Force password resets for affected accounts. Enable account lockout and MFA. Monitor for additional IPs in attack campaign.`
      });
    }
    
    // High error rate (potential scanner)
    if (data.errors >= 10 && (data.errors / data.count) > 0.7) {
      findings.push({
        id: `IDS-SC-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title: `Web Scanner Detected: ${ip}`,
        description: `IP ${ip} has ${data.errors} errors out of ${data.count} requests (${((data.errors/data.count)*100).toFixed(0)}% error rate). This indicates automated vulnerability scanning.`,
        severity: "High",
        category: "Intrusion Detection",
        recommendation: `Block IP ${ip}. Enable WAF rules. Review application for exposed endpoints or vulnerabilities being probed.`
      });
    }
  });

  return findings;
}

function detectDataExfiltration(entries: LogEntry[]): Finding[] {
  return entries
    .filter(e => (e.dataSize || 0) >= 50 * 1024 * 1024) // Lowered to 50MB
    .map(e => ({
      id: `IDS-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: "Potential Data Exfiltration Detected",
      description: `Large data transfer detected: ${((e.dataSize || 0) / (1024 * 1024)).toFixed(2)} MB.`,
      severity: (e.dataSize || 0) >= 500 * 1024 * 1024 ? "Critical" : "High",
      category: "Intrusion Detection",
      recommendation: "Review data access logs and restrict large outbound transfers."
    }));
}

function detectGeneralAnomalies(entries: LogEntry[]): Finding[] {
  const errors = entries.filter(e => /ERROR|CRITICAL|FAIL|ALERT/i.test(e.level || "") || 
                                     /error|critical|fail|alert|warning|denied|rejected/i.test(e.message));
  
  if (errors.length < 3) return []; // Lowered threshold

  return [{
    id: `IDS-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: "General Anomaly Detected",
    description: `Detected ${errors.length} error-level or suspicious events.`,
    severity: errors.length >= 10 ? "High" : "Medium",
    category: "Intrusion Detection",
    recommendation: "Investigate repeated error patterns and validate system integrity."
  }];
}

/* =======================
   ANALYSIS ORCHESTRATION
======================= */

function analyzeLogs(raw: string) {
  const entries = parseTextLogs(raw);

  const findings = [
    ...detectBruteForce(entries),
    ...detectSQLInjection(entries),
    ...detectCommandInjection(entries),
    ...detectPrivilegeEscalation(entries),
    ...detectPortScanning(entries),
    ...detectSuspiciousIP(entries),
    ...detectUnusualAccessTime(entries),
    ...detectDataExfiltration(entries),
    ...detectGeneralAnomalies(entries)
  ];

  // If no findings, create a summary finding
  if (findings.length === 0 && entries.length > 0) {
    findings.push({
      id: `IDS-${Date.now()}-summary`,
      title: "Log Analysis Complete - No Critical Threats Detected",
      description: `Analyzed ${entries.length} log entries. No immediate security threats detected. Continue monitoring for suspicious patterns.`,
      severity: "Low",
      category: "Intrusion Detection",
      recommendation: "Maintain regular log monitoring and update detection rules as needed."
    });
  }

  // Categorize findings by severity
  const critical = findings.filter(f => f.severity === 'Critical');
  const high = findings.filter(f => f.severity === 'High');
  const medium = findings.filter(f => f.severity === 'Medium');
  const low = findings.filter(f => f.severity === 'Low');

  return {
    success: true,
    analysis: {
      totalLogLines: raw.split("\n").filter(Boolean).length,
      parsedEntries: entries.length,
      findingsCount: findings.length,
      severityBreakdown: {
        critical: critical.length,
        high: high.length,
        medium: medium.length,
        low: low.length
      },
      threatLevel: critical.length > 0 ? 'CRITICAL' : 
                   high.length > 0 ? 'HIGH' : 
                   medium.length > 0 ? 'MEDIUM' : 'LOW',
      analysisTimestamp: new Date().toISOString(),
      // Debug info
      hasUsernames: entries.filter(e => e.username).length,
      hasIPs: entries.filter(e => e.ip).length,
      hasErrors: entries.filter(e => /error|fail|critical/i.test(e.message)).length,
      uniqueIPs: new Set(entries.filter(e => e.ip).map(e => e.ip)).size,
      uniqueUsers: new Set(entries.filter(e => e.username).map(e => e.username)).size
    },
    findings
  };
}

/* =======================
   API ENDPOINT
======================= */

idsRouter.post(
  "/analyze-logs",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const content =
        req.file?.buffer?.toString("utf-8") || req.body.content;

      if (!content) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Please provide either a log file or JSON with 'content' field."
        });
      }

      const result = analyzeLogs(content);

      // Get auditId from request body (should be provided by frontend)
      const { auditId } = req.body;

      if (auditId) {
        // Save findings to database
        const anomaliesText = result.findings
          .map(f => `[${f.severity}] ${f.title}`)
          .join("; ");

        const bruteForceFindings = result.findings.filter(f =>
          f.title.toLowerCase().includes("brute-force")
        );
        const failedAttempts = bruteForceFindings.length > 0
          ? parseInt(bruteForceFindings[0].description.match(/\d+/)?.[0] || "0")
          : 0;

        await prisma.iDSLab.create({
          data: {
            auditId,
            anomaliesFound: anomaliesText || null,
            failedAttempts
          }
        });
      }

      res.json(result);

    } catch (err) {
      console.error("IDS error:", err);
      res.status(500).json({
        error: "Internal Server Error",
        message: "An error occurred while analyzing the logs."
      });
    }
  }
);
