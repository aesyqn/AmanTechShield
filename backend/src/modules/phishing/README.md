# Advanced Phishing Detection Backend

This module will power the **Advanced Phishing Detection** feature.

## Stack (free only)
- Node.js + Express + TypeScript
- `multer` (or similar) for file uploads
- `tesseract.js` for image OCR (open source)
- `pdf-parse` or `pdfjs-dist` for PDF text extraction

## Planned APIs
- `POST /api/phishing/analyze-text`
  - Body: `{ "content": string }`
  - Runs keyword, URL, and pattern checks; returns risk score and flags.
- `POST /api/phishing/analyze-file`
  - Multipart upload: one file field (email, image, or PDF).
  - Backend extracts text (OCR or PDF parsing), then reuses the same detection logic as `analyze-text`.

## Implementation Steps
1. Add middleware for JSON body and multipart file uploads.
2. Move your current keyword/URL/pattern logic from the frontend into a shared backend service.
3. Implement OCR/PDF extraction using free libraries only.
4. Return a response structure compatible with the frontend `detectPhishing` result (isPhishing, matches, urlMatches, suspiciousPatterns, risk).
5. Connect `phishingRouter` under `/api/phishing` in the Express app.
