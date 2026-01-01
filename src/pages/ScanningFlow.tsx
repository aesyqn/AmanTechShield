import { useEffect, useState } from 'react';
import { StepIndicator } from '../components/StepIndicator';
import { FileUpload } from '../components/FileUpload';
import { VulnerabilityList } from '../components/VulnerabilityList';
import { RiskScoreDisplay } from '../components/RiskScoreDisplay';
import { detectPenetrationVulnerabilities, calculateRiskScore, Vulnerability } from '../utils/vulnerabilityDetector';
import { generateRecoveryPlan, RecoveryPlanItem } from '../utils/recoveryPlan';
import { generatePDFReport, downloadTextReport } from '../utils/pdfGenerator';
import { AlertCircleIcon, CheckCircleIcon, DownloadIcon, ArrowRightIcon, ArrowLeftIcon, FileTextIcon } from 'lucide-react';

// ============================================
// BACKEND API CONFIGURATION
// ============================================
const API_URL = 'http://localhost:4000';

/**
 * ScanningFlow Component - 5-Step Security Assessment Flow
 * 
 * IMPORTANT: This is a SESSION-BASED component with database persistence.
 * - Frontend state is stored in React component state (memory only)
 * - Backend saves results to database via unified audit session
 * - Refreshing the page will RESET frontend state but data is saved in DB
 * - Users must complete all 5 steps in one session to download report
 * 
 * FLOW:
 * Step 1: Penetration Test → ✅ Backend API (saves to DB with auditId)
 * Step 2: Phishing Detection → ✅ Backend API (saves to DB with auditId)
 * Step 3: IDS Analysis → ✅ Backend API (saves to DB with auditId)
 * Step 4: Risk Scoring → ✅ Backend API (calculates & saves to DB with auditId)
 * Step 5: Recovery Plan → ✅ Backend API (generates plan & PDF from DB)
 * 
 * Each step must be completed before proceeding to the next.
 */

