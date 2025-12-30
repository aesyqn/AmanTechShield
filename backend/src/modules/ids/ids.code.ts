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
    const ipMatch = line.match(/\b\d{1,3}(\.\d{1,3}){3}\b/);
    const userMatch = line.match(/user\s+([\w.]+)/i);
    const sizeMatch = line.match(/(\d+)\s*MB/i);

    return {
      message: line,
      ip: ipMatch?.[0],
      username: userMatch?.[1],
      dataSize: sizeMatch ? Number(sizeMatch[1]) * 1024 * 1024 : undefined,
      level: line.match(/ERROR|WARNING|CRITICAL|INFO/i)?.[0]
    };
  });
}

/* =======================
   DETECTION RULES
======================= */

function detectBruteForce(entries: LogEntry[]): Finding[] {
  const counter: Record<string, number> = {};
  const findings: Finding[] = [];

  entries.forEach(e => {
    if (/login failed/i.test(e.message) && e.username) {
      counter[e.username] = (counter[e.username] || 0) + 1;
    }
  });

  Object.entries(counter).forEach(([user, count]) => {
    if (count >= 5) {
      findings.push({
        id: `IDS-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title: `Brute-Force Attack Detected on User: ${user}`,
        description: `Detected ${count} failed login attempts for user "${user}". This pattern indicates a possible brute-force attack.`,
        severity: count >= 10 ? "Critical" : "High",
        category: "Intrusion Detection",
        recommendation: `Lock account "${user}" and enforce password reset. Enable account lockout policies.`
      });
    }
  });

  return findings;
}

function detectUnusualAccessTime(entries: LogEntry[]): Finding[] {
  return entries
    .filter(e => /logged in/i.test(e.message) && /2[0-3]|0[0-7]/.test(e.message))
    .map(e => ({
      id: `IDS-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: "Unusual Access Time Detected",
      description: `Login activity detected outside normal working hours.`,
      severity: "Medium",
      category: "Intrusion Detection",
      recommendation: "Verify legitimacy of access and enable multi-factor authentication."
    }));
}

function detectSuspiciousIP(entries: LogEntry[]): Finding[] {
  const counter: Record<string, number> = {};
  const findings: Finding[] = [];

  entries.forEach(e => {
    if (e.ip) counter[e.ip] = (counter[e.ip] || 0) + 1;
  });

  Object.entries(counter).forEach(([ip, count]) => {
    if (count >= 10) {
      findings.push({
        id: `IDS-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title: `Suspicious IP Activity Detected: ${ip}`,
        description: `IP address ${ip} generated ${count} access attempts.`,
        severity: "High",
        category: "Intrusion Detection",
        recommendation: `Investigate IP ${ip} and consider blocking or rate limiting.`
      });
    }
  });

  return findings;
}

function detectDataExfiltration(entries: LogEntry[]): Finding[] {
  return entries
    .filter(e => (e.dataSize || 0) >= 100 * 1024 * 1024)
    .map(e => ({
      id: `IDS-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: "Potential Data Exfiltration Detected",
      description: "Large data transfer detected exceeding 100 MB.",
      severity: "High",
      category: "Intrusion Detection",
      recommendation: "Review data access logs and restrict large outbound transfers."
    }));
}

function detectGeneralAnomalies(entries: LogEntry[]): Finding[] {
  const errors = entries.filter(e => /ERROR|CRITICAL/i.test(e.level || ""));
  if (errors.length < 5) return [];

  return [{
    id: `IDS-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: "General Anomaly Detected",
    description: `Detected ${errors.length} error-level events from the same source.`,
    severity: "Medium",
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
    ...detectUnusualAccessTime(entries),
    ...detectSuspiciousIP(entries),
    ...detectDataExfiltration(entries),
    ...detectGeneralAnomalies(entries)
  ];

  return {
    success: true,
    analysis: {
      totalLogLines: raw.split("\n").length,
      parsedEntries: entries.length,
      findingsCount: findings.length,
      analysisTimestamp: new Date().toISOString()
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
