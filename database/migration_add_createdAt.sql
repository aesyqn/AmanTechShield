-- Migration: Add createdAt timestamps to all tables
-- Date: 2026-01-01
-- Description: Add createdAt columns for better tracking and remove unused AuditReport table

-- Add createdAt to PenetrationTestResult
ALTER TABLE "public"."PenetrationTestResult" 
ADD COLUMN IF NOT EXISTS "createdAt" timestamp with time zone DEFAULT now();

-- Add createdAt to PhishingAnalysis
ALTER TABLE "public"."PhishingAnalysis" 
ADD COLUMN IF NOT EXISTS "createdAt" timestamp with time zone DEFAULT now();

-- Add createdAt to IslamicEthicsEvaluation
ALTER TABLE "public"."IslamicEthicsEvaluation" 
ADD COLUMN IF NOT EXISTS "createdAt" timestamp with time zone DEFAULT now();

-- Add createdAt to RecoveryPlan
ALTER TABLE "public"."RecoveryPlan" 
ADD COLUMN IF NOT EXISTS "createdAt" timestamp with time zone DEFAULT now();

-- Drop AuditReport table if exists (not being used)
DROP TABLE IF EXISTS "public"."AuditReport" CASCADE;

-- Remove severityLabel column if it exists (not in Prisma schema)
ALTER TABLE "public"."PenetrationTestResult" 
DROP COLUMN IF EXISTS "severityLabel";

-- Success message
SELECT 'Migration completed successfully!' AS status;
