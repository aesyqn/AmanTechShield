-- ============================================
-- ALTERNATIVE: Simple RLS for All Authenticated Users
-- ============================================
-- Use this if you want ANY authenticated user to access ALL data
-- (Less secure, but simpler for internal team tools)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PenetrationTestResult" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PhishingAnalysis" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "IDSLab" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "IslamicEthicsEvaluation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecoveryPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditReport" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RiskScore" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SIMPLE POLICIES: Allow all authenticated users full access
-- ============================================

-- User table
CREATE POLICY "Authenticated users can manage users"
ON "User" FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- AuditSession table
CREATE POLICY "Authenticated users can manage audit sessions"
ON "AuditSession" FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- PenetrationTestResult table
CREATE POLICY "Authenticated users can manage pen test results"
ON "PenetrationTestResult" FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- PhishingAnalysis table
CREATE POLICY "Authenticated users can manage phishing analysis"
ON "PhishingAnalysis" FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- IDSLab table
CREATE POLICY "Authenticated users can manage IDS logs"
ON "IDSLab" FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- IslamicEthicsEvaluation table
CREATE POLICY "Authenticated users can manage ethics evaluations"
ON "IslamicEthicsEvaluation" FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- RecoveryPlan table
CREATE POLICY "Authenticated users can manage recovery plans"
ON "RecoveryPlan" FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- AuditReport table
CREATE POLICY "Authenticated users can manage audit reports"
ON "AuditReport" FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- RiskScore table
CREATE POLICY "Authenticated users can manage risk scores"
ON "RiskScore" FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- NOTES
-- ============================================
-- This approach:
-- ✅ Simple - one policy per table
-- ✅ Easy to understand
-- ✅ Good for internal team tools
-- ✅ All authenticated users can access all data
-- ❌ No data isolation between users
-- ❌ Less secure for multi-tenant applications

-- Use this if:
-- - Your team shares all audit data
-- - You trust all authenticated users
-- - It's an internal security tool

-- Use the main RLS file (database_rls_policies.sql) if:
-- - Users should only see their own audits
-- - You need multi-tenant data isolation
-- - Different users/teams need separated data
