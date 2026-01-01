# AI-Powered Recovery Plan - Setup Guide

## ✅ What I've Done

I've integrated Google Gemini AI to generate intelligent, context-aware recovery plans!

### Files Created/Modified:

1. **`backend/src/modules/reporting/ai-recovery.service.ts`** (NEW)
   - AI-powered recovery plan generation using Gemini
   - Automatic fallback to rule-based if AI fails
   - Smart prompt engineering with Islamic ethics integration

2. **`backend/src/modules/reporting/reporting.controller.ts`** (UPDATED)
   - Added `useAI` parameter to choose AI or rule-based generation
   - Integrated AI service with error handling

3. **`.env`** (UPDATED)
   - Added your Gemini API key

---

## 📦 Installation Steps

### Step 1: Install Gemini SDK

```bash
npm install @google/generative-ai
```

### Step 2: Restart Backend

```bash
npm run backend:dev
```

---

## 🚀 How to Use

### Option 1: Enable AI in Frontend

Update `ScanningFlow.tsx` where recovery plan is generated:

```typescript
const handleGenerateRecoveryPlan = async () => {
  // ... existing code ...
  
  const response = await fetch(`${API_URL}/api/reporting/generate-recovery-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      auditId: sessionAuditId,
      useAI: true  // ← Add this to enable AI
    })
  });
  
  // ... rest of code ...
};
```

### Option 2: Test with cURL

```bash
# AI-powered (recommended)
curl -X POST http://localhost:4000/api/reporting/generate-recovery-plan \
  -H "Content-Type: application/json" \
  -d '{"auditId": "your-audit-id", "useAI": true}'

# Rule-based (fallback)
curl -X POST http://localhost:4000/api/reporting/generate-recovery-plan \
  -H "Content-Type: application/json" \
  -d '{"auditId": "your-audit-id", "useAI": false}'
```

---

## 🤖 What AI Does

The AI generates:

### 1. **Smart Action Steps**
- Analyzes all vulnerabilities contextually
- Prioritizes based on severity and impact
- Creates specific, actionable remediation steps
- Assigns appropriate stakeholders
- Sets realistic timelines

### 2. **Executive Summary**
- 2-3 sentence overview
- Urgency assessment
- Risk prioritization

### 3. **Islamic Ethics Integration**
- References Amanah (Trust) and Maslahah (Public Welfare)
- Includes Quranic guidance
- Responsible disclosure principles

### Example AI Output:

```json
{
  "executiveSummary": "Critical security assessment identified 3 high-severity vulnerabilities requiring immediate attention. Authentication weaknesses and phishing susceptibility pose significant risks to user data integrity and trust (Amanah principle).",
  
  "actionSteps": [
    {
      "phase": "immediate",
      "title": "Patch SQL Injection Vulnerability in Login Form",
      "description": "Immediately implement parameterized queries for all database interactions. Replace string concatenation in login.php with prepared statements. Deploy emergency patch within 12 hours.",
      "stakeholders": ["Lead Developer", "DevOps Team", "CISO"],
      "priority": 1,
      "timeline": "0-12 hours"
    },
    {
      "phase": "short_term",
      "title": "Implement Multi-Factor Authentication (MFA)",
      "description": "Deploy MFA across all user accounts to strengthen authentication. Use TOTP-based solution (e.g., Google Authenticator). Mandatory for admin accounts, optional for regular users initially.",
      "stakeholders": ["IT Security Team", "User Experience Team", "All Users"],
      "priority": 1,
      "timeline": "3-7 days"
    }
  ],
  
  "disclosurePolicy": "Following Islamic principles of Amanah (trust protection) and Maslahah (public benefit), this assessment follows responsible disclosure practices..."
}
```

---

## 💡 Benefits of AI vs Rule-Based

### AI-Powered ✨
- **Context-aware**: Understands relationships between vulnerabilities
- **Specific**: Tailored to exact findings (e.g., "SQL injection in login.php")
- **Intelligent**: Considers industry best practices
- **Natural language**: Easy to read and understand
- **Adaptive**: Learns from comprehensive prompts

### Rule-Based 📋
- **Fast**: No API calls, instant generation
- **Reliable**: Always works, no API limits
- **Predictable**: Same structure every time
- **Free**: No API costs

---

## 🔒 Security Notes

✅ **API Key Safety:**
- Your API key is stored in `.env` (not committed to Git)
- Never hardcode API keys in source code
- Add `.env` to `.gitignore`

✅ **Fallback System:**
- If Gemini API fails → Automatically uses rule-based
- If API key missing → Uses rule-based
- Always generates a plan (never fails)

---

## 🎯 Cost & Limits

**Gemini 1.5 Flash:**
- ✅ **FREE tier**: 15 requests per minute
- ✅ **1 million tokens per month free**
- ✅ Perfect for this use case

**Your usage:**
- ~1 request per audit
- ~2000 tokens per request
- Can handle **500+ audits per month** for free!

---

## 🧪 Testing

1. **Run backend:**
   ```bash
   npm run backend:dev
   ```

2. **Complete an audit** with some vulnerabilities

3. **Generate recovery plan** (AI will automatically analyze and create tailored steps)

4. **Check console logs:**
   ```
   🤖 Generating AI-powered recovery plan with Gemini...
   ✅ AI recovery plan generated successfully
   ```

5. **Compare outputs:**
   - Try with `useAI: true` → See intelligent, context-aware plan
   - Try with `useAI: false` → See rule-based generic plan

---

## 🐛 Troubleshooting

### "API key not found"
- Check `.env` file has `GEMINI_API_KEY=your-key`
- Restart backend server
- Verify API key is valid at https://aistudio.google.com/apikey

### "AI generation failed"
- Check internet connection
- Verify API key is correct
- Check console for specific error
- Falls back to rule-based automatically

### "Rate limit exceeded"
- Free tier: 15 requests/minute
- Wait 1 minute and try again
- Or use `useAI: false` for rule-based

---

## 📊 Prompt Engineering

The AI prompt includes:
- All vulnerability details
- Risk scores (technical, ethical, overall)
- Severity counts
- Islamic ethics scores (Amanah, Maslahah)
- Specific output format requirements
- Best practice guidelines

This ensures high-quality, actionable recovery plans! 🎯

---

## Next Steps

1. ✅ Install SDK: `npm install @google/generative-ai`
2. ✅ Restart backend
3. ✅ Update frontend to use `useAI: true`
4. ✅ Test with real audit
5. ✅ Compare AI vs rule-based outputs
6. ✅ Deploy and enjoy intelligent recovery plans! 🚀
