# Recovery & Disclosure Plan Backend

This module will power the **Recovery & Disclosure Plan** feature (PDF/text reports, templates, ethical alignment, stakeholder guidance).

## Stack (free only)
- Node.js + Express + TypeScript
- `puppeteer` or `playwright` for HTML-to-PDF (open source)
- Optional: PostgreSQL + Prisma for storing templates

## Planned API
- `POST /api/reporting/generate`
  - Body: `{ vulnerabilities: Vulnerability[], auditor: { name, position, date }, riskScore: any }`
  - Returns: either a PDF file stream or a URL to download, plus optional text report.

## Implementation Steps
1. Move your existing `generatePDFReport` / `generatePDFHTML` logic into backend services.
2. Use `puppeteer`/`playwright` or `pdfkit` to generate an actual PDF server-side.
3. Optionally store generated reports and ethical templates in a DB.
4. Mount `reportingRouter` under `/api/reporting` in the Express app.
