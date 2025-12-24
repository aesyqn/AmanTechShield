# Intrusion Detection System (IDS) Backend

This module will power the **Intrusion Detection System (IDS)** feature.

## Stack (free only)
- Node.js + Express + TypeScript
- `multer` for file upload
- Optional: `csv-parse` / `fast-csv` for CSV logs

## Planned API
- `POST /api/ids/analyze-logs`
  - Accepts uploaded log file (CSV/TXT/LOG) or raw text in JSON.
  - Parses lines and applies rules for failed logins, unusual access, anomalies.

## Implementation Steps
1. Add file upload support and basic size limits.
2. Implement a log parsing service that produces an array of vulnerability-like findings.
3. Reuse the same `Vulnerability` shape used in the frontend for consistency.
4. Mount `idsRouter` under `/api/ids` in the Express app.
