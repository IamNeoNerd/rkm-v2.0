# CI/CD Deployment Guide

Complete guide for setting up and managing the automated deployment pipeline for RK Institute ERP.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Initial Vercel Setup](#initial-vercel-setup)
4. [Environment Variables Configuration](#environment-variables-configuration)
5. [GitHub Actions Secrets](#github-actions-secrets)
6. [Deployment Workflow](#deployment-workflow)
7. [Preview Deployments](#preview-deployments)
8. [Troubleshooting](#troubleshooting)
9. [Rollback Procedures](#rollback-procedures)

---

## Overview

<The implementation plan provides the CI/CD setup workflow details. This has been configured to automatically deploy the RK Institute ERP to Vercel whenever changes are pushed to the `main` branch.

**Key Features:**
- ✅ Automatic deployments on push to `main`
- ✅ Preview deployments for all pull requests
- ✅ Automated database migrations before build
- ✅ Comprehensive testing before deployment
- ✅ Security headers and safety checks
- ✅ One-click rollback capability

**Technology Stack:**
- **CI/CD**: GitHub Actions
- **Hosting**: Vercel
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Region**: Mumbai (bom1) for optimal India performance

---

## Prerequisites

Before starting, ensure you have:

- [x] GitHub repository connected to Vercel
- [x] Neon database project created
- [x] Vercel CLI installed (optional but recommended)
- [x] Access to Vercel dashboard
- [x] Google OAuth credentials (for authentication)

---

## Initial Vercel Setup

### 1. Install Vercel CLI (Optional)

```bash
npm install -g vercel
vercel login
```

### 2. Link Your Project

If you haven't already linked your project:

```bash
cd d:\RKM\rk-institute-erp
vercel link
```

Follow the prompts to:
- Select your Vercel scope/team
- Link to existing project or create new
- Confirm directory settings

### 3. Verify Project Settings

Go to your Vercel Dashboard → Your Project → Settings

**Build & Development Settings:**
- ✅ Framework Preset: `Next.js`
- ✅ Build Command: `npm run vercel-build`
- ✅ Output Directory: `.next`
- ✅ Install Command: `npm install`
- ✅ Development Command: `npm run dev`

**Git:**
- ✅ Production Branch: `main`
- ✅ Vercel for GitHub enabled

**Deployment Protection (Recommended):**
- Enable "Automatically expose System Environment Variables"
- Enable "Include source files in deployment"

---

## Environment Variables Configuration

### Production Environment

Navigate to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add the following variables for **Production**:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `DATABASE_URL` | Your Neon connection string | From Neon dashboard |
| `AUTH_SECRET` | 32+ character random string | Use `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Your production URL |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | From Google Cloud Console |

### Preview Environment

Add the same variables for **Preview** environment:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `DATABASE_URL` | Same as production OR separate preview DB | Optional: use Neon branching |
| `AUTH_SECRET` | Same as production | Can be same |
| `NEXTAUTH_URL` | Leave blank | Auto-set by Vercel |
| `GOOGLE_CLIENT_ID` | Same as production | Same credentials |
| `GOOGLE_CLIENT_SECRET` | Same as production | Same credentials |

**Important Notes:**
- ✅ Never commit `.env` files to Git
- ✅ Mark `AUTH_SECRET` and `GOOGLE_CLIENT_SECRET` as "Sensitive"
- ✅ Use different database for preview if you need data isolation

### Getting Your Environment Variables

#### 1. Neon Database URL

1.  Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Go to **Dashboard**
4. Copy the **Connection String** (Pooled connection recommended)
5. Format: `postgresql://user:password@host/database?sslmode=require`

#### 2. Auth Secret

Generate a secure random string:

```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows (PowerShell):
$bytes = [byte[]]::new(32); (New-Object System.Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes); [Convert]::ToBase64String($bytes)

# Or use an online generator (ensure it's 32+ characters)
```

#### 3. Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-domain.vercel.app/api/auth/callback/google` (production)
7. Copy **Client ID** and **Client Secret**

---

## GitHub Actions Secrets

For GitHub Actions CI to work properly, add these secrets:

Navigate to: **GitHub Repository → Settings → Secrets and variables → Actions**

### Repository Secrets

| Secret Name | Value | Purpose |
|------------|-------|---------|
| `DATABASE_URL` | Neon connection string | For build-time migrations |
| `AUTH_SECRET` | Your auth secret | For build verification |

**How to Add:**
1. Click **"New repository secret"**
2. Name: `DATABASE_URL`
3. Value: Your Neon connection string
4. Click **"Add secret"**
5. Repeat for `AUTH_SECRET`

---

## Deployment Workflow

### Automatic Production Deployment

1. **Make changes** to your code
2. **Commit** changes:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```
3. **Push to main**:
   ```bash
   git push origin main
   ```
4. **GitHub Actions CI** runs automatically:
   - ✓ Lint code
   - ✓ Run unit tests
   - ✓ Type checking
   - ✓ Verify migrations
   - ✓ Build application
   - ✓ Security audit
5. **Vercel deployment** triggers:
   - ✓ Install dependencies
   - ✓ Run `drizzle-kit push` (migrate database)
   - ✓ Build Next.js application
   - ✓ Deploy to production
6.  **Deployment complete** (~2-5 minutes):
   - Visit your production URL
   - Check deployment logs in Vercel dashboard

### Manual Deployment (if needed)

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

---

## Preview Deployments

### Automatic Preview for Pull Requests

1. **Create feature branch**:
   ```bash
   git checkout -b feature/new-feature
   ```
2. **Make changes and commit**:
   ```bash
   git add .
   git commit -m "feat: implement new feature"
   ```
3. **Push to GitHub**:
   ```bash
   git push origin feature/new-feature
   ```
4. **Create Pull Request** on GitHub
5. **Vercel automatically**:
   - Creates preview deployment
   - Comments on PR with preview URL
   - Runs all CI checks
6. **Review and test** on preview URL
7. **Merge to main** when ready

### Preview URL Format

- Production: `https://rk-institute-erp.vercel.app`
- Preview: `https://rk-institute-erp-git-branch-name-team.vercel.app`

---

## Troubleshooting

### Common Issues

#### 1. Build Failed - Database Migration Error

**Error:** `Failed to push database schema`

**Solution:**
- Check `DATABASE_URL` environment variable in Vercel
- Verify Neon database is accessible
- Check Drizzle config file is correct
- View build logs in Vercel dashboard

```bash
# Test locally first
npm run db:push
```

#### 2. Environment Variables Not Loaded

**Error:** `process.env.DATABASE_URL is undefined`

**Solution:**
- Verify variables are set in Vercel → Settings → Environment Variables
- Check variable names match exactly (case-sensitive)
- Redeploy to apply new environment variables

#### 3. Google OAuth Not Working

**Error:** `Redirect URI mismatch`

**Solution:**
- Add your Vercel URL to Google OAuth authorized redirect URIs
- Format: `https://your-domain.vercel.app/api/auth/callback/google`
- Wait 5-10 minutes for Google to propagate changes

#### 4. Deployment Timing Out

**Error:** `Build exceeded maximum duration`

**Solution:**
- Optimize build process
- Check for infinite loops in migrations
- Consider upgrading Vercel plan if needed

### Debug Checklist

When deployment fails:

- [ ] Check Vercel deployment logs
- [ ] Verify all environment variables are set
- [ ] Test build locally: `npm run build`
- [ ] Check GitHub Actions logs
- [ ] Verify database connectivity
- [ ] Review recent code changes
- [ ] Check Neon database status

---

## Rollback Procedures

### Immediate Rollback (Vercel Dashboard)

1. Go to **Vercel Dashboard** → **Your Project** → **Deployments**
2. Find the previous working deployment
3. Click the three dots (**⋯**) → **Promote to Production**
4. Confirm rollback
5. ✅ Previous version is now live (~30 seconds)

### Database Rollback (if needed)

#### Option 1: Neon Point-in-Time Restore

1. Go to **Neon Console** → **Your Project**
2. Click **Restore** (if available on your plan)
3. Select restore point (up to 7 days on free tier)
4. Confirm restore
5. Update `DATABASE_URL` if database endpoint changed

####  Option 2: Manual Migration Rollback

```bash
# Identify problematic migration
cd migrations
ls -la

# If using migration files, manually create rollback SQL
# Example: Revert table changes
# CREATE rollback SQL file and run with Drizzle Studio or direct SQL

# Then redeploy
git revert <commit-hash>
git push origin main
```

### Emergency Procedures

**If production is completely broken:**

1. **Immediate**: Rollback via Vercel dashboard (30 seconds)
2. **Investigate**: Check deployment and CI logs
3. **Fix**: Create hotfix branch
4. **Test**: Deploy preview and verify fix
5. **Deploy**: Merge hotfix to main
6. **Document**: Add incident to audit logs

---

## Best Practices

### Before Pushing to Main

```bash
# 1. Run tests locally
npm run test:run

# 2. Run lint
npm run lint

# 3. Type check
npx tsc --noEmit

# 4. Build locally
npm run build

# 5. Test database migration
npm run db:push

# 6. If all pass, push to main
git push origin main
```

### Deployment Checklist

Before deploying major changes:

- [ ] All tests passing locally
- [ ] Database migrations tested on development database
- [ ] Environment variables updated (if new ones added)
- [ ] Feature tested on preview deployment
- [ ] Breaking changes documented
- [ ] Backup plan ready (rollback procedure)
- [ ] Stakeholders notified (if major update)

### Monitoring Deployments

**Watch these metrics:**
- Build time (should be <5 minutes)
- Deployment status (success/failure rate)
- Error logs (check Vercel dashboard)
- Database performance (check Neon dashboard)
- User feedback (after deployment)

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Neon Documentation](https://neon.tech/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [GitHub Actions](https://docs.github.com/en/actions)

---

## Support

**Issues with deployment?**

1. Check deployment logs in Vercel dashboard
2. Review GitHub Actions workflow runs
3. Consult this guide's troubleshooting section
4. Check Neon database status
5. Review recent commits for issues

**Contact:**
- Team Lead: [Email/Contact]
- DevOps Support: [Email/Contact]
