import { Router, Request, Response } from "express";
import multer from "multer";
import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";
import { prisma } from "../../prisma";
import PDFParser from "pdf2json";

export const phishingRouter = Router();
const upload = multer({ dest: "uploads/" });

async function parsePdf(filePath: string): Promise<{ text: string }> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (errData: any) => {
      console.error("PDF parse error:", errData.parserError);
      reject(new Error("Failed to parse PDF"));
    });

    pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
      try {
        let fullText = '';

        // Extract text from all pages
        if (pdfData.Pages) {
          pdfData.Pages.forEach((page: any) => {
            if (page.Texts) {
              page.Texts.forEach((text: any) => {
                if (text.R) {
                  text.R.forEach((r: any) => {
                    if (r.T) {
                      fullText += decodeURIComponent(r.T) + ' ';
                    }
                  });
                }
              });
            }
          });
        }

        resolve({ text: fullText.trim() });
      } catch (error) {
        console.error("PDF text extraction error:", error);
        reject(new Error("Failed to extract text from PDF"));
      }
    });

    pdfParser.loadPDF(filePath);
  });
}


const PHISHING_KEYWORDS = [
  // Urgency & Threat
  "urgent",
  "immediate action required",
  "act now",
  "within 24 hours",
  "final notice",
  "failure to verify",
  "account termination",
  "account will be closed",

  // Account & Security
  "account suspended",
  "temporarily suspended",
  "account locked",
  "unusual activity",
  "security alert",
  "verify your identity",
  "confirm your identity",
  "restore access",
  "reactivate your account",

  // Login & Credentials
  "login",
  "log in",
  "sign in",
  "password reset",
  "reset your password",
  "one time password",
  "otp",
  "verification code",

  // Click / Action Triggers
  "click here",
  "click the link",
  "click below",
  "verify now",
  "confirm now",

  // Financial / Banking
  "bank account",
  "credit card",
  "debit card",
  "payment failed",
  "transaction failed",
  "refund pending",
  "billing issue",

  // Government / Authority
  "government notice",
  "official notice",
  "lhdn",
  "hasil",
  "tax refund",
  "legal action",
  "court notice",

  // Delivery Scams
  "parcel delivery",
  "delivery failed",
  "courier service",
  "poslaju",
  "dhl",
  "fedex",
  "tracking number",

  // Rewards / Lures
  "you have won",
  "congratulations",
  "claim your reward",
  "free gift",
  "cash prize",

  // Job & Investment Scams
  "job offer",
  "work from home",
  "easy income",
  "investment opportunity",
  "guaranteed profit",

  // URLs & Social Engineering
  "secure login",
  "verify account",
  "do not share",
  "confidential",
  "trusted source"
];

const PHISHING_SIGNALS = {
  urgency: [
    "urgent",
    "immediate action required",
    "within 24 hours",
    "final notice",
    "act now"
  ],

  accountThreat: [
    "account suspended",
    "account locked",
    "account termination",
    "unusual activity",
    "security alert"
  ],

  actionRequest: [
    "click the link",
    "click here",
    "verify your identity",
    "confirm now",
    "restore access"
  ],

  credentialRequest: [
    "login",
    "sign in",
    "password reset",
    "otp",
    "verification code"
  ]
};

// Normalize extracted text
function normalizeExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[^\x20-\x7E]/g, "")
    .toLowerCase()
    .trim();
}

function extractUrls(text: string): string[] {
  // Fix common PDF parsing issues: "http://word - word" -> "http://word-word"
  const fixedText = text.replace(/(\w)\s+-\s+(\w)/g, '$1-$2');

  // Match URLs
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
  const urls = fixedText.match(urlRegex) || [];
  console.log("📧 Extracted URLs:", urls);
  return urls;
}

function detectKeywordsInText(text: string): string[] {
  return PHISHING_KEYWORDS.filter(keyword => {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const flexible = escaped.replace(/\s+/g, "[\\s\\W]+");
    return new RegExp(`\\b${flexible}\\b`, "i").test(text);
  });
}

function detectKeywords(text: string): { contentKeywords: string[], urlKeywords: string[], urls: string[] } {
  const urls = extractUrls(text);
  const textWithoutUrls = text.replace(/https?:\/\/[^\s]+/gi, '');

  const contentKeywords = detectKeywordsInText(textWithoutUrls);
  const urlKeywords = urls.length > 0 ? detectKeywordsInText(urls.join(' ')) : [];

  return {
    contentKeywords,
    urlKeywords,
    urls
  };
}

