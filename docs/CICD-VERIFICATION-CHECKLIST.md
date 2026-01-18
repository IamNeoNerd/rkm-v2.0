# CI/CD Setup Verification Checklist

Use this comprehensive checklist to verify your CI/CD pipeline is correctly configured before your first deployment.

---

## 📋 Pre-Deployment Checklist

### ☑️ Repository Configuration

- [ ] Code is pushed to GitHub repository
- [ ] Repository is connected to Vercel
- [ ] Main branch is `main` (not `master`)
- [ ] `.gitignore` includes `.env` file
- [ ] `.env.example` file exists in repository
- [ ] All documentation files created:
  - [ ] `docs/CICD-SETUP-SUMMARY.md`
  - [ ] `docs/deployment-guide.md`
  - [ ] `docs/environment-variables.md`
  - [ ] `.agent/workflows/deployment.md`

---

### ☑️ Vercel Configuration

#### Project Settings
- [ ] Logged into Vercel dashboard
- [ ] Project exists and is linked to GitHub repo
- [ ] Framework detected as "Next.js"
- [ ] Production branch set to `main`
- [ ] Build command: `npm run vercel-build` or auto-detected
- [ ] Output directory: `.next` or auto-detected
- [ ] Install command: `npm install` or auto-detected

#### Production Environment Variables
Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables → Production**

- [ ] `DATABASE_URL` added
  - [ ] Value is Neon **Pooled Connection** string
  - [ ] Ends with `?sslmode=require`
  - [ ] Format: `postgresql://user:pass@host-pooler.neon.tech/db?sslmode=require`
  
- [ ] `AUTH_SECRET` added
  - [ ] Is 32+ characters long
  - [ ] Is random/secure (not "abc123")
  - [ ] Different from development secret
  - [ ] Marked as "Sensitive" ✅
  
- [ ] `NEXTAUTH_URL` added
  - [ ] Format: `https://your-domain.vercel.app`
  - [ ] Matches your actual Vercel domain
  
- [ ] `GOOGLE_CLIENT_ID` added
  - [ ] Copied from Google Cloud Console
  - [ ] Format: `xxxxx.apps.googleusercontent.com`
  
- [ ] `GOOGLE_CLIENT_SECRET` added
  - [ ] Copied from Google Cloud Console
  - [ ] Format: `GOCSPX-xxxxx`
  - [ ] Marked as "Sensitive" ✅

#### Preview Environment Variables
Go to: **Vercel Dashboard → Settings → Environment Variables → Preview**

- [ ] `DATABASE_URL` added (same as production OR separate preview DB)
- [ ] `AUTH_SECRET` added (same as production)
- [ ] `GOOGLE_CLIENT_ID` added (same as production)
- [ ] `GOOGLE_CLIENT_SECRET` added (same as production)
- [ ] `NEXTAUTH_URL` left blank (auto-set by Vercel) ✅

---

### ☑️ GitHub Secrets

Go to: **GitHub Repository → Settings → Secrets and variables → Actions**

- [ ] `DATABASE_URL` secret added
  - [ ] Value matches Vercel's `DATABASE_URL`
  - [ ] Is Neon connection string
  
- [ ] `AUTH_SECRET` secret added
  - [ ] Value matches Vercel's `AUTH_SECRET`
  - [ ] Is 32+ characters

---

### ☑️ Google OAuth Configuration

Go to: **Google Cloud Console → APIs & Services → Credentials**

- [ ] OAuth 2.0 Client ID created
- [ ] Application type: "Web application"
- [ ] Authorized redirect URIs include:
  - [ ] `http://localhost:3000/api/auth/callback/google` (development)
  - [ ] `https://your-vercel-domain.vercel.app/api/auth/callback/google` (production)
- [ ] Client ID copied to Vercel environment variables
- [ ] Client Secret copied to Vercel environment variables
- [ ] Waited 5-10 minutes after saving changes (for propagation)

---

### ☑️ Neon Database

Go to: **Neon Console → Your Project**

- [ ] Project exists and is active
- [ ] Database is not paused
- [ ] Connection string obtained (Pooled connection)
- [ ] Connection string includes `?sslmode=require`
- [ ] Can connect from local machine:
  ```bash
  npm run db:push
  ```
  Should succeed without errors

---

### ☑️ Local Development

