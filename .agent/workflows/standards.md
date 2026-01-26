---
description: Standard development practices and cleanup rules for RK Institute ERP
---

# Development Standards & Practices

This workflow defines the standard practices to follow when developing and maintaining the RK Institute ERP project.

---

## 📁 Directory Organization

### Root Directory Rules
// turbo-all
1. **No log files in root** - All `.log` files must be gitignored
2. **No temporary output files** - Files like `*_output.txt`, `test_results.txt` should not be committed
3. **No SQL dumps in root** - SQL files go in `docs/` or `migrations/` only
4. **Config files only** - Root should only contain: `package.json`, `tsconfig.json`, `*.config.ts/js/mjs`, `.env.example`, `README.md`
5. **TSConfig Hygiene** - Non-project legacy folders (e.g., `design-system`) MUST be explicitly excluded in `tsconfig.json` to prevent framework logic "leakage."

### Scripts Directory Structure
```
scripts/
├── _archive/              # Old/superseded scripts (gitignored)
├── seed-production-ready.ts   # Primary seeding script
├── check-db-connection.ts     # Diagnostic utility
├── create-admin-production.ts # Admin setup
├── migrate.ts                 # Database migrations
└── [other active scripts]
```

**Rules:**
1. When a script is superseded, move it to `scripts/_archive/` instead of deleting
2. Name scripts descriptively: `seed-production-ready.ts` not `seed.ts`
3. Debug/one-time scripts should be archived after use

### Docs Directory
Keep only:
- `TECHNICAL-DEBT.md` - Known issues and TODOs
- `deployment-guide.md` - Deployment instructions
- `environment-variables.md` - Env var documentation
- `qa-checklist.md` - Testing checklist
- `user-manual.md` - User-facing documentation

---

## 🗄️ Database Practices

### Connection Verification
Before running any database operation:
```bash
npx tsx scripts/check-db-connection.ts
```
Or use the diagnostic endpoint: `/api/test-db`

### Database Selection
- **Production:** Always specify `databaseName: "rkm"` in MCP tools
- **Development:** Use `neondb` for testing
- **Never** assume the default database is correct

### Seeding
1. Always use `seed-production-ready.ts` for production data
2. Archived seed scripts are for reference only
3. Test seeding locally before running on production branch

### Performance & Data Fetching
1. **Server Components First**: Use `async` Server Components for initial data views. Avoid "Loading..." states where possible.
2. **Bulk Fetching**: Never fetch related data in a loop (N+1). Use bulk queries and map in memory.
3. **Parallel Fetching**: Use `Promise.all` for independent data requests to minimize TTFB.
4. **Action Granularity**: Server Actions should be focused. Don't fetch entire objects if only one field is needed.

### React Component Serialization
1. **Never pass Lucide icons** (or any React components/functions) directly from Server Components to Client Components as props. This causes "Error: functions cannot be passed directly to Client Components".
2. **Correct Pattern:** Pass the icon as a rendered node: `icon={<Settings className="h-4 w-4" />}`.
3. **Incorrect Pattern:** Passing the component itself: `icon={Settings}`.

### Next.js 15 Framework Purity
1. **Async Params Compliance**: `params` and `searchParams` are Promises. You MUST `await` them in Server Components/Actions.
2. **No next/document**: Never import `Html`, `Head`, `Main`, or `NextScript` from `next/document` in the `src/app` directory. Use standard `<html>` and `<body>` tags in `layout.tsx`.
3. **Implicit Error Handling**: Always maintain `not-found.tsx`, `error.tsx`, and `global-error.tsx` in `src/app` to capture all operational faults and prevent fallback to broken internal legacy paths.
4. **Build Verification**: Before pushing to Vercel, always run `npm run build` locally to catch pre-render collisions.

---

## 🧪 Testing Standards

### E2E Tests (Playwright)
1. **Selectors:** Use simple CSS selectors like `a[href="/students"]`
   - ❌ Bad: `a[href="/students"], text=Students`
   - ✅ Good: `a[href="/students"]`
2. **Wait States:** Use `'load'` instead of `'networkidle'` for SSR apps
3. **Parallel Issues:** Debug with `--workers=1` to isolate flaky tests
4. **Manual Fallback:** If automated tests fail due to environment issues (not logic), manual verification is acceptable

### Test Artifacts
- `test-results/` and `playwright-report/` are gitignored and regenerable
- Do not commit screenshots or traces

---

## 🚀 Deployment Practices

### Environment Variables
1. **Never** use `vercel.json` for secrets
2. Manage all secrets in **Vercel Dashboard only**
3. Keep `.env.example` updated with all required variables (without values)

### Pre-Deployment Checklist
1. Run `npm run lint` - fix all errors
2. Run `npm run build` - ensure no build errors
3. Run `npx playwright test` - verify E2E tests pass
4. Commit with conventional commits: `feat:`, `fix:`, `chore:`

---

## 🧹 Cleanup Protocol

### When to Cleanup
- After completing a major feature
- When log files accumulate (>5 in root)
- Before major releases

### Cleanup Steps
1. Delete all `*.log` files from root
2. Delete `test-results/` and `playwright-report/`
3. Archive unused scripts to `scripts/_archive/`
4. Remove duplicate documentation
5. Run `git status` to verify no untracked clutter

---

## 📝 Commit Standards

### Conventional Commits
- `feat:` - New features
- `fix:` - Bug fixes
- `chore:` - Maintenance, cleanup
- `docs:` - Documentation only
- `refactor:` - Code restructuring
- `test:` - Test additions/changes

### Examples
```
feat: add pro-rata fee calculation for mid-month admissions
fix: resolve login timeout for unverified users
chore: cleanup log files and archive old scripts
docs: add cumulative learnings to knowledge base
```

---

## 🔒 Security Rules

1. **Never commit `.env`** - only `.env.example`
2. **No hardcoded credentials** in any file
3. **Admin password** should be changed in production (current: `admin123`)
4. **API keys** should be rotated periodically
5. **Auth Configuration**:
   - `AUTH_URL` must not include `/api/auth`.
   - Prefer client-side `signIn` for credentials login in Turbopack environments.
   - Keep `jwt` callback pure; no database queries.

---

## 📊 Knowledge Management

### Location
- Project-specific learnings: `.agent/knowledge/cumulative_learnings.md`
- Workflows: `.agent/workflows/`
- **Do not** store project knowledge in conversation-scoped artifact directories

### Updating Learnings
After each significant development session:
1. Add new learnings to `.agent/knowledge/cumulative_learnings.md`
2. Keep entries categorized and dated
3. Include "Session:" prefix for traceability