function detectSignals(text: string): string[] {
  // Remove URLs from text to avoid matching keywords in domain names
  const textWithoutUrls = text.replace(/https?:\/\/[^\s]+/gi, '');

  const signals: string[] = [];
  const has = (phrases: string[]) =>
    phrases.some(p => new RegExp(p, "i").test(textWithoutUrls));

  if (has(PHISHING_SIGNALS.urgency)) signals.push("Urgency detected");
  if (has(PHISHING_SIGNALS.accountThreat)) signals.push("Account threat detected");
  if (has(PHISHING_SIGNALS.actionRequest)) signals.push("Action request detected");
  if (has(PHISHING_SIGNALS.credentialRequest)) signals.push("Credential request detected");
  if (/https?:\/\/[^\s]+/i.test(text)) signals.push("Suspicious link detected");

  return signals;
}

function analyzeText(text: string, mode: "text" | "file") {
  const detectedSignals = detectSignals(text);
  const keywordAnalysis = detectKeywords(text);

  // Base score: signals worth 2 points each (since they're high-confidence patterns)
  // Content keywords worth 0.5 points each
  // URL keywords worth 0.3 points each (less weight since they're in URLs)
  let score = (detectedSignals.length * 2) +
              (keywordAnalysis.contentKeywords.length * 0.5) +
              (keywordAnalysis.urlKeywords.length * 0.3);

  // Bonus points for multiple signals (indicates sophisticated phishing attempt)
  if (detectedSignals.length >= 4) {
    score += 3; // Strong phishing indicator
  }
  if (detectedSignals.length === 5) {
    score += 2; // All signals present = very likely phishing
  }

  const isPhishing = score >= 3;

  const severity =
    score >= 12 ? "Critical" :
    score >= 8 ? "High" :
    score >= 3 ? "Medium" :
    "Low";

  return {
    detectedKeywords: [...detectedSignals, ...keywordAnalysis.contentKeywords],
    suspiciousPatterns: detectedSignals,
    urlKeywords: keywordAnalysis.urlKeywords,
    urls: keywordAnalysis.urls,
    isPhishing,
    riskScore: score,
    severity
  };
}

async function alreadyAnalyzed(auditId: string) {
  try {
    return await prisma.phishingAnalysis.findFirst({
      where: { auditId },
      select: { id: true }
    });
  } catch (error) {
    console.warn("Duplicate check failed:", error);
    return null; // Continue with analysis if check fails
  }
}

/* =======================
   TEXT ANALYSIS
======================= */

