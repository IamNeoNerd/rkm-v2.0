# RK Institute ERP

A comprehensive tuition management system built with Next.js 16, featuring student admission, fee collection, academic batch management, and financial reporting.

## 🚀 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL (Neon Serverless)
- **ORM:** Drizzle ORM
- **Auth:** NextAuth.js v5
- **UI:** Tailwind CSS + shadcn/ui
- **Testing:** Vitest

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL database (or Neon account)
- Google OAuth credentials (optional)

## ⚡ Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd rk-institute-erp
npm install
```

### 2. Environment Setup

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
AUTH_SECRET=your-auth-secret-min-32-chars
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Database Setup

```bash
# Push schema to database
npx drizzle-kit push

# (Optional) Add performance indexes
npx tsx scripts/add-indexes.ts

# (Optional) Create super admin
npx tsx scripts/create-superadmin.ts
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run test` | Run unit tests (watch mode) |
| `npm run test:run` | Run unit tests once |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run test:e2e:ui` | Playwright interactive UI |
| `npm run lint` | Run ESLint |

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/        # Protected dashboard routes
│   ├── api/                # API routes
│   └── login/              # Auth pages
├── actions/                # Server Actions
│   ├── admission.ts        # Student admission
│   ├── billing.ts          # Fee processing
│   ├── academics.ts        # Batch management
│   └── staff.ts            # Staff management
├── components/             # React components
│   ├── ui/                 # shadcn/ui primitives
│   ├── dashboard/          # Dashboard widgets
│   └── layout/             # Layout components
├── db/                     # Database
│   ├── index.ts            # DB connection
│   └── schema.ts           # Drizzle schema
└── lib/                    # Utilities
    ├── auth-guard.ts       # Authorization
    ├── billing.ts          # Fee calculations
    └── scheduling.ts       # Time conflict detection
```

## 🔐 User Roles

| Role | Permissions |
|------|-------------|
| `super_admin` | Full access, user management |
| `admin` | Staff, academics, billing |
| `user` | Fee collection, admissions |

## 📊 Key Features

- **Admission Management** - Student registration with family linking
- **Fee Collection** - Payment processing with receipt generation
- **Academic Batches** - Class scheduling with conflict detection
- **Staff Management** - Teacher and admin management
- **Financial Reports** - P&L dashboard, transaction history, dues reports
- **Session Transition** - Academic year rollover with student promotion
- **Notifications** - In-app notification system
- **Audit Logging** - Complete activity trail
- **Role-Based Access** - Secure authorization on all actions

## 🔍 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check for monitoring |
| `POST /api/auth/*` | NextAuth.js authentication |

## 🧪 Testing

```bash
# Run all tests
npm run test:run

# Run with coverage
npm run test:coverage
```

## 📄 License

Private - RK Institute
