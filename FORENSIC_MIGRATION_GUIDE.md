# Forensic Stabilization & Next.js 15 Migration Guide
## RK Institute 3.0 | Institutional Knowledge Base

> [!IMPORTANT]
> This document summarizes the critical architectural recovery performed to stabilize RK Institute 3.0 on the Next.js 15.1 / React 19 stack. These changes solved the "Dispatcher is null" crash and secured the production pipeline.

---

## 1. The "Dispatcher is Null" Resolution (Core Logic)
**The Problem**: Next.js 15.1 introduced a breaking change where `params` and `searchParams` in Server Components are now **Promises**. Accessing them synchronously (e.g., `params.id`) causes a React internal state mismatch, leading to a fatal "Dispatcher is null" error.

**The Fix**: All server-side entry points were refactored to `await` these objects.
- **Server Components**:
  ```typescript
  // OLD
  export default function Page({ params }) { const id = params.id; }
  
  // NEW (STABILIZED)
  export default async function Page({ params }) { 
    const { id } = await params; 
  }
  ```
- **Client Components**: Used `React.use()` to unwrap the Promise.
  ```typescript
  import { use } from "react";
  export default function ClientPage({ params }) {
    const { id } = use(params);
  }
  ```

---

## 2. Environmental Recovery (Build Pipeline)
**The Problem**: The local build worker was failing with `<Html> cannot be used outside pages/_document`.
- **Diagnosis**: Next.js 15 scans the project root for legacy "Pages Router" indicators. The `design-system/rk-institute-erp/pages` folder was incorrectly flagged as an active Pages Router node.
- **The Fix**: 
  - Renamed the legacy directory to prevent compiler "leakage."
  - Standardized `RootLayout` by removing legacy `force-dynamic` overrides that were conflicting with the static generation worker.
  - Forced `runtime = 'nodejs'` in the root layout to ensure stable module resolution.

---

## 3. High-Performance Optimization
**Institutional Benchmarks**:
- **Baseline Stability**: Env standardized to `Next.js 15.1.0` and `React 19.0.0`.
- **Type-Hardening**: Resolved `noImplicitAny` and `any` violations across `src/actions` to prevent runtime undefined-state crashes.
- **Global Resilience**: Implemented `global-error.tsx` (App Router native) to catch fatal sync failures without falling back to the broken legacy `/500` path.

---

## 4. Maintenance & Future Safety
To maintain this stability:
1. **Avoid `next/document`**: Never use legacy `Html`, `Head`, or `Main` components in the `src/app` directory.
2. **Promise Awareness**: Always treat `params` and `searchParams` as asynchronous in new routes.
3. **Linting Hygiene**: Keep `eslint.config.mjs` standardized to ESM to catch Promise-violations during development.

---

*Compiled by Antigravity Digital Forensic Unit*