phishingRouter.post("/analyze-text", async (req: Request, res: Response) => {
  const { auditId, content, userId, skipDbSave } = req.body;

  console.log("📊 Phishing text analysis request:", {
    auditId,
    skipDbSave,
    skipDbSaveType: typeof skipDbSave,
    userId
  });

if (!auditId || !userId || !content?.trim()) {
  return res.status(400).json({
    errorCode: "INVALID_TEXT_ANALYSIS_REQUEST",
    message: "auditId, userId, and non-empty content are required"
  });
}


  try {
    const result = analyzeText(content.toLowerCase(), "text");

    // Only save to database if skipDbSave is false
    if (!skipDbSave) {
      console.log("💾 Saving phishing analysis to database for auditId:", auditId);

      // Create auditSession FIRST (required for foreign key)
      await prisma.auditSession.upsert({
        where: { id: auditId },
        update: {
          overallRiskScore: result.riskScore,
          severity: result.severity
        },
        create: {
          id: auditId,
          targetUrl: "phishing-analysis",
          overallRiskScore: result.riskScore,
          severity: result.severity,
          userId
        }
      });

      // Check if phishing analysis already exists for this audit
      const existing = await prisma.phishingAnalysis.findFirst({
        where: { auditId }
      });

      if (existing) {
        console.log("⚠️ PhishingAnalysis already exists, updating it");
        // Update existing record
        await prisma.phishingAnalysis.update({
          where: { id: existing.id },
          data: {
            detectedKeywords: result.detectedKeywords,
            isPhishing: result.isPhishing,
            riskScore: result.riskScore,
            suspiciousPatterns: result.suspiciousPatterns
          }
        });
      } else {
        console.log("✅ Creating new PhishingAnalysis record");
        // Create new record
        await prisma.phishingAnalysis.create({
          data: {
            auditId,
            detectedKeywords: result.detectedKeywords,
            isPhishing: result.isPhishing,
            riskScore: result.riskScore,
            suspiciousPatterns: result.suspiciousPatterns
          }
        });
      }
    } else {
      console.log("⏭️ Skipping database save (skipDbSave = true)");
    }

    res.json(result);
} catch (err: any) {
  console.error("❌ Phishing TEXT analysis error:", err);

  res.status(500).json({
    errorCode: "PHISHING_TEXT_ANALYSIS_FAILED",
    message: err.message || "Unknown text analysis error",
    details: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
}

});

/* =======================
   FILE ANALYSIS
======================= */

phishingRouter.post(
  "/analyze-file",
  upload.single("file"),
  async (req: Request, res: Response) => {
    const { auditId, userId, skipDbSave } = req.body;
    const file = req.file;

    console.log("📊 Phishing FILE analysis request:", {
      auditId,
      skipDbSave,
      skipDbSaveType: typeof skipDbSave,
      userId,
      fileName: file?.originalname
    });

    if (!auditId || !userId || !file) {
      return res.status(400).json({ message: "auditId, userId and file required" });
    }

    const shouldSkipDb = skipDbSave === "true" || skipDbSave === true;

    let extractedText = "";
    const ext = path.extname(file.originalname).toLowerCase();

    try {
      if ([".png", ".jpg", ".jpeg", ".gif"].includes(ext)) {
        // OCR for images with improved accuracy settings
        const ocr = await Tesseract.recognize(file.path, "eng", {
          logger: () => {}, // Disable verbose logging
        });
        extractedText = ocr.data.text;
      } else if (ext === ".pdf") {
        // Extract text from PDF (no OCR needed for text-based PDFs)
        const pdf = await parsePdf(file.path);
        extractedText = pdf.text || "";

        console.log("📄 Raw PDF text length:", extractedText.length);
        console.log("📄 Raw PDF text preview:", extractedText.substring(0, 500));

        // If PDF has no text, it might be scanned images
        // For production, you'd convert PDF pages to images first, then OCR
        if (!extractedText.trim()) {
          extractedText = "PDF contains no extractable text. For scanned PDFs, please convert to images first.";
        }
      } else {
        fs.unlinkSync(file.path);
        return res.status(400).json({ message: "Unsupported file type. Please use .txt, .pdf, .jpg, .jpeg, .png, or .gif files." });
      }

      const normalizedText = normalizeExtractedText(extractedText);
      console.log("🔄 Normalized text length:", normalizedText.length);
      console.log("🔄 Normalized text preview:", normalizedText.substring(0, 500));

      const result = analyzeText(normalizedText, "file");

      // Only save to database if skipDbSave is false
      if (!shouldSkipDb) {
        console.log("💾 Saving phishing FILE analysis to database for auditId:", auditId);

        // Create auditSession FIRST (required for foreign key)
        await prisma.auditSession.upsert({
          where: { id: auditId },
          update: {
            overallRiskScore: result.riskScore,
            severity: result.severity
          },
          create: {
            id: auditId,
            targetUrl: "phishing-analysis",
            overallRiskScore: result.riskScore,
            severity: result.severity,
            userId
          }
        });

        // Check if phishing analysis already exists for this audit
        const existing = await prisma.phishingAnalysis.findFirst({
          where: { auditId }
        });

        if (existing) {
          console.log("⚠️ PhishingAnalysis already exists, updating it");
          // Update existing record
          await prisma.phishingAnalysis.update({
            where: { id: existing.id },
            data: {
              detectedKeywords: result.detectedKeywords,
              isPhishing: result.isPhishing,
              riskScore: result.riskScore,
              suspiciousPatterns: result.suspiciousPatterns
            }
          });
        } else {
          console.log("✅ Creating new PhishingAnalysis record");
          // Create new record
          await prisma.phishingAnalysis.create({
            data: {
              auditId,
              detectedKeywords: result.detectedKeywords,
              isPhishing: result.isPhishing,
              riskScore: result.riskScore,
              suspiciousPatterns: result.suspiciousPatterns
            }
          });
        }
      } else {
        console.log("⏭️ Skipping database save for FILE (skipDbSave = true)");
      }

      res.json({
        ...result,
        extractedPreview: extractedText.slice(0, 300)
      });
} catch (err: any) {
  console.error("❌ Phishing FILE analysis error:", err);

  res.status(500).json({
    errorCode: "PHISHING_FILE_ANALYSIS_FAILED",
    message: err.message || "Unknown file analysis error",
    details: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
} finally {
      fs.unlinkSync(file.path);
    }
  }
);