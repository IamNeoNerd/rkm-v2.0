---
description: Performance audit workflow for RK Institute ERP
---

# Performance Audit Workflow

Use this workflow periodically to ensure the application maintains peak performance.

## 1. Network Chaining Audit
Check major routes (Dashboard, Student List, Family Page) for sequential client-side requests.

1. Open Browser DevTools (Network Tab).
2. Load the page.
3. **Red Flag**: If you see a waterfall where Request B only starts after Request A finishes, and both are needed for the initial UI.
4. **Fix**: Consolidate into a single Server Component fetch with `Promise.all`.

## 2. N+1 Query Audit
Review server actions and data fetchers for nested queries.

1. Look for `.map()` or `for` loops containing `await db.select()`.
2. **Red Flag**:
   ```ts
   families.map(async f => await db.select().from(students).where(eq(students.familyId, f.id)))
   ```
3. **Fix**: Fetch all related items in one query using `inArray` or a join, and group them in memory.

## 3. Bundle Size Audit (Client Islands)
Ensure Client Components aren't carrying excessive weight.

1. Verify that "Data Fetching" libraries are ONLY in the server layer.
2. Check if a Client Component can be refactored into a Server Component with a smaller Client interactive wrapper.

## 4. Middleware Latency Check
Verify `/api/auth/session` response times.

1. **Red Flag**: Response times > 100ms for session checks.
2. **Fix**: Ensure the `jwt` callback in `src/auth.ts` has ZERO database queries.

## 5. Database Index Audit
For slow queries identified via the Neon console:

1. Use `explain_sql_statement` to check the execution plan.
2. Add covering indexes for columns used in `WHERE` and `JOIN` clauses.

---
*Created: January 20, 2026*
