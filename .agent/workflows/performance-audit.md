---
description: Performance audit workflow for RK Institute ERP
---

# Performance Audit Workflow

Use this workflow periodically to ensure the application maintains peak performance.

0. Automated Performance Gate (MANDATORY – First Step)

Before opening Browser DevTools, create and run Playwright performance tests that:

Intercept all critical network requests (/api/*)

Capture request start and end times

Detect sequential (chained) requests required for initial UI rendering

❌ Red Flag

Request B starts only after Request A completes

Both requests are required for first paint / initial UI

✅ Fix Expectation

Consolidate data fetching into a single Server Component or Server Action

Use Promise.all for parallel fetching

These tests must fail automatically if chaining is detected.

1. Network Chaining Audit (Manual – Only If Tests Fail)

Use Browser DevTools only after Playwright tests fail, to visually inspect the waterfall.

2. N+1 Query Audit

Audit server actions and data fetchers:

Look for .map() or loops containing await db.*

❌ Red Flag
families.map(async f =>
  await db.select().from(students).where(eq(students.familyId, f.id))
)

✅ Fix

Fetch related data in a single query using JOIN or inArray

Group results in memory

3. Bundle Size Audit (Client Islands)

Ensure data-fetching libraries exist only in the server layer

Refactor Client Components into Server Components with minimal client wrappers where possible

4. Middleware Latency Check

Test /api/auth/session using automated timing assertions

❌ Red Flag

Response time > 100ms

✅ Fix

Ensure jwt callback in src/auth.ts performs zero database queries

5. Database Index Audit

Use Neon’s explain_sql_statement for slow queries

Add covering indexes for WHERE and JOIN columns

🧠 Operating Mode

Act as a world-class performance engineer.

Automation-first mindset

DevTools is a debugging tool, not a testing tool

Performance regressions must fail CI

Optimize for real user experience, not synthetic scores

Created: January 20, 2026 (Automation-first revision)