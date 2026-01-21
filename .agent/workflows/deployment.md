---
description: Deployment and CI/CD workflow for RK Institute ERP
---

# Deployment Workflow

This workflow guides you through deploying the RK Institute ERP application to Vercel with automated CI/CD.

## Prerequisites

- [x] GitHub repository connected to Vercel
- [x] Neon database created and accessible
- [x] Vercel project configured
- [x] Environment variables set in Vercel dashboard

## Quick Start

### First-Time Setup

1. **Configure Vercel Environment Variables**
   
   Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
   
   Add for **Production**:
   ```
   DATABASE_URL = <your-neon-connection-string>
   AUTH_SECRET = <generate-via: openssl rand -base64 32>
   NEXTAUTH_URL = https://your-domain.vercel.app
   GOOGLE_CLIENT_ID = <from-google-cloud-console>
   GOOGLE_CLIENT_SECRET = <from-google-cloud-console>
   ```
   
   Add for **Preview** (same values or separate preview DB):
   ```
   DATABASE_URL = <your-neon-connection-string>
   AUTH_SECRET = <same-as-production>
   GOOGLE_CLIENT_ID = <same-as-production>
   GOOGLE_CLIENT_SECRET = <same-as-production>
   ```

2. **Configure GitHub Secrets**
   
   Go to: GitHub Repository → Settings → Secrets → Actions
   
   Add:
   ```
   DATABASE_URL = <your-neon-connection-string>
   AUTH_SECRET = <same-as-vercel>
   ```

3. **Verify Configuration**
   
   Check `vercel.json` exists in project root:
   ```bash
   cat vercel.json
   ```
   
   Should see build configuration and environment references.

4. **Test Database Connection**
   
   ```bash
   npm run db:push
   ```
   
   Should successfully push schema to database.

---

## Regular Deployment Workflow

### Deploy to Production

// turbo
1. **Run local tests**
   ```bash
   npm run test:run
   npm run lint
   npx tsc --noEmit
   ```

// turbo
2. **Test build locally**
   ```bash
   npm run build
   ```

3. **Commit and push to main**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin main
   ```

4. **Monitor deployment**
   - GitHub Actions will run CI tests (2-3 minutes)
   - Vercel will build and deploy (2-5 minutes)
   - Check Vercel dashboard for deployment status

5. **Verify deployment**
   - Visit production URL
   - Test critical flows (login, main features)
   - Check deployment logs if issues occur

---

### Create Preview Deployment

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: implement feature"
   git push origin feature/your-feature-name
   ```

3. **Create Pull Request on GitHub**
   - Vercel automatically creates preview deployment
   - Preview URL appears in PR comments
   - CI tests run automatically

// turbo
4. **Test preview deployment**
   - Click preview URL in PR
   - Verify changes work correctly
   - Check for any issues

5. **Merge when ready**
   ```bash
   # After approval, merge PR
   # This automatically deploys to production
   ```

---

## Database Management

### Push Schema Changes

// turbo
```bash
# Push schema to database
npm run db:push
```

### Open Drizzle Studio

// turbo
```bash
# Visual database browser
npm run db:studio
```

### Seed Realistic Data

// turbo
```bash
# Populate with comprehensive realistic data
npm run db:seed
```

---

## Troubleshooting

### Build Fails on Vercel

1. Check deployment logs in Vercel dashboard
2. Verify all environment variables are set
3. Test build locally: `npm run build`
4. Check database connectivity

### Environment Variables Not Working

1. Verify variable names are correct (case-sensitive)
2. Check they're set for correct environment (Production/Preview)
3. Redeploy to apply changes
4. Clear Vercel cache if needed

### Database Migration Fails

1. Check `DATABASE_URL` is correct
2. Verify Neon database is active (not paused)
3. Test locally: `npm run db:push`
4. Check Drizzle config: `cat drizzle.config.ts`

### Google OAuth Not Working

1. Verify redirect URI in Google Cloud Console:
   - `https://your-domain.vercel.app/api/auth/callback/google`
2. Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` match
3. Wait 5-10 minutes after adding redirect URI

---

## Rollback Procedure

### Quick Rollback (30 seconds)

1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click ⋯ (three dots) → "Promote to Production"
4. Confirm
5. Previous version is now live

### Emergency Database Rollback

**Option 1: Neon Point-in-Time Restore**
1. Neon Console → Your Project → Restore
2. Select restore point (up to 7 days)
3. Confirm restore

**Option 2: Git Revert**
```bash
git revert <commit-hash>
git push origin main
```

---

## Best Practices

### Before Every Deployment

- [ ] Tests pass locally
- [ ] Lint passes
- [ ] Type check passes
- [ ] Build succeeds locally
- [ ] Database migrations tested
- [ ] Feature tested on preview deployment (for major changes)

### After Deployment

- [ ] Verify production URL loads
- [ ] Test critical user flows:
  - [ ] Login (Google OAuth)
  - [ ] Student admission
  - [ ] Fee collection
  - [ ] Batch operations
- [ ] Check deployment logs for warnings
- [ ] Monitor error rates (first 30 minutes)

---

## Quick Command Reference

```bash
# Development
npm run dev                    # Start dev server
npm run db:push                # Push schema changes
npm run db:studio              # Open DB browser
npm run db:seed                # Seed realistic data

# Testing
npm run test:run               # Run unit tests
npm run test:e2e               # Run E2E tests
npm run lint                   # Run linter
npx tsc --noEmit              # Type check

# Build & Deploy
npm run build                  # Build locally
git push origin main           # Deploy to production
vercel --prod                  # Manual deploy (if needed)

# Monitoring
vercel logs                    # View deployment logs
vercel env ls                  # List environment variables
```

---

## Documentation Links

- [Full Deployment Guide](../docs/deployment-guide.md)
- [Environment Variables Reference](../docs/environment-variables.md)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Neon Console](https://console.neon.tech)
- [GitHub Actions](https://github.com/your-org/rk-institute-erp/actions)

---

## Support

**Issues?**
1. Check deployment logs (Vercel dashboard)
2. Review GitHub Actions logs
3. Consult troubleshooting section above
4. Review recent commits for breaking changes

**Emergency Contact:**
- Team Lead: [Contact Info]
- DevOps: [Contact Info]
