# Environment Variables Reference

Complete reference for all environment variables required by RK Institute ERP.

## Overview

This document lists all environment variables needed for development, preview, and production environments.

---

## Required Variables

### Database

#### `DATABASE_URL`
- **Type:** Connection String
- **Required:** Yes (All environments)
- **Description:** PostgreSQL connection string for Neon database
- **Format:** `postgresql://user:password@host:port/database?sslmode=require`
- **Example:** `postgresql://neondb_owner:npg_xxx@ep-xxx.aws.neon.tech/neondb?sslmode=require`
- **Where to Get:**
  1. Go to [Neon Console](https://console.neon.tech)
  2. Select your project
  3. Copy "Connection String" (use Pooled connection)
- **Security:** Sensitive - Never commit to Git
- **Environments:**
  - Development: `.env` file
  - Preview: Vercel environment variables
  - Production: Vercel environment variables

---

### Authentication

#### `AUTH_SECRET`
- **Type:** String
- **Required:** Yes (All environments)
- **Description:** Secret key for NextAuth.js session encryption
- **Format:** Random string (minimum 32 characters)
- **Example:** `abc123xyz789randomstring32chars+`
- **Where to Generate:**
  ```bash
  # Linux/Mac
  openssl rand -base64 32
  
  # Windows PowerShell
  $bytes = [byte[]]::new(32)
  (New-Object System.Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
  [Convert]::ToBase64String($bytes)
  ```
- **Security:** Highly Sensitive - Never share or commit
- **Environments:**
  - Development: `.env` file
  - Preview: Vercel environment variables (same as production)
  - Production: Vercel environment variables

---

#### `NEXTAUTH_URL`
- **Type:** URL
- **Required:** Yes (Production), Optional (Development/Preview)
- **Description:** The canonical URL of your site
- **Format:** `https://your-domain.com`
- **Examples:**
  - Development: `http://localhost:3000` (auto-detected)
  - Preview: Auto-set by Vercel
  - Production: `https://rk-institute-erp.vercel.app`
- **Where to Set:**
  - Development: `.env` file or auto-detected
  - Preview: Auto-set by Vercel (do not set manually)
  - Production: Vercel environment variables
- **Security:** Public
- **Note:** Vercel automatically sets this for preview and production

---

### Google OAuth

#### `GOOGLE_CLIENT_ID`
- **Type:** String
- **Required:** Yes (if using Google OAuth)
- **Description:** Google OAuth 2.0 Client ID
- **Format:** `xxxxx-xxxxx.apps.googleusercontent.com`
- **Example:** `101466016849-xxx.apps.googleusercontent.com`
- **Where to Get:**
  1. Go to [Google Cloud Console](https://console.cloud.google.com)
  2. Select/Create project
  3. Enable "Google+ API"
  4. Navigate to "Credentials"
  5. Create OAuth 2.0 Client ID
  6. Application type: Web application
  7. Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://your-domain.vercel.app/api/auth/callback/google`
  8. Copy Client ID
- **Security:** Semi-sensitive (public in client code)
- ** Environments:** Same for all

---

#### `GOOGLE_CLIENT_SECRET`
- **Type:** String
- **Required:** Yes (if using Google OAuth)
- **Description:** Google OAuth 2.0 Client Secret
- **Format:** `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxx`
- **Example:** `GOCSPX-abc123xyz789`
- **Where to Get:** Same as GOOGLE_CLIENT_ID (step 8: Copy Client Secret)
- **Security:** Highly Sensitive - Never expose in client code
- **Environments:** Same for all

---

## Optional Variables

### `NODE_ENV`
- **Type:** String
- **Required:** No (auto-set)
- **Description:** Application environment
- **Values:** `development` | `production` | `test`
- **Default:** Auto-set by Node.js and Vercel
- **Note:** Do not manually set in Vercel

---

### `VERCEL`
- **Type:** String
- **Required:** No (auto-set by Vercel)
- **Description:** Indicates if running on Vercel
- **Values:** `"1"` when on Vercel, undefined otherwise
- **Default:** Auto-set by Vercel
- **Usage:** Detect Vercel environment in code

---

### `VERCEL_URL`
- **Type:** String
- **Required:** No (auto-set by Vercel)
- **Description:** The deployment URL
- **Format:** `your-project-git-branch.vercel.app`
- **Default:** Auto-set by Vercel for each deployment
- **Usage:** Useful for dynamic preview URLs

---

## Environment-Specific Setup

### Development (`.env` file)

Create a `.env` file in project root:

```env
# Database
DATABASE_URL="postgresql://neondb_owner:xxx@ep-xxx.aws.neon.tech/neondb?sslmode=require"

# NextAuth
AUTH_SECRET="your-super-secret-key-change-in-production-min-32-chars-long"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="101466016849-xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"
```

**Security Notes:**
- ✅ `.env` is in `.gitignore` - NEVER commit this file
- ✅ Use separate database for local development (optional)
- ✅ Can use same Google OAuth credentials as production

---

### Preview (Vercel)

Set in: **Vercel Dashboard → Project → Settings → Environment Variables**

Select **Preview** environment:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | Production DB or separate preview DB | Same as production recommended |
| `AUTH_SECRET` | Same as production | Must match |
| `GOOGLE_CLIENT_ID` | Same as production | Must match |
| `GOOGLE_CLIENT_SECRET` | Same as production | Must match |

**Notes:**
- `NEXTAUTH_URL` is auto-set by Vercel for preview deployments
- Preview deployments get unique URLs: `https://project-git-branch.vercel.app`

---

### Production (Vercel)

Set in: **Vercel Dashboard → Project → Settings → Environment Variables**

Select **Production** environment:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | Production Neon database | Use Pooled connection |
| `AUTH_SECRET` | Strong random  secret (32+ chars) | Keep secure |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Your production URL |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | From Google Cloud |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Keep secure |

**Security Checklist:**
- ✅ All secrets marked as "Sensitive" in Vercel
- ✅ Different `AUTH_SECRET` than development
- ✅ Production database (not development)
- ✅ Authorized redirect URI added in Google Cloud Console

---

## GitHub Actions Secrets

For CI/CD pipeline to work, add these to GitHub:

Navigate to: **GitHub → Repository → Settings → Secrets and variables → Actions**

| Secret Name | Value | Purpose |
|------------|-------|---------|
| `DATABASE_URL` | Neon connection string | Build-time database migrations |
| `AUTH_SECRET` | Same as production | Build verification |

**How to Add:**
1. Click "New repository secret"
2. Name: `DATABASE_URL`
3. Secret: Your Neon connection string
4. Click "Add secret"
5. Repeat for `AUTH_SECRET`

---

## Security Best Practices

### DO ✅

- Use strong, random secrets (32+ characters)
- Rotate secrets periodically (every 90 days recommended)
- Use different secrets for development and production
- Mark sensitive variables as "Sensitive" in Vercel
- Use Neon's pooled connection for better performance
- Keep `.env` file in `.gitignore`
- Document which environments need which variables

### DON'T ❌

- Commit `.env` files to Git
- Share secrets via email, Slack, or unsecured channels
- Reuse secrets across multiple projects
- Hardcode secrets in application code
- Expose secrets in client-side code
- Use weak or guessable secrets (e.g., "password123")

---

## Verification Checklist

### Before Deployment

- [ ] All required variables set in Vercel
- [ ] `AUTH_SECRET` is 32+ characters
- [ ] `DATABASE_URL` points to correct database
- [ ] Google OAuth redirect URIs configured correctly
- [ ] GitHub secrets added for CI/CD
- [ ] `.env` file exists locally (not committed)
- [ ] Production variables different from development

### After Deployment

- [ ] Application loads without errors
- [ ] Database connection working
- [ ] Google OAuth login functional
- [ ] No environment variable errors in logs
- [ ] Preview deployments working correctly

---

## Troubleshooting

### Common Issues

#### Error: `process.env.DATABASE_URL is undefined`

**Solution:**
1. Check variable name spelling (case-sensitive)
2. Verify variable  is set in Vercel → Settings → Environment Variables
3. Check correct environment selected (Production/Preview/Development)
4. Redeploy to apply changes

---

#### Error: `Invalid AUTH_SECRET`

**Solution:**
1. Ensure `AUTH_SECRET` is at least 32 characters
2. Check for typos or extra spaces
3. Generate new secret if needed:
   ```bash
   openssl rand -base64 32
   ```

---

#### Error: `Google OAuth Redirect URI mismatch`

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth 2.0 Client ID
3. Add redirect URI:
   - Format: `https://your-domain.vercel.app/api/auth/callback/google`
4. Save changes
5. Wait 5-10 minutes for propagation
6. Test again

---

#### Error: `Database connection failed`

**Solution:**
1. Verify `DATABASE_URL` is correct
2. Check Neon database is active (not paused)
3. Ensure connection string includes `?sslmode=require`
4. Test connection locally:
   ```bash
   npm run db:push
   ```

---

## Additional Notes

### Neon Database Branching (Advanced)

If using Neon branching for preview deployments:

1. Create preview branch in Neon for each PR
2. Set different `DATABASE_URL` for preview vs production
3. Clean up preview branches after PR merge

### Database URL Formats

**Pooled Connection (Recommended for Vercel):**
```
postgresql://user:pass@host-pooler.neon.tech/db?sslmode=require
```

**Direct Connection:**
```
postgresql://user:pass@host.neon.tech/db?sslmode=require
```

**Use pooled connection for:**
- Production deployments
- High-traffic applications
- Serverless environments (Vercel)

**Use direct connection for:**
- Local development
- Database migrations
- Administrative tasks

---

## Template Files

### `.env.example`

Create this file in your repository (safe to commit):

```env
# Copy this file to .env and fill in your values
# DO NOT commit .env to Git

# Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# NextAuth
AUTH_SECRET="generate-a-random-secret-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### `.env.local.example`

For team members to set up quickly:

```env
# Local Development Environment Variables
DATABASE_URL="postgresql://neondb_owner:xxx@ep-xxx-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
AUTH_SECRET="dev-secret-please-change-in-production-32-characters-minimum"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="101466016849-xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"
```

---

## Quick Reference

| Variable | Dev | Preview | Production | Sensitive |
|----------|-----|---------|------------|-----------|
| `DATABASE_URL` | ✅ | ✅ | ✅ | ✅ |
| `AUTH_SECRET` | ✅ | ✅ | ✅ | ✅✅ |
| `NEXTAUTH_URL` | ✅ | Auto | ✅ | ❌ |
| `GOOGLE_CLIENT_ID` | ✅ | ✅ | ✅ | ❌ |
| `GOOGLE_CLIENT_SECRET` | ✅ | ✅ | ✅ | ✅✅ |

**Legend:**
- ✅ = Required
- Auto = Automatically set by Vercel
- ✅✅ = Highly Sensitive

---

For more information, see [Deployment Guide](./deployment-guide.md).