interface ScanningFlowProps {
  user: {
    id: string;
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
  
  // ============================================
  // 🔑 UNIFIED SESSION MANAGEMENT
  // ============================================
  const [sessionAuditId, setSessionAuditId] = useState<string | null>(null);
  
  // Step 1: Penetration Test
  const [targetUrl, setTargetUrl] = useState('');
  const [penTestResults, setPenTestResults] = useState<Vulnerability[]>([]);
  const [penTestScanning, setPenTestScanning] = useState(false);
  const [penTestError, setPenTestError] = useState<string>('');
  
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
  
  // Step 5: Recovery Plan
  const [recoveryPlan, setRecoveryPlan] = useState<RecoveryPlanItem[]>([]);
  const [recoveryGenerating, setRecoveryGenerating] = useState(false);
  
  const steps = ['Penetration Test', 'Phishing Detection', 'IDS Analysis', 'Risk Scoring', 'Recovery Plan'];

  // ============================================
  // 🔑 CREATE UNIFIED AUDIT SESSION ON MOUNT
  // ============================================
  useEffect(() => {
    const createUnifiedSession = async () => {
      if (!user || sessionAuditId) return; // Already created or no user
      
      try {
        console.log('🔐 Creating unified audit session for user:', user.id);
        
        const response = await fetch(`${API_URL}/api/audit/create-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: user.id,
            targetUrl: 'pending' // Will be updated in Step 1
          })
        });

        if (!response.ok) {
          throw new Error('Failed to create audit session');
        }

        const data = await response.json();
        setSessionAuditId(data.auditId);
        console.log('✅ Unified session created:', data.auditId);
        console.log('   All 5 steps will use this same audit ID');
      } catch (error) {
        console.error('❌ Failed to create session:', error);
        // Don't block - frontend will still work, just won't save to DB properly
      }
    };

    createUnifiedSession();
  }, [user, sessionAuditId]);

  // ============================================
  // SESSION MANAGEMENT - No Persistence
  // ============================================
  useEffect(() => {
    // Warn user that refreshing will lose progress
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentStep > 0 || penTestResults.length > 0 || phishingResults || idsResults.length > 0) {
        e.preventDefault();
        e.returnValue = 'You have unsaved progress. If you leave, you will need to start over.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentStep, penTestResults, phishingResults, idsResults]);

  // Show session info on first load
  useEffect(() => {
    console.log('🔐 Session-based scanning flow initialized');
    console.log('⚠️ Progress will be lost if you refresh or close this page');
  }, []);

  // ============================================
  // UPDATED: Penetration Test with Backend
  // ============================================
  const handlePenTest = async () => {
    if (!user || !user.id) {
      alert('You must be logged in to perform a penetration test');
      return;
    }

    if (!targetUrl) {
      alert('Please enter a target URL');
      return;
    }

    if (!sessionAuditId) {
      alert('Session not initialized. Please refresh the page.');
      return;
    }

    setPenTestScanning(true);
    setPenTestError('');

    try {
      // Check if backend is available
      const healthResponse = await fetch(`${API_URL}/api/pen-test/health`, {
        method: 'GET',
      }).catch(() => null);

      if (!healthResponse || !healthResponse.ok) {
        // Backend not available - use frontend fallback
        console.warn('⚠️ Backend unavailable, using frontend simulation');
        setTimeout(() => {
          const vulnerabilities = detectPenetrationVulnerabilities(targetUrl);
          setPenTestResults(vulnerabilities);
          setAllVulnerabilities(prev => [...prev, ...vulnerabilities]);
          setPenTestScanning(false);
        }, 2000);
        return;
      }

      // Backend available - use real API with sessionAuditId
      console.log('🔗 Using backend API for penetration test');
      console.log('👤 User:', user.name, '| ID:', user.id);
      console.log('🔑 Session Audit ID:', sessionAuditId);
            
      const response = await fetch(`${API_URL}/api/pen-test/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: targetUrl, 
          userId: user.id,
          auditId: sessionAuditId // Use existing session!
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Scan failed' }));
        // Handle authentication error
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Set results from backend
      setPenTestResults(result.vulnerabilities);
      setAllVulnerabilities(prev => [...prev, ...result.vulnerabilities]);
      
      console.log('✅ Backend scan complete:', result.summary);
      console.log('📋 Audit ID:', result.auditId);
      console.log('💾 Database:', result.database);

      // Show success message if saved to database
      if (result.database && result.database.saved > 0) {
        console.log(`✅ Saved ${result.database.saved} vulnerabilities to database`);
      }
      
    } catch (error) {
      console.error('❌ Scan error:', error);
      setPenTestError(error instanceof Error ? error.message : 'Unknown error occurred');
      // Show user-friendly error
      if (error instanceof Error && error.message.includes('Authentication')) {
        alert('Your session has expired. Please log in again.');
      } else {
        alert(`Scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setPenTestScanning(false);
    }
  };

  // ============================================
  // UPDATED: Phishing Detection with Backend
  // ============================================
  const handlePhishingTest = async () => {
    // ✅ Guard: must be logged in
    if (!user) {
      alert("You must be logged in to run phishing analysis.");
      return;
    }

    // ✅ Check if user has ID (required after recent update)
    if (!user.id) {
      alert("Your session is outdated. Please log out and log back in to continue.");
      return;
    }

    // ✅ Check if session exists
    if (!sessionAuditId) {
      alert("Session not initialized. Please refresh the page.");
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
      let response: Response;

      if (phishingFile instanceof File) {
        // ===== FILE → analyze-file =====
        const formData = new FormData();
        formData.append("auditId", sessionAuditId); // Use session audit ID!
        formData.append("userId", user.id);
        formData.append("file", phishingFile);
        formData.append("skipDbSave", "true"); // Don't save to DB during analysis

        response = await fetch(
          `${API_URL}/api/phishing/analyze-file`,
          {
            method: "POST",
            body: formData
          }
        );
      } else {
        // ===== TEXT → analyze-text =====
        response = await fetch(
          `${API_URL}/api/phishing/analyze-text`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              auditId: sessionAuditId, // Use session audit ID!
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
      setPhishingAuditId(sessionAuditId); // Store session audit ID for later save

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

  // ============================================
  // UPDATED: IDS Analysis with Backend API
  // ============================================
  const handleIDSAnalysis = async () => {
    if (!idsFile) {
      alert('Please upload a log file');
      return;
    }
    
    if (!user || !sessionAuditId) {
      alert('Session not initialized. Please refresh and try again.');
      return;
    }
    
    setIdsScanning(true);
    
    try {
      console.log('📤 Uploading IDS log file to backend...');
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', idsFile);  // Backend expects 'file' field
      formData.append('auditId', sessionAuditId);
      
      const response = await fetch(`${API_URL}/api/ids/analyze-logs`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        let errorData: any = null;
        try {
          errorData = await response.json();
        } catch (_) {}
        
        console.error('❌ IDS backend error:', {
          status: response.status,
          errorData
        });
        
        throw new Error(errorData?.message || `Request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ IDS analysis complete:', result);
      
      // Map backend findings to frontend vulnerability format
      const vulnerabilities: Vulnerability[] = result.findings?.map((finding: any) => ({
        id: finding.id || `IDS-${Date.now()}-${Math.random()}`,
        type: finding.title || finding.type || 'IDS Finding',
        severity: (finding.severity?.toLowerCase() || 'medium') as 'critical' | 'high' | 'medium' | 'low',
        description: finding.description || 'IDS anomaly detected',
        technicalRisk: finding.technicalRisk || 3,
        ethicalRisk: finding.ethicalRisk || 2,
        recommendation: finding.recommendation || 'Review logs and investigate',
        ethicalImplication: finding.ethicalImplication || 'Potential security breach may harm user trust'
      })) || [];
      
      setIdsResults(vulnerabilities);
      setAllVulnerabilities(prev => [...prev, ...vulnerabilities]);
      
    } catch (err: any) {
      console.error('❌ IDS analysis failed:', err);
      alert(
        'IDS analysis failed:\n\n' +
        (err.message || 'Unknown error')
      );
    } finally {
      setIdsScanning(false);
    }
  };

  // ============================================
  // UPDATED: Risk Calculation with Backend API
  // ============================================
  const calculateRisk = async () => {
    if (!sessionAuditId) {
      // Fallback to frontend calculation if no session
      const score = calculateRiskScore(allVulnerabilities);
      setRiskScore(score);
      return;
    }
    
    try {
      console.log('📊 Calculating risk score via backend...');
      
      const response = await fetch(`${API_URL}/api/risk/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditId: sessionAuditId })
      });
      
      if (!response.ok) {
        let errorData: any = null;
        try {
          errorData = await response.json();
        } catch (_) {}
        
        console.error('❌ Risk calculation backend error:', {
          status: response.status,
          errorData
        });
        
        // Fallback to frontend calculation
        console.log('⚠️ Falling back to frontend calculation');
        const score = calculateRiskScore(allVulnerabilities);
        setRiskScore(score);
        return;
      }
      
      const result = await response.json();
      console.log('✅ Risk score calculated:', result);
      
      // Calculate Islamic ethics evaluation
      try {
        console.log('🕌 Evaluating Islamic ethics...');
        const ethicsResponse = await fetch(`${API_URL}/api/ethics/evaluate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ auditId: sessionAuditId })
        });
        
        if (ethicsResponse.ok) {
          const ethicsResult = await ethicsResponse.json();
          console.log('✅ Islamic ethics evaluated:', ethicsResult);
        }
      } catch (ethicsErr) {
        console.error('⚠️ Ethics evaluation failed (non-critical):', ethicsErr);
      }
      
      // Map backend result to frontend format
      setRiskScore({
        overall: result.overall_score || 0,
        technical: result.technical_score || 0,
        ethical: result.ethical_score || 0,
        totalVulnerabilities: allVulnerabilities.length,
        critical: result.severity_counts?.critical || 0,
        high: result.severity_counts?.high || 0,
        medium: result.severity_counts?.medium || 0,
        low: result.severity_counts?.low || 0,
        summary: result.summary || 'Risk assessment complete'
      });
      
    } catch (err: any) {
      console.error('❌ Risk calculation failed:', err);
      // Fallback to frontend calculation
      console.log('⚠️ Falling back to frontend calculation');
      const score = calculateRiskScore(allVulnerabilities);
      setRiskScore(score);
    }
  };

  const handleGenerateRecoveryPlan = async () => {
    if (!riskScore || allVulnerabilities.length === 0 || !sessionAuditId) return;
    
    setRecoveryGenerating(true);
    
    try {
      console.log('📋 Generating AI-powered recovery plan...');
      
      const response = await fetch(`${API_URL}/api/reporting/generate-recovery-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          auditId: sessionAuditId,
          useAI: true  // Enable AI-powered recovery plan generation
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate recovery plan');
      }
      
      const result = await response.json();
      console.log('✅ AI recovery plan generated:', result);
      
      setRecoveryPlan(result.recoveryPlan.items || []);
      
    } catch (error: any) {
      console.error('❌ Failed to generate recovery plan:', error);
      // Fallback to frontend generation
      console.log('⚠️ Falling back to frontend generation');
      const plan = generateRecoveryPlan(allVulnerabilities, riskScore);
      setRecoveryPlan(plan);
    } finally {
      setRecoveryGenerating(false);
    }
  };
  
  const handleDownloadTextReport = async () => {
    if (!user || !sessionAuditId) {
      alert('Session not initialized. Please complete the assessment.');
      return;
    }

    try {
      console.log('📄 Fetching audit data for text report...');
      
      // Fetch complete audit data including recovery plan
      const response = await fetch(`${API_URL}/api/reporting/audit/${sessionAuditId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch audit data');
      }
      
      const { audit } = await response.json();
      
      console.log('✅ Audit data fetched:', {
        hasRecoveryPlan: !!audit.recoveryPlan,
        hasActionSteps: !!audit.recoveryPlan?.actionSteps,
        actionStepsPreview: audit.recoveryPlan?.actionSteps?.substring(0, 100)
      });
      
      // Generate text report with actual recovery plan data
      const report = generatePDFReport(
        allVulnerabilities, 
        {
          name: user.name,
          position: user.position,
          date: new Date().toLocaleDateString()
        }, 
        riskScore,
        audit.recoveryPlan // Pass recovery plan from database
      );
      
      downloadTextReport(report, `AmanTech_Shield_Security_Report_${Date.now()}.txt`);
      console.log('✅ Text report downloaded successfully');
      
    } catch (error: any) {
      console.error('❌ Failed to download text report:', error);
      
      // Fallback to local data if backend fetch fails
      const report = generatePDFReport(allVulnerabilities, {
        name: user.name,
        position: user.position,
        date: new Date().toLocaleDateString()
      }, riskScore);
      downloadTextReport(report, `AmanTech_Shield_Security_Report_${Date.now()}.txt`);
    }
  };
  
  const handleDownloadPDFReport = async () => {
    if (!user || !sessionAuditId) {
      alert('Session not initialized. Please complete the assessment.');
      return;
    }
    
    try {
      console.log('📄 Downloading PDF report from backend...');
      
      const response = await fetch(`${API_URL}/api/reporting/generate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditId: sessionAuditId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      // Get PDF blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AmanTech_Security_Report_${sessionAuditId.substring(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('✅ PDF downloaded successfully');
      
    } catch (error: any) {
      console.error('❌ Failed to download PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    }
  };
  
  const nextStep = async () => {
    // Step 0: Penetration Test validation
    if (currentStep === 0 && !sessionAuditId) {
      alert('⚠️ Please complete the penetration test before proceeding to the next step.');
      return;
    }
    
    // Step 1: Phishing Detection validation
    if (currentStep === 1 && !phishingResults) {
      alert('⚠️ Please complete the phishing detection analysis before proceeding to the next step.');
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
          `${API_URL}/api/phishing/analyze-text`,
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

    // Step 2: IDS Analysis validation
    if (currentStep === 2 && idsResults.length === 0) {
      alert('⚠️ Please complete the IDS analysis before proceeding to the next step.');
      return;
    }
    
    // Step 3: Risk Scoring - auto-calculate if not done
    if (currentStep === 3) {
      if (!riskScore) {
        calculateRisk();
      }
      // Wait a moment for calculation to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    if (currentStep === 4 && riskScore && !recoveryPlan.length && !recoveryGenerating) {
      handleGenerateRecoveryPlan();
    }
  }, [currentStep, riskScore, recoveryPlan.length, recoveryGenerating]);

  return <div className="min-h-screen w-full py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Session Warning Banner */}
        {(currentStep > 0 || penTestResults.length > 0 || phishingResults || idsResults.length > 0) && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-yellow-200 font-medium">Session Active - Progress Not Saved</p>
                <p className="text-xs text-yellow-300/70">Your progress will be lost if you refresh or close this page. Complete all steps to download your report.</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Security <span className="text-cyan-400">Scanning Flow</span>
          </h1>
          <p className="text-gray-400">
            Complete all 5 steps to generate your comprehensive security report
          </p>
          
          {/* Progress Summary */}
          <div className="mt-4 flex justify-center gap-2 text-xs">
            <span className={`px-3 py-1 rounded-full ${penTestResults.length > 0 ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-gray-500'}`}>
              {penTestResults.length > 0 ? '✓' : '○'} Step 1
            </span>
            <span className={`px-3 py-1 rounded-full ${phishingResults ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-gray-500'}`}>
              {phishingResults ? '✓' : '○'} Step 2
            </span>
            <span className={`px-3 py-1 rounded-full ${idsResults.length > 0 ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-gray-500'}`}>
              {idsResults.length > 0 ? '✓' : '○'} Step 3
            </span>
            <span className={`px-3 py-1 rounded-full ${riskScore ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-gray-500'}`}>
              {riskScore ? '✓' : '○'} Step 4
            </span>
            <span className={`px-3 py-1 rounded-full ${recoveryPlan.length > 0 ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-gray-500'}`}>
              {recoveryPlan.length > 0 ? '✓' : '○'} Step 5
            </span>
          </div>
        </div>

        {/* Step Indicator */}
        <StepIndicator steps={steps} currentStep={currentStep} />

        {/* Step Content */}
        <div className="glass p-8 rounded-2xl mb-8">
          {/* ============================================ */}
          {/* Step 1: Penetration Test - UPDATED */}
          {/* ============================================ */}
          {currentStep === 0 && <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Step 1: Penetration Test
                </h2>
                <p className="text-gray-400">
                  Enter a website URL to check for security vulnerabilities including SSL/TLS, 
                  security headers, authentication issues, and potential information disclosure.
                </p>
                <div className="mt-2 flex items-center space-x-2 text-sm">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">
                    ✓ Backend Connected
                  </span>
                  <span className="text-gray-500">
                    Real-time security analysis
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Website URL
                </label>
                <input type="url" value={targetUrl} onChange={e => setTargetUrl(e.target.value)} placeholder="https://example.com" className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors text-white" />
                {penTestError && (
                  <p className="mt-2 text-sm text-red-400">
                    ⚠️ {penTestError}
                  </p>
                )}
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
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Detected Vulnerabilities</h3>
                    <span className="text-sm text-gray-400">
                      Found {penTestResults.length} issue{penTestResults.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <VulnerabilityList vulnerabilities={penTestResults} />
                </div>}

              {!penTestScanning && penTestResults.length === 0 && targetUrl && sessionAuditId && (
                <div className="mt-8 p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="text-5xl">🛡️</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-green-400 mb-2">Security Status: SAFE</h3>
                      <p className="text-gray-300 mb-3">All security checks passed! No vulnerabilities detected.</p>
                      <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex items-center space-x-2">
                          <span className="text-green-400">✓</span>
                          <span>SSL/TLS encryption verified</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-green-400">✓</span>
                          <span>Security headers properly configured</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-green-400">✓</span>
                          <span>No critical vulnerabilities detected</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>}

          {/* ============================================ */}
          {/* Step 2: Phishing Detection - UPDATED */}
          {/* ============================================ */}
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
                <div className="mt-2 flex items-center space-x-2 text-sm">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">
                    ✓ Backend Connected
                  </span>
                  <span className="text-gray-500">
                    AI-powered log analysis
                  </span>
                </div>
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
                <div className="mt-2 flex items-center space-x-2 text-sm">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">
                    ✓ Backend Connected
                  </span>
                  <span className="text-gray-500">
                    Islamic ethics integration (Amanah & Maslahah)
                  </span>
                </div>
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
                <div className="mt-2 flex items-center space-x-2 text-sm">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">
                    ✓ Backend Connected
                  </span>
                  <span className="text-gray-500">
                    PDF generation from database
                  </span>
                </div>
              </div>

              {/* AI-style Recovery Plan Generation */}
              <div className="glass p-6 rounded-xl mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">AI-Assisted Recovery Plan</h3>
                    <p className="text-gray-400 text-sm">
                      Suggested remediation actions generated from detected vulnerabilities and risk scores.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateRecoveryPlan}
                    disabled={recoveryGenerating || !riskScore || allVulnerabilities.length === 0}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-cyan-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {recoveryGenerating ? (
                      <>
                        <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <span>Generate Recovery Plan</span>
                      </>
                    )}
                  </button>
                </div>

                {recoveryPlan.length === 0 && !recoveryGenerating && (
                  <p className="text-gray-400 text-sm">
                    No recovery plan has been generated yet. Click the button above to generate suggested actions.
                  </p>
                )}

                {recoveryPlan.length > 0 && (
                  <div className="grid md:grid-cols-3 gap-4 mt-4 text-left">
                    {(['immediate', 'short_term', 'long_term'] as const).map(phase => {
                      const items = recoveryPlan.filter(item => item.phase === phase);
                      if (!items.length) return null;
                      const titleMap: Record<typeof phase, string> = {
                        immediate: 'Immediate (0-24 hours)',
                        short_term: 'Short-term (1-7 days)',
                        long_term: 'Long-term (1-3 months)',
                      } as const;
                      return (
                        <div key={phase} className="bg-gray-900/40 border border-gray-700 rounded-lg p-4">
                          <h4 className="text-sm font-semibold mb-3 text-cyan-300">
                            {titleMap[phase]}
                          </h4>
                          <ul className="space-y-3 text-sm text-gray-300">
                            {items.map(item => (
                              <li key={item.id} className="border-l-2 border-cyan-500/60 pl-3">
                                <p className="font-semibold mb-1">{item.title}</p>
                                <p className="text-gray-400 text-xs mb-1">{item.description}</p>
                                {item.stakeholders.length > 0 && (
                                  <p className="text-[11px] text-gray-500">
                                    Stakeholders: {item.stakeholders.join(', ')}
                                  </p>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                )}
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
                  <button 
                    onClick={handleDownloadPDFReport} 
                    disabled={recoveryGenerating}
                    className={`w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center space-x-2 ${
                      recoveryGenerating ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <DownloadIcon className="w-6 h-6" />
                    <span>{recoveryGenerating ? 'AI Generating...' : 'Download as PDF'}</span>
                  </button>

                  <button 
                    onClick={handleDownloadTextReport} 
                    disabled={recoveryGenerating}
                    className={`w-full py-4 border-2 border-cyan-500/50 rounded-lg font-semibold hover:bg-cyan-500/10 transition-all flex items-center justify-center space-x-2 ${
                      recoveryGenerating ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <FileTextIcon className="w-6 h-6" />
                    <span>{recoveryGenerating ? 'AI Generating...' : 'Download as Text File'}</span>
                  </button>

                  <button 
                    onClick={() => {
                      const hasProgress = currentStep > 0 || penTestResults.length > 0 || phishingResults || idsResults.length > 0;
                      if (hasProgress) {
                        const confirmed = window.confirm(
                          'Are you sure you want to return to the dashboard?\n\n' +
                          'This will end your current session and you will need to start over if you want to run another scan.'
                        );
                        if (confirmed) {
                          onComplete();
                        }
                      } else {
                        onComplete();
                      }
                    }}
                    className="w-full py-4 border-2 border-gray-600 rounded-lg font-semibold hover:bg-gray-700/30 transition-all"
                  >
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