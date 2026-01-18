---
description: Standard development workflow for the RK Institute ERP
---

# Development Workflow

To ensure stability and follow industry standards, we follow this workflow:

## 1. Branching Strategy
- **main**: Always stable. No direct commits.
- **feat/* or fix/* or refactor/***: Feature branches for all development work.

## 2. Standard Workflow Steps

### Step 1: Sync and Branch
// turbo
1. Sync main branch
   `git checkout main && git pull origin main`
2. Create feature branch
   `git checkout -b feat/[feature-name]`

### Step 2: Develop and Verify
3. Perform development work
4. Run lint and tests
   `npm run lint`

### Step 3: Commit and Push
5. Commit changes
   `git add . && git commit -m "feat: [description]"`
6. Push to origin
   `git push origin feat/[feature-name]`

### Step 4: Verification & Merge
7. Verify branch work is correct.
8. Merge to main.

> [!IMPORTANT]
> Always verify your changes in the feature branch before pushing to origin.