#### Environment File
- [ ] `.env` file created (not committed to Git)
- [ ] All required variables filled in `.env`:
  - [ ] `DATABASE_URL`
  - [ ] `AUTH_SECRET`
  - [ ] `NEXTAUTH_URL` (http://localhost:3000)
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GOOGLE_CLIENT_SECRET`

#### Local Build Test
Run these commands locally and verify they succeed:

```bash
# Install dependencies
npm install
```
- [ ] ✅ Dependencies installed without errors

```bash
# Push database schema
npm run db:push
```
- [ ] ✅ Schema pushed successfully

```bash
# Run linter
npm run lint
```
- [ ] ✅ No linting errors (or acceptable warnings)

```bash
# Run unit tests
npm run test:run
```
- [ ] ✅ All tests pass

```bash
# Type check
npx tsc --noEmit
```
- [ ] ✅ No type errors

```bash
# Build application
npm run build
```
- [ ] ✅ Build succeeds
- [ ] ✅ Database migration runs during build
- [ ] ✅ Next.js compilation completes

```bash
# Start development server
npm run dev
```
- [ ] ✅ Server starts on http://localhost:3000
- [ ] ✅ Home page loads
- [ ] ✅ Can navigate to /login
- [ ] ✅ Google OAuth appears on login page

---

### ☑️ GitHub Actions Configuration

Go to: **GitHub Repository → Actions**

- [ ] GitHub Actions is enabled
- [ ] `.github/workflows/ci.yml` exists
- [ ] Workflows show in GitHub Actions tab
- [ ] Latest workflow run (if any) is visible
- [ ] Secrets are accessible (check action logs if run before)

#### CI Workflow Verification
Trigger a workflow by:
```bash
git add .
git commit -m "test: verify CI workflow" --allow-empty
git push origin main
```

- [ ] GitHub Actions workflow starts automatically
- [ ] "lint-and-test" job runs
- [ ] "verify-migrations" job runs
- [ ] "type-check" job runs
- [ ] "build" job runs
- [ ] "security-audit" job runs
- [ ] All jobs complete successfully (green checkmarks)

---

### ☑️ Project Files Verification

Verify these files exist with correct content:

```bash
# Check package.json has updated scripts
cat package.json | grep vercel-build
```
- [ ] ✅ Shows: `"vercel-build": "drizzle-kit push && next build"`

```bash
# Check vercel.json exists
cat vercel.json
```
- [ ] ✅ File exists
- [ ] ✅ Contains build configuration
- [ ] ✅ References environment variables with @

```bash
# Check deployment workflow exists
cat .agent/workflows/deployment.md
```
- [ ] ✅ File exists
- [ ] ✅ Contains deployment instructions

```bash
# Check seed script exists
ls scripts/seed-comprehensive-realistic.ts
```
- [ ] ✅ File exists

```bash
# Check .env.example exists
cat .env.example
```
- [ ] ✅ File exists
- [ ] ✅ Contains all required variables as placeholders

---

## 🚀 Deployment Verification

### First Deployment Test

1. **Make a small change**
   ```bash
   echo "// CI/CD configured - $(date)" >> src/app/page.tsx
   ```
   - [ ] ✅ File modified

2. **Commit and push**
   ```bash
   git add .
   git commit -m "ci: verify CI/CD pipeline"
   git push origin main
   ```
   - [ ] ✅ Push successful

3. **Monitor GitHub Actions** (2-3 minutes)
   Go to: GitHub Repository → Actions tab
   - [ ] ✅ Workflow triggered automatically
   - [ ] ✅ All CI jobs pass (green checkmarks)
   - [ ] ✅ No errors in logs

4. **Monitor Vercel Deployment** (2-5 minutes)
   Go to: Vercel Dashboard → Your Project → Deployments
   - [ ] ✅ Deployment triggered automatically
   - [ ] ✅ "Building" status appears
   - [ ] ✅ Database migration runs (check build logs)
   - [ ] ✅ Next.js build completes
   - [ ] ✅ Deployment succeeds (shows "Ready")
   - [ ] ✅ No errors in deployment logs

5. **Verify Production Deployment**
   Visit your Vercel production URL:
   - [ ] ✅ Website loads
   - [ ] ✅ No 500/404 errors
   - [ ] ✅ Home page renders correctly
   - [ ] ✅ Can navigate to /login
   - [ ] ✅ Google OAuth button appears
   - [ ] ✅ Can log in with Google
   - [ ] ✅ Redirected to dashboard after login
   - [ ] ✅ Database queries work (dashboard shows data if seeded)

---

### Preview Deployment Test

1. **Create feature branch**
   ```bash
   git checkout -b test/preview-deployment
   ```
   - [ ] ✅ Branch created

2. **Make a change**
   ```bash
   echo "// Testing preview deployment" >> README.md
   git add README.md
   git commit -m "test: preview deployment"
   git push origin test/preview-deployment
   ```
   - [ ] ✅ Push successful

3. **Create Pull Request**
   Go to: GitHub Repository → Pull Requests → New Pull Request
   - [ ] ✅ PR created
   - [ ] ✅ GitHub Actions CI runs
   - [ ] ✅ Vercel bot comments with preview URL
   - [ ] ✅ CI checks pass

4. **Test Preview Deployment**
   Click the Vercel preview URL in PR comment:
   - [ ] ✅ Preview site loads
   - [ ] ✅ URL format: `https://project-git-branch.vercel.app`
   - [ ] ✅ Changes are visible on preview
   - [ ] ✅ No deployment errors

5. **Clean up**
   ```bash
   # Don't merge - just close PR and delete branch
   git checkout main
   git branch -D test/preview-deployment
   ```

---

## 🔐 Security Verification

- [ ] `.env` file is in `.gitignore`
- [ ] `.env` file is NOT committed to Git
  ```bash
  git ls-files | grep "^.env$"
  # Should return nothing
  ```
- [ ] No secrets hardcoded in source files
- [ ] `AUTH_SECRET` is strong (32+ random characters)
- [ ] `GOOGLE_CLIENT_SECRET` not exposed in client code
- [ ] All sensitive env vars marked as "Sensitive" in Vercel
- [ ] Neon database uses SSL (`?sslmode=require`)
- [ ] Google OAuth redirect URIs are specific (not wildcards)

---

## 📊 Post-Deployment Monitoring

### First 24 Hours

Check these regularly:

#### Vercel Dashboard
- [ ] No increased error rates
- [ ] Normal response times (<2s)
- [ ] No failed deployments
- [ ] Build times reasonable (<5 minutes)

#### Neon Dashboard
- [ ] Database CPU usage normal
- [ ] No connection pool exhaustion
- [ ] Query performance acceptable
- [ ] Database not paused

#### Browser Testing
- [ ] Test on Chrome desktop
- [ ] Test on mobile (iPhone/Android)
- [ ] Test on tablet (iPad)
- [ ] All pages load correctly
- [ ] All features work as expected

---

## ✅ Rollback Test (Optional but Recommended)

Practice rolling back before you need it:

1. **Find previous deployment**
   - [ ] Vercel Dashboard → Deployments → Find second-most-recent
   
2. **Perform rollback**
   - [ ] Click ⋯ (three dots) → "Promote to Production"
   - [ ] Confirm rollback
   - [ ] Wait ~30 seconds
   
3. **Verify rollback**
   - [ ] Production URL now shows previous version
   - [ ] Changes reverted successfully
   
4. **Restore current version**
   - [ ] Find most recent deployment
   - [ ] Promote back to production

---

## 🎯 Success Criteria

Your CI/CD pipeline is fully operational when:

- ✅ All items in this checklist are checked
- ✅ Push to `main` triggers automatic deployment
- ✅ Deployment completes in <8 minutes
- ✅ Production site is accessible and functional
- ✅ Database migrations run automatically
- ✅ Google OAuth login works on production
- ✅ Preview deployments work for pull requests
- ✅ Rollback tested and works in <1 minute
- ✅ No secrets committed to Git
- ✅ All tests pass in CI

---

## 📝 Record Your Configuration

For future reference, record these details:

**Project Information:**
- Vercel Project Name: ____________________
- Production URL: ____________________
- GitHub Repository: ____________________
- Production Branch: main

**Neon Database:**
- Neon Project ID: ____________________
- Database Name: ____________________
- Region: ____________________

**Google OAuth:**
- Project Name: ____________________
- Client ID (first 10 chars): ____________________

**Deployment Timeline:**
- First successful deployment: ____________________
- Average CI time: ____ minutes
- Average Vercel build time: ____ minutes
- Total deployment time: ____ minutes

---

## 🆘 If Anything Fails

### Don't Panic! 

1. **Note the specific error** from logs
2. **Check the troubleshooting section** in:
   - `docs/deployment-guide.md`
   - `docs/CICD-SETUP-SUMMARY.md`
3. **Verify the related checklist item** above
4. **Test locally first** before pushing again
5. **Check recent commits** for breaking changes

### Common Issues Quick Reference:

| Issue | Quick Fix |
|-------|-----------|
| Build fails | Check environment variables in Vercel |
| Migration fails | Verify DATABASE_URL and test locally |
| OAuth doesn't work | Check redirect URIs in Google Console |
| CI fails | Verify GitHub secrets are set |
| Site doesn't load | Check Vercel deployment logs |

---

## 🎉 Congratulations!

If all items are checked, your CI/CD pipeline is ready for production use!

**What's Next:**
1. Seed realistic data: `npm run db:seed`
2. Invite team members and share documentation
3. Set up monitoring/alerts (optional)
4. Document your deployment schedule
5. Plan your first production deployment!

---

*Checklist Version: 1.0*
*Last Updated: January 2026*
