# 🚀 Deploying AmanTech Shield to Vercel

## Prerequisites
- GitHub account with your repository pushed
- Vercel account (sign up at https://vercel.com)
- Supabase database running (already configured)
- API keys ready (Gemini AI)

## 📋 Step-by-Step Deployment Guide

### 1. Prepare Your Repository

Ensure your code is pushed to GitHub:
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push
```

### 2. Deploy to Vercel

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `AmanTechShield` repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run vercel-build` (or use default)
   - **Output Directory**: `dist` (should auto-detect)

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name: amantech-shield
# - Directory: ./
# - Override settings? N

# For production deployment
vercel --prod
```

### 3. Configure Environment Variables

In Vercel Dashboard (https://vercel.com/your-username/amantech-shield/settings/environment-variables):

Add these environment variables:

```env
DATABASE_URL=your_supabase_database_url
GEMINI_API_KEY=your_new_gemini_api_key
NODE_ENV=production
```

**⚠️ SECURITY IMPORTANT:**
- Generate a **NEW** Gemini API key at https://aistudio.google.com/app/apikey
- Do NOT use the old exposed API key from your .env file
- Get your Supabase DATABASE_URL from https://app.supabase.com/project/_/settings/database

**Environment Variable Setup:**
1. Go to Project Settings → Environment Variables
2. Add each variable with its value
3. Select environments: Production, Preview, Development (all)
4. Click "Save"

### 4. Configure Build Settings

Vercel should auto-detect your Vite configuration. Verify these settings:

- **Build Command**: `npm run vercel-build` (runs Prisma generate + Vite build)
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### 5. Deploy Database Schema

Before first use, run the migration on your Supabase database:

1. Go to https://app.supabase.com/project/_/sql
2. Run the migration file: `migration_add_createdAt.sql`
3. Verify tables have `createdAt` columns

### 6. (Optional) Deploy RLS Policies

For production security, deploy Row Level Security:

1. Open Supabase SQL Editor
2. Choose between:
   - **Secure (Multi-tenant)**: Use `RLS_policies_SECURE.sql` for multi-user
   - **Simple (Internal team)**: Use `RLS_policies_SIMPLE.sql` for trusted team
3. Execute the chosen SQL file

### 7. Test Your Deployment

After deployment completes:

1. Visit your Vercel URL (e.g., `https://amantech-shield.vercel.app`)
2. Test key functionality:
   - ✅ Login/Register
   - ✅ Start New Audit
   - ✅ Run Penetration Test
   - ✅ Complete full scan flow
   - ✅ Generate PDF report
   - ✅ AI recovery plan generation

Check the Vercel Functions logs:
- Go to Deployments → Select deployment → Functions
- Monitor API requests and errors

### 8. Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `amantech.com`)
3. Update DNS records as instructed
4. Vercel automatically provisions SSL certificate

## 🔧 Troubleshooting

### API Routes Return 404
- Verify `vercel.json` is in the root directory
- Check that `/api` routes are configured correctly
- Redeploy after any config changes

### Database Connection Fails
- Verify `DATABASE_URL` environment variable is set correctly
- Check Supabase connection pooling is enabled
- Ensure database allows connections from Vercel IPs (0.0.0.0/0)

### Prisma Client Not Generated
- Ensure `prisma` is in `devDependencies`
- Build command includes `npx prisma generate`
- Check Vercel build logs for Prisma generation errors

### AI Recovery Plan Fails
- Verify `GEMINI_API_KEY` is set in environment variables
- Check Gemini API quota and billing
- Review Vercel Function logs for specific errors
- Ensure Functions timeout is set to 60s (for AI processing)

### Build Fails
```bash
# Check local build first
npm run vercel-build

# If it works locally but fails on Vercel:
# - Check Node.js version compatibility
# - Verify all dependencies are in package.json
# - Check Vercel build logs for specific errors
```

### Cold Start Performance
Vercel serverless functions may have cold starts (1-3s delay). To minimize:
- Keep functions warm with external monitoring (e.g., UptimeRobot)
- Consider upgrading to Vercel Pro for faster cold starts
- Optimize bundle size

## 📊 Monitoring & Logs

**View Logs:**
1. Go to your Vercel project dashboard
2. Click on "Functions" or "Logs" tab
3. Real-time logs show all API requests and errors

**Analytics:**
- Vercel provides built-in analytics
- Monitor function execution time
- Track bandwidth and request counts

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push

# Vercel automatically:
# 1. Detects push
# 2. Runs build
# 3. Deploys to preview URL
# 4. (if main branch) deploys to production
```

**Branch Deployments:**
- `main` branch → Production (amantech-shield.vercel.app)
- Other branches → Preview URLs (feature-xyz-amantech-shield.vercel.app)

## 🎯 Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migration executed
- [ ] Test login/register flow
- [ ] Test complete audit workflow
- [ ] Verify PDF generation works
- [ ] Test AI recovery plan generation
- [ ] Check all API endpoints respond
- [ ] Review Vercel function logs
- [ ] (Optional) Configure custom domain
- [ ] (Optional) Deploy RLS policies
- [ ] (Optional) Set up monitoring/alerts

## 📱 Frontend API Configuration

If your frontend needs to know the backend URL, update the API configuration:

In your frontend code (e.g., `src/config.ts` or environment):
```typescript
const API_URL = import.meta.env.PROD 
  ? 'https://amantech-shield.vercel.app/api'
  : 'http://localhost:4000/api';
```

Or use relative URLs (recommended for Vercel):
```typescript
// Frontend and backend on same domain
const API_URL = '/api';
```

## 🔐 Security Reminders

1. **Never commit .env** - Already in .gitignore ✅
2. **Rotate exposed credentials** - Generate new Gemini API key
3. **Enable RLS policies** - Protect multi-tenant data
4. **Monitor function logs** - Watch for unusual activity
5. **Use HTTPS only** - Vercel provides automatic SSL

## 📖 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel + Prisma Guide](https://vercel.com/guides/prisma)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooling)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Deployment completed!** 🎉

Your AmanTech Shield platform is now live and scalable on Vercel's global edge network.
