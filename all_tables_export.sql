


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."SeverityLabel" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);


ALTER TYPE "public"."SeverityLabel" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."AuditSession" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "userId" "uuid" NOT NULL,
    "targetUrl" "text" NOT NULL,
    "overallRiskScore" double precision,
    "severity" "text",
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."AuditSession" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."IDSLab" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auditId" "uuid" NOT NULL,
    "anomaliesFound" "text",
    "failedAttempts" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."IDSLab" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."IslamicEthicsEvaluation" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auditId" "uuid" NOT NULL,
    "amanahScore" double precision,
    "maslahahScore" double precision,
    "complianceLevel" "text",
    "createdAt" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."IslamicEthicsEvaluation" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."PenetrationTestResult" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auditId" "uuid" NOT NULL,
    "vulnerabilityType" "text" NOT NULL,
    "technicalRisk" integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "PenetrationTestResult_technicalRisk_check" CHECK ((("technicalRisk" >= 1) AND ("technicalRisk" <= 5)))
);


ALTER TABLE "public"."PenetrationTestResult" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."PhishingAnalysis" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auditId" "uuid" NOT NULL,
    "detectedKeywords" "text"[],
    "isPhishing" boolean DEFAULT false NOT NULL,
    "riskScore" double precision,
    "suspiciousPatterns" "text"[],
    "createdAt" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."PhishingAnalysis" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."RecoveryPlan" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auditId" "uuid" NOT NULL,
    "actionSteps" "text",
    "disclosurePolicy" "text",
    "createdAt" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."RecoveryPlan" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."User" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "password" "text" NOT NULL,
    "position" "text" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."User" OWNER TO "postgres";


ALTER TABLE ONLY "public"."AuditSession"
    ADD CONSTRAINT "AuditSession_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."IDSLab"
    ADD CONSTRAINT "IDSLab_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."IslamicEthicsEvaluation"
    ADD CONSTRAINT "IslamicEthicsEvaluation_auditId_key" UNIQUE ("auditId");



ALTER TABLE ONLY "public"."IslamicEthicsEvaluation"
    ADD CONSTRAINT "IslamicEthicsEvaluation_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."PenetrationTestResult"
    ADD CONSTRAINT "PenetrationTestResult_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."PhishingAnalysis"
    ADD CONSTRAINT "PhishingAnalysis_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."RecoveryPlan"
    ADD CONSTRAINT "RecoveryPlan_auditId_key" UNIQUE ("auditId");



ALTER TABLE ONLY "public"."RecoveryPlan"
    ADD CONSTRAINT "RecoveryPlan_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."User"
    ADD CONSTRAINT "User_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."AuditSession"
    ADD CONSTRAINT "AuditSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."IDSLab"
    ADD CONSTRAINT "IDSLab_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "public"."AuditSession"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."IslamicEthicsEvaluation"
    ADD CONSTRAINT "IslamicEthicsEvaluation_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "public"."AuditSession"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."PenetrationTestResult"
    ADD CONSTRAINT "PenetrationTestResult_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "public"."AuditSession"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."PhishingAnalysis"
    ADD CONSTRAINT "PhishingAnalysis_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "public"."AuditSession"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."RecoveryPlan"
    ADD CONSTRAINT "RecoveryPlan_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "public"."AuditSession"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE "public"."AuditReport" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";








































































































































































GRANT ALL ON TABLE "public"."AuditReport" TO "anon";
GRANT ALL ON TABLE "public"."AuditReport" TO "authenticated";
GRANT ALL ON TABLE "public"."AuditReport" TO "service_role";



GRANT ALL ON TABLE "public"."AuditSession" TO "anon";
GRANT ALL ON TABLE "public"."AuditSession" TO "authenticated";
GRANT ALL ON TABLE "public"."AuditSession" TO "service_role";



GRANT ALL ON TABLE "public"."IDSLab" TO "anon";
GRANT ALL ON TABLE "public"."IDSLab" TO "authenticated";
GRANT ALL ON TABLE "public"."IDSLab" TO "service_role";



GRANT ALL ON TABLE "public"."IslamicEthicsEvaluation" TO "anon";
GRANT ALL ON TABLE "public"."IslamicEthicsEvaluation" TO "authenticated";
GRANT ALL ON TABLE "public"."IslamicEthicsEvaluation" TO "service_role";



GRANT ALL ON TABLE "public"."PenetrationTestResult" TO "anon";
GRANT ALL ON TABLE "public"."PenetrationTestResult" TO "authenticated";
GRANT ALL ON TABLE "public"."PenetrationTestResult" TO "service_role";



GRANT ALL ON TABLE "public"."PhishingAnalysis" TO "anon";
GRANT ALL ON TABLE "public"."PhishingAnalysis" TO "authenticated";
GRANT ALL ON TABLE "public"."PhishingAnalysis" TO "service_role";



GRANT ALL ON TABLE "public"."RecoveryPlan" TO "anon";
GRANT ALL ON TABLE "public"."RecoveryPlan" TO "authenticated";
GRANT ALL ON TABLE "public"."RecoveryPlan" TO "service_role";



GRANT ALL ON TABLE "public"."User" TO "anon";
GRANT ALL ON TABLE "public"."User" TO "authenticated";
GRANT ALL ON TABLE "public"."User" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































