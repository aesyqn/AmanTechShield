import React, { useState } from 'react';
import type { Vulnerability } from '../utils/vulnerabilityDetector';
import { StepIndicator } from '../components/StepIndicator';
import { FileUpload } from '../components/FileUpload';
import { analyzeIDSLogs, detectPenetrationVulnerabilities, calculateRiskScore } from '../utils/vulnerabilityDetector';
import { VulnerabilityList } from '../components/VulnerabilityList';
import { RiskScoreDisplay } from '../components/RiskScoreDisplay';
import { generatePDFReport, generatePDFHTML, downloadTextReport, downloadPDFReport } from '../utils/pdfGenerator';
import { AlertCircleIcon, CheckCircleIcon, DownloadIcon, ArrowRightIcon, ArrowLeftIcon, FileTextIcon } from 'lucide-react';
interface ScanningFlowProps {
  user: {
    id: string
    name: string;
    position: string;
  } | null;
  onComplete: () => void;
}
export function ScanningFlow({
  user,
  onComplete
}: ScanningFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [allVulnerabilities, setAllVulnerabilities] = useState<Vulnerability[]>([]);
  // Step 1: Penetration Test
  const [targetUrl, setTargetUrl] = useState('');
  const [penTestResults, setPenTestResults] = useState<Vulnerability[]>([]);
  const [penTestScanning, setPenTestScanning] = useState(false);
  // Step 2: Phishing Detection
  const [phishingContent, setPhishingContent] = useState('');
  const [phishingFile, setPhishingFile] = useState<File | null>(null);
  const [phishingResults, setPhishingResults] = useState<{
    isPhishing: boolean;
    matches: string[];
    risk: number;
    urlMatches: string[];
    urls: string[];
    suspiciousPatterns: string[];
  } | null>(null);
  const [phishingScanning, setPhishingScanning] = useState(false);
  const [phishingLocked, setPhishingLocked] = useState(false); // Lock after analysis
  const [phishingAuditId, setPhishingAuditId] = useState<string | null>(null); // Store audit ID for later DB save
  const [phishingAnalyzedContent, setPhishingAnalyzedContent] = useState<string>(''); // Store content that was analyzed
  // Step 3: IDS
  const [idsFile, setIdsFile] = useState<File | null>(null);
  const [idsResults, setIdsResults] = useState<Vulnerability[]>([]);
  const [idsScanning, setIdsScanning] = useState(false);
  // Step 4: Risk Scoring
  const [riskScore, setRiskScore] = useState<any>(null);
  const steps = ['Penetration Test', 'Phishing Detection', 'IDS Analysis', 'Risk Scoring', 'Recovery Plan'];
  const handlePenTest = () => {
    if (!targetUrl) {
      alert('Please enter a target URL');
      return;
    }
    setPenTestScanning(true);
    setTimeout(() => {
      const vulnerabilities = detectPenetrationVulnerabilities(targetUrl);
      setPenTestResults(vulnerabilities);
      setAllVulnerabilities(prev => [...prev, ...vulnerabilities]);
      setPenTestScanning(false);
    }, 2000);
  };

const handlePhishingTest = async () => {
  // ✅ Guard: must be logged in (DO NOT put this outside the function)
  if (!user) {
    alert("You must be logged in to run phishing analysis.");
    return;
  }

  // ✅ Check if user has ID (required after recent update)
  if (!user.id) {
    alert("Your session is outdated. Please log out and log back in to continue.");
    return;
  }

  // 🔒 Prevent re-analysis if already locked
  if (phishingLocked) {
    alert("Phishing analysis is complete and locked. Please proceed to the next step.");
    return;
  }

  if (!phishingContent && !phishingFile) {
    alert("Please enter content or upload a file");
    return;
  }

  setPhishingScanning(true);

  try {
    const auditId = crypto.randomUUID();
    let response: Response;

if (phishingFile instanceof File) {
      // ===== FILE → analyze-file =====
      const formData = new FormData();
      formData.append("auditId", auditId);
      formData.append("userId", user.id);
      formData.append("file", phishingFile);
      formData.append("skipDbSave", "true"); // Don't save to DB during analysis

      response = await fetch(
        "http://localhost:4000/api/phishing/analyze-file",
        {
          method: "POST",
          body: formData
        }
      );
    } else {
      // ===== TEXT → analyze-text =====
      response = await fetch(
        "http://localhost:4000/api/phishing/analyze-text",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            auditId,
            content: phishingContent,
            userId: user.id,
            skipDbSave: true  // Don't save to DB during analysis
          })
        }
      );
    }

    // ===== DEBUG-AWARE ERROR HANDLING =====
    if (!response.ok) {
      let errorData: any = null;

      try {
        errorData = await response.json();
      } catch (_) {}

      console.error("❌ Backend phishing error:", {
        status: response.status,
        statusText: response.statusText,
        errorData
      });

      throw new Error(
        errorData?.message ||
        errorData?.errorCode ||
        `Request failed with status ${response.status}`
      );
    }

    const result = await response.json();

    // ===== MAP BACKEND RESULT TO UI =====
    // Normalize risk score to 0-100% (max expected score is ~20 with bonuses)
    const normalizedRisk = Math.min((result.riskScore / 20) * 100, 100);

    // 🔒 Lock analysis after successful completion
    setPhishingLocked(true);
    setPhishingAuditId(auditId);

    // Store the content that was analyzed for later DB save
    if (phishingFile instanceof File) {
      // For files, store the extracted text preview if available
      setPhishingAnalyzedContent(result.extractedPreview || 'file-content');
    } else {
      // For text, store the actual content
      setPhishingAnalyzedContent(phishingContent);
    }

    setPhishingResults({
      isPhishing: result.isPhishing,
      matches: result.detectedKeywords || [],
      risk: normalizedRisk,
      urlMatches: result.urlKeywords || [],
      urls: result.urls || [],
      suspiciousPatterns: result.detectedKeywords || []
    });

    if (result.isPhishing) {
      const phishingVuln: Vulnerability = {
        id: `PHISH-${Date.now()}`,
        type: "Phishing Attempt Detected",
        severity: result.severity === "Critical" ? "high" : "medium",
        description: `Detected phishing indicators: ${result.detectedKeywords.join(", ")}`,
        technicalRisk: Math.min(result.riskScore, 5),
        ethicalRisk: 4,
        recommendation: "Block sender, report incident, educate users.",
        ethicalImplication:
          "Phishing violates trust and may lead to identity theft and financial harm."
      };

      setAllVulnerabilities(prev => [...prev, phishingVuln]);
    }

  } catch (err: any) {
    console.error("❌ Phishing detection failed:", err);

    alert(
      "Phishing analysis failed:\n\n" +
      (err.message || "Unknown error")
    );
  } finally {
    setPhishingScanning(false);
  }
};


  const handleIDSAnalysis = () => {
    if (!idsFile) {
      alert('Please upload a log file');
      return;
    }
    setIdsScanning(true);
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      setTimeout(() => {
        const vulnerabilities = analyzeIDSLogs(content);
        setIdsResults(vulnerabilities);
        setAllVulnerabilities(prev => [...prev, ...vulnerabilities]);
        setIdsScanning(false);
      }, 2000);
    };
    reader.readAsText(idsFile);
  };
  const calculateRisk = () => {
    const score = calculateRiskScore(allVulnerabilities);
    setRiskScore(score);
  };
  const handleDownloadTextReport = () => {
    if (!user) return;
    const report = generatePDFReport(allVulnerabilities, {
      name: user.name,
      position: user.position,
      date: new Date().toLocaleDateString()
    }, riskScore);
    downloadTextReport(report, `AmanTech_Shield_Security_Report_${Date.now()}.txt`);
  };
  const handleDownloadPDFReport = () => {
    if (!user) return;
    const htmlContent = generatePDFHTML(allVulnerabilities, {
      name: user.name,
      position: user.position,
      date: new Date().toLocaleDateString()
    }, riskScore);
    downloadPDFReport(htmlContent, `AmanTech_Shield_Security_Report_${Date.now()}.pdf`);
  };
  const nextStep = async () => {
    if (currentStep === 0 && penTestResults.length === 0) {
      alert('Please run the penetration test first');
      return;
    }
    if (currentStep === 1 && !phishingResults) {
      alert('Please run the phishing detection first');
      return;
    }

    // 💾 Save phishing analysis to database when moving from step 1 to step 2
    if (currentStep === 1 && phishingResults && phishingAuditId && user) {
      try {
        console.log("🔄 Attempting to save phishing analysis:", {
          auditId: phishingAuditId,
          contentLength: phishingAnalyzedContent.length,
          contentPreview: phishingAnalyzedContent.substring(0, 100),
          userId: user.id,
          skipDbSave: false
        });

        // Use stored analyzed content for save (works for both text and file)
        const response = await fetch(
          "http://localhost:4000/api/phishing/analyze-text",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              auditId: phishingAuditId,
              content: phishingAnalyzedContent,
              userId: user.id,
              skipDbSave: false  // Save to DB this time
            })
          }
        );

        if (!response.ok) {
          let errorData: any = null;
          try {
            errorData = await response.json();
          } catch (_) {}

          console.error("❌ Backend error during save:", {
            status: response.status,
            errorData
          });

          throw new Error(errorData?.message || `Save failed with status ${response.status}`);
        }

        console.log("✅ Phishing analysis saved to database");
      } catch (error: any) {
        console.error("❌ Failed to save phishing analysis:", error);
        alert(`Failed to save phishing analysis: ${error.message || 'Unknown error'}. Please try again.`);
        return; // Don't proceed to next step if save fails
      }
    }

    if (currentStep === 2 && idsResults.length === 0) {
      alert('Please run the IDS analysis first');
      return;
    }
    if (currentStep === 3 && !riskScore) {
      calculateRisk();
    }
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };
  return <div className="min-h-screen w-full py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Security <span className="text-cyan-400">Scanning Flow</span>
          </h1>
          <p className="text-gray-400">
            Complete all 5 steps to generate your comprehensive security report
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator steps={steps} currentStep={currentStep} />

        {/* Step Content */}
        <div className="glass p-8 rounded-2xl mb-8">
          {/* Step 1: Penetration Test */}
          {currentStep === 0 && <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Step 1: Penetration Test Simulation
                </h2>
                <p className="text-gray-400">
                  Enter your bank website URL to check for vulnerabilities like
                  weak passwords, missing SSL, and security misconfigurations.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Website URL
                </label>
                <input type="url" value={targetUrl} onChange={e => setTargetUrl(e.target.value)} placeholder="https://example-bank.com" className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors text-white" />
              </div>

              <button onClick={handlePenTest} disabled={penTestScanning || !targetUrl} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {penTestScanning ? <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Scanning for vulnerabilities...
                  </span> : 'Start Penetration Test'}
              </button>

              {penTestResults.length > 0 && <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">
                    Detected Vulnerabilities
                  </h3>
                  <VulnerabilityList vulnerabilities={penTestResults} />
                </div>}
            </div>}

          {/* Step 2: Phishing Detection */}
          {currentStep === 1 && <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Step 2: Phishing Detection
                </h2>
                <p className="text-gray-400">
                  Upload a suspicious email, image, or PDF, or paste content to
                  check for phishing indicators.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Content or Link {phishingLocked && <span className="text-red-400">(Locked)</span>}
                </label>
                <textarea
                  value={phishingContent}
                  onChange={e => {
                    if (phishingLocked) {
                      alert("Analysis is locked. You cannot modify the input.");
                      return;
                    }
                    if (phishingFile) {
                      alert("Please remove the uploaded file first to use text input.");
                      return;
                    }
                    setPhishingContent(e.target.value);
                  }}
                  placeholder="Paste suspicious email content or link here..."
                  rows={6}
                  disabled={phishingLocked || !!phishingFile}
                  className={`w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors text-white font-mono text-sm ${(phishingLocked || phishingFile) ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>

              <div className="text-center text-gray-400">OR</div>

              <FileUpload
                label={`Upload Email, Image, or PDF File ${phishingLocked ? '(Locked)' : ''}`}
                accept=".txt,.eml,.msg,.jpg,.jpeg,.png,.gif,.pdf"
                onFileSelect={(file) => {
                  if (phishingLocked) {
                    alert("Analysis is locked. You cannot modify the input.");
                    return;
                  }
                  if (phishingContent.trim()) {
                    alert("Please clear the text input first to upload a file.");
                    return;
                  }
                  setPhishingFile(file);
                }}
                selectedFile={phishingFile}
                onClear={() => {
                  if (phishingLocked) {
                    alert("Analysis is locked. You cannot remove the file.");
                    return;
                  }
                  setPhishingFile(null);
                }}
              />

              <button onClick={handlePhishingTest} disabled={phishingScanning || !phishingContent && !phishingFile} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {phishingScanning ? <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing content...
                  </span> : 'Analyze for Phishing'}
              </button>

              {phishingResults && <div className={`mt-8 p-6 rounded-xl border-2 ${phishingResults.isPhishing ? 'bg-red-500/10 border-red-500/50' : 'bg-green-500/10 border-green-500/50'}`}>
                  <div className="flex items-start space-x-4">
                    {phishingResults.isPhishing ? <AlertCircleIcon className="w-8 h-8 text-red-500 flex-shrink-0" /> : <CheckCircleIcon className="w-8 h-8 text-green-500 flex-shrink-0" />}
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-2 ${phishingResults.isPhishing ? 'text-red-400' : 'text-green-400'}`}>
                        {phishingResults.isPhishing ? 'Phishing Detected!' : 'Content Appears Safe'}
                      </h3>
                      <p className="text-gray-300 mb-4">
                        Risk Score:{' '}
                        <span className="font-bold">
                          {phishingResults.risk.toFixed(1)}%
                        </span>
                      </p>

                      {phishingResults.matches.length > 0 && <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-400 mb-2">
                            Content Keywords ({phishingResults.matches.length}
                            ):
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {phishingResults.matches.map((keyword, idx) => <span key={idx} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-mono">
                                {keyword}
                              </span>)}
                          </div>
                        </div>}

                      {phishingResults.urls.length > 0 && <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-400 mb-2">
                            Detected URLs ({phishingResults.urls.length}):
                          </p>
                          <div className="flex flex-col gap-2">
                            {phishingResults.urls.map((url, idx) => <div key={idx} className="px-3 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-lg text-sm font-mono break-all">
                                {url}
                              </div>)}
                          </div>
                        </div>}

                      {phishingResults.urlMatches.length > 0 && <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-400 mb-2">
                            Keywords Found in URLs (
                            {phishingResults.urlMatches.length}):
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {phishingResults.urlMatches.map((pattern, idx) => <span key={idx} className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">
                                {pattern}
                              </span>)}
                          </div>
                        </div>}

                      {phishingResults.suspiciousPatterns.length > 0 && <div>
                          <p className="text-sm font-semibold text-gray-400 mb-2">
                            Suspicious Patterns (
                            {phishingResults.suspiciousPatterns.length}):
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {phishingResults.suspiciousPatterns.map((pattern, idx) => <span key={idx} className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                                  {pattern}
                                </span>)}
                          </div>
                        </div>}
                    </div>
                  </div>
                </div>}
            </div>}

          {/* Step 3: IDS Analysis */}
          {currentStep === 2 && <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Step 3: Intrusion Detection System (IDS)
                </h2>
                <p className="text-gray-400">
                  Upload your system log files (CSV format) to detect abnormal
                  activities like failed logins, unusual access patterns, etc.
                </p>
              </div>

              <FileUpload label="Upload Log File (CSV)" accept=".csv,.txt,.log" onFileSelect={setIdsFile} selectedFile={idsFile} onClear={() => setIdsFile(null)} />

              <button onClick={handleIDSAnalysis} disabled={idsScanning || !idsFile} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {idsScanning ? <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing logs...
                  </span> : 'Analyze Log Files'}
              </button>

              {idsResults.length > 0 && <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Detected Anomalies</h3>
                  <VulnerabilityList vulnerabilities={idsResults} />
                </div>}
            </div>}

          {/* Step 4: Risk Scoring */}
          {currentStep === 3 && <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Step 4: Risk Scoring & Analysis
                </h2>
                <p className="text-gray-400">
                  Comprehensive risk assessment combining technical
                  vulnerabilities with ethical implications based on Islamic
                  principles.
                </p>
              </div>

              {riskScore ? <RiskScoreDisplay riskScore={riskScore} /> : <div className="text-center py-12">
                  <button onClick={calculateRisk} className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
                    Calculate Risk Score
                  </button>
                </div>}
            </div>}

          {/* Step 5: Recovery Plan */}
          {currentStep === 4 && <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Step 5: Recovery & Disclosure Plan
                </h2>
                <p className="text-gray-400">
                  Generate your comprehensive security report with ethical
                  disclosure policy and recovery steps.
                </p>
              </div>

              <div className="glass p-8 rounded-xl text-center">
                <div className="text-6xl mb-6">📄</div>
                <h3 className="text-2xl font-bold mb-4">Report Ready</h3>
                <p className="text-gray-300 mb-6">
                  Your comprehensive cybersecurity ethical disclosure report is
                  ready to download. This report includes all detected
                  vulnerabilities, risk scores, and detailed recovery plans
                  aligned with Islamic ethical principles.
                </p>

                <div className="space-y-4">
                  <button onClick={handleDownloadPDFReport} className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center space-x-2">
                    <DownloadIcon className="w-6 h-6" />
                    <span>Download as PDF</span>
                  </button>

                  <button onClick={handleDownloadTextReport} className="w-full py-4 border-2 border-cyan-500/50 rounded-lg font-semibold hover:bg-cyan-500/10 transition-all flex items-center justify-center space-x-2">
                    <FileTextIcon className="w-6 h-6" />
                    <span>Download as Text File</span>
                  </button>

                  <button onClick={onComplete} className="w-full py-4 border-2 border-gray-600 rounded-lg font-semibold hover:bg-gray-700/30 transition-all">
                    Return to Dashboard
                  </button>
                </div>
              </div>

              {/* Report Preview */}
              <div className="glass p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">Report Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      Total Vulnerabilities:
                    </span>
                    <span className="font-bold text-white">
                      {allVulnerabilities.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Overall Risk Score:</span>
                    <span className="font-bold text-cyan-400">
                      {riskScore?.overall.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Critical Issues:</span>
                    <span className="font-bold text-red-400">
                      {riskScore?.critical}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">High Priority Issues:</span>
                    <span className="font-bold text-orange-400">
                      {riskScore?.high}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Auditor:</span>
                    <span className="font-bold text-white">{user?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date:</span>
                    <span className="font-bold text-white">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button onClick={prevStep} disabled={currentStep === 0} className="px-6 py-3 border-2 border-cyan-500/50 rounded-lg font-semibold hover:bg-cyan-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center space-x-2">
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Previous</span>
          </button>

          {currentStep < steps.length - 1 && <button onClick={nextStep} className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center space-x-2">
              <span>Next Step</span>
              <ArrowRightIcon className="w-5 h-5" />
            </button>}
        </div>
      </div>
    </div>;
}